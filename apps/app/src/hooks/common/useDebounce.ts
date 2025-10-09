import { useEffect, useState } from 'react'

export default function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Enhanced debounce hook that also tracks if debouncing is in progress
export function useDebounceWithStatus<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    // Check if the value is different from the debounced value
    const isDifferent = JSON.stringify(value) !== JSON.stringify(debouncedValue)

    if (isDifferent) {
      setIsDebouncing(true)

      const handler = setTimeout(() => {
        setDebouncedValue(value)
        setIsDebouncing(false)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    } else {
      setIsDebouncing(false)
    }
  }, [value, delay, debouncedValue])

  return { debouncedValue, isDebouncing }
}
