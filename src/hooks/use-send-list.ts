import { HANDSHAKE_ACCEPT, HANDSHAKE_HELLO, HANDSHAKE_REJECT, HelloMessage, SERVICE_IDENTIFIER, SERVICE_TYPE, TRANSFER_PORT, encodePayload } from "@/lib/transfer/tcp-transfer";
import { getListTransferData } from "@/server/functions/get-list-transfer-data";
import { Buffer } from "buffer";
import * as Device from "expo-device";
import { useCallback, useState } from "react";
import TcpSocket from "react-native-tcp-socket";
import Zeroconf from "react-native-zeroconf";


export interface DiscoveredReceiver {
  name: string       // mdns service name
  host: string       // ip address
  port: number
}

type SendStatus =
  | { state: "idle" }
  | { state: "discovering"; receivers: DiscoveredReceiver[] }             // scanning, list grows as devices found
  | { state: "waiting_confirmation"; receiver: DiscoveredReceiver }       // hello sent, waiting for accept/reject
  | { state: "sending" }
  | { state: "rejected" }                                                 // receiver rejected
  | { state: "success" }
  | { state: "error"; reason: string }

// module-level singletons
let globalZeroconf: Zeroconf | null = null
let globalSocket: ReturnType<typeof TcpSocket.createConnection> | null = null
let globalEncoded: Buffer | null = null

function cleanupGlobal() {
  console.log("[send] running global cleanup")
  if (globalSocket) {
    globalSocket.destroy()
    globalSocket = null
  }
  if (globalZeroconf) {
    globalZeroconf.stop()
    globalZeroconf.removeDeviceListeners()
    globalZeroconf = null
  }
  globalEncoded = null
}

export function useSendList() {
  const [status, setStatus] = useState<SendStatus>({ state: "idle" })

  const send = useCallback(async (listId: number) => {
    console.log("[send] loading list data for id:", listId)
    cleanupGlobal()

    const transferableList = await getListTransferData(listId)

    if (!transferableList) {
      console.log("[send] list not found in db")
      setStatus({ state: "error", reason: "Liste nicht gefunden" })
      return
    }

    console.log("[send] list loaded:", transferableList.name)
    globalEncoded = encodePayload(transferableList)
    console.log("[send] encoded payload size:", globalEncoded.length, "bytes")

    const zeroconf = new Zeroconf()
    globalZeroconf = zeroconf

    const receivers: DiscoveredReceiver[] = []

    setStatus({ state: "discovering", receivers: [] })
    console.log("[send] starting mdns scan")

    const timeout = setTimeout(() => {
      console.log("[send] discovery timeout, found:", receivers.length, "receivers")
      zeroconf.stop()
      zeroconf.removeDeviceListeners()
      globalZeroconf = null
      if (receivers.length === 0) {
        setStatus({ state: "error", reason: "Kein Empfänger gefunden (Timeout)" })
      }
      // if receivers found, keep them in state so user can still pick one
    }, 10_000)

    zeroconf.on("resolved", (service) => {
      console.log("[send] resolved mdns service:", service)

      if (service.txt?.app !== SERVICE_IDENTIFIER) {
        console.log("[send] ignoring unrelated service:", service.name)
        return
      }

      // const ownName = getServiceName()
      // if (service.name === ownName) {
      //   console.log("[send] ignoring own service:", service.name)
      //   return
      // }

      const receiver: DiscoveredReceiver = {
        name: service.name,  // readable device name shown in ui
        host: service.addresses[0],
        port: service.port ?? TRANSFER_PORT,
      }

      receivers.push(receiver)
      console.log("[send] receiver added, total:", receivers.length)
      // update state with new receiver so ui can show it immediately
      setStatus({ state: "discovering", receivers: [...receivers] })
    })

    zeroconf.on("error", (err) => {
      console.log("[send] zeroconf error:", err.message)
      clearTimeout(timeout)
      cleanupGlobal()
      setStatus({ state: "error", reason: err.message })
    })

    zeroconf.scan(SERVICE_TYPE, "tcp", "local.")
    console.log("[send] mdns scan started")

      // store timeout ref so selectReceiver can clear it
      ; (zeroconf as any).__timeout = timeout
  }, [])

  const selectReceiver = useCallback((receiver: DiscoveredReceiver, listName: string) => {
    console.log("[send] user selected receiver:", receiver.name)

    // stop discovery
    if (globalZeroconf) {
      clearTimeout((globalZeroconf as any).__timeout)
      globalZeroconf.stop()
      globalZeroconf.removeDeviceListeners()
      globalZeroconf = null
    }

    setStatus({ state: "waiting_confirmation", receiver })

    const senderName = Device.deviceName ?? "Unbekanntes Gerät"
    const hello: HelloMessage = { senderName, listName }
    const helloMsg = `${HANDSHAKE_HELLO}\n${JSON.stringify(hello)}\n`

    console.log(`[send] connecting to ${receiver.host}:${receiver.port}`)
    const socket = TcpSocket.createConnection({ port: receiver.port, host: receiver.host }, () => {
      console.log("[send] connected, sending hello")
      socket.write(helloMsg)
    })

    globalSocket = socket

    socket.on("data", (data) => {
      const text = Buffer.from(data).toString("utf8").trim()
      console.log("[send] handshake response:", text)

      if (text === HANDSHAKE_ACCEPT) {
        console.log("[send] accepted, sending payload")
        setStatus({ state: "sending" })
        socket.write(globalEncoded!)
        socket.destroy()
      } else if (text === HANDSHAKE_REJECT) {
        console.log("[send] rejected by receiver")
        cleanupGlobal()
        setStatus({ state: "rejected" })
      }
    })

    socket.on("close", () => {
      console.log("[send] socket closed")
      // only set success if we were in sending state
      setStatus((prev) => prev.state === "sending" ? { state: "success" } : prev)
    })

    socket.on("error", (err) => {
      console.log("[send] socket error:", String(err))
      cleanupGlobal()
      setStatus({ state: "error", reason: String(err) })
    })
  }, [])

  const cancel = useCallback(() => {
    console.log("[send] cancelled")
    cleanupGlobal()
    setStatus({ state: "idle" })
  }, [])

  return { status, send, selectReceiver, cancel }
}
