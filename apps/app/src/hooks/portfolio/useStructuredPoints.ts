import useSWR from 'swr'

import getStructuredPoints, { StructuredPointsResponse } from '@/api/getStructuredPoints'

/**
 * Hook to fetch Structured Points data for a wallet address
 * @param address - The wallet address to query
 * @returns SWR response with Structured Points data
 */
export function useStructuredPoints(address: string | undefined) {
  return useSWR<StructuredPointsResponse | null>(
    address ? ['structured-points', address] : null,
    () => (address ? getStructuredPoints(address) : null),
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    },
  )
}
