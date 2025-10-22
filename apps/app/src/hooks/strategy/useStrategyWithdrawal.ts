import { useCallback, useState } from 'react'

import { BigNumber } from 'bignumber.js'

import getNeutronRouteInfo from '@/api/swap/getNeutronRouteInfo'
import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'
import { useBroadcast } from '@/utils/blockchain/broadcast'
import { getMinAmountOutFromRouteInfo } from '@/utils/data/swap'

export function useStrategyWithdrawal() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFetchingRoute, setIsFetchingRoute] = useState(false)
  const { executeTransaction } = useBroadcast()
  const { markets } = useStore()

  const withdrawFullStrategy = useCallback(
    async (params: WithdrawStrategyParams) => {
      setIsProcessing(true)
      setIsFetchingRoute(true)

      try {
        // For full withdrawal, we need to repay all debt and withdraw all collateral
        // Note: params amounts are already in human-readable format, so we need to convert to raw units
        const debtAmountFormatted = new BigNumber(params.debtAmount)
          .shiftedBy(params.debtDecimals)
          .integerValue(BigNumber.ROUND_UP)
          .toString()

        // Use 50% of total collateral as initial estimate for swap (this should be more than enough)
        const totalCollateralRaw = new BigNumber(params.collateralAmount)
          .shiftedBy(params.collateralDecimals)
          .integerValue()

        // Start with 50% of collateral for the swap, we can adjust if needed
        const initialCollateralForSwap = totalCollateralRaw
          .multipliedBy(0.5)
          .integerValue()
          .toString()

        // Fetch initial swap route
        let routeResult = await getNeutronRouteInfo(
          params.collateralDenom,
          params.debtDenom,
          new BigNumber(initialCollateralForSwap),
          markets?.map((m) => m.asset) || [],
          chainConfig,
        )

        await new Promise((resolve) => setTimeout(resolve, 1500))

        const optimizedRouteResult = await getNeutronRouteInfo(
          params.collateralDenom,
          params.debtDenom,
          new BigNumber(initialCollateralForSwap),
          markets?.map((m) => m.asset) || [],
          chainConfig,
        )

        // Use the optimized route if it's better (lower price impact or better output)
        if (optimizedRouteResult) {
          const initialPriceImpact = routeResult?.priceImpact?.abs() || new BigNumber(Infinity)
          const optimizedPriceImpact =
            optimizedRouteResult.priceImpact?.abs() || new BigNumber(Infinity)

          // Use optimized route if it has better price impact
          if (optimizedPriceImpact.lt(initialPriceImpact)) {
            console.log(
              `✅ Using optimized route with ${optimizedPriceImpact.toFixed(4)}% price impact vs ${initialPriceImpact.toFixed(4)}%`,
            )
            routeResult = optimizedRouteResult
          } else {
            console.log('ℹ️ Initial route was already optimal')
          }
        }

        setIsFetchingRoute(false)

        if (!routeResult) {
          // If 50% doesn't work, try with 75% of collateral
          const largerCollateralForSwap = totalCollateralRaw
            .multipliedBy(0.75)
            .integerValue()
            .toString()

          routeResult = await getNeutronRouteInfo(
            params.collateralDenom,
            params.debtDenom,
            new BigNumber(largerCollateralForSwap),
            markets?.map((m) => m.asset) || [],
            chainConfig,
          )

          if (!routeResult) {
            throw new Error('Could not find swap route for debt repayment')
          }
        }

        // Check if the route will give us enough debt tokens to repay
        const routeAmountOut = new BigNumber(routeResult.amountOut || '0')
        const debtAmountNeeded = new BigNumber(debtAmountFormatted)

        // If the route doesn't give us enough, we need to adjust the collateral amount
        let finalCollateralForSwap = new BigNumber(initialCollateralForSwap)

        if (routeAmountOut.lt(debtAmountNeeded)) {
          // Calculate how much more collateral we need
          const ratio = debtAmountNeeded.dividedBy(routeAmountOut)
          finalCollateralForSwap = finalCollateralForSwap.multipliedBy(ratio.multipliedBy(1.01)) // 1% buffer

          // Fetch new route with adjusted amount
          routeResult = await getNeutronRouteInfo(
            params.collateralDenom,
            params.debtDenom,
            finalCollateralForSwap,
            markets?.map((m) => m.asset) || [],
            chainConfig,
          )

          if (!routeResult) {
            throw new Error('Could not find swap route with adjusted collateral amount')
          }
        }

        const collateralAmountForSwap = finalCollateralForSwap.integerValue().toString()

        // Calculate minimum receive amount with slippage
        const minReceive = getMinAmountOutFromRouteInfo(routeResult, 0.1).integerValue().toString()

        // Build full withdrawal actions using correct order:
        // 1. Swap exact in from collateral to debt asset
        // 2. Repay the debt
        // 3. Refund all balances (withdraw remaining collateral)
        const actions = [
          // 1. Swap exact in from collateral to debt asset
          {
            swap_exact_in: {
              coin_in: {
                denom: params.collateralDenom,
                amount: { exact: collateralAmountForSwap },
              },
              denom_out: params.debtDenom,
              min_receive: minReceive,
              route: routeResult.route,
            },
          },
          // 2. Repay all debt using the exact amount
          {
            repay: {
              coin: {
                denom: params.debtDenom,
                amount: { exact: debtAmountFormatted },
              },
            },
          },
          // 3. Refund all balances (withdraw remaining collateral and any leftover debt tokens)
          {
            refund_all_coin_balances: {},
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
        setIsFetchingRoute(false)
      }
    },
    [executeTransaction, markets],
  )

  return {
    withdrawFullStrategy,
    isProcessing,
    isFetchingRoute,
  }
}
