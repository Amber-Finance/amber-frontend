import { BigNumber } from 'bignumber.js'

import { calculateUsdValue, formatTokenAmount } from '@/utils/format'
import { getMaxLeverageForStrategy } from '@/utils/maxLeverageCalculator'

export const getMaxAPY = (strategy: Strategy, markets?: Market[], isWasmReady?: boolean) => {
  const maxLeverage = calculateMaxLeverage(strategy, markets, isWasmReady)
  const collateralTotalApy = strategy.collateralTotalApy || strategy.supplyApy || 0
  const debtBorrowRate = strategy.borrowApy || 0
  const leveragedApy = maxLeverage * collateralTotalApy - (maxLeverage - 1) * debtBorrowRate
  return leveragedApy
}

export const getUserBalance = (
  isWalletConnected: boolean,
  walletBalancesLoading: boolean,
  walletBalances: any[] | undefined,
  collateralDenom: string,
) => {
  if (!isWalletConnected || walletBalancesLoading || !walletBalances) {
    return new BigNumber(0)
  }
  const balance = walletBalances.find((b) => b.denom === collateralDenom)
  if (!balance) {
    return new BigNumber(0)
  }
  return new BigNumber(balance.amount)
}

export const getAvailableDepositCapacity = () => {
  return new BigNumber('100000000000') // 1000 WBTC.axl available capacity
}

export const calculateMaxLeverage = (
  strategy: Strategy,
  markets?: Market[],
  isWasmReady?: boolean,
) => {
  // Use health computer calculation if available
  if (markets && isWasmReady) {
    try {
      const healthComputerLeverage = getMaxLeverageForStrategy(strategy, markets, isWasmReady)
      if (healthComputerLeverage > 1) {
        return healthComputerLeverage
      }
    } catch (error) {
      console.warn('Failed to calculate leverage with health computer:', error)
    }
  }

  // Fallback to strategy properties
  if (strategy.maxLeverage && strategy.maxLeverage > 1) {
    return strategy.maxLeverage
  }
  if (strategy.multiplier && strategy.multiplier > 1) {
    return strategy.multiplier
  }
  return 5 // Default fallback
}

export const getUserBalanceUsd = (
  isWalletConnected: boolean,
  walletBalancesLoading: boolean,
  walletBalances: any[] | undefined,
  collateralDenom: string,
) => {
  const userBalance = getUserBalance(
    isWalletConnected,
    walletBalancesLoading,
    walletBalances,
    collateralDenom,
  )
  const wbtcEurekaPrice = '95000'
  const usdValue = calculateUsdValue(userBalance.toString(), wbtcEurekaPrice, 8)
  return new BigNumber(usdValue)
}

export const calculateNetApy = (strategy: Strategy) => {
  return strategy.netApy || 0
}

export const formatLeverage = (strategy: Strategy, markets?: Market[], isWasmReady?: boolean) => {
  return calculateMaxLeverage(strategy, markets, isWasmReady).toFixed(2) + 'x'
}

export const formatCollateralAvailable = () => {
  const availableDepositCapacity = getAvailableDepositCapacity()
  const wbtcAxlPrice = '95000'
  const usdValue = calculateUsdValue(availableDepositCapacity.toString(), wbtcAxlPrice, 8)

  if (usdValue >= 1_000_000_000) {
    return `$${(usdValue / 1_000_000_000).toFixed(2)}B`
  } else if (usdValue >= 1_000_000) {
    return `$${(usdValue / 1_000_000).toFixed(2)}M`
  } else if (usdValue >= 1_000) {
    return `$${(usdValue / 1_000).toFixed(2)}K`
  }
  return `$${usdValue.toFixed(2)}`
}

export const getAvailableBorrowCapacity = (markets: any[] | undefined, debtAssetDenom: string) => {
  if (!markets) return new BigNumber(0)
  const debtMarket = markets.find((m) => m.asset.denom === debtAssetDenom)
  if (!debtMarket) return new BigNumber(0)
  const totalCollateral = new BigNumber(debtMarket.metrics.collateral_total_amount || '0')
  const totalDebt = new BigNumber(debtMarket.metrics.debt_total_amount || '0')
  return BigNumber.max(0, totalCollateral.minus(totalDebt))
}

export const formatBorrowableUsd = (strategy: Strategy) => {
  return strategy.liquidityDisplay || '$0'
}

export const getGradientColors = (strategy: Strategy) => {
  const collateralColor = strategy.collateralAsset.brandColor || '#F7931A'
  const debtColor = strategy.debtAsset.brandColor || '#6B7280'
  return { collateralColor, debtColor }
}

export const formatCollateralTokenAmount = () => {
  const availableDepositCapacity = getAvailableDepositCapacity()
  const formatted = availableDepositCapacity.dividedBy(new BigNumber(10).pow(8)).toNumber()

  return formatted
}

export const formatBorrowTokenAmount = (
  markets: any[] | undefined,
  debtAssetDenom: string,
  debtAssetSymbol: string,
) => {
  const availableBorrowCapacity = getAvailableBorrowCapacity(markets, debtAssetDenom)

  if (!markets) return formatTokenAmount(0, debtAssetSymbol)

  const debtMarket = markets.find((m) => m.asset.denom === debtAssetDenom)

  if (!debtMarket) return formatTokenAmount(0, debtAssetSymbol)

  const formatted = availableBorrowCapacity
    .dividedBy(new BigNumber(10).pow(debtMarket.asset.decimals || 6))
    .toNumber()

  return formatTokenAmount(formatted, debtAssetSymbol)
}

export const formatUserTokenAmount = (
  isWalletConnected: boolean,
  walletBalancesLoading: boolean,
  walletBalances: any[] | undefined,
  collateralDenom: string,
  collateralSymbol: string,
) => {
  const userBalance = getUserBalance(
    isWalletConnected,
    walletBalancesLoading,
    walletBalances,
    collateralDenom,
  )
  const tokenAmount = userBalance.dividedBy(new BigNumber(10).pow(8)).toNumber()

  return formatTokenAmount(tokenAmount, collateralSymbol)
}
