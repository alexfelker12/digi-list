import { encodePayload, SERVICE_NAME, SERVICE_TYPE, TRANSFER_PORT } from "@/lib/transfer/tcp-transfer";
import { getListTransferData } from "@/server/functions/get-list-transfer-data";
import { useCallback, useState } from "react";
import TcpSocket from "react-native-tcp-socket";
import Zeroconf from "react-native-zeroconf";


type SendStatus =
  | { state: "idle" }
  | { state: "discovering" }      // scanning mdns for a receiver
  | { state: "sending" }          // transferring data
  | { state: "success" }
  | { state: "error"; reason: string }
export function useSendList() {
  const [status, setStatus] = useState<SendStatus>({ state: "idle" })

  const send = useCallback(async (listId: number) => {
    console.log("[send] loading list data for id:", listId)
    const transferableList = await getListTransferData(listId)

    if (!transferableList) {
      console.log("[send] list not found in db")
      setStatus({ state: "error", reason: "Liste nicht gefunden" })
      return
    }

    console.log("[send] list loaded:", transferableList.name)
    const encoded = encodePayload(transferableList)
    console.log("[send] encoded payload size:", encoded.length, "bytes")

    console.log("[send] starting mdns scan for receiver")
    setStatus({ state: "discovering" })

    const zeroconf = new Zeroconf()

    const timeout = setTimeout(() => {
      console.log("[send] discovery timeout, no receiver found")
      zeroconf.stop()
      zeroconf.removeDeviceListeners()
      setStatus({ state: "error", reason: "Kein Empfänger gefunden (Timeout)" })
    }, 10_000)

    zeroconf.on("resolved", (service) => {
      console.log("[send] resolved mdns service:", service.name, "addresses:", service.addresses)

      if (service.name !== SERVICE_NAME) {
        console.log("[send] ignoring unrelated service:", service.name)
        return
      }

      clearTimeout(timeout)
      zeroconf.stop()
      zeroconf.removeDeviceListeners()
      console.log("[send] mdns scan stopped")

      const host = service.addresses[0]
      console.log(`[send] connecting to receiver at ${host}:${TRANSFER_PORT}`)
      setStatus({ state: "sending" })

      const socket = TcpSocket.createConnection({ port: TRANSFER_PORT, host }, () => {
        console.log("[send] connected, writing data...")
        socket.write(encoded)
        console.log("[send] data written, closing socket")
        socket.destroy()
      })

      socket.on("close", () => {
        console.log("[send] socket closed, transfer complete")
        setStatus({ state: "success" })
      })

      socket.on("error", (err) => {
        console.log("[send] socket error:", err.message)
        setStatus({ state: "error", reason: err.message })
      })
    })

    zeroconf.on("error", (err) => {
      console.log("[send] zeroconf error:", err.message)
      clearTimeout(timeout)
      setStatus({ state: "error", reason: err.message })
    })

    zeroconf.scan(SERVICE_TYPE, "tcp", "local.")
    console.log("[send] mdns scan started, service type:", SERVICE_TYPE)
  }, [])

  const cancel = useCallback(() => {
    console.log("[send] cancelled")
    setStatus({ state: "idle" })
  }, [])

  return { status, send, cancel }
}
