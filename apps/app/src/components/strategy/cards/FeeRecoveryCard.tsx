'use client'

import FormattedValue from '@/components/common/FormattedValue'
import { InfoCard } from '@/components/deposit'
import { Separator } from '@/components/ui/separator'
import { useStrategyFeeBreakdown } from '@/hooks/strategy/useStrategyFeeBreakdown'

// Loading skeleton component
const FeeRecoveryCardSkeleton = ({ title }: { title: string }) => (
  <InfoCard title={title}>
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
    isLeverageIncrease?: boolean
  }
  slippage: number
  currentPrice: number
  debtPrice: number
  isCalculating?: boolean
  isSwapLoading?: boolean
  mode?: 'deploy' | 'modify'
}

/**
 * FeeRecoveryCard Component (Costs Recovery Analysis)
 *
 * Displays swap value comparison and recovery analysis for strategy deployment:
 * - Input/output USD values using oracle prices
 * - Swapping costs (slippage + fees)
 * - Recovery time based on leveraged APY
 *
 * Helps users understand:
 * 1. The cost of swapping when opening/modifying a position
 * 2. How long it will take to recover these costs at current APY
 * 3. Whether the strategy is economically viable
 */
export function FeeRecoveryCard({
  strategy,
  swapRouteInfo,
  positionCalcs,
  slippage,
  currentPrice,
  debtPrice,
  isCalculating = false,
  isSwapLoading = false,
  mode = 'deploy',
}: FeeRecoveryCardProps) {
  const title = mode === 'modify' ? 'Update Costs Recovery Analysis' : 'Deploy Costs Recovery Analysis'
  const isLeverageIncrease = positionCalcs.isLeverageIncrease ?? true
  const feeBreakdown = useStrategyFeeBreakdown(
    swapRouteInfo,
    positionCalcs,
    currentPrice,
    debtPrice,
    strategy.debtAsset.decimals || 6,
    strategy.collateralAsset.decimals || 8,
    slippage,
    isLeverageIncrease,
  )

  // Loading state
  if (isCalculating || isSwapLoading || (!swapRouteInfo && !feeBreakdown.slippageLossUsd)) {
    return <FeeRecoveryCardSkeleton title={title} />
  }

  // Don't render if no swap route info
  if (!swapRouteInfo || !swapRouteInfo.amountOut) {
    return null
  }

  const leveragedApyPercent = positionCalcs.leveragedApy * 100

  return (
    <InfoCard title={title}>
      <div className='space-y-3'>
        {/* Swap Value Section */}
        <div className='space-y-2'>
          <div className='text-xs font-medium uppercase tracking-wider'>Swap Value</div>

          <div className='space-y-1.5 text-xs'>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Input Value</span>
              <span className='font-medium text-foreground'>
                ${feeBreakdown.inputValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Output Value</span>
              <span className='font-medium text-foreground'>
                ${feeBreakdown.outputValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <Separator className='my-1.5' />

            <div className='flex justify-between items-center pt-1'>
              <span className='font-medium'>Swapping Costs</span>
              <div className='text-right'>
                <div className={`font-semibold ${feeBreakdown.slippageLossUsd > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {feeBreakdown.slippageLossUsd > 0 ? '-' : '+'}${Math.abs(feeBreakdown.slippageLossUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className='text-[10px] text-muted-foreground'>
                  {feeBreakdown.slippageLossUsd > 0 ? '-' : '+'}{Math.abs(feeBreakdown.slippagePercent).toFixed(2)}% of input
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
              If execution moves more than {slippage.toFixed(2)}% (up to $
              {feeBreakdown.maxSlippageLossUsd.toFixed(2)}), the transaction will revert.
            </div>
          </div>
        </div>

        <Separator className='my-2' />

        {/* Time for Fee Recovery Section */}
        <div className='space-y-2'>
          <div className='text-xs font-medium uppercase tracking-wider'>Recovery Time</div>

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

            {/* Row 2: Time to Recover */}
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Time to Recover</span>
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
                Current APY is negative or zero. Slippage will not be recovered.
              </div>
            </div>
          )}
        </div>
      </div>
    </InfoCard>
  )
}
