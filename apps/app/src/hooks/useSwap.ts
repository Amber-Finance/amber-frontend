import { useCallback } from 'react'

import { useChain } from '@cosmos-kit/react'
import { executeRoute, route } from '@skip-go/client'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

import chainConfig from '@/config/chain'

export function useSwap() {
  const { getSigningCosmWasmClient, address } = useChain(chainConfig.name)

  const getCosmosSigner = useCallback(
    async (chainId: string) => {
      if (chainId !== chainConfig.id) {
        throw new Error(`Unsupported chain: ${chainId}`)
      }

      const client = await getSigningCosmWasmClient()
      if (!client) {
        throw new Error('Failed to get signing client')
      }

      const signer = (client as any).signer || client
      return signer
    },
    [getSigningCosmWasmClient],
  )

  const fetchSwapRoute = useCallback(
    async (
      fromToken: SwapToken,
      toToken: SwapToken,
      amount: string,
    ): Promise<SwapRouteInfo | null> => {
      try {
        const amountIn = new BigNumber(amount).shiftedBy(fromToken.decimals).toFixed(0)

        const routeResult = await route({
          amountIn,
          sourceAssetDenom: fromToken.denom,
          sourceAssetChainId: chainConfig.id,
          destAssetDenom: toToken.denom,
          destAssetChainId: chainConfig.id,
          experimentalFeatures: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
          allowUnsafe: true,
          goFast: true,
          cumulativeAffiliateFeeBps: '0',
        })

        if (!routeResult) {
          return null
        }

        // --- Use API USD values for price impact ---
        let priceImpact = 0
        if (routeResult.usdAmountIn && routeResult.usdAmountOut) {
          const usdAmountIn = new BigNumber(routeResult.usdAmountIn)
          const usdAmountOut = new BigNumber(routeResult.usdAmountOut)
          if (usdAmountIn.gt(0)) {
            priceImpact = usdAmountOut.dividedBy(usdAmountIn).minus(1).multipliedBy(100).toNumber()
          }
        }

        console.log(toToken.decimals, 'toToken.decimals')

        return {
          amountOut: new BigNumber(routeResult.estimatedAmountOut)
            .shiftedBy(-toToken.decimals)
            .toString(),
          priceImpact,
          route: routeResult,
        }
      } catch (error) {
        console.error('Error fetching swap route:', error)
        return null
      }
    },
    [],
  )

  const executeSwap = async (
    routeResult: SwapRouteInfo,
    fromToken: any,
    toToken: any,
    amount: string,
    slippage?: number,
  ) => {
    if (!routeResult || !address) return

    const pendingToastId = toast.loading('Swapping...', { autoClose: false })

    try {
      const userAddresses = routeResult.route.requiredChainAddresses.map((chainId: string) => ({
        chainId,
        address,
      }))

      await executeRoute({
        route: routeResult.route,
        userAddresses,
        getCosmosSigner,
        slippageTolerancePercent: slippage?.toString() ?? '0.5',
      })

      toast.update(pendingToastId, {
        render: `Swap successful! ${amount} ${fromToken.symbol} → ${toToken.symbol}`,
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      })

      if (address) {
        await mutate(`${address}/balances`)
      }

      return true
    } catch (error) {
      toast.update(pendingToastId, {
        render: `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      })
      return false
    }
  }

  return {
    getCosmosSigner,
    fetchSwapRoute,
    executeSwap,
  }
}
