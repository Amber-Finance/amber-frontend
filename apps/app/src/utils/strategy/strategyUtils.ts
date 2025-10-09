import { BigNumber } from 'bignumber.js'

import { calculateUsdValueLegacy, formatLargeCurrency } from '@/utils/formatting/format'
import { pipe, safeParseNumber } from '@/utils/common/functional'

// Pure functions for strategy calculations
// Calculate base net APY at 2x leverage (2x supply income - 1x borrow cost)
export const calculateBaseNetApy = (supplyApy: number, borrowApy: number): number =>
  supplyApy * 2 - borrowApy * 1

export const calculateMaxLeverage = (maxLTV: number): number => {
  if (maxLTV <= 0 || maxLTV >= 1) return 1
  const theoreticalMaxLeverage = 1 / (1 - maxLTV)
  // Apply 0.5x safety buffer
  return Math.max(1, theoreticalMaxLeverage - 0.5)
}

// Removed: calculateCappedMaxLeverage - now using pure 1/(1-LTV) calculation without caps

export const calculateBorrowCapacity = (totalCollateral: string): BigNumber =>
  BigNumber.max(0, new BigNumber(totalCollateral))

export const calculateBorrowCapacityUsd = (
  borrowCapacity: BigNumber,
  price: string,
  decimals: number,
): number => calculateUsdValueLegacy(borrowCapacity.toString(), price, decimals)

export const calculateMaxPositionUsd = (collateralUsd: BigNumber, maxLTV: number): BigNumber => {
  const maxBorrowUsd = collateralUsd.multipliedBy(maxLTV)
  return collateralUsd.plus(maxBorrowUsd)
}

// Pure function to filter debt markets
export const filterDebtMarkets = (markets: MarketData[], excludeSymbol?: string): MarketData[] =>
  markets.filter(
    (market) =>
      market.params.red_bank.borrow_enabled &&
      market.params.credit_manager.whitelisted &&
      (!excludeSymbol || market.asset.symbol !== excludeSymbol),
  )

// Pure function to find token configuration
export const findTokenConfig = (tokens: TokenInfo[], market: MarketData) =>
  tokens.find((token) => token.denom === market.asset.denom || token.symbol === market.asset.symbol)

// Pure function to create asset info
export const createTokenInfo = (token: any, market?: MarketData, tokenConfig?: any): TokenInfo => ({
  denom: token.denom || market?.asset.denom || '',
  symbol: token.symbol || market?.asset.symbol || '',
  description: token.description || market?.asset.description || '',
  decimals: token.decimals || market?.asset.decimals || 8,
  icon: token.icon || tokenConfig?.icon || market?.asset.icon || '',
  brandColor: token.brandColor || tokenConfig?.brandColor || '#6B7280',
  chainId: token.chainId || market?.asset.chainId || '',
  protocolIconLight: token.protocolIconLight || tokenConfig?.protocolIconLight || '',
  protocolIconDark: token.protocolIconDark || tokenConfig?.protocolIconDark || '',
  isLST: token.isLST || tokenConfig?.isLST || false,
  protocol: token.protocol || tokenConfig?.protocol || '',
  origin: token.origin || tokenConfig?.origin || {},
  comingSoon: token.comingSoon || tokenConfig?.comingSoon || false,
})

// Pure function to calculate strategy metrics
export const calculateStrategyMetrics = (
  market: MarketData,
  maxBtcSupplyApy: number,
  maxLTV: number,
  liquidationThreshold: number,
) => {
  const debtBorrowRate = safeParseNumber()(market.metrics.borrow_rate || '0')
  const baseNetApy = calculateBaseNetApy(maxBtcSupplyApy, debtBorrowRate)
  const maxLeverage = calculateMaxLeverage(maxLTV)

  return {
    debtBorrowRate,
    baseNetApy,
    maxLeverage,
    maxROE: baseNetApy * maxLeverage,
  }
}

// Pure function to create strategy data
export const createStrategyData = (
  market: MarketData,
  collateralAsset: TokenInfo,
  debtAsset: TokenInfo,
  metrics: ReturnType<typeof calculateStrategyMetrics>,
  borrowCapacityUsd: number,
  maxPositionUsd: number,
  maxBtcSupplyApy: number,
): StrategyData => ({
  id: `${collateralAsset.symbol}-${debtAsset.symbol}`,
  type: 'Leverage Strategy',
  collateralAsset,
  debtAsset,
  maxROE: metrics.maxROE,
  isPositive: metrics.baseNetApy >= 0,
  hasPoints: false,
  rewards: '-',
  multiplier: metrics.maxLeverage,
  isCorrelated: market.asset.symbol.includes('BTC') || market.asset.symbol.includes('btc'),
  liquidity: borrowCapacityUsd,
  liquidityDisplay: formatLargeCurrency(borrowCapacityUsd),
  subText: `Supply ${collateralAsset.symbol}, borrow ${debtAsset.symbol}`,
  supplyApy: maxBtcSupplyApy,
  borrowApy: metrics.debtBorrowRate,
  netApy: metrics.baseNetApy,
  ltv: safeParseNumber()(market.params.max_loan_to_value || '0.8'),
  liquidationThreshold: safeParseNumber()(market.params.liquidation_threshold || '0.85'),
  maxLeverage: metrics.maxLeverage,
  maxBorrowCapacityUsd: borrowCapacityUsd,
  maxPositionSizeUsd: maxPositionUsd,
  collateralStakingApy: 0,
  collateralTotalApy: maxBtcSupplyApy,
  debtStakingApy: 0,
  debtNetCost: metrics.debtBorrowRate,
  hasStakingData: false,
})

// Higher-order function for strategy generation
export const createStrategyGenerator =
  (
    collateralToken: TokenInfo,
    tokens: TokenInfo[],
    effectiveMaxBtcApy: number,
    markets: MarketData[],
  ) =>
  (market: MarketData): StrategyData => {
    const collateralAsset = collateralToken

    // Find token config for debt asset to ensure it has brandColor
    const debtTokenConfig = findTokenConfig(tokens, market)
    const debtAsset = createTokenInfo(market.asset, market, debtTokenConfig)

    // Find the collateral market to get its LTV (this is what determines max leverage)
    const collateralMarket = markets.find((m) => m.asset.denom === collateralToken.denom)

    const maxBtcSupplyApy = effectiveMaxBtcApy / 100
    // Use COLLATERAL asset's LTV for max leverage calculation, not debt asset's LTV
    const maxLTV = safeParseNumber()(collateralMarket?.params?.max_loan_to_value || '0.8')
    const liquidationThreshold = safeParseNumber()(market.params.liquidation_threshold || '0.85')

    const metrics = calculateStrategyMetrics(market, maxBtcSupplyApy, maxLTV, liquidationThreshold)

    // Calculate borrow capacity - max borrow equals total supplied amount
    const totalCollateral = new BigNumber(market.metrics.collateral_total_amount || '0')
    const availableBorrowCapacity = calculateBorrowCapacity(totalCollateral.toString())

    const borrowCapacityUsd = calculateBorrowCapacityUsd(
      availableBorrowCapacity,
      market.price?.price || '0',
      market.asset.decimals,
    )

    // Calculate max position size
    const collateralAmount = new BigNumber(0.00001)
    const collateralUsd = new BigNumber(
      calculateUsdValueLegacy(
        collateralAmount.toString(),
        market.price?.price || '0',
        collateralToken.decimals,
      ),
    )
    const maxPositionUsd = calculateMaxPositionUsd(collateralUsd, maxLTV).toNumber()

    return createStrategyData(
      market,
      collateralAsset,
      debtAsset,
      metrics,
      borrowCapacityUsd,
      maxPositionUsd,
      maxBtcSupplyApy,
    )
  }

// Pure function to generate all strategies
export const generateStrategies = (
  markets: MarketData[],
  collateralToken: TokenInfo,
  tokens: TokenInfo[],
  effectiveMaxBtcApy: number,
): StrategyData[] => {
  const debtMarkets = filterDebtMarkets(markets, collateralToken.symbol)
  const strategyGenerator = createStrategyGenerator(
    collateralToken,
    tokens,
    effectiveMaxBtcApy,
    markets,
  )

  return debtMarkets.map(strategyGenerator)
}

// Pure function for position calculations
export const calculatePositionMetrics = (
  amount: number,
  multiplier: number,
  supplyApy: number,
  borrowApy: number,
) => {
  const borrowAmount = amount * (multiplier - 1)
  const totalSupplied = amount * multiplier
  const leveragedApy = supplyApy * multiplier - borrowApy * (multiplier - 1)
  const estimatedYearlyEarnings = amount * leveragedApy

  return {
    borrowAmount,
    totalSupplied,
    leveragedApy,
    estimatedYearlyEarnings,
    netApy: leveragedApy,
  }
}

// Type definition for risk levels
type RiskLevel = 'low' | 'medium' | 'high'

// Pure function for risk assessment
export const assessRisk = (multiplier: number, isCorrelated: boolean) => {
  let leverageRisk: RiskLevel
  if (multiplier > 3) {
    leverageRisk = 'high'
  } else if (multiplier > 2) {
    leverageRisk = 'medium'
  } else {
    leverageRisk = 'low'
  }

  // Correlation risk can be low or medium based on asset correlation
  const correlationRisk: RiskLevel = isCorrelated ? 'low' : 'medium'

  let overall: RiskLevel
  if (leverageRisk === 'high') {
    overall = 'high'
  } else if (leverageRisk === 'medium' || correlationRisk === 'medium') {
    overall = 'medium'
  } else {
    overall = 'low'
  }

  return {
    leverageRisk,
    correlationRisk,
    overall,
  }
}

// Pure function for display formatting
export const formatStrategyDisplay = (strategy: StrategyData) => ({
  title: `${strategy.collateralAsset.symbol}/${strategy.debtAsset.symbol}`,
  subtitle: strategy.subText,
  apyDisplay: `${(strategy.maxROE * 100).toFixed(2)}%`,
  leverageDisplay: `${strategy.maxLeverage.toFixed(1)}x`,
  liquidityDisplay: strategy.liquidityDisplay,
})

// Utility functions for component props
export const createStrategyCardProps = (strategy: StrategyData) => ({
  strategy,
  display: formatStrategyDisplay(strategy),
  risk: assessRisk(strategy.multiplier, strategy.isCorrelated),
})

// Pure function for filtering strategies
export const filterStrategiesByRisk =
  (riskLevel: RiskLevel) =>
  (strategies: StrategyData[]): StrategyData[] =>
    strategies.filter((strategy) => {
      const risk = assessRisk(strategy.multiplier, strategy.isCorrelated)
      return risk.overall === riskLevel
    })

// Pure function for sorting strategies with coming soon assets at the end
export const sortStrategiesWithComingSoonAtEnd =
  (direction: 'asc' | 'desc' = 'desc') =>
  (strategies: StrategyData[]): StrategyData[] =>
    [...strategies].sort((a, b) => {
      // First, sort by coming soon status (coming soon goes to the end)
      if (a.debtAsset.comingSoon && !b.debtAsset.comingSoon) return 1
      if (!a.debtAsset.comingSoon && b.debtAsset.comingSoon) return -1

      // If both have the same coming soon status, sort by maxROE
      const comparison = a.maxROE - b.maxROE
      return direction === 'asc' ? comparison : -comparison
    })

// Composition functions
export const processStrategies = pipe(
  (strategies: StrategyData[]) => strategies,
  sortStrategiesWithComingSoonAtEnd('desc'),
)

export const getHighYieldStrategies = pipe(
  (strategies: StrategyData[]) => strategies.filter((s) => s.maxROE > 0.05), // > 5% APY
  sortStrategiesWithComingSoonAtEnd('desc'),
)
