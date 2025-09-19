'use client'

import { useMemo, useState } from 'react'

import BigNumber from 'bignumber.js'
import moment from 'moment'

import { BaseChart } from '@/components/common/chart/BaseChart'
import useAssetsApr from '@/hooks/redBank/useAssetsApr'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import useDenomData from '@/hooks/redBank/useDenomData'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/finance'

interface ChartProps {
  denom: string
  brandColor?: string
  className?: string
}

export function DepositChart({ denom, brandColor, className }: ChartProps) {
  const [timeRange, setTimeRange] = useState('7')

  const { data: assetMetrics, isLoading: tvlLoading } = useDenomData(denom, parseInt(timeRange))
  const { data: assetsApr, isLoading: aprLoading } = useAssetsApr(denom, parseInt(timeRange))
  const { data: assetsTvl } = useAssetsTvl()
  const tvlData = assetMetrics?.tvl_historical
  const aprData = assetsApr?.[0]?.supply_apr || []

  // Get live market data from store
  const { markets } = useStore()
  const currentMarket = markets?.find((market) => market.asset.denom === denom)

  const chartConfig = useMemo(
    () => ({
      supplyApr: {
        label: 'Deposit APY',
        color: '#6B7289',
      },
      tvl: {
        label: 'TVL',
        color: brandColor || '#f57136',
      },
    }),
    [brandColor],
  )

  // Get live TVL data from API
  const currentTokenTvlData = assetsTvl?.assets?.find((asset: any) => asset.denom === denom)

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
      dataMap.get(dateKey).supplyApr = parseFloat(convertAprToApy(parseFloat(point.value) / 100))
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

    // Sort the data by date
    const sortedData = Array.from(dataMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )

    // Replace the last data point with live data if available
    if (sortedData.length > 0 && currentMarket) {
      const lastIndex = sortedData.length - 1
      const today = new Date()

      // Get live APY from current market
      const liveSupplyApr = currentMarket.metrics?.liquidity_rate
        ? parseFloat(convertAprToApy(parseFloat(currentMarket.metrics.liquidity_rate)))
        : sortedData[lastIndex].supplyApr

      // Get live TVL from API data (same as DepositCard and DepositClient)
      const liveTvl = currentTokenTvlData?.tvl
        ? new BigNumber(currentTokenTvlData.tvl).shiftedBy(-6).toNumber()
        : sortedData[lastIndex].tvl

      // Update the last data point with live data
      sortedData[lastIndex] = {
        date: today,
        formattedDate: moment(today).format('MMM DD'),
        supplyApr: liveSupplyApr,
        tvl: liveTvl,
      }
    }

    return sortedData
  }, [aprData, tvlData, currentMarket, currentTokenTvlData])

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
