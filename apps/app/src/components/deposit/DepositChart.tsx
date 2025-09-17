'use client'

import { useMemo, useState } from 'react'

import BigNumber from 'bignumber.js'
import moment from 'moment'

import { BaseChart } from '@/components/common/chart/BaseChart'
import useAssetsApr from '@/hooks/redBank/useAssetsApr'
import useDenomData from '@/hooks/redBank/useDenomData'
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

export function DepositChart({ denom, brandColor, className }: ChartProps) {
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
      dataMap.get(dateKey).supplyApr = convertAprToApy(parseFloat(point.value) / 100)
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

  const yAxes = [
    {
      yAxisId: 'apy',
      orientation: 'left' as const,
      tickFormatter: (value: string) => `${value}%`,
    },
    {
      yAxisId: 'tvl',
      orientation: 'right' as const,
      tickFormatter: (value: string) => `$${value.toLocaleString()}`,
    },
  ]

  const areas = [
    {
      yAxisId: 'tvl',
      dataKey: 'tvl',
      name: 'TVL',
      gradientId: 'tvlGradient',
    },
    {
      yAxisId: 'apy',
      dataKey: 'supplyApr',
      name: 'Deposit APY',
      gradientId: 'supplyAprGradient',
    },
  ]

  return (
    <BaseChart
      title='Total Value Locked & Deposit APY'
      chartData={chartData}
      chartConfig={chartConfig}
      yAxes={yAxes}
      areas={areas}
      brandColor={brandColor}
      className={className}
      isLoading={isLoading}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    />
  )
}
