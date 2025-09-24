'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import useMarketsData from '@/hooks/redBank/useMarketsData'

interface TokenDepositBorrowChartProps {
  selectedToken: TokenInfo
}

export default function TokenDepositBorrowChart({ selectedToken }: TokenDepositBorrowChartProps) {
  const [timeRange, setTimeRange] = useState('7')
  const { data: marketsData } = useMarketsData(selectedToken.denom, parseInt(timeRange))

  const chartData = useMemo(() => {
    if (!marketsData?.data || !Array.isArray(marketsData.data)) {
      return []
    }

    return marketsData.data
      .map((item: any) => {
        const marketData = item.markets?.find((market: any) => market.denom === selectedToken.denom)

        const priceUsd = marketData ? parseFloat(marketData.price_usd || 0) : 0
        const depositAmount = marketData ? parseFloat(marketData.deposit_amount || 0) : 0
        const borrowAmount = marketData ? parseFloat(marketData.borrow_amount || 0) : 0

        return {
          date: item.timestamp,
          formattedDate: new Date(parseInt(item.timestamp)).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          depositAmount: depositAmount * priceUsd,
          borrowAmount: borrowAmount * priceUsd,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom, timeRange])

  const areas = [
    {
      dataKey: 'depositAmount',
      color: selectedToken.brandColor,
      label: 'Deposits',
    },
    {
      dataKey: 'borrowAmount',
      color: '#ef4444',
      label: 'Borrows',
    },
  ]

  return (
    <ChartWrapper
      title={`${selectedToken.symbol} Deposits & Borrows`}
      onTimeRangeChange={setTimeRange}
    >
      <AreaChartComponent
        data={chartData}
        areas={areas}
        title={`${selectedToken.symbol} Deposits & Borrows`}
        onTimeRangeChange={setTimeRange}
        yAxisFormatter={(value) => {
          const absValue = Math.abs(value)
          const sign = value < 0 ? '-' : ''
          return `${sign}$${(absValue / 1000).toFixed(0)}K`
        }}
        yAxisDomain={['dataMin * 0.9', 'dataMax * 1.1']}
        xAxisInterval={timeRange === '7' ? 0 : 'preserveStartEnd'}
        tooltipType='currency'
      />
    </ChartWrapper>
  )
}
