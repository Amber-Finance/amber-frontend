import useSWR from 'swr'

import getFragments, { FragmentsResponse } from '@/api/getFragments'

/**
 * Hook to fetch Mars Fragments data for a wallet address
 * @param address - The wallet address to query
 * @param days - Optional: number of days for historical data
 * @returns SWR response with Mars Fragments data
 */
export function useFragments(address: string | undefined, days?: number) {
  return useSWR<FragmentsResponse | null>(
    address ? ['fragments', address, days] : null,
    () => (address ? getFragments(address, days) : null),
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    },
  )
}

