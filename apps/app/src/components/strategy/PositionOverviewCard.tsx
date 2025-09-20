import { Info } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Separator } from '@/components/ui/separator'
import { getHealthFactorColor } from '@/utils/healthComputer'

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
  }
  getEstimatedEarningsUsd: () => string
  healthFactor: number
}

export function PositionOverviewCard({
  strategy,
  activeStrategy,
  displayValues,
  positionCalcs,
  getEstimatedEarningsUsd,
  healthFactor,
}: PositionOverviewCardProps) {
  return (
    <InfoCard title='Position Overview'>
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
                <div className='flex items-center gap-1'>
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
                <span className='text-muted-foreground'>Long exposure</span>
                <div className='text-right'>
                  <div className='font-medium text-foreground'>
                    {activeStrategy
                      ? `${activeStrategy.collateralAsset.amountFormatted.toFixed(6)} ${strategy.collateralAsset.symbol}`
                      : `${positionCalcs.totalPosition.toFixed(6)} ${strategy.collateralAsset.symbol}`}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~
                    {activeStrategy
                      ? `$${activeStrategy.collateralAsset.usdValue.toFixed(2)}`
                      : displayValues.usdValue(positionCalcs.totalPosition)}
                  </div>
                </div>
              </div>

              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Short exposure</span>
                <div className='text-right'>
                  <div className='font-medium text-foreground'>
                    {activeStrategy
                      ? `${activeStrategy.debtAsset.amountFormatted.toFixed(6)} ${strategy.debtAsset.symbol}`
                      : `${positionCalcs.borrowAmount.toFixed(6)} ${strategy.debtAsset.symbol}`}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~
                    {activeStrategy
                      ? `$${activeStrategy.debtAsset.usdValue.toFixed(2)}`
                      : displayValues.usdValue(positionCalcs.borrowAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
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
                {activeStrategy
                  ? `$${((activeStrategy.collateralAsset.usdValue * activeStrategy.netApy) / 100).toFixed(2)}`
                  : getEstimatedEarningsUsd()}
              </div>
            </div>

            <div className='space-y-1 text-xs'>
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
