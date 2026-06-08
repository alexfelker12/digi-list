import { useCallback, useEffect, useState } from "react";
import { DiscoveredReceiver, SendStatus } from "../use-send-list";


const mockReceivers: DiscoveredReceiver[] = [
  { host: "192.168.1.105", name: "Ludmilla A51", port: 42354 },
  { host: "192.168.1.106", name: "Nikita iPhone 14", port: 42351 },
  { host: "192.168.1.107", name: "Andrej A54", port: 42352 },
  { host: "192.168.1.108", name: "S23FE", port: 42353 },
]

function getMockState(mockState: SendStatus["state"]): SendStatus {
  switch (mockState) {
    case "idle":
      return { state: "idle" }
    case "discovering":
      return { state: "discovering", receivers: mockReceivers }
    case "discovered":
      return { state: "discovered", receivers: mockReceivers }
    case "waiting_confirmation":
      return { state: "waiting_confirmation", receiver: mockReceivers[3] }
    case "rejected":
      return { state: "rejected" }
    case "sending":
      return { state: "sending" }
    case "success":
      return { state: "success" }
    case "error":
      return { state: "error", reason: "Netzwerkfehler" }
  }
}

function useSendList(mockState: SendStatus["state"] = "idle", withInterval?: boolean) {
  const [status, setStatus] = useState<SendStatus>(() => getMockState(mockState))

  useEffect(() => {
    if (!withInterval) return
    setTimeout(() => setStatus(getMockState("idle")), 0 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("discovering")), 1 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("discovered")), 2 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("waiting_confirmation")), 3 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("rejected")), 4 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("sending")), 5 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("success")), 6 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("error")), 7 * 1000 * 5)
  }, [])

  const startScan = useCallback(() => {
    console.log("[send] starting scan...")
  }, [])

  const send = useCallback(async (listId: number) => {
    console.log("[send] loading list data for id:", listId)
  }, [startScan])

  const rescan = useCallback(() => {
    console.log("[send] rescan requested")
  }, [startScan])

  const selectReceiver = useCallback((receiver: DiscoveredReceiver, listName: string) => {
    console.log("[send] user selected receiver:", receiver.name)
  }, [])

  const cancel = useCallback(() => {
    console.log("[send] cancelled")
  }, [])

  return { status, send, rescan, selectReceiver, cancel }
}

export { DiscoveredReceiver, useSendList };

