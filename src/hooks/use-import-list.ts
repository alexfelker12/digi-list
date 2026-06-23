import { importEventEmitter } from "@/lib/transfer/handle-import";
import { useEffect, useState } from "react";

type ImportStatus =
  | { state: "idle" }
  | { state: "importing" }
  | { state: "success"; listId: number; listName: string }
  | { state: "error"; reason: string }

export function useImportList() {
  const [status, setStatus] = useState<ImportStatus>({ state: "idle" })

  useEffect(() => {
    const unsubscribe = importEventEmitter.on((event) => {
      if (event.type === "success") {
        setStatus({ state: "success", listId: event.listId, listName: event.listName })
      } else {
        setStatus({ state: "error", reason: event.reason })
      }
    })
    return unsubscribe
  }, [])

  const reset = () => setStatus({ state: "idle" })

  return { status, reset }
}
