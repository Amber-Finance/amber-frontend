'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import useMarketsData from '@/hooks/redBank/useMarketsData'

interface TokenPriceLineChartProps {
  selectedToken: TokenInfo
}

export default function TokenPriceLineChart({ selectedToken }: TokenPriceLineChartProps) {
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
          priceUsd: marketData ? parseFloat(marketData.price_usd || 0) : 0,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom, timeRange])

  const areas = [
    {
      dataKey: 'priceUsd',
      color: selectedToken.brandColor,
      label: 'Price (USD)',
    },
  ]

  return (
    <ChartWrapper title={`${selectedToken.symbol} Price (USD)`} onTimeRangeChange={setTimeRange}>
      <AreaChartComponent
        data={chartData}
        areas={areas}
        title={`${selectedToken.symbol} Price (USD)`}
        onTimeRangeChange={setTimeRange}
        yAxisFormatter={(value) =>
          `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
        yAxisDomain={['dataMin - 100', 'dataMax + 100']}
        xAxisInterval={timeRange === '7' ? 0 : 'preserveStartEnd'}
        tooltipType='currency'
      />
    </ChartWrapper>
  )
}
