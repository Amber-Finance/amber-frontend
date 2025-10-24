'use client'

import React from 'react'

import { BigNumber } from 'bignumber.js'

import FormattedValue from '@/components/common/FormattedValue'
import { usePrices } from '@/hooks/market'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/formatting/format'

type Size = 'xs' | 'sm' | 'md' | 'lg'
type Align = 'left' | 'right' | 'center'

interface TokenBalanceProps {
  coin: Coin // Required coin object with denom and amount
  size?: Size
  align?: Align
  className?: string
  textClassName?: string
  useCompactNotation?: boolean // Whether to use compact notation (K, M, B) for large values
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
  textClassName = '',
  useCompactNotation = true,
}) => {
  // Get markets data from the store and price loading state
  const { markets } = useStore()
  const { isLoading: isPricesLoading } = usePrices()

  // Set font sizes based on size prop, with responsive variants
  const getAmountTextSize = (size: Size) => {
    if (size === 'xs') return 'text-xxs'
    if (size === 'sm') return 'text-xs sm:text-sm'
    if (size === 'lg') return 'text-base sm:text-lg'
    return 'text-sm sm:text-base'
  }

  const getValueTextSize = (size: Size) => {
    if (size === 'xs') return 'text-xxs'
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
  let usdValue = '0.00'
  let adjustedAmount: string
  let assetDecimals = 6
  let symbol = ''
  let showUsdValue = true

  if (markets && coin.denom) {
    // Find the matching market for this coin
    const market = markets.find((market) => market.asset.denom === coin.denom)

    if (market?.asset) {
      assetDecimals = market.asset.decimals || 6
      symbol = market.asset.symbol || ''
    }

    if (coin.amount && market?.price?.price) {
      // Price is available - calculate USD value
      usdValue = calculateUsdValueLegacy(coin.amount, market.price.price, assetDecimals).toString()
      adjustedAmount = new BigNumber(coin.amount).shiftedBy(-assetDecimals).toString()
      // showUsdValue remains true (default)
    } else if (isPricesLoading && coin.amount) {
      // Prices are loading - show token amount but hide USD value
      adjustedAmount = new BigNumber(coin.amount).shiftedBy(-assetDecimals).toString()
      showUsdValue = false
    } else {
      // No amount or price not loaded yet - show zero
      adjustedAmount = '0.' + '0'.repeat(assetDecimals)
      showUsdValue = false
    }
  } else {
    // Set default zero value with correct decimals
    adjustedAmount = '0.' + '0'.repeat(assetDecimals)
    showUsdValue = false
  }

  return (
    <div className={cn(alignmentClass, className)}>
      <div
        className={cn(
          amountTextSize,
          textClassName || 'text-gray-900 dark:text-white font-medium truncate',
        )}
      >
        {showUsdValue && (
          <FormattedValue
            value={usdValue}
            isCurrency={true}
            useCompactNotation={useCompactNotation}
          />
        )}
        {!showUsdValue && isPricesLoading && (
          <span className='text-muted-foreground text-xs'>Loading prices...</span>
        )}
        {!showUsdValue && !isPricesLoading && (
          <FormattedValue value='0' isCurrency={true} useCompactNotation={useCompactNotation} />
        )}
      </div>
      <div
        className={cn(
          valueTextSize,
          textClassName || 'text-gray-500 dark:text-gray-400 opacity-50 truncate',
        )}
      >
        <FormattedValue
          value={adjustedAmount}
          isCurrency={false}
          tokenDecimals={assetDecimals}
          suffix={` ${symbol}`}
          useCompactNotation={useCompactNotation}
        />
      </div>
    </div>
  )
}

export default TokenBalance
