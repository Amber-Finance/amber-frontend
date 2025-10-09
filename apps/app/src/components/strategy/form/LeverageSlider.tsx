import { useEffect, useMemo } from 'react'

import { Slider } from '@/components/ui/slider'
import useDebounce from '@/hooks/useDebounce'

interface LeverageSliderProps {
  /** Current leverage value for the slider */
  leverage: number
  /** Callback when leverage changes (real-time) */
  onLeverageChange: (value: number[]) => void
  /** Maximum allowed leverage */
  maxLeverage: number
  /** Existing position leverage (for modify mode) */
  existingPositionLeverage?: number
  /** Brand color for the slider */
  brandColor?: string
  /** Debounce delay in milliseconds */
  debounceMs?: number
  /** Whether the slider is disabled */
  disabled?: boolean
}

interface LeverageSliderReturn {
  /** Debounced leverage value (updates after delay) */
  debouncedLeverage: number
  /** Whether user is currently modifying (leverage !== debouncedLeverage) */
  isModifying: boolean
  /** The slider component to render */
  SliderComponent: React.ReactNode
}

export function useLeverageSlider({
  leverage,
  onLeverageChange,
  maxLeverage,
  existingPositionLeverage,
  brandColor = '#F7931A',
  debounceMs = 2000,
  disabled = false,
}: LeverageSliderProps): LeverageSliderReturn {
  // Debounce the leverage value
  const debouncedLeverage = useDebounce(leverage, debounceMs)

  // Track if user is currently modifying
  const isModifying = useMemo(() => {
    return Math.abs(leverage - debouncedLeverage) > 0.01
  }, [leverage, debouncedLeverage])

  // Create the slider component
  const SliderComponent = (
    <div className='space-y-2'>
      <div className='flex justify-between items-center'>
        <span
          className={`text-xs font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}
        >
          Multiplier
        </span>
        <div className='flex items-center gap-2'>
          <span
            className={`text-sm font-semibold ${disabled ? 'text-muted-foreground' : 'text-accent-foreground'}`}
          >
            {leverage.toFixed(2)}x
          </span>
          {existingPositionLeverage && (
            <span className='text-xs text-muted-foreground'>
              (from {existingPositionLeverage.toFixed(2)}x)
            </span>
          )}
        </div>
      </div>

      <Slider
        value={[leverage]}
        onValueChange={disabled ? undefined : onLeverageChange}
        max={maxLeverage}
        min={2.0}
        step={0.01}
        className={'w-full' + (disabled ? ' opacity-50' : '')}
        brandColor={brandColor}
        disabled={disabled}
      />

      <div className='flex justify-between text-xs text-muted-foreground'>
        <span>2.0x</span>
        <span>Max {maxLeverage.toFixed(1)}x</span>
      </div>
    </div>
  )

  return {
    debouncedLeverage,
    isModifying,
    SliderComponent,
  }
}

// Alternative: Standalone component version
interface StandaloneLeverageSliderProps extends LeverageSliderProps {
  /** Callback when debounced leverage changes */
  onDebouncedLeverageChange?: (debouncedLeverage: number, isModifying: boolean) => void
}

export function LeverageSlider({
  leverage,
  onLeverageChange,
  maxLeverage,
  existingPositionLeverage,
  brandColor = '#F7931A',
  debounceMs = 2000,
  disabled = false,
  onDebouncedLeverageChange,
}: StandaloneLeverageSliderProps) {
  const { debouncedLeverage, isModifying, SliderComponent } = useLeverageSlider({
    leverage,
    onLeverageChange,
    maxLeverage,
    existingPositionLeverage,
    brandColor,
    debounceMs,
    disabled,
  })

  // Notify parent when debounced values change
  useEffect(() => {
    if (onDebouncedLeverageChange) {
      onDebouncedLeverageChange(debouncedLeverage, isModifying)
    }
  }, [debouncedLeverage, isModifying, onDebouncedLeverageChange])

  return <>{SliderComponent}</>
}
