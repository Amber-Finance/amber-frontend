'use client'

import FormattedValue from '@/components/common/FormattedValue'
import { InfoCard } from '@/components/deposit'
import { Separator } from '@/components/ui/separator'
import { useStrategyFeeBreakdown } from '@/hooks/strategy/useStrategyFeeBreakdown'

// Loading skeleton component
const FeeRecoveryCardSkeleton = () => (
  <InfoCard title='Fee Recovery Analysis'>
    <div className='space-y-4'>
      <div className='h-5 w-32 bg-muted/40 rounded animate-pulse' />
      <div className='space-y-3'>
        <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
        <div className='h-4 w-4/5 bg-muted/40 rounded animate-pulse' />
        <div className='h-16 w-full bg-muted/40 rounded animate-pulse' />
        <div className='h-4 w-3/4 bg-muted/40 rounded animate-pulse' />
      </div>
    </div>
  </InfoCard>
)

interface FeeRecoveryCardProps {
  strategy: Strategy
  swapRouteInfo: SwapRouteInfo | null
  positionCalcs: {
    leveragedApy: number
    totalPosition: number
    estimatedYearlyEarnings: number
    borrowAmount: number
  }
  slippage: number
  currentPrice: number
  isCalculating?: boolean
  isSwapLoading?: boolean
}

/**
 * FeeRecoveryCard Component
 *
 * Displays comprehensive fee breakdown and break-even analysis for strategy deployment:
 * - Total fees from swaps and slippage
 * - Break-even time based on leveraged APY
 * - Visual indicators for fee recovery timeline
 * - Swap route details with user's slippage tolerance
 *
 * Helps users understand:
 * 1. How much they'll pay in fees to open/modify the position
 * 2. How long it will take to overcome these fees at current APY
 * 3. Whether the strategy is economically viable
 */
export function FeeRecoveryCard({
  strategy,
  swapRouteInfo,
  positionCalcs,
  slippage,
  currentPrice,
  isCalculating = false,
  isSwapLoading = false,
}: FeeRecoveryCardProps) {
  const feeBreakdown = useStrategyFeeBreakdown(
    swapRouteInfo,
    positionCalcs,
    currentPrice,
    strategy.debtAsset.decimals || 6,
    strategy.collateralAsset.decimals || 8,
    slippage,
  )

  // Loading state
  if (isCalculating || isSwapLoading || (!swapRouteInfo && !feeBreakdown.totalFeesUsd)) {
    return <FeeRecoveryCardSkeleton />
  }

  // Don't render if no swap route info
  if (!swapRouteInfo || !swapRouteInfo.amountIn) {
    return null
  }

  const leveragedApyPercent = positionCalcs.leveragedApy * 100

  return (
    <InfoCard title='Fee Recovery Analysis'>
      <div className='space-y-3'>
        {/* Fees Section */}
        <div className='space-y-2'>
          <div className='text-xs font-medium uppercase tracking-wider'>Fees</div>

          <div className='space-y-1.5 text-xs'>
            {feeBreakdown.swapFeeUsd > 0 && (
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Swap Fee</span>
                <span className='font-medium text-foreground'>
                  ${feeBreakdown.swapFeeUsd.toFixed(2)}
                </span>
              </div>
            )}
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Price Impact</span>
              <span className='font-medium text-foreground'>
                ${feeBreakdown.priceImpactUsd.toFixed(2)}
              </span>
            </div>

            <Separator className='my-1.5' />

            <div className='flex justify-between items-center pt-1'>
              <span className='font-medium'>Total Fees</span>
              <div className='text-right'>
                <div className='font-semibold text-foreground'>
                  ${feeBreakdown.totalFeesUsd.toFixed(2)}
                </div>
                <div className='text-[10px] text-muted-foreground'>
                  {feeBreakdown.feesAsPercentOfPosition.toFixed(3)}% of position
                </div>
              </div>
            </div>
          </div>

          {/* Slippage Protection Info */}
          <div className='text-[11px] text-muted-foreground bg-muted/20 rounded-lg p-2 mt-2'>
            <div className='flex justify-between items-center mb-1'>
              <span>Slippage Tolerance:</span>
              <span className='font-medium text-foreground'>{slippage.toFixed(2)}%</span>
            </div>
            <div>
              Price impact is expected at ${feeBreakdown.priceImpactUsd.toFixed(2)}. If actual
              execution price moves more than {slippage.toFixed(2)}% (up to $
              {feeBreakdown.maxSlippageLossUsd.toFixed(2)}), the transaction will revert to protect
              you.
            </div>
          </div>
        </div>

        <Separator className='my-2' />

        {/* Time for Fee Recovery Section */}
        <div className='space-y-2'>
          <div className='text-xs font-medium uppercase tracking-wider'>Time for Fee Recovery</div>

          <div className='space-y-1.5 text-xs'>
            {/* Row 1: Leveraged APY */}
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Leveraged APY</span>
              <span
                className={`font-medium ${
                  positionCalcs.leveragedApy >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                <FormattedValue
                  value={leveragedApyPercent}
                  maxDecimals={2}
                  suffix='%'
                  useCompactNotation={false}
                />
              </span>
            </div>

            {/* Row 2: Time to Recover Fees */}
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Time to Recover Fees</span>
              <span className={`font-medium ${feeBreakdown.recoveryHealthColor}`}>
                {feeBreakdown.breakEvenFormatted}
              </span>
            </div>
          </div>

          {/* Alert only for negative APY */}
          {!feeBreakdown.canRecover && positionCalcs.leveragedApy <= 0 && (
            <div className='text-xs bg-red-500/5 border border-red-500/20 rounded-lg p-2 mt-2'>
              <div className='font-medium text-red-600 dark:text-red-400 mb-0.5'>Negative APY</div>
              <div className='text-[11px] text-muted-foreground'>
                Current APY is negative or zero. Fees will not be recovered and your position will
                lose value over time. Reconsider this strategy.
              </div>
            </div>
          )}
        </div>
      </div>
    </InfoCard>
  )
}
