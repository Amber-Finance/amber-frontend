'use client'

import { useMemo } from 'react'

/**
 * Hook for calculating simulated APY values for strategy deployments
 * This integrates the APY calculation with leverage multiplier calculations
 */
export const useStrategySimulatedApy = (
  collateralAmount: string,
  multiplier: number,
  collateralMarketData: MarketDataItem | null,
  debtMarketData: MarketDataItem | null,
  currentApys: {
    collateralSupplyApy: number
    debtBorrowApy: number
  },
  decimals: {
    collateral: number
    debt: number
  } = { collateral: 6, debt: 6 },
) => {
  const calculatedApys = useMemo(() => {
    // Return current APYs if no valid market data or multiplier
    if (!collateralMarketData || !debtMarketData || multiplier <= 1) {
      // Ensure we always have valid APY values for display
      const safeCollateralApy = isNaN(currentApys.collateralSupplyApy)
        ? 0
        : currentApys.collateralSupplyApy || 0
      const safeDebtApy = isNaN(currentApys.debtBorrowApy) ? 0 : currentApys.debtBorrowApy || 0
      const safeMultiplier = isNaN(multiplier) || multiplier < 1 ? 1 : multiplier
      const leveragedApy = safeCollateralApy * safeMultiplier - safeDebtApy * (safeMultiplier - 1)

      return {
        collateralSupplyApy: safeCollateralApy,
        debtBorrowApy: safeDebtApy,
        leveragedApy: isNaN(leveragedApy) ? 0 : leveragedApy,
        netApy: isNaN(leveragedApy) ? 0 : leveragedApy,
      }
    }

    // If collateral amount is empty or very small, use static values
    const collateralAmountNum = parseFloat(collateralAmount || '0')
    if (
      !collateralAmount ||
      collateralAmount === '0' ||
      collateralAmount === '' ||
      collateralAmountNum < 0.001
    ) {
      // Use static APY values for display when no meaningful input
      const safeCollateralApy = isNaN(currentApys.collateralSupplyApy)
        ? 0
        : currentApys.collateralSupplyApy || 0
      const safeDebtApy = isNaN(currentApys.debtBorrowApy) ? 0 : currentApys.debtBorrowApy || 0
      const safeMultiplier = isNaN(multiplier) || multiplier < 1 ? 1 : multiplier
      const leveragedApy = safeCollateralApy * safeMultiplier - safeDebtApy * (safeMultiplier - 1)

      return {
        collateralSupplyApy: safeCollateralApy,
        debtBorrowApy: safeDebtApy,
        leveragedApy: isNaN(leveragedApy) ? 0 : leveragedApy,
        netApy: isNaN(leveragedApy) ? 0 : leveragedApy,
      }
    }

    try {
      // Keep both APYs static for strategy display - don't simulate market impact
      // This prevents rates from fluctuating when leverage changes, providing clearer UX
      const newCollateralSupplyApy = currentApys.collateralSupplyApy || 0
      const newDebtBorrowApy = currentApys.debtBorrowApy || 0

      // Validate inputs to prevent NaN
      const safeMultiplier = isNaN(multiplier) || multiplier < 1 ? 1 : multiplier
      const safeCollateralApy = isNaN(newCollateralSupplyApy) ? 0 : newCollateralSupplyApy
      const safeDebtApy = isNaN(newDebtBorrowApy) ? 0 : newDebtBorrowApy

      // Calculate leveraged APY: Supply APY × Multiplier - Borrow APY × (Multiplier - 1)
      const leveragedApy = safeCollateralApy * safeMultiplier - safeDebtApy * (safeMultiplier - 1)

      return {
        collateralSupplyApy: safeCollateralApy,
        debtBorrowApy: safeDebtApy,
        leveragedApy: isNaN(leveragedApy) ? 0 : leveragedApy,
        netApy: isNaN(leveragedApy) ? 0 : leveragedApy,
      }
    } catch (error) {
      console.warn('Error calculating strategy simulated APY:', error)
      // Return safe fallback values
      const safeCollateralApy = currentApys.collateralSupplyApy || 0
      const safeDebtApy = currentApys.debtBorrowApy || 0
      const safeMultiplier = isNaN(multiplier) || multiplier < 1 ? 1 : multiplier
      const leveragedApy = safeCollateralApy * safeMultiplier - safeDebtApy * (safeMultiplier - 1)

      return {
        collateralSupplyApy: safeCollateralApy,
        debtBorrowApy: safeDebtApy,
        leveragedApy: isNaN(leveragedApy) ? 0 : leveragedApy,
        netApy: isNaN(leveragedApy) ? 0 : leveragedApy,
      }
    }
  }, [collateralAmount, multiplier, collateralMarketData, debtMarketData, currentApys, decimals])

  return calculatedApys
}

/**
 * Hook for calculating position metrics with simulated APY
 * This combines the existing position calculations with simulated APY updates
 */
export const usePositionCalculationsWithSimulatedApy = (
  collateralAmount: string,
  multiplier: number,
  collateralMarketData: MarketDataItem | null,
  debtMarketData: MarketDataItem | null,
  currentApys: {
    collateralSupplyApy: number
    debtBorrowApy: number
  },
  decimals: {
    collateral: number
    debt: number
  } = { collateral: 6, debt: 6 },
) => {
  const currentAmount = parseFloat(collateralAmount || '0')

  const simulatedApys = useStrategySimulatedApy(
    collateralAmount,
    multiplier,
    collateralMarketData,
    debtMarketData,
    currentApys,
    decimals,
  )

  const positionCalcs = useMemo(() => {
    const borrowAmount = currentAmount * (multiplier - 1)
    const totalPosition = currentAmount * multiplier
    const estimatedYearlyEarnings = currentAmount * simulatedApys.leveragedApy

    return {
      borrowAmount,
      totalPosition,
      leveragedApy: simulatedApys.leveragedApy,
      netApy: simulatedApys.netApy,
      estimatedYearlyEarnings,
      collateralSupplyApy: simulatedApys.collateralSupplyApy,
      debtBorrowApy: simulatedApys.debtBorrowApy,
      yieldSpread: simulatedApys.collateralSupplyApy - simulatedApys.debtBorrowApy,
    }
  }, [currentAmount, multiplier, simulatedApys])

  return positionCalcs
}
