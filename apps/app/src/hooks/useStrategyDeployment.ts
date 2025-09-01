import { useCallback } from 'react'

import chainConfig from '@/config/chain'

interface StrategyDeploymentParams {
  collateralAmount: number
  multiplier: number
  swapRoute: any
}

interface UseStrategyDeploymentProps {
  strategy: Strategy
  executeTransaction: any
  isModifying: boolean
  modifyingAccountId: string | null
}

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
        type: 'deploy_strategy',
        strategyType: isModifying ? 'increase' : 'create',
        accountId: isModifying && modifyingAccountId ? modifyingAccountId : undefined,
        collateral: {
          amount: params.collateralAmount,
          denom: strategy.collateralAsset.denom,
          decimals: strategy.collateralAsset.decimals || 6,
        },
        debt: {
          amount: borrowAmount,
          denom: strategy.debtAsset.denom,
          decimals: strategy.debtAsset.decimals || 6,
        },
        swap: {
          route: params.swapRoute,
          slippage: '0.5',
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
      const { route } = await import('@skip-go/client')
      const { BigNumber } = await import('bignumber.js')

      const formattedBorrowAmount = new BigNumber(borrowAmount)
        .shiftedBy(strategy.debtAsset.decimals || 6)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()

      try {
        const routeResult = await route({
          amount_in: formattedBorrowAmount,
          source_asset_denom: strategy.debtAsset.denom,
          source_asset_chain_id: chainConfig.id,
          dest_asset_denom: strategy.collateralAsset.denom,
          dest_asset_chain_id: chainConfig.id,
          smart_relay: true,
          experimental_features: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
          allow_multi_tx: true,
          allow_unsafe: true,
          smart_swap_options: {
            split_routes: true,
            evm_swaps: true,
          },
          go_fast: false,
          cumulative_affiliate_fee_bps: '0',
        } as any)

        if (!routeResult || !routeResult.operations || routeResult.operations.length === 0) {
          throw new Error(
            `No swap route found between ${strategy.debtAsset.symbol} and ${strategy.collateralAsset.symbol}`,
          )
        }

        return routeResult
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
