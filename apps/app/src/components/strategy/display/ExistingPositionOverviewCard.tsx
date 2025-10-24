import { Info } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Separator } from '@/components/ui/separator'
import { getHealthFactorColor } from '@/utils/blockchain/healthComputer'

interface PositionOverviewCardProps {
  strategy: Strategy
  activeStrategy?: ActiveStrategy // Add activeStrategy for modify mode
  displayValues: {
    currentPrice: string
    usdValue: (amount: number) => string
  }
  positionCalcs: {
    totalPosition: number
    borrowAmount: number
    estimatedYearlyEarnings: number
    supplies?: number // Net equity (user's actual deposit minus debt)
  }
  getEstimatedEarningsUsd: () => string
  healthFactor: number
  marketData?: any // Add marketData for price calculations
}

export function ExistingPositionOverviewCard({
  strategy,
  activeStrategy,
  displayValues,
  positionCalcs,
  getEstimatedEarningsUsd,
  healthFactor,
  marketData,
}: PositionOverviewCardProps) {
  // Only render if there's an active strategy (existing position)
  if (!activeStrategy) {
    return null
  }

  // Calculate position components - STATIC, based only on existing position
  const netCollateral = activeStrategy.collateralAsset.amountFormatted
  const netBorrowed = activeStrategy.debtAsset.amountFormatted
  const netEquity = netCollateral - netBorrowed

  const currentPrice = marketData?.currentPrice || 0

  // Calculate static estimated earnings from existing position only
  // Earnings are based on equity (your actual investment), not total collateral
  const existingEstimatedEarnings = (netEquity * activeStrategy.netApy) / 100

  return (
    <InfoCard title='Existing Position Overview'>
      <div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <div className='space-y-1'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Current price</span>
                <span className='font-medium text-foreground'>{displayValues.currentPrice}</span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Liquidation mechanism</span>
                <div className='flex items-start gap-1'>
                  <span className='font-medium text-orange-600 dark:text-orange-400'>
                    Yield-based
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-xs max-w-xs'>
                        Liquidation occurs when borrow rate &gt; supply rate. Negative yield spread
                        erodes collateral over time, increasing leverage. At max leverage, partial
                        liquidation occurs.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            <Separator />

            <div className='space-y-1'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Net Collateral</span>
                <div className='text-right'>
                  <div className='font-medium text-foreground'>
                    {netCollateral.toFixed(6)} {strategy.collateralAsset.symbol}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~${activeStrategy.collateralAsset.usdValue.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Net Borrowed</span>
                <div className='text-right'>
                  <div className='font-medium text-foreground'>
                    {netBorrowed.toFixed(6)} {strategy.debtAsset.symbol}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~${activeStrategy.debtAsset.usdValue.toFixed(2)}
                  </div>
                </div>
              </div>

              <Separator className='my-2' />

              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground font-semibold'>Your Equity</span>
                <div className='text-right'>
                  <div className='font-semibold text-foreground'>
                    {netEquity.toFixed(6)} {strategy.collateralAsset.symbol}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~${(netEquity * currentPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <div
              className={`p-2 rounded-lg border ${
                existingEstimatedEarnings >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-900/20 dark:border-emerald-700/30'
                  : 'bg-red-500/10 border-red-500/20 dark:bg-red-900/20 dark:border-red-700/30'
              }`}
            >
              <div
                className={`text-xs font-medium mb-1 ${
                  existingEstimatedEarnings >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400'
                }`}
              >
                Est. Annual Earnings
              </div>
              <div
                className={`font-semibold text-sm ${
                  activeStrategy.netApy >= 0
                    ? 'text-emerald-600 dark:text-emerald-300'
                    : 'text-red-600 dark:text-red-300'
                }`}
              >
                {activeStrategy.netApy > 0 ? '+' : ''}
                {existingEstimatedEarnings.toFixed(6)} {strategy.collateralAsset.symbol}
              </div>
              <div
                className={`text-xs ${
                  activeStrategy.netApy >= 0
                    ? 'text-emerald-600/80 dark:text-emerald-400/80'
                    : 'text-red-600/80 dark:text-red-400/80'
                }`}
              >
                ~${(existingEstimatedEarnings * currentPrice).toFixed(2)}
              </div>
            </div>

            <div className='space-y-1 text-xs'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Net APY</span>
                <span
                  className={`font-medium ${
                    activeStrategy.netApy >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {activeStrategy.netApy.toFixed(2)}%
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Leverage</span>
                <span className='font-medium text-foreground'>
                  {(netEquity > 0 ? netCollateral / netEquity : 1).toFixed(2)}x
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Your health</span>
                <span
                  className={`font-medium text-foreground ${getHealthFactorColor(healthFactor)}`}
                >
                  {healthFactor?.toFixed(2) || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
