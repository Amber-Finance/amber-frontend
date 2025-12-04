'use client'

import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import { useTheme } from '@/components/providers/ThemeProvider'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface AreaData {
  dataKey: string
  color: string
  label: string
}

interface Props {
  data: ChartDataPoint[]
  areas: AreaData[]
  yAxisFormatter?: (value: number) => string
  yAxisDomain?: [string, string]
  tooltipType?: 'currency' | 'percentage'
  className?: string
}

export default function BaseAreaChart({
  data,
  areas,
  yAxisFormatter,
  yAxisDomain,
  tooltipType = 'currency',
  className = 'h-[350px] w-full',
}: Props) {
  const { resolvedTheme } = useTheme()
  const tickColor = resolvedTheme === 'dark' ? 'rgb(156, 156, 156)' : 'rgb(120, 85, 50)'

  const chartConfig = areas.reduce(
    (config, area) => {
      config[area.dataKey] = {
        label: area.label,
        color: area.color,
      }
      return config
    },
    {} as Record<string, { label: string; color: string }>,
  )

  return (
    <div className={className}>
      {!data.length ? (
        <div className='flex h-64 items-center justify-center text-muted-foreground'>
          Loading...
        </div>
      ) : (
        <ChartContainer config={chartConfig} className='h-full'>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <defs>
              {areas.map((area) => (
                <linearGradient
                  key={`${area.dataKey}Gradient`}
                  id={`${area.dataKey}Gradient`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='5%' stopColor={area.color} stopOpacity={0.3} />
                  <stop offset='95%' stopColor={area.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey='formattedDate'
              axisLine={true}
              tickLine={false}
              fontSize={10}
              dy={10}
              stroke='rgba(255, 255, 255, 0.06)'
              interval={Math.ceil(data.length / 8)}
              tick={{ fill: tickColor }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={10}
              dy={10}
              stroke='rgba(255, 255, 255, 0.06)'
              interval='preserveStartEnd'
              domain={yAxisDomain}
              tickFormatter={yAxisFormatter}
              tick={{ fill: tickColor }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator='line'
                  isCurrency={tooltipType === 'currency'}
                  isPercentage={tooltipType === 'percentage'}
                />
              }
            />
            {areas.map((area) => (
              <Area
                key={area.dataKey}
                type='monotone'
                dataKey={area.dataKey}
                stroke={area.color}
                fill={`url(#${area.dataKey}Gradient)`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: area.color }}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  )
}
