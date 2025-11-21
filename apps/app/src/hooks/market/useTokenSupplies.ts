'use client'

import useSWR from 'swr'

import chainConfig from '@/config/chain'

/**
 * Hook to fetch total token supplies from Neutron bank balances API.
 * This endpoint returns the combined balances of all tokens (RedBank + Credit Accounts)
 * held by the credit manager contract.
 */
export const useTokenSupplies = () => {
  // Fetcher for Neutron bank balances
  const fetcher = async (url: string): Promise<TokenSupplies> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching token supplies: ${response.statusText}`)
    }
    const data: NeutronBankBalancesResponse = await response.json()

    // Convert to a simple denom -> amount mapping
    const supplies: TokenSupplies = {}
    data.balances.forEach((balance) => {
      supplies[balance.denom] = balance.amount
    })

    return supplies
  }

  // Construct the URL for Neutron bank balances endpoint
  const url = `${chainConfig.endpoints.restUrl}/cosmos/bank/v1beta1/balances/${chainConfig.contracts.creditManager}`

  const {
    data: tokenSupplies,
    error,
    isLoading,
    mutate,
  } = useSWR<TokenSupplies>('tokenSupplies', () => fetcher(url), {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    fallbackData: {},
  })

  return {
    tokenSupplies: tokenSupplies || {},
    error,
    isLoading,
    mutate,
  }
}
