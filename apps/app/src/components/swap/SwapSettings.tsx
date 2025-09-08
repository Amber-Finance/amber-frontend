import { Settings } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
        <Button variant='outline' size='icon' className='hover:bg-muted/50'>
          <Settings className='w-4 h-4' />
        </Button>
      </div>
    </PopoverTrigger>
    <PopoverContent
      align='center'
      className='min-w-[240px] p-4 bg-card rounded-2xl border border-border/30'
    >
      <div className='space-y-4'>
        <div>
          <div className='font-semibold text-sm mb-2'>Slippage Tolerance</div>
          <div className='text-xs text-muted-foreground mb-3'>
            Your swap will fail if the price changes by more than this percentage.
          </div>
          <div className='flex gap-2 mb-2'>
            {SLIPPAGE_OPTIONS.map((val) => (
              <Button
                key={val}
                variant={slippage === val ? 'default' : 'outline'}
                size='sm'
                className='flex-1'
                onClick={() => {
                  onSlippageChange(val)
                  onCustomSlippageChange('')
                  onPopoverToggle(false)
                }}
              >
                {val}%
              </Button>
            ))}
          </div>
          <div className='flex gap-2'>
            <input
              type='number'
              min='0'
              max='50'
              step='0.1'
              placeholder='Custom %'
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
              className='flex-1 px-3 py-2 rounded-lg border border-border bg-muted/20 text-sm outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </div>
          {slippage > 5 && (
            <div className='text-xs text-amber-500 mt-2'>
              High slippage tolerance may result in unfavorable rates.
            </div>
          )}
        </div>
      </div>
    </PopoverContent>
  </Popover>
)
