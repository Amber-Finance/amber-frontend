'use client'

import React from 'react'

import { BigNumber } from 'bignumber.js'

import FormattedValue from '@/components/common/FormattedValue'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

type Size = 'sm' | 'md' | 'lg'
type Align = 'left' | 'right' | 'center'

interface TokenBalanceProps {
  coin: Coin // Required coin object with denom and amount
  size?: Size
  align?: Align
  className?: string
}

/**
 * TokenBalance component displays a token amount with its USD value underneath.
 * Uses the FormattedValue component for consistent formatting across the application.
 * Gets the USD value automatically from the store based on the coin's denom.
 */
const TokenBalance: React.FC<TokenBalanceProps> = ({
  coin,
  size = 'md',
  align = 'right',
  className = '',
}) => {
  // Get markets data from the store
  const { markets } = useStore()

  // Set font sizes based on size prop, with responsive variants
  const getAmountTextSize = (size: Size) => {
    if (size === 'sm') return 'text-xs sm:text-sm'
    if (size === 'lg') return 'text-base sm:text-lg'
    return 'text-sm sm:text-base'
  }

  const getValueTextSize = (size: Size) => {
    if (size === 'sm') return 'text-xxs sm:text-xs'
    if (size === 'lg') return 'text-sm sm:text-base'
    return 'text-xs sm:text-sm'
  }

  // Set alignment classes
  const getAlignmentClass = (align: Align) => {
    if (align === 'left') return 'text-left'
    if (align === 'center') return 'text-center'
    return 'text-right'
  }

  const amountTextSize = getAmountTextSize(size)
  const valueTextSize = getValueTextSize(size)
  const alignmentClass = getAlignmentClass(align)

  // Calculate USD value from the store using coin.denom
  let usdValue = '0'
  let adjustedAmount = '0'

  if (markets && coin.denom && coin.amount) {
    // Find the matching market for this coin
    const market = markets.find((market) => market.asset.denom === coin.denom)

    if (market?.price?.price) {
      const decimals = market.asset.decimals || 6
      usdValue = calculateUsdValueLegacy(coin.amount, market.price.price, decimals).toString()
    }
    if (market?.asset) {
      adjustedAmount = new BigNumber(coin.amount).shiftedBy(-market.asset.decimals).toString()
    }
  }

  // Only show USD value if it's not zero
  const showUsdValue = usdValue !== '0'

  return (
    <div className={`${alignmentClass} ${className}`}>
      <div className={`${amountTextSize} text-gray-900 dark:text-white font-medium truncate`}>
        <FormattedValue value={adjustedAmount} isCurrency={false} />
      </div>
      {showUsdValue && (
        <div className={`${valueTextSize} text-gray-500 dark:text-gray-400 opacity-50 truncate`}>
          <FormattedValue value={usdValue} isCurrency={true} />
        </div>
      )}
    </div>
  )
}

export default TokenBalance
