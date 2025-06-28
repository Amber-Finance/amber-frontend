import React from 'react'

interface AmountInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  token: { symbol: string; brandColor: string }
  usdValue: string
  balance?: string
  placeholder?: string
  disabled?: boolean
}

export function AmountInput({
  value,
  onChange,
  token,
  usdValue,
  balance = '0',
  placeholder = '0.000000',
  disabled = false,
}: AmountInputProps) {
  const handleMaxClick = () => {
    const event = {
      target: { value: balance },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(event)
  }

  const handleHalfClick = () => {
    const halfValue = (parseFloat(balance) / 2).toString()
    const event = {
      target: { value: halfValue },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(event)
  }

  return (
    <div className='relative mb-3'>
      <input
        type='number'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className='w-full bg-background/50 border border-border/60 rounded-lg px-3 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        style={
          {
            '--tw-ring-color': `${token.brandColor}80`,
          } as React.CSSProperties
        }
      />
      <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3'>
        <div className='flex flex-col items-end gap-1'>
          <span className='text-xs text-muted-foreground'>{token.symbol}</span>
          <span className='text-xs text-muted-foreground'>{usdValue}</span>
        </div>
        <div className='flex flex-col items-center gap-1'>
          <button
            type='button'
            onClick={handleMaxClick}
            className='text-[10px] px-2 py-0.5 rounded bg-muted/50 hover:bg-muted/70 transition-colors font-medium cursor-pointer'
            style={{ color: token.brandColor }}
          >
            MAX
          </button>
          <button
            type='button'
            onClick={handleHalfClick}
            className='text-[10px] px-2 py-0.5 rounded bg-muted/50 hover:bg-muted/70 transition-colors font-medium cursor-pointer'
            style={{ color: token.brandColor }}
          >
            HALF
          </button>
        </div>
      </div>
    </div>
  )
}
