import React from 'react'

import BigNumber from 'bignumber.js'

import FormattedValue from '@/components/common/FormattedValue'
import { cn } from '@/lib/utils'

interface SwapRouteInfoProps {
  amountIn: string
  amountOut: string
  priceImpact: number
  fromToken: any
  toToken: any
  slippage: number
  isRouteLoading?: boolean
}

export const SwapRouteInfo: React.FC<SwapRouteInfoProps> = ({
  amountIn,
  amountOut,
  priceImpact,
  fromToken,
  toToken,
  slippage,
  isRouteLoading = false,
}) => {
  if (isRouteLoading) {
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
      </div>
    )
  }

  if (!amountOut || !fromToken || !toToken || !amountIn) {
    return (
      <div className='flex items-center justify-center h-[72px] rounded-lg border border-border/30 my-2'>
        <span className='text-muted-foreground text-sm'>No route available</span>
      </div>
    )
  }

  let rate = 0
  const inValue = parseFloat(amountIn)
  const outValue = parseFloat(amountOut)
  if (inValue > 0 && outValue > 0) {
    rate = new BigNumber(outValue).dividedBy(new BigNumber(inValue)).toNumber()
  }

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
          <span
            className={cn(
              priceImpact > 0
                ? 'text-green-500'
                : priceImpact < 0
                  ? 'text-red-500'
                  : 'text-muted-foreground',
            )}
          >
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
        <FormattedValue
          value={amountOut}
          maxDecimals={8}
          useCompactNotation={false}
          suffix={` ${toToken.symbol}`}
        />
      </div>
    </div>
  )
}
