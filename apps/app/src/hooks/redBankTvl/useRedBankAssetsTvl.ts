import useSWR from 'swr'

import getRedBankAssetsTvl from '@/api/redBankTvl/getRedBankAssetsTvl'

export default function useRedBankAssetsTvl() {
  return useSWR(
    `chains/neutron/managedVaults/redBank`,
    async () => {
      const response = await getRedBankAssetsTvl()

      return response
    },
    {
      revalidateOnFocus: false,
      suspense: false,
    },
  )
}
