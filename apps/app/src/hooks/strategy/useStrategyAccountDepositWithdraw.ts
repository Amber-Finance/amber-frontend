import { useCallback, useState } from 'react'

import { BigNumber } from 'bignumber.js'

import { useBroadcast } from '@/utils/blockchain/broadcast'

interface UseStrategyAccountDepositWithdrawProps {
  activeStrategy?: ActiveStrategy
  accountId: string
}

interface DepositWithdrawResult {
  success: boolean
  error?: string
}

export interface StrategyAccountDepositParams {
  type: 'strategy_account_deposit'
  accountId: string
  amount: string
  denom: string
  decimals: number
  symbol: string
}

export interface StrategyAccountWithdrawParams {
  type: 'strategy_account_withdraw'
  accountId: string
  amount: string
  denom: string
  decimals: number
  symbol: string
}

export const useStrategyAccountDepositWithdraw = ({
  activeStrategy,
  accountId,
}: UseStrategyAccountDepositWithdrawProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const { executeTransaction } = useBroadcast()

  const depositToStrategy = useCallback(
    async (
      amount: string,
      denom: string,
      decimals: number,
      symbol: string,
    ): Promise<DepositWithdrawResult> => {
      setIsProcessing(true)

      try {
        if (!activeStrategy) {
          return { success: false, error: 'No active strategy found' }
        }

        if (!accountId) {
          return { success: false, error: 'No account ID provided' }
        }

        const depositAmount = new BigNumber(amount)
        if (depositAmount.isLessThanOrEqualTo(0)) {
          return { success: false, error: 'Invalid deposit amount' }
        }

        const config: StrategyAccountDepositParams = {
          type: 'strategy_account_deposit',
          accountId,
          amount,
          denom,
          decimals,
          symbol,
        }

        const result = await executeTransaction(config, {
          pending: `Depositing ${amount} ${symbol}...`,
          success: `Successfully deposited ${amount} ${symbol}!`,
          error: `Failed to deposit ${symbol}`,
        })

        return {
          success: result.success,
          error: result.error,
        }
      } catch (error) {
        console.error('Deposit failed:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [activeStrategy, accountId, executeTransaction],
  )

  const withdrawFromStrategy = useCallback(
    async (
      amount: string,
      denom: string,
      decimals: number,
      symbol: string,
    ): Promise<DepositWithdrawResult> => {
      setIsProcessing(true)

      try {
        if (!activeStrategy) {
          return { success: false, error: 'No active strategy found' }
        }

        if (!accountId) {
          return { success: false, error: 'No account ID provided' }
        }

        const withdrawAmount = new BigNumber(amount)
        if (withdrawAmount.isLessThanOrEqualTo(0)) {
          return { success: false, error: 'Invalid withdrawal amount' }
        }

        // Validate that user has enough collateral to withdraw
        const currentCollateral = new BigNumber(activeStrategy.collateralAsset.amountFormatted)
        const currentDebt = new BigNumber(activeStrategy.debtAsset.amountFormatted)
        const supplies = currentCollateral.minus(currentDebt)

        if (withdrawAmount.isGreaterThan(supplies)) {
          return {
            success: false,
            error: `Cannot withdraw more than your supply amount (${supplies.toFixed(8)} ${symbol})`,
          }
        }

        const config: StrategyAccountWithdrawParams = {
          type: 'strategy_account_withdraw',
          accountId,
          amount,
          denom,
          decimals,
          symbol,
        }

        const result = await executeTransaction(config, {
          pending: `Withdrawing ${amount} ${symbol}...`,
          success: `Successfully withdrew ${amount} ${symbol}!`,
          error: `Failed to withdraw ${symbol}`,
        })

        return {
          success: result.success,
          error: result.error,
        }
      } catch (error) {
        console.error('Withdrawal failed:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [activeStrategy, accountId, executeTransaction],
  )

  return {
    depositToStrategy,
    withdrawFromStrategy,
    isProcessing,
  }
}
