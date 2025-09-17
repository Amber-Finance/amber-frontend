'use client'

import { useMemo } from 'react'

import BigNumber from 'bignumber.js'

import { calculateApyAfterAction } from '@/utils/apyCalculations'

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
    // Return current APYs if no input or market data
    if (
      !collateralAmount ||
      collateralAmount === '0' ||
      collateralAmount === '' ||
      !collateralMarketData ||
      !debtMarketData ||
      multiplier <= 1
    ) {
      return {
        collateralSupplyApy: currentApys.collateralSupplyApy,
        debtBorrowApy: currentApys.debtBorrowApy,
        leveragedApy: (currentApys.collateralSupplyApy - currentApys.debtBorrowApy) * multiplier,
        netApy: (currentApys.collateralSupplyApy - currentApys.debtBorrowApy) * multiplier,
      }
    }

    try {
      const collateralAmountBN = new BigNumber(collateralAmount)

      // Calculate borrow amount based on multiplier
      // borrowAmount = collateralAmount * (multiplier - 1)
      const borrowAmount = collateralAmountBN.multipliedBy(multiplier - 1)

      // Convert to smallest units
      const collateralAmountSmallest = collateralAmountBN.shiftedBy(decimals.collateral).toString()
      const borrowAmountSmallest = borrowAmount.shiftedBy(decimals.debt).toString()

      // Calculate new APYs after deposit action
      const collateralResult = calculateApyAfterAction(
        'deposit',
        collateralAmountSmallest,
        collateralMarketData,
      )

      // Calculate new APYs after borrow action
      const debtResult = calculateApyAfterAction('borrow', borrowAmountSmallest, debtMarketData)

      // Convert APY strings to numbers (they're already in percentage format)
      const newCollateralSupplyApy = parseFloat(collateralResult.apys.lend) / 100
      const newDebtBorrowApy = parseFloat(debtResult.apys.borrow) / 100

      // Calculate leveraged APY: (collateral APY - debt APY) * multiplier
      const leveragedApy = (newCollateralSupplyApy - newDebtBorrowApy) * multiplier

      return {
        collateralSupplyApy: newCollateralSupplyApy,
        debtBorrowApy: newDebtBorrowApy,
        leveragedApy,
        netApy: leveragedApy,
      }
    } catch (error) {
      console.warn('Error calculating strategy simulated APY:', error)
      // Return fallback values
      const leveragedApy =
        (currentApys.collateralSupplyApy - currentApys.debtBorrowApy) * multiplier
      return {
        collateralSupplyApy: currentApys.collateralSupplyApy,
        debtBorrowApy: currentApys.debtBorrowApy,
        leveragedApy,
        netApy: leveragedApy,
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
