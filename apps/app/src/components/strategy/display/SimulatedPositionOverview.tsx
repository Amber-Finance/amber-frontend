'use client'

import { BigNumber } from 'bignumber.js'
import { TrendingDown, TrendingUp } from 'lucide-react'

import FormattedValue from '@/components/common/FormattedValue'
import TokenBalance from '@/components/common/TokenBalance'
import { InfoCard } from '@/components/deposit'
import { getPriceImpactColor } from '@/components/strategy/helpers'
import { Separator } from '@/components/ui/separator'
import { getHealthFactorColor } from '@/utils/blockchain/healthComputer'

// Helper to render change indicator
const ChangeIndicator = ({ value, inverse = false }: { value: number; inverse?: boolean }) => {
  if (Math.abs(value) < 0.000001) return null
  const isPositive = inverse ? value < 0 : value > 0
  return (
    <span
      className={`ml-1 text-[10px] ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
    >
      {isPositive ? (
        <TrendingUp className='inline w-3 h-3' />
      ) : (
        <TrendingDown className='inline w-3 h-3' />
      )}{' '}
      {value > 0 && '+'}
      {value.toFixed(6)}
    </span>
  )
}

interface SimulatedPositionOverviewProps {
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

  // For existing positions (modify mode)
  activeStrategy?: ActiveStrategy
  getEstimatedEarningsUsd?: () => string
  existingHealthFactor?: number

  // Loading and swap states
  isCalculatingPositions?: boolean
  isSwapLoading?: boolean
  showSwapDetails?: boolean
  swapRouteInfo?: SwapRouteInfo | null
  swapError?: Error | null
  isLeverageIncrease?: boolean

  // Initial amounts (for deploy mode)
  initialCollateralAmount?: number
}

export function SimulatedPositionOverview({
  strategy,
  displayValues,
  positionCalcs,
  healthFactor,
  marketData,
  activeStrategy,
  getEstimatedEarningsUsd,
  existingHealthFactor,
  isCalculatingPositions = false,
  isSwapLoading = false,
  showSwapDetails = false,
  swapRouteInfo = null,
  swapError = null,
  isLeverageIncrease = true,
  initialCollateralAmount = 0,
}: SimulatedPositionOverviewProps) {
  const hasExistingPosition = !!activeStrategy
  const isModifying = hasExistingPosition

  // Loading state - single skeleton for all data
  if (
    showSwapDetails &&
    (isCalculatingPositions || isSwapLoading || (!swapRouteInfo && !swapError))
  ) {
    return (
      <InfoCard title={isModifying ? 'Position Overview' : 'Projected Position'}>
        <div className='space-y-4'>
          <div className='space-y-3'>
            <div className='h-4 w-32 bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-4/5 bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-3/4 bg-muted/40 rounded animate-pulse' />
            <div className='h-12 w-full bg-muted/40 rounded animate-pulse' />
            <div className='h-4 w-2/3 bg-muted/40 rounded animate-pulse' />
          </div>
        </div>
      </InfoCard>
    )
  }

  // Don't render if no swap details to show
  if (!showSwapDetails || !swapRouteInfo) {
    return null
  }

  // Calculate position values
  const priceImpact = swapRouteInfo?.priceImpact?.toNumber() || 0

  // Current position values (for modify mode)
  const currentCollateral = hasExistingPosition
    ? activeStrategy!.collateralAsset.amountFormatted
    : 0
  const currentBorrowed = hasExistingPosition ? activeStrategy!.debtAsset.amountFormatted : 0
  const currentSupplies = hasExistingPosition
    ? positionCalcs.supplies ||
      activeStrategy!.collateralAsset.amountFormatted - activeStrategy!.debtAsset.amountFormatted
    : initialCollateralAmount

  // Projected/final position values
  const projectedCollateral = positionCalcs.totalPosition
  const projectedBorrowed = positionCalcs.borrowAmount
  const projectedSupplies = projectedCollateral - projectedBorrowed

  // Calculate changes (deltas)
  const collateralChange = projectedCollateral - currentCollateral
  const borrowChange = projectedBorrowed - currentBorrowed
  const suppliesChange = projectedSupplies - currentSupplies
  const healthChange = existingHealthFactor ? healthFactor - existingHealthFactor : 0

  return (
    <InfoCard title={isModifying ? 'New Position After Adjustment' : 'Projected Position'}>
      <div className='space-y-3'>
        {/* Swap Transaction Details */}
        <div className='space-y-2'>
          <div className='text-xs font-medium uppercase tracking-wider'>Transaction Details</div>

          <div className='space-y-1.5'>
            {/* What's being swapped */}
            <div className='flex justify-between items-center text-xs'>
              <span className='text-muted-foreground'>
                {isLeverageIncrease ? 'Borrow to be swapped' : 'Collateral to be swapped'}
              </span>
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

            {/* What you receive */}
            <div className='flex justify-between items-center text-xs'>
              <span className='text-muted-foreground'>
                {isLeverageIncrease ? 'Added Collateral' : 'Debt Repayment'}
              </span>
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

            {/* Price Impact */}
            <div className='flex justify-between items-center text-xs'>
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

        <Separator />

        {/* Final Position Breakdown */}
        <div className='space-y-2'>
          <div className='text-xs font-medium uppercase tracking-wider'>
            {isModifying ? 'New Position Breakdown' : 'Position Breakdown'}
          </div>

          <div className='space-y-1.5'>
            {/* Total Collateral */}
            <div className='flex justify-between items-center text-xs'>
              <span className='text-muted-foreground'>Total Collateral</span>
              <div className='text-right'>
                <div className='font-medium text-foreground flex items-center justify-end'>
                  <TokenBalance
                    coin={{
                      denom: strategy.collateralAsset.denom,
                      amount: new BigNumber(projectedCollateral)
                        .shiftedBy(strategy.collateralAsset.decimals || 8)
                        .toString(),
                    }}
                    size='xs'
                    align='right'
                  />
                  {isModifying && <ChangeIndicator value={collateralChange} />}
                </div>
              </div>
            </div>

            {/* Total Borrowed */}
            <div className='flex justify-between items-center text-xs'>
              <span className='text-muted-foreground'>Total Borrowed</span>
              <div className='text-right'>
                <div className='font-medium text-foreground flex items-center justify-end'>
                  <TokenBalance
                    coin={{
                      denom: strategy.debtAsset.denom,
                      amount: new BigNumber(projectedBorrowed)
                        .shiftedBy(strategy.debtAsset.decimals || 6)
                        .toString(),
                    }}
                    size='xs'
                    align='right'
                  />
                  {isModifying && <ChangeIndicator value={borrowChange} />}
                </div>
              </div>
            </div>

            {/* Net Position (Your Supplies) */}
            <div className='flex justify-between items-center text-xs'>
              <span className='text-muted-foreground font-medium'>Your Supplies (Net)</span>
              <div className='text-right'>
                <div className='font-semibold text-foreground flex items-center justify-end'>
                  {projectedSupplies.toFixed(6)} {strategy.collateralAsset.symbol}
                  {isModifying && <ChangeIndicator value={suppliesChange} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Performance & Health */}
        <div className='space-y-2'>
          <div className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            {isModifying ? 'New Performance & Health' : 'Performance & Health'}
          </div>

          {/* Health Factor */}
          <div className='flex justify-between items-center text-xs mb-2'>
            <span className='text-muted-foreground'>Health Factor</span>
            <span className={`font-medium flex items-center ${getHealthFactorColor(healthFactor)}`}>
              {healthFactor?.toFixed(2) || '-'}
              {isModifying && existingHealthFactor && (
                <ChangeIndicator value={healthChange} inverse />
              )}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-lg border ${
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
              className={`font-semibold text-base ${
                positionCalcs.estimatedYearlyEarnings >= 0
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-red-600 dark:text-red-300'
              }`}
            >
              {positionCalcs.estimatedYearlyEarnings >= 0 ? '+' : ''}
              {positionCalcs.estimatedYearlyEarnings.toFixed(6)} {strategy.collateralAsset.symbol}
            </div>
            <div
              className={`text-xs mt-0.5 ${
                positionCalcs.estimatedYearlyEarnings >= 0
                  ? 'text-emerald-600/80 dark:text-emerald-400/80'
                  : 'text-red-600/80 dark:text-red-400/80'
              }`}
            >
              ~
              {getEstimatedEarningsUsd?.() ||
                displayValues.usdValue(positionCalcs.estimatedYearlyEarnings)}
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
