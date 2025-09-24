'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import useBtcApy from '@/hooks/useBtcApy'

interface TokenApyLineChartProps {
  selectedToken: TokenInfo
}

export default function TokenApyLineChart({ selectedToken }: TokenApyLineChartProps) {
  const [timeRange, setTimeRange] = useState('7')
  const { data: marketsData } = useMarketsData(selectedToken.denom, parseInt(timeRange))
  const { data: btcApyData } = useBtcApy(selectedToken.symbol, parseInt(timeRange))

  const isMaxBtc = selectedToken.symbol.toLowerCase() === 'maxbtc'

  const chartData = useMemo(() => {
    if (isMaxBtc) {
      // Handle maxBTC APY data
      if (!btcApyData?.data) {
        return []
      }

      // Convert maxBTC APY data to chart format
      const timestamps = Object.keys(btcApyData.data).sort()
      return timestamps.map((timestamp) => {
        const apyValue = btcApyData.data[timestamp]
        const depositApy = parseFloat(apyValue || '0')

        return {
          date: timestamp,
          formattedDate: new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          depositApy: depositApy,
          borrowApy: 0, // maxBTC has no borrow APY
        }
      })
    }

    // Handle regular tokens
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
  }, [marketsData, selectedToken.denom, timeRange, isMaxBtc, btcApyData])

  const areas = [
    {
      dataKey: 'depositApy',
      color: selectedToken.brandColor,
      label: 'Deposit APY',
    },
    // Only show borrow APY for non-maxBTC tokens
    ...(isMaxBtc
      ? []
      : [
          {
            dataKey: 'borrowApy',
            color: '#ef4444',
            label: 'Borrow APY',
          },
        ]),
  ]

  return (
    <ChartWrapper
      title={
        isMaxBtc
          ? `${selectedToken.symbol} Deposit APY`
          : `${selectedToken.symbol} Deposit and Borrow APY`
      }
      onTimeRangeChange={setTimeRange}
    >
      <AreaChartComponent
        data={chartData}
        areas={areas}
        title={
          isMaxBtc
            ? `${selectedToken.symbol} Deposit APY`
            : `${selectedToken.symbol} Deposit and Borrow APY`
        }
        onTimeRangeChange={setTimeRange}
        xAxisInterval={Math.ceil(chartData.length / 8)}
        tooltipType='percentage'
      />
    </ChartWrapper>
  )
}
