import { useState } from 'react'

import { useChain } from '@cosmos-kit/react'
import BigNumber from 'bignumber.js'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

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
      toast.error(
        `Insufficient balance. You have ${userBalance.shiftedBy(-fromToken.decimals).toFixed(6)} ${fromToken.symbol}, but need ${fromAmount} ${fromToken.symbol}`,
        { autoClose: 5000 },
      )
      return
    }

    setIsExecuting(true)
    const pendingToastId = toast.loading('Swapping...', { autoClose: false })

    try {
      const client = await getSigningCosmWasmClient()
      if (!client) {
        toast.error('Failed to connect to wallet', { autoClose: 5000 })
        return
      }

      // Create the swap action using the helper function
      const swapAction = getSwapExactInAction(
        {
          denom: fromToken.denom,
          amount: requiredAmount.toString(),
        },
        toToken.denom,
        routeInfo,
        slippage,
      )

      // Determine which swapper contract to use
      let swapperContractAddress: string
      if (routeInfo.route.duality) {
        swapperContractAddress = chainConfig.contracts.dualitySwapper
      } else if (routeInfo.route.astro) {
        swapperContractAddress = chainConfig.contracts.swapper
      } else {
        console.error('Invalid route structure')
        return
      }

      // Execute the swap
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

        if (address) {
          await mutate(`${address}/balances`)
        }

        return result
      }

      console.error('Swap failed - no transaction hash returned')
      return
    } catch (error) {
      console.error('Swap execution failed:', error)
      toast.update(pendingToastId, {
        render: `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      })
      return
    } finally {
      setIsExecuting(false)
    }
  }

  return {
    executeSwap,
    isExecuting,
  }
}
