import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/common/fetch'

export interface NeutronRewardsApyData {
  denom: string
  apy: string
}

export interface NeutronRewardsApyResponse {
  ntrnRewardsDataAmber: NeutronRewardsApyData[]
}

/**
 * Fetches Neutron Rewards APY data for all supported denoms
 * @returns Neutron Rewards APY data for each denom
 */
export default async function getNeutronRewardsApy(): Promise<NeutronRewardsApyResponse | null> {
  try {
    const url = 'https://api.amberfi.io/api/ntrn-rewards-amber'

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      console.warn(
        `Failed to fetch Neutron Rewards APY: ${response.status} ${response.statusText}`,
      )
      return null
    }

    const data: NeutronRewardsApyResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Neutron Rewards APY:', error)
    return null
  }
}

