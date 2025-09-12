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
import useDenomData from '@/hooks/redBank/useDenomData'
import { cn } from '@/lib/utils'
import { convertAprToApy } from '@/utils/finance'

interface ChartProps {
  denom: string
  brandColor?: string
  className?: string
}

const chartConfig = {
  supplyApr: {
    label: 'Deposit APY',
    color: '#6B7289',
  },
  tvl: {
    label: 'TVL',
    color: '#f57136',
  },
}

export function Chart({ denom, brandColor, className }: ChartProps) {
  const [timeRange, setTimeRange] = useState('7')

  const { data: assetMetrics, isLoading: tvlLoading } = useDenomData(denom, parseInt(timeRange))
  const { data: assetsApr, isLoading: aprLoading } = useAssetsApr(denom, parseInt(timeRange))
  const tvlData = assetMetrics?.tvl_historical
  const aprData = assetsApr?.[0]?.supply_apr || []

  const isLoading = tvlLoading || aprLoading

  const chartData = useMemo(() => {
    if (!aprData || aprData.length === 0 || !tvlData || tvlData.length === 0) return []

    const dataMap = new Map()

    // APR
    aprData.forEach((point: { date: string; value: string }) => {
      const dateKey = moment(point.date).format('YYYY-MM-DD')
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: new Date(point.date),
          formattedDate: moment(point.date).format('MMM DD'),
          supplyApr: 0,
          tvl: 0,
        })
      }
      dataMap.get(dateKey).supplyApr = parseFloat(convertAprToApy(point.value))
    })

    // TVL
    tvlData.forEach((point: { date: string; value: string }) => {
      const dateKey = moment(point.date).format('YYYY-MM-DD')
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: new Date(point.date),
          formattedDate: moment(point.date).format('MMM DD'),
          supplyApr: 0,
          tvl: 0,
        })
      }
      dataMap.get(dateKey).tvl = new BigNumber(point.value).shiftedBy(-6).toNumber()
    })

    return Array.from(dataMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [aprData, tvlData])

  if (!isLoading && (!aprData || aprData.length === 0 || !tvlData || tvlData.length === 0)) {
    return null
  }

  return (
    <Card className='bg-card/20 pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b border-border/40 py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle className='text-sm font-bold text-foreground'>
            Total Value Locked & Deposit APY
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
                '--color-supplyApr': '#6B7280',
                '--color-tvl': brandColor || '#f57136',
              } as React.CSSProperties
            }
          >
            <AreaChart data={chartData} margin={{ top: 10, right: -10, left: -10, bottom: 10 }}>
              <defs>
                <linearGradient id='supplyAprGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-supplyApr)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--color-supplyApr)' stopOpacity={0} />
                </linearGradient>
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
                interval='preserveStartEnd'
              />
              <YAxis
                yAxisId='apy'
                orientation='left'
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke='rgba(255, 255, 255, 0.06)'
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                yAxisId='tvl'
                orientation='right'
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke='rgba(255, 255, 255, 0.06)'
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />

              <ChartTooltip content={<ChartTooltipContent indicator='line' />} />
              <Area
                yAxisId='apy'
                type='monotone'
                dataKey='supplyApr'
                stroke='var(--color-supplyApr)'
                strokeWidth={2}
                fill='url(#supplyAprGradient)'
                name='Deposit APY'
              />
              <Area
                yAxisId='tvl'
                type='monotone'
                dataKey='tvl'
                stroke='var(--color-tvl)'
                strokeWidth={2}
                fill='url(#tvlGradient)'
                name='TVL'
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
