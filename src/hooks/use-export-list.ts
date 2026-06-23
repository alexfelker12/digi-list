import { encodePayload } from "@/lib/transfer/tcp-transfer";
import { getListTransferData } from "@/server/functions/get-list-transfer-data";
import { File, Paths } from "expo-file-system/next";
import { isAvailableAsync, shareAsync } from "expo-sharing";
import { useCallback, useState } from "react";

type ExportStatus =
  | { state: "idle" }
  | { state: "exporting" }
  | { state: "error"; reason: string }

export function useExportList() {
  const [status, setStatus] = useState<ExportStatus>({ state: "idle" })

  const exportList = useCallback(async (listId: number, listName: string) => {
    console.log("[export] starting export for list:", listName)
    setStatus({ state: "exporting" })

    try {
      const transferableList = await getListTransferData(listId)
      if (!transferableList) {
        console.log("[export] list not found")
        setStatus({ state: "error", reason: "Liste nicht gefunden" })
        return
      }

      const encoded = await encodePayload(transferableList)
      console.log("[export] encoded size:", encoded.length, "bytes")

      // sanitize filename
      const safeFilename = listName.replace(/[^a-z0-9äöüß]/gi, "_")
      const file = new File(Paths.cache, `${safeFilename}.digilist`)

      // overwrite if exists from previous export
      if (file.exists) file.delete()
      file.write(new Uint8Array(encoded))
      console.log("[export] wrote file:", file.uri)

      const canShare = await isAvailableAsync()
      if (!canShare) {
        setStatus({ state: "error", reason: "Teilen nicht verfügbar" })
        return
      }

      await shareAsync(file.uri, {
        mimeType: "application/x-digilist",
        dialogTitle: `"${listName}" teilen`,
        UTI: "com.alexfelker.digilist.list",
      })

      console.log("[export] share sheet dismissed")
      setStatus({ state: "idle" })
    } catch (e) {
      console.log("[export] error:", e)
      setStatus({ state: "error", reason: String(e) })
    }
  }, [])

  return { status, exportList }
}
