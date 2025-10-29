import useSWR from 'swr'

import getMaxBtcHistoricalApy from '@/api/getMaxBtcHistoricalApy'

export default function useMaxBtcHistoricalApy(days: number = 7) {
  return useSWR(
    `chains/neutron/btcApy?asset=maxbtc&days=${days}`,
    async () => {
      const response = await getMaxBtcHistoricalApy(days)

      return response
    },
    {
      revalidateOnFocus: false,
    },
  )
}
