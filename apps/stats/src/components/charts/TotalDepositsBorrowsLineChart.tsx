'use client'

import { useMemo, useState } from 'react'

import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import ChartWrapper from '@/components/charts/ChartWrapper'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useMarketsData from '@/hooks/redBank/useMarketsData'

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
          formattedDate: new Date(parseInt(dayData.timestamp)).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          totalDeposits,
          totalBorrows,
          tvl: totalDeposits - totalBorrows,
        }
      })
      .reverse()
  }, [marketsData, timeRange])

  const chartConfig = {
    totalDeposits: {
      label: 'Total Deposits',
      color: '#059669',
    },
    totalBorrows: {
      label: 'Total Borrows',
      color: '#dc2626',
    },
    tvl: {
      label: 'TVL',
      color: '#d97706',
    },
  }

  return (
    <ChartWrapper title='Total Deposits, Borrows & TVL' onTimeRangeChange={setTimeRange}>
      <ChartContainer config={chartConfig} className='h-[350px] w-full'>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
          <defs>
            <linearGradient id='totalDepositsGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={chartConfig.totalDeposits.color} stopOpacity={0.3} />
              <stop offset='95%' stopColor={chartConfig.totalDeposits.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id='totalBorrowsGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={chartConfig.totalBorrows.color} stopOpacity={0.3} />
              <stop offset='95%' stopColor={chartConfig.totalBorrows.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id='tvlGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={chartConfig.tvl.color} stopOpacity={0.3} />
              <stop offset='95%' stopColor={chartConfig.tvl.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey='formattedDate'
            axisLine={true}
            tickLine={false}
            fontSize={10}
            dy={10}
            stroke='rgba(255, 255, 255, 0.06)'
            interval={Math.ceil(chartData.length / 8)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={10}
            dy={10}
            stroke='rgba(255, 255, 255, 0.06)'
            interval='preserveStartEnd'
            tickFormatter={(value) => {
              const absValue = Math.abs(value)
              return `$${(absValue / 1000).toFixed(0)}K`
            }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator='line' isCurrency />} />
          <Area
            type='monotone'
            dataKey='totalDeposits'
            stroke={chartConfig.totalDeposits.color}
            fill='url(#totalDepositsGradient)'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.totalDeposits.color }}
          />
          <Area
            type='monotone'
            dataKey='totalBorrows'
            stroke={chartConfig.totalBorrows.color}
            fill='url(#totalBorrowsGradient)'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.totalBorrows.color }}
          />
          <Area
            type='monotone'
            dataKey='tvl'
            stroke={chartConfig.tvl.color}
            fill='url(#tvlGradient)'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.tvl.color }}
          />
        </AreaChart>
      </ChartContainer>
    </ChartWrapper>
  )
}
