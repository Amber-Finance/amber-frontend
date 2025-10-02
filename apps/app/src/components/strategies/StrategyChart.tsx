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
  supplyApy?: number // MaxBTC supply APY from strategy
  currentBorrowApy?: number // Current borrow APY to replace the last data point
}

export function StrategyChart({
  denom,
  brandColor,
  className,
  symbol,
  supplyApy,
  currentBorrowApy,
}: StrategyChartProps) {
  const [timeRange, setTimeRange] = useState('30')

  const chartConfig = useMemo(
    () => ({
      borrowApr: {
        label: 'Debt Borrow APY',
        color: brandColor || '#f57136',
      },
      maxBtcSupplyApr: {
        label: 'MaxBTC Underlying Staking APY',
        color: '#6B7289',
      },
    }),
    [brandColor],
  )

  const { data: assetsApr, isLoading: aprLoading } = useAssetsApr(denom, parseInt(timeRange))
  const assetAprData = assetsApr?.[0]?.borrow_apr || []

  const isLoading = aprLoading

  const chartData = useMemo(() => {
    if (!assetAprData || assetAprData.length === 0) return []

    const dataMap = new Map()

    // Asset Borrow APR - create historical data points
    assetAprData.forEach((point: { date: string; value: string }) => {
      const dateKey = moment(point.date).format('YYYY-MM-DD')
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: new Date(point.date),
          formattedDate: moment(point.date).format('MMM DD'),
          borrowApr: 0,
          maxBtcSupplyApr: 0,
        })
      }

      dataMap.get(dateKey).borrowApr = parseFloat(convertAprToApy(parseFloat(point.value) / 100))
      dataMap.get(dateKey).maxBtcSupplyApr = 0
    })

    const sortedData = Array.from(dataMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )

    // Replace ONLY the last data point with current APY values
    if (sortedData.length > 0) {
      const lastIndex = sortedData.length - 1
      const lastDataPoint = sortedData[lastIndex]

      // Create updated last data point with current APYs
      sortedData[lastIndex] = {
        ...lastDataPoint,
        borrowApr:
          currentBorrowApy !== undefined ? currentBorrowApy * 100 : lastDataPoint.borrowApr,
        maxBtcSupplyApr: supplyApy !== undefined ? supplyApy * 100 : 0,
        date: new Date(), // Use current date for the last point
        formattedDate: moment().format('MMM DD'), // Current date formatting
      }
    }

    return sortedData
  }, [assetAprData, supplyApy, currentBorrowApy])

  const yAxes = [
    {
      yAxisId: 'left',
      orientation: 'left' as const,
      tickFormatter: (value: string) => `${value}%`,
    },
  ]

  const areas = [
    {
      yAxisId: 'left',
      dataKey: 'borrowApr',
      name: `${symbol} Borrow APY`,
      gradientId: 'borrowAprGradient',
    },
    {
      yAxisId: 'left',
      dataKey: 'maxBtcSupplyApr',
      name: 'MaxBTC Underlying Staking APY',
      gradientId: 'maxBtcSupplyAprGradient',
    },
  ]

  return (
    <BaseChart
      title={`${symbol} Borrow APY & MaxBTC Underlying Staking APY`}
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
