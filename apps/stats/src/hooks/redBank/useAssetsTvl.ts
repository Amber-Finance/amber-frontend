import useSWR from 'swr'

import getAssetsTvl from '@/api/getAssetsTvl'

export default function useAssetsTvl() {
  return useSWR(
    `chains/neutron/redBank/assetsTvl`,
    async () => {
      const response = await getAssetsTvl()

      return response
    },
    {
      revalidateOnFocus: false,
    },
  )
}
