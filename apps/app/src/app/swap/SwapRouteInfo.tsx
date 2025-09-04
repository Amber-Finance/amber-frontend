import React from 'react'

import BigNumber from 'bignumber.js'

import FormattedValue from '@/components/common/FormattedValue'

// Helper function to get route type
const getRouteType = (route: any): string => {
  if (!route || typeof route !== 'object') return ''
  const routeKeys = Object.keys(route)
  return routeKeys.length > 0 ? routeKeys[0] : ''
}

// Helper function to get price impact color
const getPriceImpactColor = (priceImpact: number): string => {
  if (priceImpact > 0) return 'text-green-500'
  if (priceImpact < 0) return 'text-red-500'
  return 'text-muted-foreground'
}

interface SwapRouteInfoProps {
  amountIn: string
  amountOut: BigNumber
  priceImpact: number
  fromToken: any
  toToken: any
  slippage: number
  isRouteLoading?: boolean
  route?: any
  isDebouncePending?: boolean
  routeError?: any
}

export const SwapRouteInfo: React.FC<SwapRouteInfoProps> = ({
  amountIn,
  amountOut,
  priceImpact,
  fromToken,
  toToken,
  slippage,
  isRouteLoading = false,
  route,
  isDebouncePending = false,
  routeError,
}) => {
  const hasValidAmounts = amountIn && parseFloat(amountIn) > 0 && amountOut.gt(0)
  const shouldShowLoading = isRouteLoading || isDebouncePending || (!hasValidAmounts && !routeError)

  if (shouldShowLoading) {
    return (
      <div className='p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2 text-sm my-2'>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Rate</span>
          <span className='inline-block h-4 w-32 bg-muted/40 rounded animate-pulse align-middle' />
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Price Impact</span>
          <span className='inline-block h-4 w-16 bg-muted/40 rounded animate-pulse align-middle' />
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Minimum Received</span>
          <span className='inline-block h-4 w-32 bg-muted/40 rounded animate-pulse align-middle' />
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Route</span>
          <span className='inline-block h-4 w-24 bg-muted/40 rounded animate-pulse align-middle' />
        </div>
      </div>
    )
  }

  if (routeError && !isRouteLoading && !isDebouncePending) {
    return (
      <div className='flex items-center justify-center h-[130px] rounded-lg border border-border/30 my-2'>
        <span className='text-muted-foreground text-sm'>No route available</span>
      </div>
    )
  }

  let rate = 0
  if (new BigNumber(amountIn).gt(0) && amountOut.gt(0)) {
    const inValue = new BigNumber(amountIn)
    const outValue = amountOut.shiftedBy(-toToken.decimals)
    rate = outValue.dividedBy(inValue).toNumber()
  }

  const slippageMultiplier = 1 - slippage / 100
  const minimumReceived = amountOut.shiftedBy(-toToken.decimals).multipliedBy(slippageMultiplier)

  return (
    <div className='p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2 text-sm my-2'>
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Rate</span>
        <span>
          1 {fromToken.symbol} ≈{' '}
          {isRouteLoading ? (
            <span className='inline-block h-4 w-24 bg-muted/40 rounded animate-pulse align-middle' />
          ) : (
            <FormattedValue
              value={rate}
              maxDecimals={6}
              useCompactNotation={false}
              suffix={` ${toToken.symbol}`}
            />
          )}
        </span>
      </div>
      {priceImpact !== null && (
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Price Impact</span>
          <span className={getPriceImpactColor(priceImpact)}>
            {priceImpact > 0 ? '+' : '-'}
            <FormattedValue
              value={Math.abs(priceImpact)}
              maxDecimals={2}
              suffix='%'
              useCompactNotation={false}
            />
          </span>
        </div>
      )}
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Minimum Received</span>
        <div className='text-right'>
          <div>
            <FormattedValue
              value={minimumReceived.toNumber()}
              maxDecimals={8}
              useCompactNotation={false}
              suffix={` ${toToken.symbol}`}
            />
          </div>
        </div>
      </div>

      {route && (
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Route</span>
          <span className='text-foreground capitalize'>{getRouteType(route)}</span>
        </div>
      )}
    </div>
  )
}
