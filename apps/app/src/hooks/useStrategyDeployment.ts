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
          routeInfo: params.swapRouteInfo,
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
        const skipRouteParams = {
          amount_in: formattedBorrowAmount,
          source_asset_chain_id: chainConfig.id,
          source_asset_denom: strategy.debtAsset.denom,
          dest_asset_chain_id: chainConfig.id,
          dest_asset_denom: strategy.collateralAsset.denom,
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
        }

        const skipRouteResponse = await route(skipRouteParams as any)

        if (!skipRouteResponse?.operations || skipRouteResponse?.operations?.length === 0) {
          throw new Error(
            `No swap route found between ${strategy.debtAsset.symbol} and ${strategy.collateralAsset.symbol}`,
          )
        }

        // Extract swap operations from Skip response
        const extractSwapOperations = (skipResponse: any): any[] => {
          const firstOperation = skipResponse.operations?.[0]?.swap?.swapIn?.swapOperations
          return firstOperation || []
        }

        // Create duality route from swap operations
        const createDualityRoute = (
          denomIn: string,
          denomOut: string,
          swapOperations: any[],
        ): any => {
          const swapDenoms: string[] = [denomIn]

          swapOperations.forEach((op: any) => {
            if (op.denomOut && !swapDenoms.includes(op.denomOut)) {
              swapDenoms.push(op.denomOut)
            }
          })

          // Ensure denomOut is included if not already present
          if (!swapDenoms.includes(denomOut)) {
            swapDenoms.push(denomOut)
          }

          return {
            duality: {
              from: denomIn,
              swap_denoms: swapDenoms,
              to: denomOut,
            },
          }
        }

        const swapOperations = extractSwapOperations(skipRouteResponse)
        const marsRoute = createDualityRoute(
          strategy.debtAsset.denom,
          strategy.collateralAsset.denom,
          swapOperations,
        )

        console.log('Skip route response:', skipRouteResponse)
        console.log('Extracted swap operations:', swapOperations)
        console.log('Mars route format:', marsRoute)

        // Create SwapRouteInfo object
        const routeInfo: SwapRouteInfo = {
          amountOut: new BigNumber(skipRouteResponse.amountOut || '0'),
          priceImpact: new BigNumber(skipRouteResponse.swapPriceImpactPercent || '0'),
          fee: new BigNumber('0'),
          description: `${strategy.debtAsset.symbol} → ${strategy.collateralAsset.symbol}`,
          route: marsRoute,
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
