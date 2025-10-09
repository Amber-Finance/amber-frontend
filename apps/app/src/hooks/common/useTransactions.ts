import { useState } from 'react'

import { useBroadcast } from '@/utils/blockchain/broadcast'

export type TransactionType = 'deposit' | 'withdraw'

export function useTransactions() {
  const [isPending, setIsPending] = useState(false)
  const { executeTransaction } = useBroadcast()

  const deposit = async (params: LegacyTransactionParams) => {
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

  const withdraw = async (params: LegacyTransactionParams) => {
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
