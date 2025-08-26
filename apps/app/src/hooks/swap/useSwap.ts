import { useState } from 'react'

import { useChain } from '@cosmos-kit/react'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'

import chainConfig from '@/config/chain'
import { getSwapExactInAction } from '@/utils/swap'

export function useSwap() {
  const [isExecuting, setIsExecuting] = useState(false)
  const { address, getSigningCosmWasmClient } = useChain(chainConfig.name)

  const executeSwap = async (
    routeInfo: SwapRouteInfo,
    fromToken: any,
    toToken: any,
    fromAmount: string,
    slippage: number,
  ) => {
    if (!address || !routeInfo) {
      throw new Error('Missing address or route info')
    }

    // Check if user has enough balance
    const requiredAmount = new BigNumber(fromAmount).shiftedBy(fromToken.decimals)
    const userBalance = new BigNumber(fromToken.rawBalance || 0)

    if (userBalance.lt(requiredAmount)) {
      throw new Error(
        `Insufficient balance. You have ${userBalance.shiftedBy(-fromToken.decimals).toFixed(6)} ${fromToken.symbol}, but need ${fromAmount} ${fromToken.symbol}`,
      )
    }

    setIsExecuting(true)
    const pendingToastId = toast.loading('Swapping...', { autoClose: false })

    try {
      const client = await getSigningCosmWasmClient()
      if (!client) {
        throw new Error('Failed to connect to wallet')
      }

      // Create the swap action using the helper function
      const swapAction = getSwapExactInAction(
        {
          denom: fromToken.denom,
          amount: {
            exact: requiredAmount.toString(),
          },
        },
        toToken.denom,
        routeInfo,
        slippage,
      )

      console.log('Swap action:', swapAction)

      // Determine which swapper contract to use
      let swapperContractAddress: string
      if (routeInfo.route.duality) {
        swapperContractAddress = chainConfig.contracts.dualitySwapper
      } else if (routeInfo.route.astro) {
        swapperContractAddress = chainConfig.contracts.swapper
      } else {
        throw new Error('Invalid route structure')
      }

      // Execute the swap using the contract
      const result = await client.execute(
        address,
        swapperContractAddress,
        swapAction,
        'auto',
        undefined,
        [
          {
            denom: fromToken.denom,
            amount: requiredAmount.toString(),
          },
        ],
      )

      if (result && result.transactionHash) {
        toast.update(pendingToastId, {
          render: `Swap successful! ${fromAmount} ${fromToken.symbol} → ${toToken.symbol}`,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        })
        return result
      }

      throw new Error('Swap failed - no transaction hash returned')
    } catch (error) {
      console.error('Swap execution failed:', error)
      toast.update(pendingToastId, {
        render: `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      })
      throw error
    } finally {
      setIsExecuting(false)
    }
  }

  return {
    executeSwap,
    isExecuting,
  }
}
