'use client'

import { useMemo, useState } from 'react'

import BigNumber from 'bignumber.js'
import moment from 'moment'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAssetsApr from '@/hooks/redBank/useAssetsApr'
import { cn } from '@/lib/utils'
import { convertAprToApy } from '@/utils/finance'

interface StrategyChartProps {
  denom: string
  brandColor?: string
  className?: string
  symbol?: string
}

const chartConfig = {
  borrowApr: {
    label: 'Borrow APY',
    color: '#f57136',
  },
  maxBtcBorrowApr: {
    label: 'MaxBTC Borrow APY',
    color: '#6B7289',
  },
}
const maxBtcDenom =
  'factory/neutron17sp75wng9vl2hu3sf4ky86d7smmk3wle9gkts2gmedn9x4ut3xcqa5xp34/maxbtc'

export function StrategyChart({ denom, brandColor, className, symbol }: StrategyChartProps) {
  const [timeRange, setTimeRange] = useState('7')

  const { data: assetsApr, isLoading: aprLoading } = useAssetsApr(denom, parseInt(timeRange))
  const { data: maxBtcApr, isLoading: maxBtcAprLoading } = useAssetsApr(
    maxBtcDenom,
    parseInt(timeRange),
  )
  const assetAprData = assetsApr?.[0]?.borrow_apr || []
  const maxBtcAprData = maxBtcApr?.[0]?.borrow_apr || []

  const isLoading = maxBtcAprLoading || aprLoading

  const chartData = useMemo(() => {
    if (!assetAprData || assetAprData.length === 0 || !maxBtcAprData || maxBtcAprData.length === 0)
      return []

    const dataMap = new Map()

    // Asset Borrow APR
    assetAprData.forEach((point: { date: string; value: string }) => {
      const dateKey = moment(point.date).format('YYYY-MM-DD')
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: new Date(point.date),
          formattedDate: moment(point.date).format('MMM DD'),
          borrowApr: 0,
          maxBtcBorrowApr: 0,
        })
      }
      dataMap.get(dateKey).borrowApr = parseFloat(convertAprToApy(point.value))
    })

    // MaxBTC Borrow APR
    maxBtcAprData.forEach((point: { date: string; value: string }) => {
      const dateKey = moment(point.date).format('YYYY-MM-DD')
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: new Date(point.date),
          formattedDate: moment(point.date).format('MMM DD'),
          borrowApr: 0,
          maxBtcBorrowApr: 0,
        })
      }
      dataMap.get(dateKey).maxBtcBorrowApr = parseFloat(convertAprToApy(point.value))
    })

    return Array.from(dataMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [assetAprData, maxBtcAprData])

  if (
    !isLoading &&
    (!assetAprData || assetAprData.length === 0 || !maxBtcAprData || maxBtcAprData.length === 0)
  ) {
    return null
  }

  return (
    <Card className='bg-card/20 pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b border-border/40 py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle className='text-sm font-bold text-foreground'>
            {symbol} Borrow APY & MaxBTC Borrow APY
          </CardTitle>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className='hidden w-[160px] rounded-lg sm:ml-auto sm:flex'
            aria-label='Select a value'
          >
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
                '--color-borrowApr': brandColor || '#f57136',
                '--color-maxBtcBorrowApr': '#6B7280',
              } as React.CSSProperties
            }
          >
            <AreaChart data={chartData} margin={{ top: 10, right: -10, left: -10, bottom: 10 }}>
              <defs>
                <linearGradient id='borrowAprGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-borrowApr)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--color-borrowApr)' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='maxBtcBorrowAprGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-maxBtcBorrowApr)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--color-maxBtcBorrowApr)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey='formattedDate'
                axisLine={true}
                tickLine={false}
                fontSize={10}
                dy={10}
                stroke='rgba(255, 255, 255, 0.06)'
                interval='preserveStartEnd'
              />
              <YAxis
                yAxisId='borrowApr'
                orientation='left'
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke='rgba(255, 255, 255, 0.06)'
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                yAxisId='maxBtcBorrowApr'
                orientation='right'
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke='rgba(255, 255, 255, 0.06)'
                tickFormatter={(value) => `${value}%`}
              />

              <ChartTooltip content={<ChartTooltipContent indicator='line' isPercentage />} />
              <Area
                yAxisId='borrowApr'
                type='monotone'
                dataKey='borrowApr'
                stroke='var(--color-borrowApr)'
                strokeWidth={2}
                fill='url(#borrowAprGradient)'
                name={`${symbol} Borrow APY`}
              />
              <Area
                yAxisId='maxBtcBorrowApr'
                type='monotone'
                dataKey='maxBtcBorrowApr'
                stroke='var(--color-maxBtcBorrowApr)'
                strokeWidth={2}
                fill='url(#maxBtcBorrowAprGradient)'
                name='MaxBTC Borrow APY'
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
