import { useChain } from '@cosmos-kit/react'
import useSWR from 'swr'

import chainConfig from '@/config/chain'
import { getUrl } from '@/utils/format'

interface UserDepositResponse {
  data: {
    amount: string
  }
}

async function fetchUserDeposit(address: string, denom: string): Promise<string> {
  if (!address || !denom) return '0'

  try {
    const query = btoa(
      JSON.stringify({
        user_collateral: {
          user: address,
          denom,
        },
      }),
    )

    const url = getUrl(
      chainConfig.endpoints.restUrl,
      `/cosmwasm/wasm/v1/contract/${chainConfig.contracts.redBank}/smart/${query}`,
    )

    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Failed to fetch user deposit: ${response.status} ${response.statusText}`)
      return '0'
    }

    const data: UserDepositResponse = await response.json()
    return data.data.amount || '0'
  } catch (error) {
    console.error('Error fetching user deposit:', error)
    return '0'
  }
}

export function useUserDeposit(denom: string | undefined) {
  const { address } = useChain(chainConfig.name)

  // Only create a key when we have both address and denom
  const swrKey = address && denom ? `${address}/deposit/${denom}` : null

  const {
    data: amount,
    error,
    isLoading,
  } = useSWR(swrKey, () => fetchUserDeposit(address!, denom!), {
    fallbackData: '0',
    revalidateOnMount: true,
    revalidateOnFocus: true,
  })

  return {
    amount: amount || '0',
    error,
    isLoading: address ? isLoading : false,
  }
}
