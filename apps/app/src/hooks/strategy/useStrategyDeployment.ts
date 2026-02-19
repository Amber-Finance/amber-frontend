import { useCallback } from 'react'

import chainConfig from '@/config/chain'

export const useStrategyDeployment = ({
  strategy,
  executeTransaction,
  isModifying,
  modifyingAccountId,
}: UseStrategyDeploymentProps) => {
  const deployStrategy = useCallback(
    async (params: StrategyDeploymentParams) => {
      const borrowAmount = params.collateralAmount * (params.multiplier - 1)

      // Create config for broadcast's executeTransaction
      const config: DeployStrategyConfig = {
        type: 'strategy',
        strategyType: isModifying ? 'increase' : 'create',
        accountId: isModifying && modifyingAccountId ? modifyingAccountId : undefined,
        collateral: {
          amount: params.collateralAmount,
          denom: strategy.collateralAsset.denom,
          decimals: strategy.collateralAsset.decimals || 8,
        },
        debt: {
          amount: borrowAmount,
          denom: strategy.debtAsset.denom,
          decimals: strategy.debtAsset.decimals || 6,
        },
        swap: {
          routeInfo: params.swapRouteInfo,
          slippage: params.slippage?.toString() || '0.5',
          destDenom: strategy.collateralAsset.denom,
        },
        multiplier: params.multiplier,
        strategy,
      }

      const actionType = isModifying ? 'Modifying' : 'Deploying'
      const successType = isModifying ? 'modified' : 'deployed'
      // Use broadcast's executeTransaction with proper toast messages
      return await executeTransaction(config, {
        pending: `${actionType} ${strategy.collateralAsset.symbol}/${strategy.debtAsset.symbol} strategy...`,
        success: `Strategy ${successType} successfully at ${params.multiplier.toFixed(2)}x leverage!`,
        error: `Strategy ${isModifying ? 'modification' : 'deployment'} failed`,
      })
    },
    [strategy, executeTransaction, isModifying, modifyingAccountId],
  )

  const fetchSwapRoute = useCallback(
    async (borrowAmount: number) => {
      const { BigNumber } = await import('bignumber.js')
      const getNeutronRouteInfo = (await import('@/api/swap/getNeutronRouteInfo')).default

      const formattedBorrowAmount = new BigNumber(borrowAmount).shiftedBy(
        strategy.debtAsset.decimals || 6,
      )

      try {
        // Fetch initial route
        let routeInfo = await getNeutronRouteInfo(
          strategy.debtAsset.denom,
          strategy.collateralAsset.denom,
          formattedBorrowAmount,
          [], // assets array - not needed for route structure
          chainConfig,
        )

        if (!routeInfo) {
          throw new Error(
            `No swap route found between ${strategy.debtAsset.symbol} and ${strategy.collateralAsset.symbol}`,
          )
        }

        // Wait 1.5 seconds and fetch again to get optimized route
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const optimizedRouteInfo = await getNeutronRouteInfo(
          strategy.debtAsset.denom,
          strategy.collateralAsset.denom,
          formattedBorrowAmount,
          [], // assets array - not needed for route structure
          chainConfig,
        )

        // Use optimized route if it has better price impact
        if (optimizedRouteInfo) {
          const initialPriceImpact = routeInfo.priceImpact?.abs() || new BigNumber(Infinity)
          const optimizedPriceImpact =
            optimizedRouteInfo.priceImpact?.abs() || new BigNumber(Infinity)

          if (optimizedPriceImpact.lt(initialPriceImpact)) {
            console.log(
              `✅ Using optimized route for deployment: ${optimizedPriceImpact.toFixed(4)}% vs ${initialPriceImpact.toFixed(4)}%`,
            )
            routeInfo = optimizedRouteInfo
          } else {
            console.log('ℹ️ Initial route was already optimal for deployment')
          }
        }

        return routeInfo
      } catch (error) {
        console.error('Route fetching failed:', error)
        throw new Error(
          `Failed to fetch swap route: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    },
    [strategy],
  )

  return { deployStrategy, fetchSwapRoute }
}
