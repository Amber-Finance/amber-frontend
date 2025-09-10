import { useMemo } from 'react'

import { BigNumber } from 'bignumber.js'

import { useStore } from '@/store/useStore'

interface WithdrawValidationResult {
  isValid: boolean
  maxWithdrawable: string
  errorMessage?: string
  isLoading: boolean
}

export function useWithdrawValidation(
  amount: string,
  denom: string,
  userDepositedAmount?: string,
): WithdrawValidationResult {
  const { markets } = useStore()

  return useMemo(() => {
    if (!markets || markets.length === 0) {
      return {
        isValid: false,
        maxWithdrawable: '0',
        isLoading: true,
      }
    }

    const market = markets.find((market) => market.asset.denom === denom)

    if (!market) {
      return {
        isValid: false,
        maxWithdrawable: '0',
        errorMessage: 'Market not found',
        isLoading: false,
      }
    }

    let withdrawalAmount: BigNumber
    try {
      withdrawalAmount = new BigNumber(amount || '0')
    } catch {
      return {
        isValid: false,
        maxWithdrawable: '0',
        errorMessage: 'Invalid amount format',
        isLoading: false,
      }
    }

    // Available liquidity = collateral_total_amount - debt_total_amount
    const collateralTotal = new BigNumber(market.metrics.collateral_total_amount || '0')
    const debtTotal = new BigNumber(market.metrics.debt_total_amount || '0')
    const availableLiquidity = collateralTotal.minus(debtTotal)

    const decimals = market.asset.decimals || 6
    const availableLiquidityTokens = availableLiquidity.shiftedBy(-decimals)
    const userDepositedTokens = userDepositedAmount
      ? new BigNumber(userDepositedAmount).shiftedBy(-decimals)
      : new BigNumber(0)

    // The actual max withdrawable is the minimum of:
    // 1. User's deposited amount
    // 2. Available liquidity in the pool
    const actualMaxWithdrawable = BigNumber.min(userDepositedTokens, availableLiquidityTokens)

    // Apply 1% buffer to the withdrawal amount for safety, but only if it's not exactly the user's deposited amount
    const isExactUserDeposit = withdrawalAmount.isEqualTo(userDepositedTokens)
    const bufferedWithdrawalAmount = isExactUserDeposit
      ? withdrawalAmount
      : withdrawalAmount.multipliedBy(1.01)
    const isValid = bufferedWithdrawalAmount.isLessThanOrEqualTo(actualMaxWithdrawable)

    return {
      isValid,
      maxWithdrawable: actualMaxWithdrawable.toString(),
      errorMessage: !isValid ? 'Insufficient liquidity in pool. Try a smaller amount.' : undefined,
      isLoading: false,
    }
  }, [amount, denom, markets, userDepositedAmount])
}
