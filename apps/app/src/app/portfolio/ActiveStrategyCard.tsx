import { useMemo } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Info } from 'lucide-react'

import { EarningPointsRow } from '@/components/common/EarningPointsRow'
import { Button } from '@/components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useHealthComputer from '@/hooks/common/useHealthComputer'
import { useStore } from '@/store/useStore'
import { getHealthFactorColor } from '@/utils/blockchain/healthComputer'

interface ActiveStrategyCardProps {
  strategy: ActiveStrategy
  index: number
}

// Helper function to determine leverage color
const getLeverageColor = (leverage: number): string => {
  if (leverage <= 5) return 'text-green-600 dark:text-green-400'
  if (leverage <= 9) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export function ActiveStrategyCard({ strategy, index }: ActiveStrategyCardProps) {
  const router = useRouter()
  const { markets } = useStore()

  // Create positions for health computer using the specific account ID
  const updatedPositions = useMemo(
    () => ({
      account_kind: 'default' as const,
      account_id: strategy.accountId, // Use the specific account ID for this strategy
      lends: [
        {
          denom: strategy.collateralAsset.denom,
          amount: strategy.collateralAsset.amount,
        },
      ],
      debts: [
        {
          denom: strategy.debtAsset.denom,
          amount: strategy.debtAsset.amount,
          shares: '0',
        },
      ],
      deposits: [],
      staked_astro_lps: [],
      perps: [],
      vaults: [],
    }),
    [
      strategy.accountId,
      strategy.collateralAsset.denom,
      strategy.collateralAsset.amount,
      strategy.debtAsset.denom,
      strategy.debtAsset.amount,
    ],
  )

  // Use health computer hook
  const { healthFactor: computedHealthFactor } = useHealthComputer(updatedPositions)
  // Real calculations using market data and health computer
  const calculations = useMemo(() => {
    if (!markets?.length) {
      return {
        positionValue: strategy.collateralAsset.usdValue,
        healthFactor: 0,
        maxLeverage: 12,
        pnl: 0,
        pnlPercent: 0,
      }
    }

    // Find market data for collateral and debt assets
    const collateralMarket = markets.find((m) => m.asset.denom === strategy.collateralAsset.denom)
    const debtMarket = markets.find((m) => m.asset.denom === strategy.debtAsset.denom)

    if (!collateralMarket || !debtMarket) {
      return {
        positionValue: strategy.collateralAsset.usdValue,
        healthFactor: 0,
        maxLeverage: 12,
        pnl: 0,
        pnlPercent: 0,
      }
    }

    // Calculate position value: deposits - borrows (in USD terms)
    const depositsUsd = strategy.collateralAsset.usdValue
    const borrowsUsd = strategy.debtAsset.usdValue
    const positionValue = depositsUsd - borrowsUsd

    // Calculate max leverage from LTV
    const ltv = parseFloat(collateralMarket.params?.max_loan_to_value || '0')
    const theoreticalMaxLeverage = ltv > 0 ? 1 / (1 - ltv) : 12
    // Apply 0.5x safety buffer
    const maxLeverage = Math.max(1, theoreticalMaxLeverage - 0.5)

    // Use computed health factor from hook, with fallback
    const fallbackHealthFactor = depositsUsd > 0 ? depositsUsd / (borrowsUsd || 1) : 0
    const healthFactor = computedHealthFactor ?? fallbackHealthFactor

    // Use actual P&L from strategy (calculated from initial_deposit)
    const actualPnl = strategy.actualPnl || 0
    const actualPnlPercent = strategy.actualPnlPercent || 0

    return {
      positionValue: Math.max(positionValue, 0), // Ensure non-negative
      healthFactor: Math.max(healthFactor, 0),
      maxLeverage,
      pnl: actualPnl,
      pnlPercent: actualPnlPercent,
    }
  }, [strategy, markets, computedHealthFactor])

  const { positionValue, healthFactor, pnl } = calculations

  // Format amounts for display with appropriate precision
  const formatAmount = (amount: number, tokenDecimals: number = 6, displayDecimals = 6): string => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
      return '0.' + '0'.repeat(tokenDecimals)
    }

    // For tokens with high decimals (like eBTC with 18), show more precision for small amounts
    const effectiveDecimals =
      tokenDecimals && tokenDecimals > 8 ? Math.min(displayDecimals + 2, 8) : displayDecimals

    if (amount < Math.pow(10, -effectiveDecimals))
      return `<${Math.pow(10, -effectiveDecimals).toFixed(effectiveDecimals)}`
    return amount.toFixed(effectiveDecimals)
  }

  const formatUsdValue = (value: number): string => {
    if (value === 0) return '$0'
    if (value < 0.01) return '<$0.01'
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <Card className='group relative overflow-hidden bg-card border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg'>
      {/* Card Header */}
      <CardHeader className='relative z-20'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='relative w-12 h-12'>
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  fill
                  sizes='48px'
                  className='w-full h-full object-contain'
                />
              </div>
              <div className='absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full border shadow-sm p-0.5 bg-background'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  fill
                  sizes='24px'
                  className=' w-full h-full'
                  unoptimized={true}
                />
              </div>
            </div>
            <div className='flex flex-col'>
              <CardTitle className='text-lg font-semibold'>
                {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
              </CardTitle>
              <CardDescription className='text-sm text-muted-foreground'>
                Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Main APY Display */}
      <CardContent className='relative space-y-4'>
        <div className='text-center py-3'>
          <div className='text-4xl sm:text-5xl font-funnel font-bold text-foreground mb-1'>
            {!strategy.isPositive ? '-' : ''}
            {Math.abs(strategy.netApy).toFixed(2)}
            <span
              className={`text-xl sm:text-2xl`}
              style={{ color: (strategy.debtAsset as any)?.brandColor || '#F97316' }}
            >
              %
            </span>
          </div>
          <p className='text-muted-foreground uppercase tracking-wider text-sm font-medium'>
            Net APY
          </p>
        </div>

        {/* Earning Points Section */}
        <div className='pt-3 border-t border-border/20'>
          <EarningPointsRow
            assetSymbol={strategy.debtAsset.symbol}
            variant='full'
            type='strategy'
          />
        </div>

        {/* Strategy Metrics */}
        <div className='grid grid-cols-2 gap-3 pt-3 border-t border-border/20'>
          <div className='bg-secondary/20 rounded-lg p-2.5 text-center border border-border/40'>
            <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>Leverage</p>
            <p className={`font-semibold text-sm ${getLeverageColor(strategy.leverage)}`}>
              {strategy.leverage.toFixed(2)}x
              {strategy.leverage > 11 && <span className='ml-1 text-xs'>⚠️</span>}
            </p>
          </div>
          <div className='bg-secondary/20 rounded-lg p-2.5 text-center border border-border/40'>
            <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
              Unrealized P&L
            </p>
            <p
              className={`font-semibold text-sm ${pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {pnl >= 0 ? '+' : '-'}
              {formatUsdValue(Math.abs(pnl))}
            </p>
          </div>
        </div>

        {/* Position Details */}
        <div className='space-y-3 pt-3 border-t border-border/20'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground text-sm'>Equity</span>
            <span className='text-foreground font-medium'>{formatUsdValue(positionValue)}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground text-sm'>Collateral</span>
            <div className='text-right'>
              <div className='text-foreground font-medium'>
                {formatAmount(
                  strategy.collateralAsset.amountFormatted,
                  strategy.collateralAsset.decimals,
                )}{' '}
                {strategy.collateralAsset.symbol}
              </div>
              <div className='text-xs text-muted-foreground'>
                {formatUsdValue(strategy.collateralAsset.usdValue)}
              </div>
            </div>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground text-sm'>Debt</span>
            <div className='text-right'>
              <div className='text-foreground font-medium'>
                {formatAmount(strategy.debtAsset.amountFormatted, strategy.debtAsset.decimals)}{' '}
                {strategy.debtAsset.symbol}
              </div>
              <div className='text-xs text-muted-foreground'>
                {formatUsdValue(strategy.debtAsset.usdValue)}
              </div>
            </div>
          </div>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>Health Factor</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs max-w-xs'>
                    Monitor your Health Factor regularly. If it falls below 1, your position will
                    become eligible for liquidation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className={`font-medium ${getHealthFactorColor(healthFactor)}`}>
              {healthFactor.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className='flex pt-3'>
          <Button
            variant='default'
            size='sm'
            className='w-full'
            onClick={() => {
              const strategyId = `${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`
              router.push(`/strategies/${strategyId}`)
            }}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
