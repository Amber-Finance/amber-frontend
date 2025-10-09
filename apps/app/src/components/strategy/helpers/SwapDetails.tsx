'use client'

import React from 'react'

import { BigNumber } from 'bignumber.js'

import FormattedValue from '@/components/common/FormattedValue'
import TokenBalance from '@/components/common/TokenBalance'

import { getPriceImpactColor } from './strategyHelpers'

interface SwapDetailsProps {
  isCalculatingPositions: boolean
  isSwapLoading: boolean
  showSwapDetailsAndSlippage: boolean
  swapRouteInfo: SwapRouteInfo | null
  swapError: Error | null
  isLeverageIncrease: boolean
  debtAssetDecimals: number
  strategy: Strategy
  positionCalcs: any
  debtAssetDenom: string
  collateralAssetDenom: string
}

export default function SwapDetails({
  isCalculatingPositions,
  isSwapLoading,
  showSwapDetailsAndSlippage,
  swapRouteInfo,
  swapError,
  isLeverageIncrease,
  debtAssetDecimals,
  strategy,
  positionCalcs,
  debtAssetDenom,
  collateralAssetDenom,
}: SwapDetailsProps) {
  if (
    isCalculatingPositions ||
    (isSwapLoading && showSwapDetailsAndSlippage) ||
    (!swapRouteInfo && !swapError && showSwapDetailsAndSlippage)
  ) {
    return (
      <div className='p-2 rounded-lg bg-muted/20 border border-border/50 space-y-4'>
        <div className='h-5 w-28 bg-muted/40 rounded animate-pulse' />
        <div className='space-y-3'>
          <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
          <div className='h-4 w-4/5 bg-muted/40 rounded animate-pulse' />
          <div className='h-4 w-3/4 bg-muted/40 rounded animate-pulse' />
          <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
          <div className='h-4 w-2/3 bg-muted/40 rounded animate-pulse' />
        </div>
      </div>
    )
  }

  if (!swapRouteInfo) return null

  const fromAssetDecimals = isLeverageIncrease
    ? debtAssetDecimals
    : strategy.collateralAsset.decimals || 8
  const toAssetDecimals = isLeverageIncrease
    ? strategy.collateralAsset.decimals || 8
    : debtAssetDecimals

  let actualPriceImpact = 0
  if (swapRouteInfo.amountIn?.gt(0) && swapRouteInfo.amountOut?.gt(0)) {
    const inputAmount = swapRouteInfo.amountIn.shiftedBy(-fromAssetDecimals)
    const outputAmount = swapRouteInfo.amountOut.shiftedBy(-toAssetDecimals)
    actualPriceImpact =
      ((outputAmount.toNumber() - inputAmount.toNumber()) / inputAmount.toNumber()) * 100
  }

  const priceImpact = actualPriceImpact
  const swapLabel = isLeverageIncrease ? 'Borrow to be swapped' : 'Collateral to be swapped'
  const receiveLabel = isLeverageIncrease ? 'Added Collateral' : 'Debt Repay'

  // Derive sign once to avoid nested ternary in JSX
  let priceImpactSign = ''
  if (priceImpact < 0) priceImpactSign = '-'
  else if (priceImpact > 0) priceImpactSign = '+'

  return (
    <div className='p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1 text-sm'>
      <div className='font-medium text-foreground mb-2'>Swap Details</div>

      <div className='flex justify-between'>
        <span className='text-muted-foreground'>{swapLabel}</span>
        <TokenBalance
          coin={{
            denom: isLeverageIncrease ? debtAssetDenom : collateralAssetDenom,
            amount: swapRouteInfo.amountIn?.toString() || '0',
          }}
          size='xs'
          align='right'
        />
      </div>

      <div className='flex justify-between'>
        <span className='text-muted-foreground'>{receiveLabel}</span>
        <TokenBalance
          coin={{
            denom: isLeverageIncrease ? collateralAssetDenom : debtAssetDenom,
            amount: swapRouteInfo.amountOut.toString(),
          }}
          size='xs'
          align='right'
        />
      </div>

      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Total Exposure</span>
        <TokenBalance
          coin={{
            denom: collateralAssetDenom,
            amount: new BigNumber(positionCalcs.totalPosition)
              .shiftedBy(strategy.collateralAsset.decimals || 8)
              .toString(),
          }}
          size='xs'
          align='right'
        />
      </div>

      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Price Impact</span>
        <span className={getPriceImpactColor(priceImpact)}>
          {priceImpactSign}
          <FormattedValue
            value={Math.abs(priceImpact)}
            maxDecimals={2}
            suffix='%'
            useCompactNotation={false}
          />
        </span>
      </div>
    </div>
  )
}
