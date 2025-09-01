import { Info, Wallet } from 'lucide-react'

import { AmountInput } from '@/components/ui/AmountInput'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

interface MarginCollateralCardProps {
  strategy: Strategy
  collateralAmount: string
  setCollateralAmount: (value: string) => void
  multiplier: number
  handleMultiplierChange: (value: number[]) => void
  dynamicMaxLeverage: number
  displayValues: {
    walletBalance: string
    usdValue: (amount: number) => string
  }
  userBalance: number
  currentAmount: number
  positionCalcs: {
    borrowAmount: number
    totalPosition: number
  }
}

export function MarginCollateralCard({
  strategy,
  collateralAmount,
  setCollateralAmount,
  multiplier,
  handleMultiplierChange,
  dynamicMaxLeverage,
  displayValues,
  userBalance,
  currentAmount,
  positionCalcs,
}: MarginCollateralCardProps) {
  return (
    <Card>
      <CardHeader className='pb-1'>
        <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
          <Wallet className='w-4 h-4 text-accent-foreground' />
          Margin Collateral
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='flex justify-between items-center text-xs'>
          <span className='text-muted-foreground'>Wallet balance</span>
          <span className='font-medium text-foreground'>{displayValues.walletBalance}</span>
        </div>

        <AmountInput
          value={collateralAmount}
          onChange={(e) => setCollateralAmount(e.target.value)}
          token={{
            symbol: strategy.collateralAsset.symbol,
            brandColor: strategy.collateralAsset.brandColor || '#F7931A',
          }}
          usdValue={displayValues.usdValue(currentAmount || 0)}
          balance={userBalance.toString()}
        />

        <Separator />

        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-xs font-medium text-foreground'>Multiplier</span>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-accent-foreground'>
                {multiplier.toFixed(2)}x
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs max-w-xs'>
                    Leverage multiplier: {multiplier}x means you'll have {multiplier}x exposure to{' '}
                    {strategy.collateralAsset.symbol}. You supply {currentAmount.toFixed(6)} and
                    borrow {positionCalcs.borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Slider
            value={[multiplier]}
            onValueChange={handleMultiplierChange}
            max={dynamicMaxLeverage}
            min={1}
            step={0.01}
            className='w-full'
            brandColor={strategy.collateralAsset.brandColor || '#F7931A'}
          />

          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>1.0x</span>
            <span>Max {dynamicMaxLeverage.toFixed(1)}x</span>
          </div>

          {/* Leverage Breakdown */}
          <div className='p-2 rounded-lg bg-muted/20 border border-border/50'>
            <div className='text-xs space-y-1'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Your collateral:</span>
                <span className='font-medium'>
                  {currentAmount.toFixed(6)} {strategy.collateralAsset.symbol}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Borrow amount:</span>
                <span className='font-medium'>
                  {positionCalcs.borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total exposure:</span>
                <span className='font-medium'>
                  {positionCalcs.totalPosition.toFixed(6)} {strategy.collateralAsset.symbol}
                </span>
              </div>
              <Separator />
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Leverage ratio:</span>
                <span className='font-medium'>
                  {currentAmount > 0
                    ? (positionCalcs.totalPosition / currentAmount).toFixed(2)
                    : '0.00'}
                  x
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Borrow ratio:</span>
                <span className='font-medium'>
                  {currentAmount > 0
                    ? (positionCalcs.borrowAmount / currentAmount).toFixed(2)
                    : '0.00'}
                  x
                </span>
              </div>
              <Separator />
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Max leverage:</span>
                <span className='font-medium text-accent-foreground'>
                  {dynamicMaxLeverage.toFixed(2)}x
                </span>
              </div>
              <div className='text-xs text-muted-foreground/80'>
                Based on liquidation threshold: {(strategy.liquidationThreshold || 0.85) * 100}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
