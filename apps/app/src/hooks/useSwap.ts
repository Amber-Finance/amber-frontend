import { useCallback, useState } from 'react'

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChain } from '@cosmos-kit/react'
import { route as skipRoute } from '@skip-go/client'
import BigNumber from 'bignumber.js'

import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'
import { getSwapExactInAction } from '@/utils/swap'

const DEFAULT_GAS_LIMIT = '1000000'
const DEFAULT_GAS_AMOUNT = '1500'
const DEFAULT_GAS_DENOM = 'untrn'

interface SkipRouteResponse {
  amountOut: string
  usdAmountIn?: string
  usdAmountOut?: string
  operations?: Array<{
    swap?: {
      swapIn?: {
        swapOperations?: Array<{
          denomOut?: string
        }>
      }
    }
  }>
}

export interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance?: string
  price?: number
  denom: string
  usdValue?: string
}

export interface SwapRouteInfo {
  amountOut: BigNumber
  priceImpact: BigNumber
  route: {
    duality: {
      from: string
      swap_denoms: string[]
      to: string
    }
  }
}

export function useSwap() {
  const { address, getOfflineSigner } = useChain(chainConfig.name)
  const { markets } = useStore()
  const [isSwapInProgress, setIsSwapInProgress] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)

  const getTokenDecimals = useCallback(
    (denom: string): number => {
      if (!markets) return 6 // fallback
      const market = markets.find((m) => m.asset.denom === denom)
      return market?.asset?.decimals || 6
    },
    [markets],
  )

  const clearError = useCallback(() => {
    setSwapError(null)
  }, [])

  const fetchSwapRoute = useCallback(
    async (
      fromToken: SwapToken,
      toToken: SwapToken,
      amount: string,
    ): Promise<SwapRouteInfo | null> => {
      try {
        const response = (await skipRoute({
          sourceAssetDenom: fromToken.denom,
          sourceAssetChainId: chainConfig.id,
          destAssetDenom: toToken.denom,
          destAssetChainId: chainConfig.id,
          amountIn: new BigNumber(amount).shiftedBy(getTokenDecimals(fromToken.denom)).toString(),
          allowUnsafe: true,
          swapVenues: [{ name: 'neutron-duality', chainId: chainConfig.id }],
        })) as SkipRouteResponse

        if (!response) return null

        const amountOut = new BigNumber(response.amountOut)

        let priceImpact = new BigNumber(0)
        if (response.usdAmountIn && response.usdAmountOut) {
          const usdAmountIn = new BigNumber(response.usdAmountIn)
          const usdAmountOut = new BigNumber(response.usdAmountOut)
          if (usdAmountIn.gt(0)) {
            priceImpact = usdAmountOut.minus(usdAmountIn).dividedBy(usdAmountIn).multipliedBy(100)
          }
        }

        const firstOperation = response.operations?.[0]
        const swapOperations = firstOperation?.swap?.swapIn?.swapOperations || []
        const swapDenoms: string[] = [fromToken.denom]

        swapOperations.forEach((op) => {
          if (op.denomOut && !swapDenoms.includes(op.denomOut)) {
            swapDenoms.push(op.denomOut)
          }
        })

        if (!swapDenoms.includes(toToken.denom)) {
          swapDenoms.push(toToken.denom)
        }

        const dualityRoute = {
          duality: {
            from: fromToken.denom,
            swap_denoms: swapDenoms,
            to: toToken.denom,
          },
        }

        return {
          amountOut,
          priceImpact,
          route: dualityRoute,
        }
      } catch (error) {
        console.error('Duality route fetch failed:', error)
        return null
      }
    },
    [getTokenDecimals],
  )

  const executeSwap = useCallback(
    async (
      fromToken: SwapToken,
      toToken: SwapToken,
      amount: string,
      slippage: number,
    ): Promise<boolean> => {
      if (!address || !getOfflineSigner) {
        setSwapError('Wallet not connected')
        return false
      }

      setIsSwapInProgress(true)
      setSwapError(null)

      try {
        const routeInfo = await fetchSwapRoute(fromToken, toToken, amount)
        if (!routeInfo) {
          setSwapError('No Duality route available for this swap')
          return false
        }

        const swapAction = getSwapExactInAction(
          {
            denom: fromToken.denom,
            amount: {
              exact: new BigNumber(amount).shiftedBy(getTokenDecimals(fromToken.denom)).toString(),
            },
          },
          toToken.denom,
          routeInfo,
          slippage,
        )

        const offlineSigner = await getOfflineSigner()
        const client = await SigningCosmWasmClient.connectWithSigner(
          chainConfig.endpoints.rpcUrl,
          offlineSigner,
        )

        const creditManagerAddress = chainConfig.contracts.creditManager
        if (!creditManagerAddress) {
          setSwapError('Credit Manager address not configured')
          return false
        }

        await client.execute(
          address,
          creditManagerAddress,
          {
            update_credit_account: {
              actions: [swapAction],
            },
          },
          {
            gas: DEFAULT_GAS_LIMIT,
            amount: [{ denom: DEFAULT_GAS_DENOM, amount: DEFAULT_GAS_AMOUNT }],
          },
          'Swap via Duality Router',
        )

        return true
      } catch (error) {
        console.error('Transaction failed:', error)
        setSwapError(error instanceof Error ? error.message : 'Transaction failed')
        return false
      } finally {
        setIsSwapInProgress(false)
      }
    },
    [address, getOfflineSigner, fetchSwapRoute, getTokenDecimals],
  )

  return {
    fetchSwapRoute,
    executeSwap,
    isSwapInProgress,
    swapError,
    clearError,
  }
}
