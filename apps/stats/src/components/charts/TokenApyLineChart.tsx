'use client'

import { useMemo, useState } from 'react'

import BaseAreaChart from '@/components/charts/BaseAreaChart'
import ChartWrapper from '@/components/charts/ChartWrapper'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import useBtcApy from '@/hooks/useBtcApy'
import { formatChartDate } from '@/utils/chartDateFormatter'

interface Props {
  selectedToken: TokenInfo
}

export default function TokenApyLineChart({ selectedToken }: Props) {
  const [timeRange, setTimeRange] = useState('30')
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
          formattedDate: formatChartDate(timestamp),
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
      .map((dayData: DailyMarketData) => {
        const marketData = dayData.markets?.find(
          (market: MarketData) => market.denom === selectedToken.denom,
        )
        return {
          date: dayData.timestamp,
          formattedDate: formatChartDate(dayData.timestamp),
          depositApy: marketData ? parseFloat(marketData.deposit_apy || '0') : 0,
          borrowApy: marketData ? parseFloat(marketData.borrow_apy || '0') : 0,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom, isMaxBtc, btcApyData])

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
      <BaseAreaChart data={chartData} areas={areas} tooltipType='percentage' />
    </ChartWrapper>
  )
}
