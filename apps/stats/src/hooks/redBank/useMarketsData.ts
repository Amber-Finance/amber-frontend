import useSWR from 'swr'

import getMarketsData from '@/api/getMarketsData'

export default function useMarketsData(denom?: string, days: number = 30) {
  return useSWR(
    `chains/neutron/redBank/marketsData-${denom || 'all'}-${days}`,
    async () => {
      const response = await getMarketsData(denom, days)

      return response
    },
    {
      revalidateOnFocus: false,
    },
  )
}
