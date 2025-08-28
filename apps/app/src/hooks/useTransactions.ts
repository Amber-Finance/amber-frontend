import { useState } from 'react'

import { type DepositParams, type WithdrawParams, useBroadcast } from '@/utils/broadcast'

export type TransactionType = 'deposit' | 'withdraw'

// Legacy interface for backward compatibility
interface TransactionParams {
  amount: string
  denom: string
  symbol: string
  decimals: number
}

export function useTransactions() {
  const [isPending, setIsPending] = useState(false)
  const { executeTransaction } = useBroadcast()

  const deposit = async (params: TransactionParams) => {
    setIsPending(true)
    try {
      const depositParams: DepositParams = {
        type: 'deposit',
        amount: params.amount,
        denom: params.denom,
        decimals: params.decimals,
        symbol: params.symbol,
      }

      const result = await executeTransaction(depositParams)
      return result
    } finally {
      setIsPending(false)
    }
  }

  const withdraw = async (params: TransactionParams) => {
    setIsPending(true)
    try {
      const withdrawParams: WithdrawParams = {
        type: 'withdraw',
        amount: params.amount,
        denom: params.denom,
        decimals: params.decimals,
        symbol: params.symbol,
      }

      const result = await executeTransaction(withdrawParams)
      return result
    } finally {
      setIsPending(false)
    }
  }

  return {
    deposit,
    withdraw,
    isPending,
  }
}
