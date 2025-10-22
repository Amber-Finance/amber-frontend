import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/common/fetch'
import { getUrl } from '@/utils/ui/url'

/**
 * Fetches portfolio positions for a given wallet address
 * @param address - The wallet address
 * @param chain - The blockchain chain (default: 'neutron')
 * @returns Portfolio positions data including accounts, redbank deposits, and totals
 */
export default async function getPortfolioPositions(
  address: string,
  chain: string = 'neutron',
): Promise<PortfolioPositionsResponse | null> {
  if (!address) {
    console.warn('Address is required for portfolio positions')
    return null
  }

  try {
    const url = getUrl(
      chainConfig.endpoints.redBank,
      `/account_portfolio?chain=${chain}&address=${address}`,
    )

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      console.warn(`Failed to fetch portfolio positions: ${response.status} ${response.statusText}`)
      return null
    }

    const data: PortfolioPositionsResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching portfolio positions:', error)
    return null
  }
}
