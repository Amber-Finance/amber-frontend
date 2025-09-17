import { BigNumber } from 'bignumber.js'
import useSWR from 'swr'

import getDenomData from '@/api/redBank/getDenomData'

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
    tvlGrowth30d: calculateTvlGrowth(denomData?.tvl_historical),
    isLoading,
    error,
    mutate,
  }
}

const calculateTvlGrowth = (historicalData: TvlHistoricalPoint[]) => {
  if (!historicalData || historicalData.length < 2) return 0

  const oldestTvl = new BigNumber(historicalData[historicalData.length - 1].value)
  const newestTvl = new BigNumber(historicalData[0].value)

  const growthPercentage = newestTvl.minus(oldestTvl).dividedBy(oldestTvl).multipliedBy(100)
  const result = growthPercentage.toNumber()

  return result || 0
}
