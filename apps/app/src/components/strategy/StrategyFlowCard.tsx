import { ArrowRight, RotateCcw, TrendingUp, Wallet } from 'lucide-react'

import { StrategyFlow } from '@/components/strategy/StrategyFlow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface StrategyFlowCardProps {
  strategy: Strategy
  activeStrategy?: any
  currentAmount: number
  multiplier: number
  positionCalcs: {
    borrowAmount: number
    totalPosition: number
    leveragedApy: number
  }
  marketData: {
    dynamicMaxLeverage: number
  }
  collateralSupplyApy: number
  debtBorrowApy: number
}

export function StrategyFlowCard({
  strategy,
  activeStrategy,
  currentAmount,
  multiplier,
  positionCalcs,
  marketData,
  collateralSupplyApy,
  debtBorrowApy,
}: StrategyFlowCardProps) {
  return (
    <Card>
      <CardHeader className='pb-1'>
        <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
          <RotateCcw className='w-4 h-4 text-muted-foreground' />
          Strategy Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <StrategyFlow />

          {/* Flow Explanations */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-2 text-xs'>
            <div className='text-center space-y-1'>
              <div className='flex items-center justify-center'>
                <Wallet className='w-3 h-3 text-accent-foreground' />
              </div>
              <div className='font-medium text-foreground'>1. Deposit</div>
              <div className='text-muted-foreground text-xs'>
                Supply {strategy.collateralAsset.symbol} as collateral to the protocol
              </div>
            </div>

            <div className='text-center space-y-1'>
              <div className='flex items-center justify-center'>
                <ArrowRight className='w-3 h-3 text-accent-foreground' />
              </div>
              <div className='font-medium text-foreground'>2. Borrow</div>
              <div className='text-muted-foreground text-xs'>
                Borrow {strategy.debtAsset.symbol} against your {strategy.collateralAsset.symbol}{' '}
                collateral
              </div>
            </div>

            <div className='text-center space-y-1'>
              <div className='flex items-center justify-center'>
                <RotateCcw className='w-3 h-3 text-accent-foreground' />
              </div>
              <div className='font-medium text-foreground'>3. Swap</div>
              <div className='text-muted-foreground text-xs'>
                Swap borrowed {strategy.debtAsset.symbol} for more {strategy.collateralAsset.symbol}
              </div>
            </div>

            <div className='text-center space-y-1'>
              <div className='flex items-center justify-center'>
                <TrendingUp className='w-3 h-3 text-accent-foreground' />
              </div>
              <div className='font-medium text-foreground'>4. Re-deposit</div>
              <div className='text-muted-foreground text-xs'>
                Supply new {strategy.collateralAsset.symbol} to multiply your position
              </div>
            </div>
          </div>

          {/* Active Strategy Display */}
          {activeStrategy && (
            <div className='p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                <h3 className='text-sm font-semibold text-green-700 dark:text-green-400'>
                  Active Position
                </h3>
              </div>

              <div className='grid grid-cols-2 gap-4 text-xs'>
                <div>
                  <div className='text-muted-foreground'>Collateral Supplied</div>
                  <div className='font-semibold'>
                    {activeStrategy.collateralAsset.amountFormatted.toFixed(6)}{' '}
                    {activeStrategy.collateralAsset.symbol}
                  </div>
                  <div className='text-muted-foreground'>
                    ${activeStrategy.collateralAsset.usdValue.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className='text-muted-foreground'>Debt Borrowed</div>
                  <div className='font-semibold'>
                    {activeStrategy.debtAsset.amountFormatted.toFixed(6)}{' '}
                    {activeStrategy.debtAsset.symbol}
                  </div>
                  <div className='text-muted-foreground'>
                    ${activeStrategy.debtAsset.usdValue.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className='text-muted-foreground'>Current Leverage</div>
                  <div className='font-semibold text-lg'>{activeStrategy.leverage.toFixed(2)}x</div>
                </div>

                <div>
                  <div className='text-muted-foreground'>Current APY</div>
                  <div
                    className={`font-semibold text-lg ${
                      activeStrategy.isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {activeStrategy.netApy > 0 ? '+' : ''}
                    {(activeStrategy.netApy * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className='mt-3 pt-3 border-t border-green-200 dark:border-green-800'>
                <div className='text-xs text-green-700 dark:text-green-400'>
                  💡 <strong>Tip:</strong> You can modify this position by adjusting the leverage
                  above and deploying again, or close it completely using the strategy card.
                </div>
              </div>
            </div>
          )}

          {/* Strategy Summary */}
          <div className='p-2 rounded-lg bg-muted/20 border border-border/50'>
            <div className='text-xs text-muted-foreground'>
              <strong className='text-foreground'>How it works:</strong> This strategy leverages
              your {strategy.collateralAsset.symbol} position by borrowing{' '}
              {strategy.debtAsset.symbol} and swapping it for more {strategy.collateralAsset.symbol}
              . The cycle repeats until you reach your target leverage multiplier.
              {strategy.isCorrelated && (
                <span className='text-blue-600 dark:text-blue-400'>
                  {' '}
                  Since all assets track the same BTC price, your profit depends on maintaining a
                  positive yield spread (collateral APY &gt; borrow rate). Negative spreads erode
                  collateral and increase leverage over time.
                </span>
              )}
            </div>

            {/* Leverage Math Summary */}
            <div className='mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 dark:bg-blue-900/20 dark:border-blue-700/30'>
              <div className='text-xs text-blue-700 dark:text-blue-400 font-medium mb-1'>
                Leverage Math
              </div>
              <div className='text-xs text-blue-700/80 dark:text-blue-400/80 space-y-1'>
                <div>
                  • Supply: {currentAmount.toFixed(6)} {strategy.collateralAsset.symbol}
                </div>
                <div>
                  • Borrow: {positionCalcs.borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}
                </div>
                <div>
                  • Total: {positionCalcs.totalPosition.toFixed(6)}{' '}
                  {strategy.collateralAsset.symbol} ({multiplier.toFixed(2)}x exposure)
                </div>
                <div>
                  • Net APY: {(positionCalcs.leveragedApy * 100).toFixed(2)}% ( (
                  {(collateralSupplyApy * 100).toFixed(2)}% - {(debtBorrowApy * 100).toFixed(2)}% )
                  × {multiplier.toFixed(2)}x)
                </div>
                <Separator />
                <div className='text-xs text-blue-600/80 dark:text-blue-400/80'>
                  Max leverage: {marketData.dynamicMaxLeverage.toFixed(2)}x (based on liquidation
                  threshold)
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
