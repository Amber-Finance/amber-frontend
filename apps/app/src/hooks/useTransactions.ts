import { useState } from 'react'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { toast } from 'react-toastify'
import { mutate } from 'swr'

import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'
import { track } from '@/utils/analytics'
import { updatePositions } from '@/utils/healthComputer'

export type TransactionType = 'deposit' | 'withdraw'

interface TransactionParams {
  amount: string
  denom: string
  symbol: string
  decimals: number
}

export function useTransactions() {
  const { getSigningCosmWasmClient, address } = useChain(chainConfig.name)
  const { markets } = useStore()
  const [isPending, setIsPending] = useState(false)

  const executeTransaction = async (type: TransactionType, params: TransactionParams) => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    setIsPending(true)

    const formattedAmount = new BigNumber(params.amount)
      .shiftedBy(params.decimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    const pendingToastId = toast.loading(`Transaction pending...`, {
      autoClose: false,
    })

    try {
      const client = await getSigningCosmWasmClient()
      if (!client) {
        toast.update(pendingToastId, {
          render: 'Failed to connect to wallet',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        })
        return
      }

      const msg =
        type === 'deposit'
          ? { deposit: {} }
          : {
              withdraw: {
                amount: formattedAmount,
                denom: params.denom,
              },
            }

      let funds: { amount: string; denom: string }[] = []
      if (type === 'deposit') {
        funds = [{ amount: formattedAmount, denom: params.denom }]
      }

      await client.execute(
        address,
        chainConfig.constracts.moneyMarketContract,
        msg,
        'auto',
        undefined,
        funds,
      )

      if (markets) {
        const actionType = type === 'deposit' ? 'supply' : 'withdraw'
        updatePositions(markets, actionType, {
          amount: formattedAmount,
          denom: params.denom,
        })
      }

      toast.update(pendingToastId, {
        render: `Successfully ${type === 'deposit' ? 'deposited' : 'withdrew'} ${params.amount} ${params.symbol}`,
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      })

      await mutate('metricsRefresh')
      await mutate(`${address}/positions`)
      await mutate(`${address}/balances`)
      await mutate(`${address}/deposit/${params.denom}`)

      track(`${type} ${params.amount} ${params.symbol}`)
      setIsPending(false)
    } catch (error) {
      console.error('Transaction error:', error)

      track(`${type} ${params.amount} ${params.symbol} Failed`)

      toast.update(pendingToastId, {
        render: `Transaction failed: ${(error as Error).message || 'Unknown error'}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      })
      setIsPending(false)
    }
  }

  const deposit = async (params: TransactionParams) => {
    return executeTransaction('deposit', params)
  }

  const withdraw = async (params: TransactionParams) => {
    return executeTransaction('withdraw', params)
  }

  return {
    deposit,
    withdraw,
    isPending,
  }
}
