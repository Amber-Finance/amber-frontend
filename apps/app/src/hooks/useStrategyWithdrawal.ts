import { useCallback, useState } from 'react'

import { BigNumber } from 'bignumber.js'

import getNeutronRouteInfo from '@/api/swap/getNeutronRouteInfo'
import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'
import { useBroadcast } from '@/utils/broadcast'
import { getMinAmountOutFromRouteInfo } from '@/utils/swap'

export function useStrategyWithdrawal() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { executeTransaction } = useBroadcast()
  const { markets } = useStore()

  const withdrawStrategy = useCallback(
    async (params: WithdrawStrategyParams) => {
      setIsProcessing(true)

      try {
        // Calculate the amount needed to repay debt
        const debtAmountFormatted = new BigNumber(params.debtAmount)
          .shiftedBy(params.debtDecimals)
          .integerValue(BigNumber.ROUND_UP)
          .toString()

        // Calculate collateral needed for swap (add some buffer for slippage/fees)
        const collateralForSwap = new BigNumber(params.collateralAmount)
          .multipliedBy(0.95) // Use 95% of collateral, leaving buffer
          .shiftedBy(params.collateralDecimals)
          .integerValue(BigNumber.ROUND_DOWN)
          .toString()

        console.log('Fetching swap route for strategy withdrawal:', {
          collateralDenom: params.collateralDenom,
          debtDenom: params.debtDenom,
          collateralAmount: collateralForSwap,
          debtAmountNeeded: debtAmountFormatted,
        })

        // Fetch swap route from collateral to debt asset using existing Neutron API
        const routeResult = await getNeutronRouteInfo(
          params.collateralDenom,
          params.debtDenom,
          new BigNumber(collateralForSwap),
          markets?.map((m) => m.asset) || [],
          chainConfig,
        )

        if (!routeResult) {
          throw new Error('Could not find swap route for withdrawal')
        }

        console.log('Swap route found:', routeResult)
        console.log('Route object:', routeResult.route)

        // Calculate minimum receive amount with slippage
        const minReceive = getMinAmountOutFromRouteInfo(routeResult, 0.5).integerValue().toString()

        // Build withdrawal actions
        const actions = [
          // 1. Withdraw some collateral
          {
            withdraw: {
              denom: params.collateralDenom,
              amount: { exact: collateralForSwap },
            },
          },
          // 2. Swap collateral to debt asset
          {
            swap_exact_in: {
              coin_in: {
                denom: params.collateralDenom,
                amount: { exact: collateralForSwap },
              },
              denom_out: params.debtDenom,
              min_receive: minReceive,
              route: routeResult.route,
            },
          },
          // 3. Repay debt
          {
            repay: {
              coin: {
                denom: params.debtDenom,
                amount: { exact: debtAmountFormatted },
              },
            },
          },
        ]

        // Execute withdrawal transaction
        const result = await executeTransaction(
          {
            type: 'strategy',
            strategyType: 'update',
            accountId: params.accountId,
            actions,
          },
          {
            pending: 'Withdrawing from strategy...',
            success: 'Strategy withdrawal successful!',
            error: 'Strategy withdrawal failed',
          },
        )

        return result
      } catch (error) {
        console.error('Strategy withdrawal error:', error)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [executeTransaction],
  )

  const withdrawFullStrategy = useCallback(
    async (params: WithdrawStrategyParams) => {
      setIsProcessing(true)

      try {
        // For full withdrawal, we need to repay all debt and withdraw all collateral
        const debtAmountFormatted = new BigNumber(params.debtAmount)
          .shiftedBy(params.debtDecimals)
          .integerValue(BigNumber.ROUND_UP)
          .toString()

        // Use most of collateral for swap, leaving some for gas/fees
        const collateralForSwap = new BigNumber(params.collateralAmount)
          .multipliedBy(0.98) // Use 98% of collateral
          .shiftedBy(params.collateralDecimals)
          .integerValue(BigNumber.ROUND_DOWN)
          .toString()

        console.log('Fetching swap route for full strategy withdrawal:', {
          collateralDenom: params.collateralDenom,
          debtDenom: params.debtDenom,
          collateralAmount: collateralForSwap,
          debtAmountNeeded: debtAmountFormatted,
        })

        // Fetch swap route using existing Neutron API
        const routeResult = await getNeutronRouteInfo(
          params.collateralDenom,
          params.debtDenom,
          new BigNumber(collateralForSwap),
          markets?.map((m) => m.asset) || [],
          chainConfig,
        )

        if (!routeResult) {
          throw new Error('Could not find swap route for full withdrawal')
        }

        // Build full withdrawal actions
        const actions = [
          // 1. Withdraw collateral for swap
          {
            withdraw: {
              denom: params.collateralDenom,
              amount: collateralForSwap,
            },
          },
          // 2. Swap to debt asset
          {
            swap_exact_in: {
              coin_in: {
                denom: params.collateralDenom,
                amount: collateralForSwap,
              },
              denom_out: params.debtDenom,
              slippage: '0.5',
              route: routeResult,
            },
          },
          // 3. Repay all debt (this should close the debt position)
          {
            repay: {
              coin: {
                denom: params.debtDenom,
                amount: debtAmountFormatted,
              },
            },
          },
          // 4. Withdraw remaining collateral
          {
            withdraw: {
              denom: params.collateralDenom,
              amount: 'all', // Withdraw all remaining collateral
            },
          },
        ]

        // Execute full withdrawal transaction
        const result = await executeTransaction(
          {
            type: 'strategy',
            strategyType: 'decrease',
            accountId: params.accountId,
            actions,
          },
          {
            pending: 'Closing strategy position...',
            success: 'Strategy position closed successfully!',
            error: 'Strategy closure failed',
          },
        )

        return result
      } catch (error) {
        console.error('Full strategy withdrawal error:', error)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [executeTransaction],
  )

  const deleteAccount = useCallback(
    async (options: DeleteAccountOptions) => {
      setIsProcessing(true)

      try {
        // Build reclaim messages for all lends
        const reclaimMsg = options.lends.map((coin) => ({
          reclaim: {
            denom: coin.denom,
            amount: coin.amount,
          },
        }))

        // Execute delete transaction with reclaim and refund actions
        const result = await executeTransaction(
          {
            type: 'strategy',
            strategyType: 'delete',
            accountId: options.accountId,
            actions: [...reclaimMsg, { refund_all_coin_balances: {} }],
          },
          {
            pending: 'Deleting strategy account...',
            success: 'Strategy account deleted successfully!',
            error: 'Failed to delete strategy account',
          },
        )

        return result
      } catch (error) {
        console.error('Delete account error:', error)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [executeTransaction],
  )

  const withdrawAndDeleteAccount = useCallback(
    async (params: WithdrawStrategyParams) => {
      setIsProcessing(true)

      try {
        // First do the full withdrawal
        await withdrawFullStrategy(params)

        // Then delete the account by reclaiming all remaining collateral
        const lends: BNCoin[] = [
          {
            denom: params.collateralDenom,
            amount: '0', // Will be determined by the contract
          },
        ]

        await deleteAccount({
          accountId: params.accountId,
          lends,
        })

        return true
      } catch (error) {
        console.error('Withdraw and delete account error:', error)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [withdrawFullStrategy, deleteAccount],
  )

  return {
    withdrawStrategy,
    withdrawFullStrategy,
    deleteAccount,
    withdrawAndDeleteAccount,
    isProcessing,
  }
}
