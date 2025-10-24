import { useMemo } from 'react'

import { useDebounce } from '@/hooks/common'

interface UseLeverageSliderProps {
  /** Current leverage value */
  leverage: number
  /** Debounce delay in milliseconds */
  debounceMs?: number
}

interface UseLeverageSliderReturn {
  /** Debounced leverage value (updates after delay) */
  debouncedLeverage: number
  /** Whether user is currently modifying (leverage !== debouncedLeverage) */
  isModifying: boolean
}

export function useLeverageSlider({
  leverage,
  debounceMs = 2000,
}: UseLeverageSliderProps): UseLeverageSliderReturn {
  // Debounce the leverage value
  const debouncedLeverage = useDebounce(leverage, debounceMs)

  // Track if user is currently modifying
  const isModifying = useMemo(() => {
    return Math.abs(leverage - debouncedLeverage) > 0.01
  }, [leverage, debouncedLeverage])

  return {
    debouncedLeverage,
    isModifying,
  }
}
