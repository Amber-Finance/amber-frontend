import useSWR from 'swr'

import getNeutronRewardsApy, { NeutronRewardsApyResponse } from '@/api/getNeutronRewardsApy'

/**
 * Hook to fetch Neutron Rewards APY data for all denoms
 * @returns SWR response with Neutron Rewards APY data
 */
export function useNeutronRewardsApy() {
  return useSWR<NeutronRewardsApyResponse | null>(
    'neutron-rewards-apy',
    () => getNeutronRewardsApy(),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    },
  )
}

/**
 * Helper function to get Neutron Rewards APY for a specific token symbol
 * @param data - The Neutron Rewards APY response data
 * @param symbol - The token symbol (e.g., 'wbtc', 'unibtc', 'maxbtc-usdc')
 * @returns The APY as a number, or null if not found
 */
export function getNeutronApyForSymbol(
  data: NeutronRewardsApyResponse | null | undefined,
  symbol: string,
): number | null {
  if (!data || !data.ntrnRewardsDataAmber) {
    return null
  }

  // Normalize symbol to lowercase for comparison
  const normalizedSymbol = symbol.toLowerCase()

  // Find matching denom
  const match = data.ntrnRewardsDataAmber.find((item) => item.denom === normalizedSymbol)

  if (!match) {
    return null
  }

  const apy = parseFloat(match.apy)
  return !isNaN(apy) ? apy : null
}
