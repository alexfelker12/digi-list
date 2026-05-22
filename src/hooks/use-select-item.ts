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
    const cb = callbackRef.current
    callbackRef.current = null
    setCallback(null)
    router.back()
    requestAnimationFrame(() => cb?.(item))
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
