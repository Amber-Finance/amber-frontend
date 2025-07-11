import Image from 'next/image'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance?: string
  price?: number
  denom: string
}

interface TokenSelectorProps {
  token: SwapToken | null
  onTokenSelect: (token: SwapToken) => void
  disabledTokens: string[]
  label: string
  availableTokens: SwapToken[]
}

export function TokenSelector({
  token,
  onTokenSelect,
  disabledTokens,
  label,
  availableTokens,
}: TokenSelectorProps) {
  return (
    <div className='flex justify-between items-center mb-2'>
      <span className='text-sm text-muted-foreground font-medium'>{label}</span>
      <Select
        value={token?.symbol || ''}
        onValueChange={(value) => {
          const selectedToken = availableTokens.find((t) => t.symbol === value)
          if (selectedToken) onTokenSelect(selectedToken)
        }}
      >
        <SelectTrigger className='min-w-28 bg-muted/20 border-border font-semibold'>
          <SelectValue placeholder='Select'>
            {token && (
              <div className='flex items-center gap-2'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  width={24}
                  height={24}
                  className='rounded-full'
                />
                <span className='text-sm'>{token.symbol}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className='max-h-80 w-[calc(100vw-2rem)] max-w-[420px] min-w-[280px] bg-background'
          align='end'
        >
          {availableTokens.map((tokenOption) => (
            <SelectItem
              key={tokenOption.symbol}
              value={tokenOption.symbol}
              disabled={disabledTokens.includes(tokenOption.symbol)}
            >
              <div className='flex items-center justify-between w-full'>
                <Image
                  src={tokenOption.icon}
                  alt={tokenOption.symbol}
                  width={32}
                  height={32}
                  className='rounded-full'
                />
                <div className='ml-3'>
                  <div className='font-medium text-sm'>{tokenOption.symbol}</div>
                  <div className='text-xs text-muted-foreground'>{tokenOption.name}</div>
                </div>
                <div className='ml-auto text-sm font-medium'>{tokenOption.balance}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export type { SwapToken }
