import React, { useMemo } from 'react'

import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { SubtleGradientBg } from '@/components/ui/SubtleGradientBg'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import useHealthComputer from '@/hooks/useHealthComputer'
import { useStore } from '@/store/useStore'

interface ActivePositionCardProps {
  strategy: ActiveStrategy
  index: number
  onManage?: (strategy: ActiveStrategy) => void
  onClose?: (strategy: ActiveStrategy) => void
}

// Helper function to determine health factor color
const getHealthFactorColor = (healthFactor: number): string => {
  if (healthFactor > 2) return 'text-green-500'
  if (healthFactor > 1.5) return 'text-amber-500'
  return 'text-red-500'
}

// Helper function to determine leverage color
const getLeverageColor = (leverage: number): string => {
  if (leverage <= 5) return 'text-green-600 dark:text-green-400'
  if (leverage <= 9) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

export function ActivePositionCard({
  strategy,
  index,
  onManage,
  onClose,
}: ActivePositionCardProps) {
  const { markets } = useStore()

  // Token decimals are now included in the strategy object from useActiveStrategies

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
        maxLeverage: 12.5,
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
        maxLeverage: 12.5,
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
    const maxLeverage = ltv > 0 ? 1 / (1 - ltv) : 12.5

    // Use computed health factor from hook, with fallback
    const fallbackHealthFactor = depositsUsd > 0 ? depositsUsd / (borrowsUsd || 1) : 0
    const healthFactor = computedHealthFactor ?? fallbackHealthFactor

    // Calculate P&L based on strategy performance (same as StrategyCard)
    // Use the netApy directly from strategy (already calculated correctly in useActiveStrategies)
    const netApyDecimal = strategy.netApy / 100 // Convert percentage to decimal
    const timeEstimate = 1 / 12 // Assume 1 month average holding
    const estimatedPnl = positionValue * netApyDecimal * timeEstimate
    const pnlPercent = positionValue > 0 ? (estimatedPnl / positionValue) * 100 : 0

    return {
      positionValue: Math.max(positionValue, 0), // Ensure non-negative
      healthFactor: Math.max(healthFactor, 0),
      maxLeverage,
      pnl: estimatedPnl,
      pnlPercent,
    }
  }, [strategy, markets, computedHealthFactor])

  const { positionValue, healthFactor, pnl } = calculations

  const gradientVariants: ('purple' | 'blue' | 'secondary')[] = ['purple', 'blue', 'secondary']
  const gradientClass = gradientVariants[index % gradientVariants.length]

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
    <Card className='group relative overflow-hidden bg-card/20 border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg'>
      {/* Subtle Gradient Background */}
      <SubtleGradientBg variant={gradientClass} className='opacity-40' />

      {/* Card Header */}
      <CardHeader className='relative pb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='w-12 h-12 rounded-2xl overflow-hidden bg-background border border-border/20 p-2'>
                {strategy.collateralAsset.icon ? (
                  <Image
                    src={strategy.collateralAsset.icon}
                    alt={strategy.collateralAsset.symbol}
                    width={32}
                    height={32}
                    className='w-full h-full object-contain'
                  />
                ) : (
                  <div className='w-full h-full bg-primary/30 rounded-xl flex items-center justify-center text-xs font-bold text-primary'>
                    {strategy.collateralAsset.symbol}
                  </div>
                )}
              </div>
              <div className='absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-background/90 backdrop-blur-sm border border-border/30 p-1'>
                {strategy.debtAsset.icon ? (
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={20}
                    height={20}
                    className='w-full h-full object-contain'
                  />
                ) : (
                  <div className='w-full h-full bg-secondary/40 rounded-md flex items-center justify-center text-[10px] font-bold text-secondary'>
                    {strategy.debtAsset.symbol}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className='font-funnel font-semibold text-foreground text-lg mb-1'>
                {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
              </h3>
              <p className='text-muted-foreground text-sm font-medium'>
                Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Main APY Display */}
      <CardContent className='relative space-y-6'>
        <div className='text-center py-4'>
          <div className='text-6xl font-funnel font-bold text-foreground mb-2'>
            {Math.abs(strategy.netApy).toFixed(2)}
            <span className={`text-3xl ${strategy.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              %
            </span>
          </div>
          <p className='text-muted-foreground uppercase tracking-wider text-sm font-medium'>
            Net APY
          </p>
        </div>

        {/* Strategy Metrics */}
        <div className='grid grid-cols-2 gap-4 pt-3 border-t border-border/20'>
          <div className='bg-secondary/20 rounded-lg p-3 text-center border border-border/40'>
            <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>Leverage</p>
            <p className={`font-semibold text-sm ${getLeverageColor(strategy.leverage)}`}>
              {strategy.leverage.toFixed(2)}x
              {strategy.leverage > 9 && <span className='ml-1 text-xs'>⚠️</span>}
            </p>
          </div>
          <div className='bg-secondary/20 rounded-lg p-3 text-center border border-border/40'>
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
        <div className='space-y-3 pt-4 border-t border-border/20'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground text-sm'>Position Value</span>
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
            <span className='text-muted-foreground text-sm'>Health Factor</span>
            <span className={`font-medium ${getHealthFactorColor(healthFactor)}`}>
              {healthFactor.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 pt-4'>
          <Button
            variant='default'
            size='sm'
            className='flex-1'
            onClick={() => onManage?.(strategy)}
          >
            Manage
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={() => onClose?.(strategy)}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
