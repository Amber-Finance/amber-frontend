import { Info, Target } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card>
      <CardHeader className='pb-1'>
        <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
          <Target className='w-4 h-4 text-accent-foreground' />
          Position Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            <div className='p-2 rounded-lg border bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-900/20 dark:border-emerald-700/30'>
              <div className='text-xs font-medium mb-1 text-emerald-700 dark:text-emerald-400'>
                Est. Annual Earnings
              </div>
              <div className='font-semibold text-sm text-emerald-600 dark:text-emerald-300'>
                {Math.abs(positionCalcs.estimatedYearlyEarnings).toFixed(6)}{' '}
                {strategy.collateralAsset.symbol}
              </div>
              <div className='text-xs text-emerald-600/80 dark:text-emerald-400/80'>
                {getEstimatedEarningsUsd()}
              </div>
            </div>

            <div className='space-y-1 text-xs'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>ROE</span>
                <Tooltip>
                  <TooltipTrigger>
                    <span className='font-medium text-foreground cursor-help'>0.00%</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='text-xs'>Current return on equity based on price change</p>
                  </TooltipContent>
                </Tooltip>
              </div>

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
      </CardContent>
    </Card>
  )
}
