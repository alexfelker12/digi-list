import { queryKeys } from "@/lib/queries/_helper";
import { HANDSHAKE_ACCEPT, HANDSHAKE_HELLO, HANDSHAKE_REJECT, HelloMessage, SERVICE_TXT, SERVICE_TYPE, TRANSFER_PORT, decodePayload, getServiceName } from "@/lib/transfer/tcp-transfer";
import { saveTransferedList } from "@/server/functions/save-transfered-list";
import { useQueryClient } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { useCallback, useState } from "react";
import TcpSocket from "react-native-tcp-socket";
import Zeroconf from "react-native-zeroconf";


// module-level singletons - survive hook re-mounts
let globalServer: ReturnType<typeof TcpSocket.createServer> | null = null
let globalZeroconf: Zeroconf | null = null
let globalSocket: TcpSocket.Socket | null = null  // track active connection socket

function cleanupGlobal() {
  if (globalSocket) {
    globalSocket.destroy()
    globalSocket = null
  }
  if (globalServer) {
    globalServer.close(() => {
    })
    globalServer = null
  } else {
  }
  if (globalZeroconf) {
    globalZeroconf.unpublishService(getServiceName())
    globalZeroconf = null
  }
}

export type ReceiveStatus =
  | { state: "idle" }
  | { state: "advertising" }                                              // server running, waiting for sender
  | { state: "pending"; senderName: string; listName: string }            // hello received, waiting for user confirmation
  | { state: "receiving" }                                                // accepted, data incoming
  | { state: "saving" }
  | { state: "success"; listId: number; listName: string }
  | { state: "error"; reason: string; retryable: boolean }

export function useReceiveList() {
  const [status, setStatus] = useState<ReceiveStatus>({ state: "idle" })
  const qc = useQueryClient()

  const receive = useCallback(() => {
    cleanupGlobal()

    setStatus({ state: "advertising" })

    const zeroconf = new Zeroconf()
    globalZeroconf = zeroconf

    const server = TcpSocket.createServer((socket) => {
      globalSocket = socket

      let handshakeDone = false
      let chunks = Buffer.alloc(0)

      socket.on("data", (data) => {
        const chunk = Buffer.from(data)

        if (!handshakeDone) {
          // accumulate until we have a full hello message
          const text = chunk.toString("utf8")

          if (text.startsWith(HANDSHAKE_HELLO)) {
            try {
              // format: "HELLO\n{...json...}\n"
              const jsonPart = text.split("\n")[1]
              const hello = JSON.parse(jsonPart) as HelloMessage

              // stop advertising - we have a sender
              zeroconf.unpublishService(getServiceName())
              globalZeroconf = null

              // show confirmation ui to user - do not respond yet
              setStatus({ state: "pending", senderName: hello.senderName, listName: hello.listName })
            } catch (e) {
              socket.write(`${HANDSHAKE_REJECT}\n`)
              socket.destroy()
            }
          }
          return
        }

        // handshake done, accumulate payload chunks
        chunks = Buffer.concat([chunks, chunk])
      })

      socket.on("close", async () => {
        globalSocket = null
        if (!handshakeDone) {
          // sender disconnected before handshake completed
          setStatus({ state: "advertising" })
          return
        }

        cleanupGlobal()
        setStatus({ state: "saving" })

        const result = decodePayload(chunks)

        if (!result) {
          setStatus({ state: "error", reason: "Daten konnten nicht gelesen werden", retryable: true })
          return
        }

        const newList = await saveTransferedList(result.payload, result.images)

        if (newList) {
          setStatus({ state: "success", listId: newList.id, listName: newList.name })
          qc.invalidateQueries({ queryKey: queryKeys.lists() })
        } else {
          setStatus({ state: "error", reason: "Fehler beim Speichern", retryable: false })
        }
      })

      socket.on("error", (err) => {
        setStatus({ state: "error", reason: String(err), retryable: true })
      });

      // called by accept() below - sets handshakeDone and sends ACCEPT
      (socket as any).__accept = () => {
        handshakeDone = true
        socket.write(`${HANDSHAKE_ACCEPT}\n`)
      };
      (socket as any).__reject = () => {
        socket.write(`${HANDSHAKE_REJECT}\n`)
        socket.destroy()
      };
    })

    globalServer = server

    server.on("error", (err) => {
      const reason = String(err)
      cleanupGlobal()
      setStatus({ state: "error", reason, retryable: true })
    })

    server.on("close", () => {
    })

    server.listen({ port: TRANSFER_PORT, host: "0.0.0.0", reuseAddress: true }, () => {
      const serviceName = getServiceName()
      zeroconf.publishService(SERVICE_TYPE, "tcp", "local.", serviceName, TRANSFER_PORT, SERVICE_TXT)
    })
  }, [])

  const accept = useCallback(() => {
    if (globalSocket) {
      ; (globalSocket as any).__accept?.()
      setStatus({ state: "receiving" })
    }
  }, [])

  const reject = useCallback(() => {
    if (globalSocket) {
      ; (globalSocket as any).__reject?.()
      globalSocket = null
    }
    // go back to advertising so user can receive another list
    setStatus({ state: "advertising" })
  }, [])

  const reset = useCallback(() => {
    cleanupGlobal()
    setStatus({ state: "idle" })
  }, [])

  return { status, receive, accept, reject, reset }
}
