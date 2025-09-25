import useSWR from 'swr'

import getDenomData from '@/api/getDenomData'

export default function useDenomData(denom: string, days: number = 30) {
  const {
    data: denomData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    `chains/neutron/redBank/denomData?denom=${denom}&days=${days}`,
    async () => await getDenomData(denom, days),
    {
      revalidateOnFocus: false,
    },
  )

  return {
    data: denomData,
    isLoading,
    error,
    mutate,
  }
}
