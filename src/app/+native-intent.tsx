import { handleImportUrl } from "@/lib/transfer/handle-import";


export function redirectSystemPath({ path }: { path: string }) {
  console.log("[native-intent] path:", path)

  if (path.includes("whatsapp.provider") || path.includes(".digilist")) {
    handleImportUrl(path)
    return null
  }

  return path
}
