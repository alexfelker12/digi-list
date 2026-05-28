import { ItemWithUriArray } from "@/server/db"
import { useMemo, useState } from "react"


export function useSearchItemState(data: ItemWithUriArray[] | undefined) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!data || !search.trim()) return data
    const searchValue = search.toLowerCase()
    return data.filter(({ name }) => name.toLowerCase().includes(searchValue))
  }, [data, search])

  return { filtered, search, setSearch }
}
