import { navCallbackAtom } from "@/lib/atoms/addItemAtom"
import { ItemWithUriArray } from "@/server/db"
import { router } from "expo-router"
import { useAtom } from "jotai"
import { useEffect } from "react"


export function useSelectItem() {
  const [callback, setCallback] = useAtom(navCallbackAtom)

  const handleSelect = (item: ItemWithUriArray) => {
    callback?.(item)
    setCallback(null)
    router.back()
  }

  useEffect(() => {
    return () => {
      callback?.(null)
      setCallback(null)
    }
  }, [])

  return handleSelect
}