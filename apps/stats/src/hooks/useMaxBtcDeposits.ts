import useSWR from 'swr'

import getMaxBtcDeposits from '@/api/getMaxBtcDeposits'

export default function useMaxBtcDeposits() {
  return useSWR(
    `chains/neutron/maxBtcDeposits`,
    async () => {
      const response = await getMaxBtcDeposits()

      return response
    },
    {
      revalidateOnFocus: false,
    },
  )
}
