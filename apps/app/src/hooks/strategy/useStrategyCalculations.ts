import { useMemo } from 'react'

import { BigNumber } from 'bignumber.js'

export const formatBalance = (balance: number): string =>
  balance <= 0 ? '0.000000' : balance.toFixed(6)

export const calculateMaxLeverage = (ltv: number): number => {
  if (ltv <= 0) return 1
  const theoreticalMaxLeverage = 1 / (1 - ltv)
  // Apply 0.5x safety buffer
  return Math.max(1, theoreticalMaxLeverage - 0.5)
}

export const usePositionCalculations = (
  currentAmount: number,
  multiplier: number,
  collateralSupplyApy: number,
  debtBorrowApy: number,
) =>
  useMemo(
    () => ({
      borrowAmount: currentAmount * (multiplier - 1),
      totalPosition: currentAmount * multiplier,
      leveragedApy: multiplier * collateralSupplyApy - (multiplier - 1) * debtBorrowApy,
      baseApy: collateralSupplyApy - debtBorrowApy,
      yieldSpread: collateralSupplyApy - debtBorrowApy,
      estimatedYearlyEarnings:
        currentAmount * (multiplier * collateralSupplyApy - (multiplier - 1) * debtBorrowApy),
    }),
    [currentAmount, multiplier, collateralSupplyApy, debtBorrowApy],
  )

export const useMarketData = (strategy: Strategy, markets: Market[] | null) =>
  useMemo(() => {
    const collateralMarket = markets?.find((m) => m.asset.denom === strategy.collateralAsset.denom)
    const debtMarket = markets?.find((m) => m.asset.denom === strategy.debtAsset.denom)

    const currentPrice = collateralMarket?.price?.price
      ? new BigNumber(collateralMarket.price.price).toNumber()
      : 0

    const debtBorrowApy = debtMarket?.metrics?.borrow_rate
      ? new BigNumber(debtMarket.metrics.borrow_rate).toNumber()
      : strategy.borrowApy || 0

    // Use COLLATERAL asset's LTV for max leverage calculation, not debt asset's LTV
    const maxLTV = Number.parseFloat(collateralMarket?.params?.max_loan_to_value || '0.8')
    const dynamicMaxLeverage = calculateMaxLeverage(maxLTV)

    return {
      collateralMarket,
      debtMarket,
      currentPrice,
      debtBorrowApy,
      dynamicMaxLeverage,
    }
  }, [strategy, markets])

export const useWalletData = (
  strategy: Strategy,
  walletBalances: any[],
  address: string | undefined,
) =>
  useMemo(() => {
    const userWalletBalance = walletBalances?.find(
      (balance) => balance.denom === strategy.collateralAsset.denom,
    )

    const userBalance = userWalletBalance
      ? new BigNumber(userWalletBalance.amount)
          .shiftedBy(-(strategy.collateralAsset.decimals || 6))
          .toNumber()
      : 0

    return {
      userWalletBalance,
      userBalance,
      isWalletConnected: !!address,
    }
  }, [strategy, walletBalances, address])
