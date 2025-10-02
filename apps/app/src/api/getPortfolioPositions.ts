import chainConfig from '@/config/chain'

/**
 * Fetches portfolio positions for a given wallet address
 * @param address - The wallet address
 * @param chain - The blockchain chain (default: 'neutron')
 * @returns Portfolio positions data including accounts, redbank deposits, and totals
 */
export default async function getPortfolioPositions(
  address: string,
  chain: string = 'neutron',
): Promise<PortfolioPositionsResponse> {
  if (!address) {
    throw new Error('Address is required')
  }

  try {
    const url = `${chainConfig.endpoints.redBank}/account_portfolio?chain=${chain}&address=${address}`

    const response = await fetch(url, {
      method: 'GET',
      // No headers needed for simple GET requests - avoids CORS preflight
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio positions: ${response.statusText}`)
    }

    const data: PortfolioPositionsResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching portfolio positions:', error)
    throw error
  }
}
