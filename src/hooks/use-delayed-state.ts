import { useEffect, useState } from "react"


export function useDelayedState(value: boolean, delay: number) {
  const [delayedValue, setDelayedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDelayedValue(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return delayedValue
}
