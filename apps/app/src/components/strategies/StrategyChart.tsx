'use client'

import { useMemo, useState } from 'react'

import moment from 'moment'

import { BaseChart } from '@/components/common/chart/BaseChart'
import useAssetsApr from '@/hooks/redBank/useAssetsApr'
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

  const yAxes = [
    {
      yAxisId: 'borrowApr',
      orientation: 'left' as const,
      tickFormatter: (value: string) => `${value}%`,
    },
    {
      yAxisId: 'maxBtcBorrowApr',
      orientation: 'right' as const,
      tickFormatter: (value: string) => `${value}%`,
    },
  ]

  const areas = [
    {
      yAxisId: 'borrowApr',
      dataKey: 'borrowApr',
      name: `${symbol} Borrow APY`,
      gradientId: 'borrowAprGradient',
    },
    {
      yAxisId: 'maxBtcBorrowApr',
      dataKey: 'maxBtcBorrowApr',
      name: 'MaxBTC Borrow APY',
      gradientId: 'maxBtcBorrowAprGradient',
    },
  ]

  return (
    <BaseChart
      title={`${symbol} Borrow APY & MaxBTC Borrow APY`}
      chartData={chartData}
      chartConfig={chartConfig}
      yAxes={yAxes}
      areas={areas}
      brandColor={brandColor}
      className={className}
      isLoading={isLoading}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      isPercentage={true}
    />
  )
}
