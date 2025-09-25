'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import { formatChartDate } from '@/utils/chartDateFormatter'
import { formatCompactCurrency } from '@/utils/format'

interface TokenPriceLineChartProps {
  selectedToken: TokenInfo
}

export default function TokenPriceLineChart({ selectedToken }: TokenPriceLineChartProps) {
  const [timeRange, setTimeRange] = useState('30')
  const { data: marketsData } = useMarketsData(selectedToken.denom, parseInt(timeRange))

  const chartData = useMemo(() => {
    if (!marketsData?.data || !Array.isArray(marketsData.data)) {
      return []
    }

    return marketsData.data
      .map((dayData: DailyMarketData) => {
        const marketData = dayData.markets?.find(
          (market: MarketData) => market.denom === selectedToken.denom,
        )

        return {
          date: dayData.timestamp,
          formattedDate: formatChartDate(dayData.timestamp),
          priceUsd: marketData ? parseFloat(marketData.price_usd || '0') : 0,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom])

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
        yAxisFormatter={formatCompactCurrency}
        yAxisDomain={['dataMin - 100', 'dataMax + 100']} //so the chart is a bit more 'zoomed in'
        tooltipType='currency'
      />
    </ChartWrapper>
  )
}
