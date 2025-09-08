import Image from 'next/image'

import FormattedValue from '@/components/common/FormattedValue'
import QuickAmountButtons from '@/components/swap/QuickAmountButtons'
import { cn } from '@/lib/utils'

function formatWithThousandsSeparator(value: string) {
  if (!value) return ''
  const [int, dec] = value.split('.')
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted
}

function stripNonNumericExceptDot(value: string) {
  return value.replace(/[^\d.]/g, '')
}

interface SwapTokenInputProps {
  type: 'from' | 'to'
  token: any
  amount: string
  usdValue: number
  balance: string
  showInsufficientFunds?: boolean
  onAmountChange: (amount: string) => void
  onTokenSelect: () => void
  onQuickAmountSelect?: (percent: number) => void
  disabled?: boolean
  inputRef?: React.RefObject<HTMLInputElement>
}

export const SwapTokenInput = ({
  type,
  token,
  amount,
  usdValue,
  balance,
  showInsufficientFunds = false,
  onAmountChange,
  onTokenSelect,
  onQuickAmountSelect,
  disabled = false,
  inputRef,
}: SwapTokenInputProps) => (
  <div className='relative rounded-xl bg-muted/10 border border-border/30 p-4 group'>
    <div className='flex items-center justify-between mb-1'>
      <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
        {type === 'from' ? 'From' : 'To'}
      </div>
      {type === 'from' && onQuickAmountSelect && (
        <QuickAmountButtons
          onSelect={onQuickAmountSelect}
          disabled={!token || parseFloat(token.balance) <= 0}
          className='hidden group-hover:flex group-focus-within:flex'
        />
      )}
    </div>
    <div className='relative my-3'>
      <input
        ref={inputRef}
        type='text'
        value={formatWithThousandsSeparator(amount)}
        onChange={(e) => {
          const raw = stripNonNumericExceptDot(e.target.value.replace(/,/g, ''))
          const parts = raw.split('.')
          let clean = parts[0]
          if (parts.length > 1) {
            clean += '.' + parts.slice(1).join('')
          }
          onAmountChange(clean)
        }}
        placeholder='0.00'
        disabled={disabled}
        className={cn(
          'w-full pr-32 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground',
          showInsufficientFunds && 'text-red-500',
        )}
      />
      <button
        onClick={onTokenSelect}
        className='absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-border bg-muted/20 min-w-[100px] sm:min-w-[140px] text-sm sm:text-base'
      >
        {token ? (
          <>
            <Image
              src={token.icon}
              alt={token.symbol}
              width={24}
              height={24}
              className='rounded-full'
            />
            <span className='font-semibold'>{token.symbol}</span>
          </>
        ) : (
          <span>Select token</span>
        )}
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
        </svg>
      </button>
    </div>
    <div className='flex justify-between mt-2 text-xs text-muted-foreground'>
      <FormattedValue value={usdValue} isCurrency={true} useCompactNotation={false} />
      <FormattedValue
        value={balance}
        maxDecimals={8}
        suffix={token?.symbol ? ` ${token.symbol}` : ''}
        useCompactNotation={false}
        className={cn(showInsufficientFunds ? 'text-red-500' : 'text-muted-foreground')}
      />
    </div>
  </div>
)
