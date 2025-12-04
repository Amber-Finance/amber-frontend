import useSWR from 'swr'

import getMaxBtcDeposits from '@/api/getMaxBtcDeposits'

export default function useMaxBtcDeposits(days: number = 30) {
  return useSWR(
    `chains/neutron/maxBtcDeposits-${days}`,
    async () => {
      const response = await getMaxBtcDeposits(days)

      return response
    },
    {
      revalidateOnFocus: false,
    },
  )
}
