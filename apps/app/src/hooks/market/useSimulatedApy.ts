'use client'

import { useMemo } from 'react'

import BigNumber from 'bignumber.js'

import { calculateApyAfterAction } from '@/utils/strategy/apyCalculations'

/**
 * Hook for calculating simulated APY values based on user input amounts
 * This hook integrates with the existing APY calculation utility to provide
 * real-time APY updates as users type in deposit/borrow amounts
 */
export const useSimulatedApy = (
  action: 'deposit' | 'borrow' | 'withdraw',
  inputAmount: string,
  decimals: number,
  marketData: MarketDataItem | null,
  fallbackApy: {
    lend: string
    borrow: string
  },
) => {
  const simulatedApys = useMemo(() => {
    // Return fallback APYs if no market data or no input amount
    if (!marketData || !inputAmount || inputAmount === '0' || inputAmount === '') {
      return fallbackApy
    }

    try {
      // Convert input amount to the smallest unit using the correct decimals
      const amountInSmallestUnit = new BigNumber(inputAmount).shiftedBy(decimals).toString()

      // Calculate new APYs after the action
      const result = calculateApyAfterAction(action, amountInSmallestUnit, marketData)
      return result.apys
    } catch (error) {
      console.warn('Error calculating simulated APY:', error)
      return fallbackApy
    }
  }, [action, inputAmount, decimals, marketData, fallbackApy])

  return simulatedApys
}

/**
 * Hook specifically for deposit forms
 * Calculates how the lending APY will change after a deposit or withdrawal
 */
export const useDepositSimulatedApy = (
  amount: string,
  action: 'deposit' | 'withdraw',
  decimals: number,
  marketData: MarketDataItem | null,
  currentLendApy: string,
) => {
  return useSimulatedApy(action, amount, decimals, marketData, {
    lend: currentLendApy,
    borrow: '0', // Not relevant for deposit-only operations
  })
}

/**
 * Hook specifically for strategy deployment
 * Calculates how both lending and borrowing APYs will change after strategy actions
 */
export const useStrategySimulatedApy = (
  collateralAmount: string,
  borrowAmount: string,
  collateralDecimals: number,
  debtDecimals: number,
  collateralMarketData: MarketDataItem | null,
  debtMarketData: MarketDataItem | null,
  currentApys: {
    collateralLend: string
    debtBorrow: string
  },
) => {
  // Calculate APY changes for collateral deposit
  const collateralApys = useSimulatedApy(
    'deposit',
    collateralAmount,
    collateralDecimals,
    collateralMarketData,
    {
      lend: currentApys.collateralLend,
      borrow: '0',
    },
  )

  // Calculate APY changes for debt borrowing
  const debtApys = useSimulatedApy('borrow', borrowAmount, debtDecimals, debtMarketData, {
    lend: '0',
    borrow: currentApys.debtBorrow,
  })

  return {
    collateralSupplyApy: collateralApys.lend,
    debtBorrowApy: debtApys.borrow,
  }
}
