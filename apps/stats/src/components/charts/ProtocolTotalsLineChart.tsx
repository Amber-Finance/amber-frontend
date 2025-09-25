'use client'

import { useMemo } from 'react'

import AreaChartComponent from '@/components/charts/AreaChartComponent'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import { formatChartDate } from '@/utils/chartDateFormatter'
import { formatCompactCurrency } from '@/utils/format'

interface Props {
  timeRange: string
}

export default function ProtocolTotalsLineChart({ timeRange }: Props) {
  const { data: marketsData } = useMarketsData(undefined, parseInt(timeRange))

  const chartData = useMemo(() => {
    if (!marketsData?.data || !Array.isArray(marketsData.data)) {
      return []
    }

    return marketsData.data
      .map((dayData: DailyMarketData) => {
        let totalDeposits = 0
        let totalBorrows = 0

        if (dayData.markets) {
          dayData.markets.forEach((market: MarketData) => {
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
  }, [marketsData])

  const areas = [
    {
      dataKey: 'totalDeposits',
      color: '#059669',
      label: 'Total Deposits',
    },
    {
      dataKey: 'totalBorrows',
      color: '#ef4444',
      label: 'Total Borrows',
    },
    {
      dataKey: 'tvl',
      color: '#d97706',
      label: 'TVL',
    },
  ]

  return (
    <div className='w-full h-[350px] overflow-hidden'>
      <AreaChartComponent
        data={chartData}
        areas={areas}
        yAxisFormatter={formatCompactCurrency}
        tooltipType='currency'
      />
    </div>
  )
}
