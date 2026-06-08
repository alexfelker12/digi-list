import { HANDSHAKE_ACCEPT, HANDSHAKE_HELLO, HANDSHAKE_REJECT, HelloMessage, SERVICE_IDENTIFIER, SERVICE_TYPE, TRANSFER_PORT, encodePayload, getServiceName } from "@/lib/transfer/tcp-transfer";
import { getListTransferData } from "@/server/functions/get-list-transfer-data";
import { Buffer } from "buffer";
import { deviceName } from "expo-device";
import { useCallback, useRef, useState } from "react";
import TcpSocket from "react-native-tcp-socket";
import Zeroconf from "react-native-zeroconf";


export interface DiscoveredReceiver {
  name: string
  host: string
  port: number
}

export type SendStatus =
  | { state: "idle" }
  | { state: "discovering"; receivers: DiscoveredReceiver[] }
  | { state: "discovered"; receivers: DiscoveredReceiver[] }
  | { state: "waiting_confirmation"; receiver: DiscoveredReceiver }
  | { state: "sending" }
  | { state: "rejected" }
  | { state: "success" }
  | { state: "error"; reason: string }

// module-level singletons
let globalZeroconf: Zeroconf | null = null
let globalSocket: ReturnType<typeof TcpSocket.createConnection> | null = null
let globalEncoded: Buffer | null = null

function cleanupGlobal() {
  cleanupSocket()
  cleanupZeroconf()
  cleanupTransferData()
}
function cleanupSocket() {
  if (globalSocket) {
    globalSocket.destroy()
    globalSocket = null
  }
}
function cleanupZeroconf() {
  if (globalZeroconf) {
    clearTimeout((globalZeroconf as any).__timeout)
    globalZeroconf.stop()
    globalZeroconf.removeDeviceListeners()
    globalZeroconf = null
  }
}
function cleanupTransferData() {
  globalEncoded = null
}

export function useSendList() {
  const [status, setStatus] = useState<SendStatus>({ state: "idle" })
  // keep receivers across scan/rescan cycles
  const receiversRef = useRef<DiscoveredReceiver[]>([])

  const startScan = useCallback(() => {
    cleanupZeroconf()

    const zeroconf = new Zeroconf()
    globalZeroconf = zeroconf

    // carry over previously found receivers into new scan
    setStatus({ state: "discovering", receivers: [...receiversRef.current] })

    const timeout = setTimeout(() => {
      cleanupZeroconf()
      // transition to discovered regardless of count - user decides what to do
      setStatus({ state: "discovered", receivers: [...receiversRef.current] })
    }, 10_000)

    zeroconf.on("resolved", (service) => {

      if (service.txt?.app !== SERVICE_IDENTIFIER) {
        return
      }

      const ownName = getServiceName()
      if (service.name === ownName) {
        return
      }

      // deduplicate by host
      if (receiversRef.current.some(r => r.host === service.addresses[0])) {
        return
      }

      const receiver: DiscoveredReceiver = {
        name: service.name,
        host: service.addresses[0],
        port: service.port ?? TRANSFER_PORT,
      }

      receiversRef.current = [...receiversRef.current, receiver]
      setStatus({ state: "discovering", receivers: [...receiversRef.current] })
    })

    zeroconf.on("error", (err) => {
      clearTimeout(timeout)
      if (globalZeroconf === zeroconf) {
        globalZeroconf = null
      }
      setStatus({ state: "error", reason: err.message })
    })

    zeroconf.scan(SERVICE_TYPE, "tcp", "local.")
      ; (zeroconf as any).__timeout = timeout
  }, [])

  const send = useCallback(async (listId: number) => {
    cleanupGlobal()
    receiversRef.current = []

    const transferableList = await getListTransferData(listId)

    if (!transferableList) {
      setStatus({ state: "error", reason: "Liste nicht gefunden" })
      return
    }

    globalEncoded = await encodePayload(transferableList)

    startScan()
  }, [startScan])

  const rescan = useCallback(() => {
    startScan()
  }, [startScan])

  const selectReceiver = useCallback((receiver: DiscoveredReceiver, listName: string) => {

    cleanupZeroconf()

    setStatus({ state: "waiting_confirmation", receiver })

    const senderName = deviceName ?? "Unbekanntes Gerät"
    const hello: HelloMessage = { senderName, listName }
    const helloMsg = `${HANDSHAKE_HELLO}\n${JSON.stringify(hello)}\n`

    const socket = TcpSocket.createConnection({ port: receiver.port, host: receiver.host }, () => {
      socket.write(helloMsg)
    })

    globalSocket = socket

    socket.on("data", (data) => {
      const text = Buffer.from(data).toString("utf8").trim()

      if (text === HANDSHAKE_ACCEPT) {
        setStatus({ state: "sending" })

        const CHUNK_SIZE = 16384  // 16kb chunks matching tcp buffer size
        let offset = 0

        const writeNextChunk = () => {
          while (offset < globalEncoded!.length) {
            const chunk = globalEncoded!.subarray(offset, offset + CHUNK_SIZE)
            offset += chunk.length
            const canContinue = socket.write(chunk)

            if (!canContinue) {
              // buffer full, wait for drain before continuing
              socket.once("drain", writeNextChunk)
              return
            }
          }
          // all chunks written
          socket.destroy()
        }

        writeNextChunk()
      } else if (text === HANDSHAKE_REJECT) {
        cleanupGlobal()
        setStatus({ state: "rejected" })
      }
    })

    socket.on("close", () => {
      setStatus((prev) => prev.state === "sending" ? { state: "success" } : prev)
    })

    socket.on("error", (err) => {
      cleanupGlobal()
      setStatus({ state: "error", reason: String(err) })
    })
  }, [])

  const cancel = useCallback(() => {
    cleanupGlobal()
    receiversRef.current = []
    setStatus({ state: "idle" })
  }, [])

  return { status, send, rescan, selectReceiver, cancel }
}
