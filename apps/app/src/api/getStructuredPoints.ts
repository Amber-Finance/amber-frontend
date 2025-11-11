import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/common/fetch'

export interface StructuredPointsResponse {
  balance: string
}

interface CW20BalanceQueryResponse {
  data: {
    balance: string
  }
}

/**
 * Fetches Structured Points balance from CW20 contract for a given wallet address
 * @param address - The wallet address to query
 * @returns Structured Points balance as a string
 */
export default async function getStructuredPoints(
  address: string,
): Promise<StructuredPointsResponse | null> {
  if (!address) {
    return null
  }

  try {
    // Create the query message
    const queryMsg = {
      balance: {
        address: address,
      },
    }

    // Encode query message to base64 (browser-compatible)
    const queryBase64 = btoa(JSON.stringify(queryMsg))

    // Build the REST endpoint URL
    const url = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.structuredPoints}/smart/${queryBase64}`

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      console.warn(`Failed to fetch structured points: ${response.status} ${response.statusText}`)
      return null
    }

    const data: CW20BalanceQueryResponse = await response.json()

    // Return the balance from the contract query
    return {
      balance: data.data.balance,
    }
  } catch (error) {
    console.error('Error fetching structured points:', error)
    return null
  }
}
