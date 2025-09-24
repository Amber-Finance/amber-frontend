'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import { MAXBTC_DENOM } from '@/constants/query'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import useMaxBtcDeposits from '@/hooks/useMaxBtcDeposits'

interface TokenDepositBorrowChartProps {
  selectedToken: TokenInfo
}

export default function TokenDepositBorrowChart({ selectedToken }: TokenDepositBorrowChartProps) {
  const [timeRange, setTimeRange] = useState('7')
  const { data: marketsData } = useMarketsData(selectedToken.denom, parseInt(timeRange))
  const { data: maxBtcDeposits } = useMaxBtcDeposits()
  const isMaxBtc = selectedToken.denom === MAXBTC_DENOM

  const chartData = useMemo(() => {
    if (isMaxBtc) {
      if (!maxBtcDeposits?.data) {
        return []
      }

      // Convert maxBTC deposits data to chart format
      const timestamps = Object.keys(maxBtcDeposits.data).sort()
      return timestamps.map((timestamp) => {
        const deposits = maxBtcDeposits.data[timestamp]
        // Get the first (and likely only) deposit amount for this day
        const depositAmount =
          deposits && deposits.length > 0 ? parseFloat(deposits[0].amount || '0') : 0
        // Convert from satoshis to BTC units (maxBTC has 8 decimals)
        const maxBtcAmountInBtc = depositAmount / Math.pow(10, 8)

        // Get maxBTC price from markets data if available
        let btcPriceUsd = 0
        if (marketsData?.data) {
          // Convert timestamp to date string for matching
          const depositDate = new Date(parseInt(timestamp)).toDateString()
          const marketData = marketsData.data.find((item: any) => {
            const marketDate = new Date(parseInt(item.timestamp)).toDateString()
            return marketDate === depositDate
          })
          if (marketData?.markets) {
            for (const market of marketData.markets) {
              if (market.symbol === 'maxBTC') {
                btcPriceUsd = parseFloat(market.price_usd || '0')
                break
              }
            }
          }
        }

        const depositAmountUsd = maxBtcAmountInBtc * btcPriceUsd

        return {
          date: timestamp,
          formattedDate: new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          depositAmount: depositAmountUsd,
          borrowAmount: 0, // maxBTC has no borrows
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
  }, [marketsData, selectedToken.denom, timeRange, isMaxBtc, maxBtcDeposits])

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
        title={
          isMaxBtc
            ? `${selectedToken.symbol} Deposits`
            : `${selectedToken.symbol} Deposits & Borrows`
        }
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
