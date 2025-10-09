import { BigNumber } from 'bignumber.js'
import { Info } from 'lucide-react'

import TokenBalance from '@/components/common/TokenBalance'
import {
  computePositionAfterSwap,
  computeSwapImpact,
  getPriceImpactColor,
} from '@/components/strategy/helpers'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Separator } from '@/components/ui/separator'
import { getHealthFactorColor } from '@/utils/blockchain/healthComputer'

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
  // Optional swap route info for price impact calculations
  swapRouteInfo?: SwapRouteInfo | null
  // Whether this is a leverage increase or decrease
  isLeverageIncrease?: boolean
}

export function NewPositionTable({
  strategy,
  positionCalcs,
  collateralAmount,
  marketData,
  collateralSupplyApy,
  debtBorrowApy,
  simulatedHealthFactor,
  swapRouteInfo,
  isLeverageIncrease = true,
}: NewPositionTableProps) {
  // Compute final supplies/borrows/collateral using helper
  const {
    supplies,
    totalBorrows,
    actualCollateral: computedCollateral,
  } = computePositionAfterSwap(positionCalcs, strategy, swapRouteInfo ?? null, isLeverageIncrease)

  // Determine actual collateral (prioritize computed value)
  const actualCollateral = computedCollateral

  const longLeverage = supplies > 0 ? actualCollateral / supplies : 1 // This equals the multiplier
  const shortLeverage = longLeverage - 1 // Borrow ratio is multiplier - 1

  // Create Coin objects for TokenBalance
  const suppliesCoin = {
    denom: strategy.collateralAsset.denom,
    amount: new BigNumber(supplies)
      .shiftedBy(strategy.collateralAsset.decimals || 8)
      .integerValue()
      .toString(),
  }

  const collateralCoin = {
    denom: strategy.collateralAsset.denom,
    amount: new BigNumber(actualCollateral)
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

  const { priceImpact, minReceivedDisplay } = computeSwapImpact(
    swapRouteInfo ?? null,
    strategy,
    isLeverageIncrease,
  )

  return (
    <div className='p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1 text-sm'>
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
      {swapRouteInfo && (
        <div className='mt-2 p-2 rounded-lg bg-muted/10 border border-border/40 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Price Impact</span>
            <span className={getPriceImpactColor(priceImpact)}>{priceImpact.toFixed(2)}%</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Min received (out asset)</span>
            <span className='font-medium'>{minReceivedDisplay}</span>
          </div>
        </div>
      )}
    </div>
  )
}
