import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/common/fetch'

export interface FragmentsResponse {
  campaign: {
    name: string
    chain: string
    start_block: number
    end_block: number
  }
  wallet: string
  total_fragments: {
    total_accumulated: string
    redbank_deposit: string
    credit_manager_deposit: string
  }
  total_notionals: {
    total_accumulated: string
    redbank_deposit: string
    credit_manager_deposit: string
  }
  historical: Array<any>
}

/**
 * Fetches Mars Fragments balance from the Amber backend API
 * @param address - The wallet address to query
 * @param days - Optional: number of days for historical data
 * @returns Mars Fragments balance
 */
export default async function getFragments(
  address: string,
  days?: number,
): Promise<FragmentsResponse | null> {
  if (!address) {
    return null
  }

  try {
    // Build the URL with optional days parameter
    const params = new URLSearchParams({
      chain: 'neutron',
      wallet: address,
    })

    if (days) {
      params.append('days', days.toString())
    }

    const url = `${chainConfig.endpoints.amberBackend}/fragments/by_wallet?${params.toString()}`

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      console.warn(`Failed to fetch fragments: ${response.status} ${response.statusText}`)
      return null
    }

    const data: FragmentsResponse = await response.json()

    return data
  } catch (error) {
    console.error('Error fetching fragments:', error)
    return null
  }
}

