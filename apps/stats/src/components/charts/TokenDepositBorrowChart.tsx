'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import { MAXBTC_DENOM } from '@/constants/query'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import useMaxBtcData from '@/hooks/useMaxBtcData'
import { formatChartDate } from '@/utils/chartDateFormatter'
import { formatCompactCurrency } from '@/utils/format'

interface TokenDepositBorrowChartProps {
  selectedToken: TokenInfo
}

export default function TokenDepositBorrowChart({ selectedToken }: TokenDepositBorrowChartProps) {
  const [timeRange, setTimeRange] = useState('7')
  const { data: marketsData } = useMarketsData(selectedToken.denom, parseInt(timeRange))
  const { data: maxBtcData } = useMaxBtcData(parseInt(timeRange))
  const isMaxBtc = selectedToken.denom === MAXBTC_DENOM

  const chartData = useMemo(() => {
    if (isMaxBtc) {
      // Use the new maxBTC data hook
      return maxBtcData.map((item) => ({
        date: item.timestamp,
        formattedDate: formatChartDate(item.timestamp),
        depositAmount: item.depositAmountUsd,
        borrowAmount: 0, // maxBTC has no borrows
      }))
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

        const priceUsd = marketData ? parseFloat(marketData.price_usd || '0') : 0
        const depositAmount = marketData ? parseFloat(marketData.deposit_amount || '0') : 0
        const borrowAmount = marketData ? parseFloat(marketData.borrow_amount || '0') : 0

        return {
          date: dayData.timestamp,
          formattedDate: formatChartDate(dayData.timestamp),
          depositAmount: depositAmount * priceUsd,
          borrowAmount: borrowAmount * priceUsd,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom, isMaxBtc, maxBtcData])

  const areas = [
    {
      dataKey: 'depositAmount',
      color: selectedToken.brandColor,
      label: 'Deposits',
    },
    // Only show borrows for non-maxBTC tokens
    ...(isMaxBtc
      ? []
      : [
          {
            dataKey: 'borrowAmount',
            color: '#ef4444',
            label: 'Borrows',
          },
        ]),
  ]

  return (
    <ChartWrapper
      title={
        isMaxBtc ? `${selectedToken.symbol} Deposits` : `${selectedToken.symbol} Deposits & Borrows`
      }
      onTimeRangeChange={setTimeRange}
    >
      <AreaChartComponent
        data={chartData}
        areas={areas}
        yAxisFormatter={formatCompactCurrency}
        yAxisDomain={['dataMin * 0.9', 'dataMax * 1.1']}
        tooltipType='currency'
      />
    </ChartWrapper>
  )
}
