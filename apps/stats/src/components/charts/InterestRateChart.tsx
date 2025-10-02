'use client'

import { useMemo } from 'react'

import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'

import { ChartContainer } from '@/components/ui/chart'

type InterestRateModelParams = {
  optimal_utilization_rate: string
  base: string
  slope_1: string
  slope_2: string
}

interface InterestRateChartProps {
  interestRateModel: InterestRateModelParams
  reserveFactor: number
  currentUtilization: number
  brandColor?: string
}

const convertFromAprToApy = (apr: number): number => {
  const compoundingPeriods = 365 // Daily compounding
  const aprDecimal = apr / 100
  const apy = (Math.pow(1 + aprDecimal / compoundingPeriods, compoundingPeriods) - 1) * 100
  return parseFloat(apy.toFixed(2))
}

const CustomTooltip = ({ active, payload, label, brandColor }: any) => {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className='grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl'>
      <div className='font-medium'>Utilization: {data.utilization}%</div>
      <div className='grid gap-1.5'>
        {[
          { label: 'Borrow APY', value: data.borrowRate, color: '#ef4444' },
          { label: 'Supply APY', value: data.supplyRate, color: brandColor || '#F59E0B' },
          { label: 'Borrow APR', value: data.borrowApr, color: '#fca5a5' },
          {
            label: 'Supply APR',
            value: data.supplyApr,
            color: brandColor ? `${brandColor}80` : '#FDE68A',
          },
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
}: InterestRateChartProps) {
  const interestRateData = useMemo(() => {
    const dataPoints = []

    // Get interest rate model parameters
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

      const borrowApy = convertFromAprToApy(borrowRate)
      const supplyApy = convertFromAprToApy(supplyRate)

      dataPoints.push({
        utilization: i,
        utilizationFormatted: `${i}%`,
        borrowApr: parseFloat(borrowRate.toFixed(2)),
        supplyApr: parseFloat(supplyRate.toFixed(2)),
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

      const borrowApy = convertFromAprToApy(borrowRate)
      const supplyApy = convertFromAprToApy(supplyRate)

      dataPoints.push({
        utilization: exactCurrentUtil,
        utilizationFormatted: `${exactCurrentUtil}%`,
        borrowApr: parseFloat(borrowRate.toFixed(2)),
        supplyApr: parseFloat(supplyRate.toFixed(2)),
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
      color: '#ffff',
    },
    borrowRate: {
      label: 'Borrow APY',
      color: '#ef4444',
    },
    supplyRate: {
      label: 'Supply APY',
      color: brandColor || '#F59E0B',
    },
    borrowApr: {
      label: 'Borrow APR',
      color: '#fca5a5',
    },
    supplyApr: {
      label: 'Supply APR',
      color: brandColor ? `${brandColor}80` : '#FDE68A',
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
              stroke='#ffff'
              strokeWidth={1.5}
              strokeDasharray='5 5'
              ifOverflow='extendDomain'
              label={{
                value: `Current: ${currentUtilizationValue}%`,
                position: 'top',
                offset: 10,
                fill: '#ffff',
                style: {
                  fontSize: 10,
                  fontWeight: 'bold',
                  textAnchor: 'middle',
                },
              }}
            />

            {/* Optimal utilization reference line */}
            <ReferenceLine
              x={optimalUtilizationRate}
              stroke='#ffff'
              strokeWidth={1.5}
              strokeDasharray='3 3'
              ifOverflow='extendDomain'
              label={{
                value: `Optimal: ${optimalUtilizationRate.toFixed(0)}%`,
                position: 'top',
                offset: 10,
                fill: '#ffff',
                style: {
                  fontSize: 10,
                  fontWeight: 'bold',
                  textAnchor: 'middle',
                },
              }}
            />

            {/* APR Lines */}
            <Line
              type='monotone'
              dataKey='borrowApr'
              stroke='#fca5a5'
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: '#fca5a5' }}
            />
            <Line
              type='monotone'
              dataKey='supplyApr'
              stroke={brandColor ? `${brandColor}80` : '#FDE68A'}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: brandColor ? `${brandColor}80` : '#FDE68A' }}
            />

            {/* APY Lines */}
            <Line
              type='monotone'
              dataKey='borrowRate'
              stroke='#ef4444'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#ef4444' }}
            />
            <Line
              type='monotone'
              dataKey='supplyRate'
              stroke={brandColor || '#F59E0B'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: brandColor || '#F59E0B' }}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}
