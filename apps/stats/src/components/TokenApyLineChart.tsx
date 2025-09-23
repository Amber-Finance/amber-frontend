'use client'

import { useMemo, useState } from 'react'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useMarketsData from '@/hooks/redBank/useMarketsData'

interface TokenApyLineChartProps {
  selectedToken: TokenInfo
}

export default function TokenApyLineChart({ selectedToken }: TokenApyLineChartProps) {
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
          depositApy: marketData ? parseFloat(marketData.deposit_apy || 0) : 0,
          borrowApy: marketData ? parseFloat(marketData.borrow_apy || 0) : 0,
        }
      })
      .reverse()
  }, [marketsData, selectedToken.denom, timeRange])

  const chartConfig = {
    depositApy: {
      label: 'Deposit APY',
      color: selectedToken.brandColor,
    },
    borrowApy: {
      label: 'Borrow APY',
      color: '#ef4444',
    },
  }

  return (
    <Card className='bg-card/20 w-full'>
      <CardHeader className='flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-b border-border/40'>
        <CardTitle className='text-sm font-bold text-foreground text-center sm:text-left'>
          {selectedToken.symbol} Deposit and Borrow APY
        </CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className='w-[160px] rounded-lg' aria-label='Select a value'>
            <SelectValue placeholder='Last 7 days' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='7' className='rounded-lg'>
              Last 7 days
            </SelectItem>
            <SelectItem value='30' className='rounded-lg'>
              Last 30 days
            </SelectItem>
            <SelectItem value='90' className='rounded-lg'>
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[350px] w-full'>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
            <defs>
              <linearGradient id='depositApyGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={chartConfig.depositApy.color} stopOpacity={0.3} />
                <stop offset='95%' stopColor={chartConfig.depositApy.color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id='borrowApyGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={chartConfig.borrowApy.color} stopOpacity={0.3} />
                <stop offset='95%' stopColor={chartConfig.borrowApy.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey='formattedDate'
              axisLine={true}
              tickLine={false}
              fontSize={10}
              dy={10}
              stroke='rgba(255, 255, 255, 0.06)'
              // interval={timeRange === '7' ? 0 : 'preserveStartEnd'}
              interval={Math.ceil(chartData.length / 8)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={10}
              dy={10}
              stroke='rgba(255, 255, 255, 0.06)'
              interval='preserveStartEnd'
            />
            <ChartTooltip content={<ChartTooltipContent indicator='line' isPercentage />} />
            <Area
              type='monotone'
              dataKey='depositApy'
              stroke={chartConfig.depositApy.color}
              fill='url(#depositApyGradient)'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: chartConfig.depositApy.color }}
            />
            <Area
              type='monotone'
              dataKey='borrowApy'
              stroke={chartConfig.borrowApy.color}
              fill='url(#borrowApyGradient)'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: chartConfig.borrowApy.color }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
