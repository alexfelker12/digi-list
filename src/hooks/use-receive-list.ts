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
  console.log("[receive] running global cleanup")
  if (globalSocket) {
    console.log("[receive] destroying active socket")
    globalSocket.destroy()
    globalSocket = null
  }
  if (globalServer) {
    console.log("[receive] closing server")
    globalServer.close(() => {
      console.log("[receive] server close callback fired")
    })
    globalServer = null
  } else {
    console.log("[receive] no global server to close")
  }
  if (globalZeroconf) {
    console.log("[receive] unpublishing mdns service")
    globalZeroconf.unpublishService(getServiceName())
    globalZeroconf = null
  }
}

type ReceiveStatus =
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
    console.log("[receive] starting - cleaning up any previous session first")
    cleanupGlobal()

    setStatus({ state: "advertising" })

    const zeroconf = new Zeroconf()
    globalZeroconf = zeroconf

    const server = TcpSocket.createServer((socket) => {
      console.log("[receive] sender connected:", socket.remoteAddress)
      globalSocket = socket

      let handshakeDone = false
      let chunks = Buffer.alloc(0)

      socket.on("data", (data) => {
        const chunk = Buffer.from(data)

        if (!handshakeDone) {
          // accumulate until we have a full hello message
          const text = chunk.toString("utf8")
          console.log("[receive] handshake data:", text)

          if (text.startsWith(HANDSHAKE_HELLO)) {
            try {
              // format: "HELLO\n{...json...}\n"
              const jsonPart = text.split("\n")[1]
              const hello = JSON.parse(jsonPart) as HelloMessage
              console.log("[receive] hello from:", hello.senderName, "list:", hello.listName)

              // stop advertising - we have a sender
              zeroconf.unpublishService(getServiceName())
              globalZeroconf = null

              // show confirmation ui to user - do not respond yet
              setStatus({ state: "pending", senderName: hello.senderName, listName: hello.listName })
            } catch (e) {
              console.log("[receive] failed to parse hello:", e)
              socket.write(`${HANDSHAKE_REJECT}\n`)
              socket.destroy()
            }
          }
          return
        }

        // handshake done, accumulate payload chunks
        console.log(`[receive] got chunk: ${chunk.length} bytes`)
        chunks = Buffer.concat([chunks, chunk])
      })

      socket.on("close", async () => {
        globalSocket = null
        if (!handshakeDone) {
          // sender disconnected before handshake completed
          console.log("[receive] socket closed before handshake")
          setStatus({ state: "advertising" })
          return
        }

        console.log(`[receive] connection closed, total bytes: ${chunks.length}`)
        cleanupGlobal()
        setStatus({ state: "saving" })

        const payload = decodePayload(chunks)

        if (!payload) {
          console.log("[receive] failed to decode payload")
          setStatus({ state: "error", reason: "Daten konnten nicht gelesen werden", retryable: true })
          return
        }

        console.log("[receive] decoded payload, list name:", payload.name)
        const newList = await saveTransferedList(payload)

        if (newList) {
          console.log("[receive] saved successfully, new list id:", newList.id)
          setStatus({ state: "success", listId: newList.id, listName: newList.name })
          qc.invalidateQueries({ queryKey: queryKeys.lists() })
        } else {
          console.log("[receive] failed to save list")
          setStatus({ state: "error", reason: "Fehler beim Speichern", retryable: false })
        }
      })

      socket.on("error", (err) => {
        console.log("[receive] socket error:", String(err))
        setStatus({ state: "error", reason: String(err), retryable: true })
      });

      // called by accept() below - sets handshakeDone and sends ACCEPT
      (socket as any).__accept = () => {
        handshakeDone = true
        console.log("[receive] sending ACCEPT")
        socket.write(`${HANDSHAKE_ACCEPT}\n`)
      };
      (socket as any).__reject = () => {
        console.log("[receive] sending REJECT")
        socket.write(`${HANDSHAKE_REJECT}\n`)
        socket.destroy()
      };
    })

    globalServer = server

    server.on("error", (err) => {
      const reason = String(err)
      console.log("[receive] server error:", reason)
      cleanupGlobal()
      setStatus({ state: "error", reason, retryable: true })
    })

    server.on("close", () => {
      console.log("[receive] server 'close' event fired")
    })

    server.listen({ port: TRANSFER_PORT, host: "0.0.0.0", reuseAddress: true }, () => {
      const serviceName = getServiceName()
      console.log(`[receive] tcp server listening on port ${TRANSFER_PORT}`)
      zeroconf.publishService(SERVICE_TYPE, "tcp", "local.", serviceName, TRANSFER_PORT, SERVICE_TXT)
      console.log(`[receive] mdns service published: ${serviceName}`)
    })
  }, [])

  const accept = useCallback(() => {
    console.log("[receive] user accepted transfer")
    if (globalSocket) {
      // globalSocket.write(`${HANDSHAKE_ACCEPT}\n`)
      ; (globalSocket as any).__accept?.()
      setStatus({ state: "receiving" })
    }
  }, [])

  const reject = useCallback(() => {
    console.log("[receive] user rejected transfer")
    if (globalSocket) {
      // globalSocket.write(`${HANDSHAKE_REJECT}\n`)
      ; (globalSocket as any).__reject?.()
      globalSocket = null
    }
    // go back to advertising so user can receive another list
    setStatus({ state: "advertising" })
  }, [])

  const reset = useCallback(() => {
    console.log("[receive] reset called")
    cleanupGlobal()
    setStatus({ state: "idle" })
  }, [])

  return { status, receive, accept, reject, reset }
}
