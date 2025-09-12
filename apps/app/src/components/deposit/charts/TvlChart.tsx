'use client'

import { useMemo, useState } from 'react'

import { BigNumber } from 'bignumber.js'
import moment from 'moment'
import { Area, AreaChart, XAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useDenomData from '@/hooks/redBank/useDenomData'
import { cn } from '@/lib/utils'

interface TvlChartProps {
  denom: string
  brandColor?: string
  className?: string
}

const chartConfig = {
  tvl: {
    label: 'TVL',
    color: '#f57136',
  },
}

export function TvlChart({ denom, brandColor, className }: TvlChartProps) {
  const [timeRange, setTimeRange] = useState('7')

  const { data: assetMetrics, isLoading } = useDenomData(denom, parseInt(timeRange))
  const data = assetMetrics?.tvl_historical

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data
      .map((point: { date: string; value: string }) => ({
        date: new Date(point.date),
        tvl: new BigNumber(point.value).shiftedBy(-6).toNumber(), // Convert from micro units
        formattedDate: moment(point.date).format('MMM DD'),
        formattedValue: new BigNumber(point.value).toFixed(2),
      }))
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime()) // Sort by date ascending
  }, [data])

  if (!isLoading && (!data || data.length === 0)) {
    return null
  }

  return (
    <Card className='bg-card/20 pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b border-border/40 py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle className='text-sm font-bold text-foreground'>Total Value Locked</CardTitle>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className='hidden w-[160px] rounded-lg sm:ml-auto sm:flex'
            aria-label='Select a value'
          >
            <SelectValue placeholder='Last 3 months' />
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
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {isLoading ? (
          <div className='flex items-center justify-center h-[350px] text-muted-foreground'>
            Loading...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className={cn(className, 'w-full h-[350px]')}
            style={
              {
                '--color-tvl': brandColor || '#f57136',
              } as React.CSSProperties
            }
          >
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id='tvlGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-tvl)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--color-tvl)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey='formattedDate'
                axisLine={true}
                tickLine={false}
                fontSize={10}
                dy={10}
                stroke='rgba(255, 255, 255, 0.06)'
                interval='preserveStartEnd' //????
              />

              <ChartTooltip
                content={<ChartTooltipContent color={brandColor} indicator='line' isCurrency />}
              />
              <Area
                type='monotone'
                dataKey='tvl'
                stroke='var(--color-tvl)'
                strokeWidth={2}
                fill='url(#tvlGradient)'
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
