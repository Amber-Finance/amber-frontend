import useSWR from 'swr'

import getAssetsApr from '@/api/redBank/getAssetsApr'

export default function useAssetsApr(denom: string, days: number = 30) {
  const {
    data: assetsApr,
    error,
    isLoading,
    mutate,
  } = useSWR(
    `chains/neutron/redBank/assetsApr?denom=${denom}&days=${days}`,
    async () => await getAssetsApr(denom, days),
    {
      revalidateOnFocus: false,
    },
  )

  return {
    data: assetsApr?.data,
    isLoading,
    error,
    mutate,
  }
}
