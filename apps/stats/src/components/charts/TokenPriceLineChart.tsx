'use client'

import { useMemo, useState } from 'react'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import ChartWrapper from '@/components/charts/ChartWrapper'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useMarketsData from '@/hooks/redBank/useMarketsData'

interface TokenPriceLineChartProps {
  selectedToken: TokenInfo
}

export default function TokenPriceLineChart({ selectedToken }: TokenPriceLineChartProps) {
  const [timeRange, setTimeRange] = useState('7')
  const { data: marketsData } = useMarketsData(selectedToken.denom, parseInt(timeRange))

  const chartData = useMemo(() => {
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
          priceUsd: marketData ? parseFloat(marketData.price_usd || 0) : 0,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom, timeRange])

  const chartConfig = {
    priceUsd: {
      label: 'Price (USD)',
      color: selectedToken.brandColor,
    },
  }

  return (
    <ChartWrapper title={`${selectedToken.symbol} Price (USD)`} onTimeRangeChange={setTimeRange}>
      <ChartContainer config={chartConfig} className='h-[350px] w-full'>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
          <defs>
            <linearGradient id='priceUsdGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={chartConfig.priceUsd.color} stopOpacity={0.3} />
              <stop offset='95%' stopColor={chartConfig.priceUsd.color} stopOpacity={0} />
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
            domain={['dataMin - 100', 'dataMax + 100']}
            tickFormatter={(value) =>
              `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            }
          />
          <ChartTooltip content={<ChartTooltipContent indicator='line' isCurrency />} />
          <Area
            type='monotone'
            dataKey='priceUsd'
            stroke={chartConfig.priceUsd.color}
            fill='url(#priceUsdGradient)'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: chartConfig.priceUsd.color }}
          />
        </AreaChart>
      </ChartContainer>
    </ChartWrapper>
  )
}
