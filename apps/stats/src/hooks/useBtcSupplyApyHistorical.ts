import useSWR from 'swr'

import getBtcAssetSupplyApyHistorical from '@/api/getBtcSupplyApyHistorical'

export default function useBtcSupplyApyHistorical(asset: string, days: number = 7) {
  return useSWR(
    `chains/neutron/btcSupplyApyHistorical?asset=${asset}&days=${days}`,
    async () => {
      const response = await getBtcAssetSupplyApyHistorical(asset, days)

      return response
    },
    {
      revalidateOnFocus: false,
    },
  )
}
