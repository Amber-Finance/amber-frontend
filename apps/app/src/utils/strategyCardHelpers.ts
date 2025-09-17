import { BigNumber } from 'bignumber.js'

import {
  calculateUsdValueLegacy,
  formatLargeCurrency,
  formatTokenAmountLegacy,
} from '@/utils/format'
import { pipe } from '@/utils/functional'
import { calculatePositionMetrics } from '@/utils/strategyUtils'

// Pure functions for strategy card calculations

// Calculate maximum APY for a strategy
export const getMaxAPY = (strategy: any, markets: any[], isWasmReady: boolean): number => {
  if (!isWasmReady || !markets || markets.length === 0) {
    return strategy.maxROE || 0
  }

  // Use the pre-calculated maxROE from strategy
  return strategy.maxROE || 0
}

// Calculate net APY for a strategy
export const calculateNetApy = (strategy: any): number => {
  return strategy.netApy || strategy.supplyApy - strategy.borrowApy || 0
}

// Format leverage display
export const formatLeverage = (strategy: any, markets: any[], isWasmReady: boolean): string => {
  if (!isWasmReady) {
    return `${(strategy.maxLeverage || strategy.multiplier || 1).toFixed(1)}x`
  }

  return `${(strategy.maxLeverage || strategy.multiplier || 1).toFixed(1)}x`
}

// Format borrowable USD amount
export const formatBorrowableUsd = (strategy: any): string => {
  return strategy.liquidityDisplay || formatLargeCurrency(strategy.liquidity || 0)
}

// Get gradient colors for strategy
export const getGradientColors = (
  strategy: any,
): { collateralColor: string; debtColor: string } => ({
  collateralColor: strategy.collateralAsset?.brandColor || '#F97316',
  debtColor: strategy.debtAsset?.brandColor || '#6B7280',
})

// Format borrow token amount
export const formatBorrowTokenAmount = (
  markets: any[],
  debtDenom: string,
  debtSymbol: string,
): string => {
  const market = markets.find((m) => m.asset.denom === debtDenom)
  if (!market?.metrics?.collateral_total_amount) {
    return `0 ${debtSymbol}`
  }

  const amount = new BigNumber(market.metrics.collateral_total_amount)
    .shiftedBy(-(market.asset.decimals || 6))
    .toNumber()

  return formatTokenAmountLegacy(amount, debtSymbol)
}

// Get user balance in USD
export const getUserBalanceUsd = (
  isWalletConnected: boolean,
  isLoading: boolean,
  walletBalances: any[] | undefined,
  collateralDenom: string,
  markets: Market[] | null = null,
): BigNumber => {
  if (!isWalletConnected || isLoading || !walletBalances || !markets) {
    return new BigNumber(0)
  }

  const balance = walletBalances.find((b) => b.denom === collateralDenom)
  if (!balance?.amount) {
    return new BigNumber(0)
  }

  // Find the matching market for this coin
  const market = markets.find((m) => m.asset.denom === collateralDenom)
  if (!market?.price?.price) {
    return new BigNumber(0)
  }

  // Calculate USD value using market price and proper decimals
  const decimals = market.asset.decimals || 6
  const usdValue = calculateUsdValueLegacy(balance.amount, market.price.price, decimals)
  return new BigNumber(usdValue)
}

// Format user token amount
export const formatUserTokenAmount = (
  isWalletConnected: boolean,
  isLoading: boolean,
  walletBalances: any[] | undefined,
  collateralDenom: string,
  collateralSymbol: string,
  decimals: number = 8, // Add decimals parameter with fallback
): string => {
  if (!isWalletConnected || isLoading) {
    return `0.000000 ${collateralSymbol}`
  }

  if (!walletBalances) {
    return `0.000000 ${collateralSymbol}`
  }

  const balance = walletBalances.find((b) => b.denom === collateralDenom)
  if (!balance?.amount) {
    return `0.000000 ${collateralSymbol}`
  }

  const amount = new BigNumber(balance.amount).shiftedBy(-decimals).toNumber()
  return `${amount.toFixed(6)} ${collateralSymbol}`
}

// Pure function to calculate strategy risk level
export const calculateRiskLevel = (strategy: any): 'low' | 'medium' | 'high' => {
  const leverage = strategy.maxLeverage || strategy.multiplier || 1
  const isCorrelated = strategy.isCorrelated || false

  if (leverage > 5 || (!isCorrelated && leverage > 3)) {
    return 'high'
  } else if (leverage > 3 || (!isCorrelated && leverage > 2)) {
    return 'medium'
  } else {
    return 'low'
  }
}

// Pure function to get risk color
export const getRiskColor = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low':
      return '#10B981' // green
    case 'medium':
      return '#F59E0B' // yellow
    case 'high':
      return '#EF4444' // red
    default:
      return '#6B7280' // gray
  }
}

// Pure function to format APY with sign
export const formatApyWithSign = (apy: number): string => {
  const percentage = apy * 100
  const sign = percentage > 0 ? '+' : '-'
  return `${sign}${percentage.toFixed(2)}%`
}

// Pure function to calculate position health
export const calculatePositionHealth = (
  collateralValue: number,
  debtValue: number,
  liquidationThreshold: number,
): number => {
  if (collateralValue === 0) return 0
  const currentLTV = debtValue / collateralValue
  return Math.max(0, (liquidationThreshold - currentLTV) / liquidationThreshold)
}

// Pure function to format position health
export const formatPositionHealth = (
  health: number,
): {
  percentage: number
  color: string
  label: string
} => {
  const percentage = health * 100

  if (percentage > 50) {
    return { percentage, color: '#10B981', label: 'Healthy' }
  } else if (percentage > 20) {
    return { percentage, color: '#F59E0B', label: 'Caution' }
  } else {
    return { percentage, color: '#EF4444', label: 'Risk' }
  }
}

// Higher-order function to create strategy calculators
export const createStrategyCalculator = (strategy: any) => ({
  calculatePosition: (amount: number, multiplier: number) =>
    calculatePositionMetrics(amount, multiplier, strategy.supplyApy || 0, strategy.borrowApy || 0),

  getRiskLevel: () => calculateRiskLevel(strategy),

  getColors: () => getGradientColors(strategy),

  formatDisplay: () => ({
    title: `${strategy.collateralAsset?.symbol}/${strategy.debtAsset?.symbol}`,
    maxApy: formatApyWithSign(strategy.maxROE || 0),
    netApy: formatApyWithSign(strategy.netApy || 0),
    leverage: `${(strategy.maxLeverage || 1).toFixed(1)}x`,
  }),
})

// Composition functions for strategy data processing
export const processStrategyForDisplay = pipe(
  (strategy: any) => strategy,
  (strategy: any) => ({
    ...strategy,
    calculator: createStrategyCalculator(strategy),
    riskLevel: calculateRiskLevel(strategy),
    colors: getGradientColors(strategy),
  }),
)

// Pure function to validate strategy data
export const isValidStrategy = (strategy: any): boolean => {
  return !!(
    strategy?.id &&
    strategy?.collateralAsset &&
    strategy?.debtAsset &&
    typeof strategy?.maxROE === 'number' &&
    typeof strategy?.multiplier === 'number'
  )
}

// Pure function to filter valid strategies
export const filterValidStrategies = (strategies: any[]): any[] =>
  strategies.filter(isValidStrategy)

// Pure function to sort strategies by APY with coming soon assets at the end
export const sortStrategiesByApy = (strategies: any[], direction: 'asc' | 'desc' = 'desc'): any[] =>
  [...strategies].sort((a, b) => {
    // First, sort by coming soon status (coming soon goes to the end)
    if (a.debtAsset?.comingSoon && !b.debtAsset?.comingSoon) return 1
    if (!a.debtAsset?.comingSoon && b.debtAsset?.comingSoon) return -1
    
    // If both have the same coming soon status, sort by APY
    const aApy = a.maxROE || 0
    const bApy = b.maxROE || 0
    return direction === 'asc' ? aApy - bApy : bApy - aApy
  })

// Pure function to group strategies by risk level
export const groupStrategiesByRisk = (strategies: any[]): Record<string, any[]> => {
  return strategies.reduce(
    (groups, strategy) => {
      const risk = calculateRiskLevel(strategy)
      return {
        ...groups,
        [risk]: [...(groups[risk] || []), strategy],
      }
    },
    {} as Record<string, any[]>,
  )
}
