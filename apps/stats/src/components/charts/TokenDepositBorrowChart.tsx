'use client'

import { useMemo, useState } from 'react'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import ChartWrapper from '@/components/charts/ChartWrapper'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
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

  const chartConfig = {
    depositAmount: {
      label: 'Deposits',
      color: selectedToken.brandColor,
    },
    borrowAmount: {
      label: 'Borrows',
      color: '#ef4444',
    },
  }

  return (
    <ChartWrapper
      title={`${selectedToken.symbol} Deposits & Borrows`}
      onTimeRangeChange={setTimeRange}
    >
      <ChartContainer config={chartConfig} className='h-[350px] w-full'>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
          <defs>
            <linearGradient id='depositAmountGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={chartConfig.depositAmount.color} stopOpacity={0.3} />
              <stop offset='95%' stopColor={chartConfig.depositAmount.color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id='borrowAmountGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={chartConfig.borrowAmount.color} stopOpacity={0.3} />
              <stop offset='95%' stopColor={chartConfig.borrowAmount.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey='formattedDate'
            axisLine={true}
            tickLine={false}
            fontSize={10}
            dy={10}
            stroke='rgba(255, 255, 255, 0.06)'
            interval={timeRange === '7' ? 0 : 'preserveStartEnd'}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={10}
            dy={10}
            stroke='rgba(255, 255, 255, 0.06)'
            interval='preserveStartEnd'
            domain={['dataMin * 0.9', 'dataMax * 1.1']}
            tickFormatter={(value) => {
              const absValue = Math.abs(value)
              const sign = value < 0 ? '-' : ''
              return `${sign}$${(absValue / 1000).toFixed(0)}K`
            }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator='line' isCurrency />} />
          <Area
            type='monotone'
            dataKey='depositAmount'
            stroke={chartConfig.depositAmount.color}
            fill='url(#depositAmountGradient)'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.depositAmount.color }}
          />
          <Area
            type='monotone'
            dataKey='borrowAmount'
            stroke={chartConfig.borrowAmount.color}
            fill='url(#borrowAmountGradient)'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.borrowAmount.color }}
          />
        </AreaChart>
      </ChartContainer>
    </ChartWrapper>
  )
}
