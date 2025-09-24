import useSWR from 'swr'

import getBtcApy from '@/api/getBtcApy'

export default function useBtcApy(asset: string, days: number = 7) {
  return useSWR(
    `chains/neutron/btcApy?asset=${asset}&days=${days}`,
    async () => {
      const response = await getBtcApy(asset, days)

      console.log('response:', response)
      return response
    },
    {
      revalidateOnFocus: false,
    },
  )
}
