'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import useMarketsData from '@/hooks/redBank/useMarketsData'

interface TokenApyLineChartProps {
  selectedToken: TokenInfo
}

export default function TokenApyLineChart({ selectedToken }: TokenApyLineChartProps) {
  const [timeRange, setTimeRange] = useState('7')
  const { data: marketsData } = useMarketsData(selectedToken.denom, parseInt(timeRange))

  const chartData = useMemo(() => {
    if (!marketsData?.data || !Array.isArray(marketsData.data)) {
      return []
    }

    return marketsData.data
      .map((item: any) => {
        const marketData = item.markets?.find((market: any) => market.denom === selectedToken.denom)

        return {
          date: item.timestamp,
          formattedDate: new Date(parseInt(item.timestamp)).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          depositApy: marketData ? parseFloat(marketData.deposit_apy || 0) : 0,
          borrowApy: marketData ? parseFloat(marketData.borrow_apy || 0) : 0,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom, timeRange])

  const areas = [
    {
      dataKey: 'depositApy',
      color: selectedToken.brandColor,
      label: 'Deposit APY',
    },
    {
      dataKey: 'borrowApy',
      color: '#ef4444',
      label: 'Borrow APY',
    },
  ]

  return (
    <ChartWrapper
      title={`${selectedToken.symbol} Deposit and Borrow APY`}
      onTimeRangeChange={setTimeRange}
    >
      <AreaChartComponent
        data={chartData}
        areas={areas}
        title={`${selectedToken.symbol} Deposit and Borrow APY`}
        onTimeRangeChange={setTimeRange}
        xAxisInterval={Math.ceil(chartData.length / 8)}
        tooltipType='percentage'
      />
    </ChartWrapper>
  )
}
