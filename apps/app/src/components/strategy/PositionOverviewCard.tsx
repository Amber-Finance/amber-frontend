import { Info } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Separator } from '@/components/ui/separator'

interface PositionOverviewCardProps {
  strategy: Strategy
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
}

export function PositionOverviewCard({
  strategy,
  displayValues,
  positionCalcs,
  getEstimatedEarningsUsd,
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
                    {positionCalcs.totalPosition.toFixed(6)} {strategy.collateralAsset.symbol}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~{displayValues.usdValue(positionCalcs.totalPosition)}
                  </div>
                </div>
              </div>

              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Short exposure</span>
                <div className='text-right'>
                  <div className='font-medium text-foreground'>
                    {positionCalcs.borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~{displayValues.usdValue(positionCalcs.borrowAmount)}
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
                className={`font-semibold text-sm ${
                  positionCalcs.estimatedYearlyEarnings >= 0
                    ? 'text-emerald-600 dark:text-emerald-300'
                    : 'text-red-600 dark:text-red-300'
                }`}
              >
                {positionCalcs.estimatedYearlyEarnings >= 0 ? '+' : ''}
                {positionCalcs.estimatedYearlyEarnings.toFixed(6)} {strategy.collateralAsset.symbol}
              </div>
              <div
                className={`text-xs ${
                  positionCalcs.estimatedYearlyEarnings >= 0
                    ? 'text-emerald-600/80 dark:text-emerald-400/80'
                    : 'text-red-600/80 dark:text-red-400/80'
                }`}
              >
                {getEstimatedEarningsUsd()}
              </div>
            </div>

            <div className='space-y-1 text-xs'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Your LTV (LLTV)</span>
                <span className='font-medium text-foreground'>∞ (-%)</span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Your health</span>
                <span className='font-medium text-foreground'>-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
