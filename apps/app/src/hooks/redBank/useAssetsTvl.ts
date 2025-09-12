import useSWR from 'swr'

import getAssetsTvl from '@/api/redBank/getAssetsTvl'

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
