import { BigNumber } from 'bignumber.js'
import { Info } from 'lucide-react'

import TokenBalance from '@/components/common/TokenBalance'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Separator } from '@/components/ui/separator'
import { getHealthFactorColor } from '@/utils/healthComputer'

interface NewPositionTableProps {
  strategy: Strategy
  positionCalcs: {
    totalPosition: number
    borrowAmount: number
    estimatedYearlyEarnings: number
    leveragedApy: number
  }
  collateralAmount: string
  marketData: {
    currentPrice: number
  }
  collateralSupplyApy: number
  debtBorrowApy: number
  simulatedHealthFactor: number
}

export function NewPositionTable({
  strategy,
  positionCalcs,
  collateralAmount,
  marketData,
  collateralSupplyApy,
  debtBorrowApy,
  simulatedHealthFactor,
}: NewPositionTableProps) {
  // Check if we have modify mode data (supplies and totalBorrows fields)
  const isModifyMode =
    (positionCalcs as any).supplies !== undefined &&
    (positionCalcs as any).totalBorrows !== undefined

  // Calculate supplies and borrows correctly based on mode
  const supplies = isModifyMode
    ? (positionCalcs as any).supplies // Use actual user supplies for modify mode
    : positionCalcs.totalPosition - positionCalcs.borrowAmount // For deploy mode

  const totalBorrows = isModifyMode
    ? (positionCalcs as any).totalBorrows // Use total target borrows for modify mode
    : positionCalcs.borrowAmount // For deploy mode, borrowAmount IS the total borrows

  // Calculate leverages based on position
  const longLeverage = supplies > 0 ? positionCalcs.totalPosition / supplies : 1 // This equals the multiplier
  const shortLeverage = longLeverage - 1 // Borrow ratio is multiplier - 1

  // Create Coin objects for TokenBalance
  const suppliesCoin = {
    denom: strategy.collateralAsset.denom,
    amount: new BigNumber(supplies > 0 ? supplies : 0.001)
      .shiftedBy(strategy.collateralAsset.decimals || 8)
      .integerValue()
      .toString(),
  }

  const collateralCoin = {
    denom: strategy.collateralAsset.denom,
    amount: new BigNumber(positionCalcs.totalPosition)
      .shiftedBy(strategy.collateralAsset.decimals || 8)
      .integerValue()
      .toString(),
  }

  const borrowCoin = {
    denom: strategy.debtAsset.denom,
    amount: new BigNumber(totalBorrows)
      .shiftedBy(strategy.debtAsset.decimals || 6)
      .integerValue()
      .toString(),
  }

  return (
    <div className='p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1 text-xs'>
      <div className='font-medium text-foreground mb-2'>Updated Position Overview</div>
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Your supplies:</span>
        <TokenBalance coin={suppliesCoin} size='sm' align='right' />
      </div>
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Your collateral:</span>
        <TokenBalance coin={collateralCoin} size='sm' align='right' />
      </div>
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Your borrows:</span>
        <TokenBalance coin={borrowCoin} size='sm' align='right' />
      </div>
      <Separator />
      <div className='flex justify-between items-center'>
        <span className='text-muted-foreground'>Long leverage:</span>
        <span className='font-medium'>{longLeverage.toFixed(2)}x</span>
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-muted-foreground'>Short leverage:</span>
        <span className='font-medium'>{shortLeverage.toFixed(2)}x</span>
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-muted-foreground'>Base APY:</span>
        <span className='font-medium'>
          {(2.0 * collateralSupplyApy * 100 - (2.0 - 1) * debtBorrowApy * 100).toFixed(2)}%
        </span>
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-muted-foreground'>Net APY:</span>
        <span
          className={`font-medium ${
            positionCalcs.leveragedApy >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {(positionCalcs.leveragedApy * 100).toFixed(2)}%
        </span>
      </div>
      <Separator />
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-1'>
          <span className='text-muted-foreground'>Simulated health:</span>
          <Tooltip>
            <TooltipTrigger>
              <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
            </TooltipTrigger>
            <TooltipContent>
              <p className='text-xs max-w-xs'>
                Estimated health factor based on your position parameters. Higher values indicate
                safer positions.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className={`font-medium ${getHealthFactorColor(simulatedHealthFactor)}`}>
          {simulatedHealthFactor?.toFixed(2) || '-'}
        </span>
      </div>
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
          ~$
          {(Math.abs(positionCalcs.estimatedYearlyEarnings) * marketData.currentPrice).toFixed(2)}
        </div>
      </div>
    </div>
  )
}
