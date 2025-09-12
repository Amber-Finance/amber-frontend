'use client'

import { useMemo, useState } from 'react'

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

interface ApyChartProps {
  denom: string
  brandColor?: string
  className?: string
}

const chartConfig = {
  supplyApr: {
    label: 'Supply APY',
    color: '#f57136',
  },
  borrowApr: {
    label: 'Borrow APY',
    color: '#6B7280',
  },
}

export function ApyChart({ denom, brandColor, className }: ApyChartProps) {
  const [timeRange, setTimeRange] = useState('7')

  const { data: assetsApr, isLoading } = useAssetsApr(denom, parseInt(timeRange))

  const chartData = useMemo(() => {
    if (!assetsApr || assetsApr.length === 0) return []

    // Get the first asset's data (assuming single asset for now)
    const assetData = assetsApr[0]
    if (!assetData || !assetData.supply_apr || !assetData.borrow_apr) return []

    // Create a map to combine supply and borrow data by date
    const dataMap = new Map()

    // Process supply APR data
    assetData.supply_apr.forEach((point: { date: string; value: string }) => {
      const date = point.date
      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date: new Date(date),
          formattedDate: moment(date).format('MMM DD'),
        })
      }
      dataMap.get(date).supplyApr = parseFloat(convertAprToApy(point.value))
    })

    // Process borrow APR data
    assetData.borrow_apr.forEach((point: { date: string; value: string }) => {
      const date = point.date
      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date: new Date(date),
          formattedDate: moment(date).format('MMM DD'),
        })
      }
      dataMap.get(date).borrowApr = parseFloat(convertAprToApy(point.value))
    })

    return Array.from(dataMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [assetsApr])

  if (!isLoading && (!assetsApr || assetsApr.length === 0)) {
    return null
  }

  return (
    <Card className='bg-card/20 pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b border-border/40 py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle className='text-sm font-bold text-foreground'>Supply & Borrow APY</CardTitle>
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
                '--color-supplyApr': brandColor || '#f57136',
                '--color-borrowApr': '#6B7280',
              } as React.CSSProperties
            }
          >
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id='supplyAprGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-supplyApr)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--color-supplyApr)' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='borrowAprGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-borrowApr)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='var(--color-borrowApr)' stopOpacity={0} />
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
              {/* <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke='rgba(255, 255, 255, 0.06)'
                tickFormatter={(value) => `${value}%`}
              /> */}

              <ChartTooltip content={<ChartTooltipContent indicator='line' isPercentage />} />
              <Area
                type='monotone'
                dataKey='supplyApr'
                stroke='var(--color-supplyApr)'
                strokeWidth={2}
                fill='url(#supplyAprGradient)'
                name='Supply APY'
              />
              <Area
                type='monotone'
                dataKey='borrowApr'
                stroke='var(--color-borrowApr)'
                strokeWidth={2}
                fill='url(#borrowAprGradient)'
                name='Borrow APY'
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
