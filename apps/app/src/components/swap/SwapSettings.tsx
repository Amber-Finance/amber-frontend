import { Settings } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1] as const

interface SwapSettingsProps {
  slippage: number
  customSlippage: string
  showSlippagePopover: boolean
  onSlippageChange: (slippage: number) => void
  onCustomSlippageChange: (value: string) => void
  onPopoverToggle: (open: boolean) => void
}

export const SwapSettings = ({
  slippage,
  customSlippage,
  showSlippagePopover,
  onSlippageChange,
  onCustomSlippageChange,
  onPopoverToggle,
}: SwapSettingsProps) => (
  <Popover open={showSlippagePopover} onOpenChange={onPopoverToggle}>
    <PopoverTrigger asChild>
      <div className='flex items-center gap-1'>
        <span className='text-muted-foreground'>{slippage}% Slippage</span>
        <button className='hover:bg-muted/50 p-2 rounded-lg transition-colors flex items-center'>
          <Settings className='w-4 h-4' />
        </button>
      </div>
    </PopoverTrigger>
    <PopoverContent align='center' className='min-w-[180px] p-4 bg-card rounded-2xl'>
      <div className='font-semibold text-sm mb-1'>Slippage</div>
      <div className='flex gap-2 mb-2'>
        {SLIPPAGE_OPTIONS.map((val) => (
          <button
            key={val}
            className={cn(
              'px-3 py-1 rounded-lg border text-sm font-medium transition-colors',
              slippage === val
                ? 'bg-primary text-background border-primary'
                : 'bg-muted/30 border-border hover:bg-muted/50',
            )}
            onClick={() => {
              onSlippageChange(val)
              onCustomSlippageChange('')
              onPopoverToggle(false)
            }}
          >
            {val}%
          </button>
        ))}
        <input
          type='number'
          min='0'
          placeholder='Custom'
          value={customSlippage}
          onChange={(e) => onCustomSlippageChange(e.target.value)}
          onBlur={() => {
            if (customSlippage) {
              onSlippageChange(Number(customSlippage))
              onCustomSlippageChange('')
              onPopoverToggle(false)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customSlippage) {
              onSlippageChange(Number(customSlippage))
              onCustomSlippageChange('')
              onPopoverToggle(false)
            }
          }}
          className='w-16 px-2 py-1 rounded-lg border border-border bg-muted/20 text-xs outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        />
      </div>
      <div className='text-xs text-muted-foreground'>
        Your swap will fail if the price changes by more than this %.
      </div>
    </PopoverContent>
  </Popover>
)
