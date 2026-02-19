'use client'

import { useMemo } from 'react'

import BigNumber from 'bignumber.js'

import { calculateApyAfterAction } from '@/utils/strategy/apyCalculations'

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
        leveragedApy:
          currentApys.collateralSupplyApy * multiplier -
          currentApys.debtBorrowApy * (multiplier - 1),
        netApy:
          currentApys.collateralSupplyApy * multiplier -
          currentApys.debtBorrowApy * (multiplier - 1),
      }
    }

    try {
      const collateralAmountBN = new BigNumber(collateralAmount)

      // Check if the amount is too large for simulation (> 1000 units)
      // For very large amounts, the interest rate simulation becomes unreliable
      if (collateralAmountBN.isGreaterThan(1000)) {
        console.warn('Amount too large for APY simulation, using current APYs')
        const leveragedApy =
          currentApys.collateralSupplyApy * multiplier -
          currentApys.debtBorrowApy * (multiplier - 1)
        return {
          collateralSupplyApy: currentApys.collateralSupplyApy,
          debtBorrowApy: currentApys.debtBorrowApy,
          leveragedApy,
          netApy: leveragedApy,
        }
      }

      // Calculate borrow amount based on multiplier
      // borrowAmount = collateralAmount * (multiplier - 1)
      const borrowAmount = collateralAmountBN.multipliedBy(multiplier - 1)

      // Convert to smallest units
      const borrowAmountSmallest = borrowAmount.shiftedBy(decimals.debt).toString()

      // Additional check: if borrow amount in smallest units is too large, fallback
      // For 18-decimal tokens (like solvBTC), 1e15 is only 0.001 tokens, so scale threshold by decimals
      const borrowAmountBN = new BigNumber(borrowAmountSmallest)
      const maxSmallestUnits = new BigNumber(1000).shiftedBy(decimals.debt) // 1000 tokens in smallest units
      if (borrowAmountBN.isGreaterThan(maxSmallestUnits)) {
        console.warn('Borrow amount too large for simulation, using current APYs')
        const leveragedApy =
          currentApys.collateralSupplyApy * multiplier -
          currentApys.debtBorrowApy * (multiplier - 1)
        return {
          collateralSupplyApy: currentApys.collateralSupplyApy,
          debtBorrowApy: currentApys.debtBorrowApy,
          leveragedApy,
          netApy: leveragedApy,
        }
      }

      // Calculate new APYs after borrow action
      const debtResult = calculateApyAfterAction('borrow', borrowAmountSmallest, debtMarketData)

      // Convert APY strings to numbers (they're already in percentage format)
      const newDebtBorrowApy = parseFloat(debtResult.apys.borrow) / 100

      // Sanity check the calculated APY
      if (!isFinite(newDebtBorrowApy) || Math.abs(newDebtBorrowApy) > 100) {
        console.warn('Simulated APY is extreme, using current APYs')
        const leveragedApy =
          currentApys.collateralSupplyApy * multiplier -
          currentApys.debtBorrowApy * (multiplier - 1)
        return {
          collateralSupplyApy: currentApys.collateralSupplyApy,
          debtBorrowApy: currentApys.debtBorrowApy,
          leveragedApy,
          netApy: leveragedApy,
        }
      }

      // Calculate leveraged APY: (collateral APY * multiplier) - (debt APY * (multiplier - 1))
      // This accounts for earning on total collateral and paying interest on borrowed amount
      const leveragedApy =
        currentApys.collateralSupplyApy * multiplier - newDebtBorrowApy * (multiplier - 1)

      // Final sanity check on leveraged APY
      if (!isFinite(leveragedApy) || Math.abs(leveragedApy) > 1000) {
        console.warn('Leveraged APY is extreme, using current APYs')
        const fallbackLeveragedApy =
          currentApys.collateralSupplyApy * multiplier -
          currentApys.debtBorrowApy * (multiplier - 1)
        return {
          collateralSupplyApy: currentApys.collateralSupplyApy,
          debtBorrowApy: currentApys.debtBorrowApy,
          leveragedApy: fallbackLeveragedApy,
          netApy: fallbackLeveragedApy,
        }
      }

      return {
        collateralSupplyApy: currentApys.collateralSupplyApy,
        debtBorrowApy: newDebtBorrowApy,
        leveragedApy,
        netApy: leveragedApy,
      }
    } catch (error) {
      console.warn('Error calculating strategy simulated APY:', error)
      // Return fallback values
      const leveragedApy =
        currentApys.collateralSupplyApy * multiplier - currentApys.debtBorrowApy * (multiplier - 1)
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
