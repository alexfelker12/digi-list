import { queryKeys } from "@/lib/queries/_helper";
import { decodePayload, SERVICE_NAME, SERVICE_TYPE, TRANSFER_PORT } from "@/lib/transfer/tcp-transfer";
import { saveTransferedList } from "@/server/functions/save-transfered-list";
import { useQueryClient } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { useCallback, useState } from "react";
import TcpSocket from "react-native-tcp-socket";
import Zeroconf from "react-native-zeroconf";

// module-level singletons - survive hook re-mounts
let globalServer: ReturnType<typeof TcpSocket.createServer> | null = null
let globalZeroconf: Zeroconf | null = null

function cleanupGlobal() {
  console.log("[receive] running global cleanup")
  if (globalServer) {
    console.log("[receive] closing global tcp server, server exists:", !!globalServer)
    globalServer.close(() => {
      console.log("[receive] server close callback fired")
    })
    globalServer = null
  } else {
    console.log("[receive] no global server to close")
  }
  if (globalZeroconf) {
    console.log("[receive] unpublishing global mdns service")
    globalZeroconf.unpublishService(SERVICE_NAME)
    globalZeroconf = null
  }
}

type ReceiveStatus =
  | { state: "idle" }
  | { state: "advertising" }
  | { state: "receiving" }
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
    let chunks = Buffer.alloc(0)

    const server = TcpSocket.createServer((socket) => {
      console.log("[receive] sender connected:", socket.remoteAddress)
      setStatus({ state: "receiving" })

      socket.on("data", (data) => {
        const chunk = Buffer.from(data) // force real Buffer
        console.log(`[receive] got chunk: ${chunk.length} bytes`)
        chunks = Buffer.concat([chunks, chunk])
      })

      socket.on("close", async () => {
        console.log(`[receive] connection closed, total bytes: ${chunks.length}`)
        cleanupGlobal()
        setStatus({ state: "saving" })

        console.log("[receive] first 4 bytes:", Array.from(chunks.slice(0, 4)))
        console.log("[receive] Buffer.isBuffer:", Buffer.isBuffer(chunks))
        console.log(chunks)
        const payload = decodePayload(chunks)
        console.log(payload)

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
      })
    })

    globalServer = server

    server.on("error", (err) => {
      const reason = String(err)
      console.log("[receive] server error:", reason)
      cleanupGlobal()
      setStatus({ state: "error", reason, retryable: true })
    })

    server.listen({ port: TRANSFER_PORT, host: "0.0.0.0", reuseAddress: true }, () => {
      console.log(`[receive] tcp server listening on port ${TRANSFER_PORT}`)
      zeroconf.publishService(SERVICE_TYPE, "tcp", "local.", SERVICE_NAME, TRANSFER_PORT)
      console.log(`[receive] mdns service published: ${SERVICE_NAME}`)
    })

    // ---
    server.on("close", () => {
      console.log("[receive] server 'close' event fired")
    })
  }, [])

  const reset = useCallback(() => {
    console.log("[receive] reset called")
    cleanupGlobal()
    setStatus({ state: "idle" })
  }, [])

  return { status, receive, reset }
}
