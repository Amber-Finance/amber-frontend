import { useCallback, useState } from 'react'

import { useChain } from '@cosmos-kit/react'
import { executeRoute, route } from '@skip-go/client'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

import chainConfig from '@/config/chain'

export function useSwap() {
  const [isSwapInProgress, setIsSwapInProgress] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const { address, getSigningCosmWasmClient } = useChain(chainConfig.name)

  const clearError = useCallback(() => {
    setSwapError(null)
  }, [])

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

  const getUserAddresses = useCallback(
    async (requiredChainAddresses: string[]) => {
      if (!address) {
        throw new Error('Wallet not connected')
      }

      return requiredChainAddresses.map((chainId) => ({
        chainId,
        address,
      }))
    },
    [address],
  )

  const fetchSwapRoute = useCallback(
    async (
      fromToken: SwapToken,
      toToken: SwapToken,
      amount: string,
    ): Promise<SwapRouteInfo | null> => {
      try {
        const amountInSmallestUnit = new BigNumber(amount).shiftedBy(fromToken.decimals).toString()

        const routeResponse = await route({
          amountIn: amountInSmallestUnit,
          sourceAssetDenom: fromToken.denom,
          sourceAssetChainId: chainConfig.id,
          destAssetDenom: toToken.denom,
          destAssetChainId: chainConfig.id,
          cumulativeAffiliateFeeBps: '0',
          goFast: true,
        })

        if (!routeResponse) {
          setSwapError('No route available')
          return null
        }

        const amountOut = new BigNumber(routeResponse.estimatedAmountOut)
        let priceImpact = 0
        if (routeResponse.usdAmountIn && routeResponse.usdAmountOut) {
          const usdAmountIn = new BigNumber(routeResponse.usdAmountIn)
          const usdAmountOut = new BigNumber(routeResponse.usdAmountOut)
          if (usdAmountIn.gt(0)) {
            priceImpact = usdAmountOut
              .minus(usdAmountIn)
              .dividedBy(usdAmountIn)
              .multipliedBy(100)
              .toNumber()
          }
        }

        return {
          amountOut,
          priceImpact,
          route: routeResponse,
        }
      } catch (error) {
        console.error('Route fetch failed:', error)
        setSwapError('Failed to fetch route')
        return null
      }
    },
    [],
  )

  const executeSwap = useCallback(
    async (
      fromToken: SwapToken,
      toToken: SwapToken,
      amount: string,
      slippage: number,
    ): Promise<boolean> => {
      if (!address) {
        setSwapError('Wallet not connected')
        return false
      }

      setIsSwapInProgress(true)
      setSwapError(null)

      const pendingToastId = toast.loading(
        `Swapping ${amount} ${fromToken.symbol} for ${toToken.symbol}...`,
        {
          autoClose: false,
        },
      )

      try {
        const routeInfo = await fetchSwapRoute(fromToken, toToken, amount)
        if (!routeInfo) {
          toast.update(pendingToastId, {
            render: 'Failed to find swap route',
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          })
          return false
        }

        const userAddresses = await getUserAddresses(routeInfo.route.requiredChainAddresses)

        await executeRoute({
          route: routeInfo.route,
          userAddresses,
          getCosmosSigner,
          slippageTolerancePercent: slippage.toString(),
        })

        // If we reach here without error, the swap was successful
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
        console.error('Swap execution failed:', error)
        setSwapError('Swap execution failed')

        toast.update(pendingToastId, {
          render: `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        })

        return false
      } finally {
        setIsSwapInProgress(false)
      }
    },
    [address, fetchSwapRoute, getUserAddresses, getCosmosSigner],
  )

  return {
    fetchSwapRoute,
    executeSwap,
    isSwapInProgress,
    swapError,
    clearError,
  }
}
