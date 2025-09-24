'use client'

import { useMemo, useState } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import ChartWrapper from '@/components/charts/ChartWrapper'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import { formatChartDate } from '@/utils/chartDateFormatter'
import { formatCompactCurrency } from '@/utils/format'

export default function TotalDepositsBorrowsLineChart() {
  const [timeRange, setTimeRange] = useState('7')
  const { data: marketsData } = useMarketsData(undefined, parseInt(timeRange))

  const chartData = useMemo(() => {
    if (!marketsData?.data || !Array.isArray(marketsData.data)) {
      return []
    }

    return marketsData.data
      .map((dayData: any) => {
        let totalDeposits = 0
        let totalBorrows = 0

        if (dayData.markets) {
          dayData.markets.forEach((market: any) => {
            const priceUsd = parseFloat(market.price_usd || '0')
            const depositAmount = parseFloat(market.deposit_amount || '0')
            const borrowAmount = parseFloat(market.borrow_amount || '0')

            const depositValue = depositAmount * priceUsd
            const borrowValue = borrowAmount * priceUsd

            totalDeposits += depositValue
            totalBorrows += borrowValue
          })
        }

        return {
          date: dayData.timestamp,
          formattedDate: formatChartDate(dayData.timestamp),
          totalDeposits,
          totalBorrows,
          tvl: totalDeposits - totalBorrows,
        }
      })
      .reverse()
  }, [marketsData, timeRange])

  const areas = [
    {
      dataKey: 'totalDeposits',
      color: '#059669',
      label: 'Total Deposits',
    },
    {
      dataKey: 'totalBorrows',
      color: '#dc2626',
      label: 'Total Borrows',
    },
    {
      dataKey: 'tvl',
      color: '#d97706',
      label: 'TVL',
    },
  ]

  return (
    <ChartWrapper title='Total Deposits, Borrows & TVL' onTimeRangeChange={setTimeRange}>
      <AreaChartComponent
        data={chartData}
        areas={areas}
        title='Total Deposits, Borrows & TVL'
        onTimeRangeChange={setTimeRange}
        yAxisFormatter={formatCompactCurrency}
        tooltipType='currency'
      />
    </ChartWrapper>
  )
}
