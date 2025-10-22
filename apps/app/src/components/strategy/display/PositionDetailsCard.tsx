'use client'

import { BigNumber } from 'bignumber.js'
import { Info } from 'lucide-react'

import FormattedValue from '@/components/common/FormattedValue'
import TokenBalance from '@/components/common/TokenBalance'
import { InfoCard } from '@/components/deposit'
import { getPriceImpactColor } from '@/components/strategy/helpers'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Separator } from '@/components/ui/separator'
import { getHealthFactorColor } from '@/utils/blockchain/healthComputer'

interface PositionDetailsCardProps {
  // Common props
  strategy: Strategy
  displayValues: {
    currentPrice?: string
    usdValue: (amount: number) => string
  }
  positionCalcs: {
    totalPosition: number
    borrowAmount: number
    estimatedYearlyEarnings: number
    supplies?: number
  }
  healthFactor: number
  marketData?: any

  // Existing position props (for modify mode)
  activeStrategy?: ActiveStrategy
  getEstimatedEarningsUsd?: () => string

  // Swap props
  isCalculatingPositions?: boolean
  isSwapLoading?: boolean
  showSwapDetails?: boolean
  swapRouteInfo?: SwapRouteInfo | null
  swapError?: Error | null
  isLeverageIncrease?: boolean
}

export function PositionDetailsCard({
  strategy,
  displayValues,
  positionCalcs,
  healthFactor,
  marketData,
  activeStrategy,
  getEstimatedEarningsUsd,
  isCalculatingPositions = false,
  isSwapLoading = false,
  showSwapDetails = false,
  swapRouteInfo = null,
  swapError = null,
  isLeverageIncrease = true,
}: PositionDetailsCardProps) {
  const hasExistingPosition = !!activeStrategy
  const hasSwapInfo = showSwapDetails && (swapRouteInfo || isSwapLoading || isCalculatingPositions)
  const currentPrice = marketData?.currentPrice || 0
  const formattedCurrentPrice = displayValues.currentPrice || `$${currentPrice.toFixed(2)}`

  // Loading state
  if (hasSwapInfo && (isCalculatingPositions || isSwapLoading || (!swapRouteInfo && !swapError))) {
    return (
      <InfoCard title='Position Details'>
        <div className='space-y-4'>
          <div className='h-5 w-28 bg-muted/40 rounded animate-pulse' />
          <div className='space-y-3'>
            <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-4/5 bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-3/4 bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-2/3 bg-muted/40 rounded animate-pulse' />
          </div>
        </div>
      </InfoCard>
    )
  }

  // Don't render if no existing position and no swap details
  if (!hasExistingPosition && !hasSwapInfo) {
    return null
  }

  // Calculate position components for existing positions
  const netSupplies = hasExistingPosition
    ? positionCalcs.supplies ||
      activeStrategy!.collateralAsset.amountFormatted - activeStrategy!.debtAsset.amountFormatted
    : 0
  const netCollateral = hasExistingPosition ? activeStrategy!.collateralAsset.amountFormatted : 0
  const netBorrowed = hasExistingPosition ? activeStrategy!.debtAsset.amountFormatted : 0

  // Swap calculations
  const priceImpact = swapRouteInfo?.priceImpact?.toNumber() || 0
  const swapLabel = isLeverageIncrease ? 'Borrow to be swapped' : 'Collateral to be swapped'
  const receiveLabel = isLeverageIncrease ? 'Added Collateral' : 'Debt Repay'

  return (
    <InfoCard title='Position Details'>
      <div className='space-y-3'>
        {/* Existing Position Section - Only show in modify mode */}
        {hasExistingPosition && (
          <>
            <div className='space-y-2'>
              <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Current Position
              </div>

              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Price</span>
                  <span className='font-medium text-foreground'>{formattedCurrentPrice}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Liquidation</span>
                  <div className='flex items-center gap-1'>
                    <span className='font-medium text-orange-600 dark:text-orange-400 text-[10px]'>
                      Yield-based
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='text-xs max-w-xs'>
                          Liquidation occurs when borrow rate &gt; supply rate. Negative yield
                          spread erodes collateral over time.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <Separator className='my-2' />

              <div className='space-y-1.5'>
                <div className='flex justify-between items-center text-xs'>
                  <span className='text-muted-foreground'>Net Collateral</span>
                  <div className='text-right'>
                    <div className='font-medium text-foreground'>
                      {netCollateral.toFixed(6)} {strategy.collateralAsset.symbol}
                    </div>
                    <div className='text-[10px] text-muted-foreground'>
                      ~${activeStrategy!.collateralAsset.usdValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className='flex justify-between items-center text-xs'>
                  <span className='text-muted-foreground'>Net Borrowed</span>
                  <div className='text-right'>
                    <div className='font-medium text-foreground'>
                      {netBorrowed.toFixed(6)} {strategy.debtAsset.symbol}
                    </div>
                    <div className='text-[10px] text-muted-foreground'>
                      ~${activeStrategy!.debtAsset.usdValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                <Separator className='my-2' />

                <div className='flex justify-between items-center text-xs'>
                  <span className='text-muted-foreground'>Net Supplies</span>
                  <div className='text-right'>
                    <div className='font-medium text-foreground'>
                      {netSupplies.toFixed(6)} {strategy.collateralAsset.symbol}
                    </div>
                    <div className='text-[10px] text-muted-foreground'>
                      ~${(netSupplies * currentPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Swap Details Section - Show when swap is happening */}
        {swapRouteInfo && showSwapDetails && (
          <>
            <div className='space-y-2'>
              <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                {hasExistingPosition ? 'Leverage Adjustment' : 'Swap Details'}
              </div>

              <div className='space-y-1.5 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{swapLabel}</span>
                  <TokenBalance
                    coin={{
                      denom: isLeverageIncrease
                        ? strategy.debtAsset.denom
                        : strategy.collateralAsset.denom,
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
                      denom: isLeverageIncrease
                        ? strategy.collateralAsset.denom
                        : strategy.debtAsset.denom,
                      amount: swapRouteInfo.amountOut.toString(),
                    }}
                    size='xs'
                    align='right'
                  />
                </div>

                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    {hasExistingPosition ? 'New Total Exposure' : 'Total Exposure'}
                  </span>
                  <TokenBalance
                    coin={{
                      denom: strategy.collateralAsset.denom,
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
                    {priceImpact > 0 && '+'}
                    <FormattedValue
                      value={priceImpact}
                      maxDecimals={2}
                      suffix='%'
                      useCompactNotation={false}
                    />
                  </span>
                </div>
              </div>
            </div>

            {hasExistingPosition && <Separator />}
          </>
        )}

        {/* Financial Metrics Section */}
        <div className='space-y-2'>
          <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            {hasExistingPosition ? 'Performance' : 'Projected Performance'}
          </div>

          {hasExistingPosition && (
            <div
              className={`p-2 rounded-lg border ${
                positionCalcs.estimatedYearlyEarnings >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-900/20 dark:border-emerald-700/30'
                  : 'bg-red-500/10 border-red-500/20 dark:bg-red-900/20 dark:border-red-700/30'
              }`}
            >
              <div
                className={`text-xs font-medium mb-1 ${
                  positionCalcs.estimatedYearlyEarnings >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400'
                }`}
              >
                Est. Annual Earnings
              </div>
              <div
                className={`font-semibold text-sm ${(() => {
                  const isPositive = activeStrategy
                    ? activeStrategy.netApy > 0
                    : positionCalcs.estimatedYearlyEarnings >= 0
                  return isPositive
                    ? 'text-emerald-600 dark:text-emerald-300'
                    : 'text-red-600 dark:text-red-300'
                })()}`}
              >
                {activeStrategy ? (
                  <>
                    {activeStrategy.netApy > 0 ? '+' : ''}
                    {(
                      (activeStrategy.collateralAsset.amountFormatted * activeStrategy.netApy) /
                      100
                    ).toFixed(6)}{' '}
                    {strategy.collateralAsset.symbol}
                  </>
                ) : (
                  <>
                    {positionCalcs.estimatedYearlyEarnings >= 0 ? '+' : ''}
                    {positionCalcs.estimatedYearlyEarnings.toFixed(6)}{' '}
                    {strategy.collateralAsset.symbol}
                  </>
                )}
              </div>
              <div
                className={`text-xs ${(() => {
                  const isPositive = activeStrategy
                    ? activeStrategy.netApy > 0
                    : positionCalcs.estimatedYearlyEarnings >= 0
                  return isPositive
                    ? 'text-emerald-600/80 dark:text-emerald-400/80'
                    : 'text-red-600/80 dark:text-red-400/80'
                })()}`}
              >
                ~
                {activeStrategy && getEstimatedEarningsUsd
                  ? `$${((activeStrategy.collateralAsset.usdValue * activeStrategy.netApy) / 100).toFixed(2)}`
                  : getEstimatedEarningsUsd?.() || '$0.00'}
              </div>
            </div>
          )}

          <div className='space-y-1.5 text-xs'>
            {hasExistingPosition && (
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Net APY</span>
                <span
                  className={`font-medium ${
                    activeStrategy && activeStrategy.netApy >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {activeStrategy ? `${activeStrategy.netApy.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            )}
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>
                {hasExistingPosition ? 'Your Health' : 'Health Factor'}
              </span>
              <span className={`font-medium ${getHealthFactorColor(healthFactor)}`}>
                {healthFactor?.toFixed(2) || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
