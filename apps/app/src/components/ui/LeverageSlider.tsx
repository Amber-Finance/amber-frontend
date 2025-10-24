import { Slider } from '@/components/ui/slider'

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
  /** Whether the slider is disabled */
  disabled?: boolean
}

export function LeverageSlider({
  leverage,
  onLeverageChange,
  maxLeverage,
  existingPositionLeverage,
  brandColor = '#F7931A',
  disabled = false,
}: LeverageSliderProps) {
  return (
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
        min={2}
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
}
