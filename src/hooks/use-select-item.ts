import { addItemAtom } from "@/lib/atoms/add-item-atom";
import { ItemWithUriArray } from "@/server/db";
import { router, useNavigation } from "expo-router";
import { useAtom } from "jotai";
import { useEffect } from "react";


export function useSelectItem() {
  const [, setAddItem] = useAtom(addItemAtom)
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setAddItem({ status: 'idle' })
    })
    return unsubscribe
  }, [])

  return (item: ItemWithUriArray) => {
    setAddItem({ status: 'selected', item })
    router.back()
  }
}
