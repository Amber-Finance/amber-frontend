'use client'

import chainConfig from '@/config/chain'

import { BigNumber } from 'bignumber.js'

import useSWR from 'swr'

/**
 * Hook to fetch total deposits from all credit accounts aggregated by denom.
 * This is needed to get the complete picture of total deposits including
 * assets held in credit accounts (like maxBTC).
 */
export const useCreditAccountDeposits = () => {
  // Fetcher for all coin balances from credit manager
  const fetcher = async (url: string): Promise<CreditAccountDeposits> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching credit account deposits: ${response.statusText}`)
    }
    const data: AllCoinBalancesResponse = await response.json()

    // Aggregate balances by denom across all credit accounts
    const aggregatedDeposits: CreditAccountDeposits = {}

    // Iterate through all balance records
    data.data.forEach((balance) => {
      if (aggregatedDeposits[balance.denom]) {
        // Add to existing total for this denom
        aggregatedDeposits[balance.denom] = new BigNumber(aggregatedDeposits[balance.denom])
          .plus(balance.amount)
          .toString()
      } else {
        // First occurrence of this denom
        aggregatedDeposits[balance.denom] = balance.amount
      }
    })

    return aggregatedDeposits
  }

  // Construct the URL for fetching all coin balances
  const url = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.creditManager}/smart/${chainConfig.queries.allCoinBalances}`

  const {
    data: creditAccountDeposits,
    error,
    isLoading,
    mutate,
  } = useSWR<CreditAccountDeposits>('creditAccountDeposits', () => fetcher(url), {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    fallbackData: {},
  })

  return {
    creditAccountDeposits: creditAccountDeposits || {},
    error,
    isLoading,
    mutate,
  }
}

