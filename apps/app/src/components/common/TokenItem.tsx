import React from 'react'

import Image from 'next/image'

import FormattedValue from '@/components/common/FormattedValue'
import { cn } from '@/lib/utils'

interface TokenItemProps {
  token: TokenData
  isSelected?: boolean
  isDisabled?: boolean
  onClick?: (token: TokenData) => void
  className?: string
  showBalance?: boolean
  showUsdValue?: boolean
}

// Pure function for generating className
const generateTokenItemClassName = (
  isSelected: boolean,
  isDisabled: boolean,
  baseClassName: string = '',
): string =>
  cn(
    'flex items-center w-full px-4 py-3 rounded-xl transition-colors',
    isSelected && 'bg-muted/40',
    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/30 cursor-pointer',
    baseClassName,
  )

// Pure function for handling click events
const createClickHandler =
  (token: TokenData, isDisabled: boolean, onClick?: (token: TokenData) => void) => () => {
    if (isDisabled || !onClick) return
    onClick(token)
  }

// Pure component for token icon
const TokenIcon: React.FC<{ token: TokenData }> = ({ token }) => (
  <Image src={token.icon} alt={token.symbol} width={32} height={32} className='rounded-full' />
)

// Pure component for token info
const TokenInfo: React.FC<{ token: TokenData }> = ({ token }) => (
  <div className='ml-3 flex flex-col items-start min-w-0 flex-1'>
    <div className='font-medium text-sm'>{token.symbol}</div>
    <div className='text-xs text-muted-foreground truncate'>{token.name}</div>
  </div>
)

// Pure component for token balance display
const TokenBalance: React.FC<{
  token: TokenData
  showBalance: boolean
  showUsdValue: boolean
}> = ({ token, showBalance, showUsdValue }) => {
  if (!showBalance && !showUsdValue) return null

  return (
    <div className='ml-auto flex flex-col items-end min-w-0'>
      {showUsdValue && (
        <div className='font-semibold text-base'>
          <FormattedValue value={parseFloat(token.usdValue)} isCurrency={true} maxDecimals={2} />
        </div>
      )}
      {showBalance && (
        <div className='text-xs text-muted-foreground truncate'>
          <FormattedValue value={token.balance} maxDecimals={8} suffix={` ${token.symbol}`} />
        </div>
      )}
    </div>
  )
}

// Main pure component
export const TokenItem: React.FC<TokenItemProps> = ({
  token,
  isSelected = false,
  isDisabled = false,
  onClick,
  className = '',
  showBalance = true,
  showUsdValue = true,
}) => {
  const handleClick = createClickHandler(token, isDisabled, onClick)
  const itemClassName = generateTokenItemClassName(isSelected, isDisabled, className)

  return (
    <button className={itemClassName} onClick={handleClick} disabled={isDisabled} type='button'>
      <TokenIcon token={token} />
      <TokenInfo token={token} />
      <TokenBalance token={token} showBalance={showBalance} showUsdValue={showUsdValue} />
    </button>
  )
}

// Higher-order component for creating specialized token items
export const createTokenItemVariant =
  (defaultProps: Partial<TokenItemProps>) => (props: TokenItemProps) => (
    <TokenItem {...defaultProps} {...props} />
  )

// Pre-configured variants
export const CompactTokenItem = createTokenItemVariant({
  showBalance: false,
  showUsdValue: true,
})

export const DetailedTokenItem = createTokenItemVariant({
  showBalance: true,
  showUsdValue: true,
})

export const SimpleTokenItem = createTokenItemVariant({
  showBalance: false,
  showUsdValue: false,
})
