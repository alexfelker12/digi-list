import { navCallbackAtom } from "@/lib/atoms/addItemAtom"
import { ItemWithUriArray } from "@/server/db"
import { router, useNavigation } from "expo-router"
import { useAtom } from "jotai"
import { useEffect, useRef } from "react"


export function useSelectItem() {
  const [callback, setCallback] = useAtom(navCallbackAtom)
  const navigation = useNavigation()
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const handleSelect = (item: ItemWithUriArray) => {
    setCallback(null)
    callbackRef.current?.(item)
    callbackRef.current = null
    router.back()
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      callbackRef.current?.(null)
      callbackRef.current = null
      setCallback(null)
    })
    return unsubscribe
  }, [])

  return handleSelect
}
