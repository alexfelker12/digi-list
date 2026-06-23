import { queryKeys } from "@/lib/queries/_helper";
import { queryClient } from "@/lib/query-client";
import { decodePayload } from "@/lib/transfer/tcp-transfer";
import { saveTransferedList } from "@/server/functions/save-transfered-list";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";
import { File } from "expo-file-system/next";


async function readFileBytes(url: string): Promise<Buffer> {
  // expo-file-system/next can't read content:// uris - copy to cache first
  if (url.startsWith("content://")) {
    console.log("[import] content:// uri, copying to cache first")
    const cacheUri = `${FileSystem.cacheDirectory}import_temp.digilist`
    await FileSystem.copyAsync({ from: url, to: cacheUri })
    console.log("[import] copied to cache:", cacheUri)
    const bytes = await new File(cacheUri).bytes()
    // cleanup temp file
    await FileSystem.deleteAsync(cacheUri, { idempotent: true })
    return Buffer.from(bytes)
  }

  return Buffer.from(await new File(url).bytes())
}

export async function handleImportUrl(url: string): Promise<void> {
  console.log("[import] handling url:", url)

  try {
    const buf = await readFileBytes(url)
    console.log("[import] read bytes:", buf.length)

    const result = decodePayload(buf)
    if (!result) {
      console.log("[import] failed to decode payload")
      return
    }

    console.log("[import] decoded list:", result.payload.name)
    const newList = await saveTransferedList(result.payload, result.images)

    if (newList) {
      console.log("[import] saved:", newList.id)
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
      // notify the app via a simple event
      importEventEmitter.emit("success", { listId: newList.id, listName: newList.name })
    }
  } catch (e) {
    console.log("[import] error:", e)
    importEventEmitter.emit("error", { reason: String(e) })
  }
}

// minimal event emitter to notify the toast
type ImportEvent =
  | { type: "success"; listId: number; listName: string }
  | { type: "error"; reason: string }

type Listener = (event: ImportEvent) => void

class ImportEventEmitter {
  private listeners: Listener[] = []

  emit(type: "success", data: { listId: number; listName: string }): void
  emit(type: "error", data: { reason: string }): void
  emit(type: string, data: any): void {
    this.listeners.forEach(l => l({ type, ...data } as ImportEvent))
  }

  on(listener: Listener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

export const importEventEmitter = new ImportEventEmitter()
