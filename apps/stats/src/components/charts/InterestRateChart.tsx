'use client'

import { useMemo } from 'react'

import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartContainer } from '@/components/ui/chart'
import { convertAprToApy } from '@/utils/format'

type InterestRateModelParams = {
  optimal_utilization_rate: string
  base: string
  slope_1: string
  slope_2: string
}

interface Props {
  interestRateModel: InterestRateModelParams
  reserveFactor: number
  currentUtilization: number
  brandColor?: string
}

interface TooltipData {
  utilization: number
  borrowRate: number
  supplyRate: number
  borrowApr: number
  supplyApr: number
}
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TooltipData }>
  brandColor?: string
}

// Default colors
const COLORS = {
  borrowApy: '#ef4444',
  supplyApy: '#F59E0B',
  referenceLine: '#ffff',
} as const

const CustomTooltip = ({ active, payload, brandColor }: CustomTooltipProps) => {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className='grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl'>
      <div>Utilization: {data.utilization}%</div>
      <div className='grid gap-1.5'>
        {[
          { label: 'Borrow APY', value: data.borrowRate, color: COLORS.borrowApy },
          { label: 'Supply APY', value: data.supplyRate, color: brandColor || COLORS.supplyApy },
        ].map(({ label, value, color }) => (
          <div key={label} className='flex w-full flex-wrap items-stretch gap-2'>
            <div className='shrink-0 w-1 rounded-[2px]' style={{ backgroundColor: color }} />
            <div className='flex flex-1 justify-between leading-none gap-4 items-center'>
              <span className='text-muted-foreground'>{label}</span>
              <span className='font-medium tabular-nums text-foreground'>{value.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InterestRateChart({
  interestRateModel,
  reserveFactor,
  currentUtilization,
  brandColor,
}: Props) {
  const interestRateData = useMemo(() => {
    const dataPoints = []
    const optimalUtilizationRate = parseFloat(interestRateModel.optimal_utilization_rate) * 100
    const base = parseFloat(interestRateModel.base) * 100
    const slope1 = parseFloat(interestRateModel.slope_1) * 100
    const slope2 = parseFloat(interestRateModel.slope_2) * 100
    const reserveFactorValue = reserveFactor

    // Generate data points from 0% to 100% utilization with higher density (every 1%)
    for (let i = 0; i <= 100; i += 1) {
      let borrowRate
      if (i <= optimalUtilizationRate) {
        // Before optimal: base + slope1 * (utilization / optimal)
        borrowRate = base + (i / optimalUtilizationRate) * slope1
      } else {
        // After optimal: base + slope1 + slope2 * (utilization - optimal) / (1 - optimal)
        borrowRate =
          base + slope1 + ((i - optimalUtilizationRate) / (100 - optimalUtilizationRate)) * slope2
      }

      const supplyRate = borrowRate * (i / 100) * (1 - reserveFactorValue)
      const borrowApy = convertAprToApy(borrowRate)
      const supplyApy = convertAprToApy(supplyRate)

      dataPoints.push({
        utilization: i,
        utilizationFormatted: `${i}%`,
        borrowRate: borrowApy,
        supplyRate: supplyApy,
      })
    }

    // Add exact points for current utilization and optimal utilization to ensure alignment with reference lines
    // currentUtilization is passed as decimal, convert to percentage for the chart
    const exactCurrentUtil = parseFloat((currentUtilization * 100).toFixed(2))
    if (!dataPoints.some((p) => p.utilization === exactCurrentUtil)) {
      let borrowRate
      if (exactCurrentUtil <= optimalUtilizationRate) {
        borrowRate = base + (exactCurrentUtil / optimalUtilizationRate) * slope1
      } else {
        borrowRate =
          base +
          slope1 +
          ((exactCurrentUtil - optimalUtilizationRate) / (100 - optimalUtilizationRate)) * slope2
      }
      const supplyRate = borrowRate * (exactCurrentUtil / 100) * (1 - reserveFactorValue)

      const borrowApy = convertAprToApy(borrowRate)
      const supplyApy = convertAprToApy(supplyRate)

      dataPoints.push({
        utilization: exactCurrentUtil,
        utilizationFormatted: `${exactCurrentUtil}%`,
        borrowRate: borrowApy,
        supplyRate: supplyApy,
      })
    }

    return dataPoints.sort((a, b) => a.utilization - b.utilization)
  }, [interestRateModel, reserveFactor, currentUtilization])

  // Convert current utilization to percentage for display
  const currentUtilizationValue = parseFloat((currentUtilization * 100).toFixed(2))
  const optimalUtilizationRate = parseFloat(interestRateModel.optimal_utilization_rate) * 100

  const chartConfig = {
    utilizationFormatted: {
      label: 'Utilization',
      color: COLORS.referenceLine,
    },
    borrowRate: {
      label: 'Borrow APY',
      color: COLORS.borrowApy,
    },
    supplyRate: {
      label: 'Supply APY',
      color: brandColor || COLORS.supplyApy,
    },
  }

  return (
    <div className='h-[350px] w-full'>
      {!interestRateData.length ? (
        <div className='flex h-64 items-center justify-center text-muted-foreground'>
          Loading...
        </div>
      ) : (
        <ChartContainer config={chartConfig} className='h-full'>
          <LineChart data={interestRateData} margin={{ top: 40, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
            <XAxis
              dataKey='utilization'
              axisLine={true}
              tickLine={false}
              fontSize={10}
              dy={10}
              stroke='rgba(255, 255, 255, 0.06)'
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              type='number'
              allowDecimals={false}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={10}
              dy={10}
              stroke='rgba(255, 255, 255, 0.06)'
              interval='preserveStartEnd'
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip brandColor={brandColor} />} />

            {/* Current utilization reference line */}
            <ReferenceLine
              x={currentUtilizationValue}
              stroke={COLORS.referenceLine}
              strokeWidth={1.5}
              strokeDasharray='5 5'
              ifOverflow='extendDomain'
              label={{
                value: `Current: ${currentUtilizationValue}%`,
                position: 'top',
                offset: 10,
                fill: COLORS.referenceLine,
                style: {
                  fontSize: 12,
                  fontWeight: 'bold',
                  textAnchor: 'middle',
                },
              }}
            />

            {/* Optimal utilization reference line */}
            <ReferenceLine
              x={optimalUtilizationRate}
              stroke={COLORS.referenceLine}
              strokeWidth={1.5}
              strokeDasharray='3 3'
              ifOverflow='extendDomain'
              label={{
                value: `Optimal: ${optimalUtilizationRate.toFixed(0)}%`,
                position: 'top',
                offset: 10,
                fill: COLORS.referenceLine,
                style: {
                  fontSize: 10,
                  fontWeight: 'bold',
                  textAnchor: 'middle',
                },
              }}
            />

            {/* APY Lines */}
            <Line
              type='monotone'
              dataKey='borrowRate'
              stroke={COLORS.borrowApy}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: COLORS.borrowApy }}
            />
            <Line
              type='monotone'
              dataKey='supplyRate'
              stroke={brandColor || COLORS.supplyApy}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: brandColor || COLORS.supplyApy }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}
