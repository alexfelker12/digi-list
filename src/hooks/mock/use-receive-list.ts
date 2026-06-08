import { useCallback, useEffect, useState } from "react";
import { ReceiveStatus } from "../use-receive-list";

function getMockState(mockState: ReceiveStatus["state"]): ReceiveStatus {
  switch (mockState) {
    case "idle":
      return { state: "idle" }
    case "advertising":
      return { state: "advertising" }
    case "pending":
      return { state: "pending", senderName: "S23FE", listName: "Einkauf" }
    case "receiving":
      return { state: "receiving" }
    case "saving":
      return { state: "saving" }
    case "success":
      return { state: "success", listId: 12, listName: "Einkauf" }
    case "error":
      return { state: "error", reason: "Netzwerkfehler", retryable: true }
  }
}

function useReceiveList(mockState: ReceiveStatus["state"] = "idle", withInterval?: boolean) {
  const [status, setStatus] = useState<ReceiveStatus>(() => getMockState(mockState))

  useEffect(() => {
    if (!withInterval) return
    setTimeout(() => setStatus(getMockState("idle")), 0 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("advertising")), 1 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("pending")), 2 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("receiving")), 3 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("saving")), 4 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("success")), 5 * 1000 * 5)
    setTimeout(() => setStatus(getMockState("error")), 6 * 1000 * 5)
  }, [])

  const receive = useCallback(() => {
    console.log("[receive] starting - cleaning up any previous session first")
  }, [])

  const accept = useCallback(() => {
    console.log("[receive] user accepted transfer")
  }, [])

  const reject = useCallback(() => {
    console.log("[receive] user rejected transfer")
  }, [])

  const reset = useCallback(() => {
    console.log("[receive] reset called")
  }, [])

  return { status, receive, accept, reject, reset }
}

export { ReceiveStatus, useReceiveList };

