import { ArrowRight, RotateCcw, TrendingUp, Wallet } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { StrategyFlow } from '@/components/strategy/StrategyFlow'
import { InfoAlert } from '@/components/ui/InfoAlert'
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
    <InfoCard title='Strategy Flow'>
      <div>
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
            <InfoAlert title='Leverage Math' variant='blue' className='mt-2'>
              <div className='space-y-1'>
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
                <div>
                  Max leverage: {marketData.dynamicMaxLeverage.toFixed(2)}x (based on liquidation
                  threshold)
                </div>
              </div>
            </InfoAlert>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
