'use client'

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
import { cn } from '@/lib/utils'

interface BaseChartProps {
  title: string
  chartData: ChartData[]
  chartConfig: ChartConfig
  yAxes: YAxisConfig[]
  areas: Array<{
    yAxisId: string
    dataKey: string
    name: string
    gradientId: string
  }>
  brandColor?: string
  className?: string
  isLoading?: boolean
  timeRange: string
  onTimeRangeChange: (value: string) => void
  isPercentage?: boolean
}

export function BaseChart({
  title,
  chartData,
  chartConfig,
  yAxes,
  areas,
  brandColor,
  className,
  isLoading = false,
  timeRange,
  onTimeRangeChange,
  isPercentage = false,
}: BaseChartProps) {
  if (!isLoading && (!chartData || chartData.length === 0)) {
    return null
  }

  return (
    <Card className='bg-card/20 pt-0 w-full min-w-0'>
      <CardHeader className='flex items-center border-b border-border/40 pt-6'>
        <CardTitle className='text-sm font-bold text-foreground'>{title}</CardTitle>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className='w-[160px] rounded-lg ml-auto' aria-label='Select a value'>
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
        <div className='w-full h-[350px] overflow-hidden'>
          {isLoading ? (
            <div className='flex items-center justify-center w-full h-full text-muted-foreground'>
              Loading...
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className={cn(className, 'w-full h-full')}
              style={Object.keys(chartConfig).reduce(
                (acc, key) => {
                  // First area gets brand color, second area gets gray color
                  const isFirstArea = areas.length > 0 && areas[0].dataKey === key
                  if (isFirstArea) {
                    acc[`--color-${key}`] = brandColor || '#f57136'
                  } else {
                    acc[`--color-${key}`] = '#6B7280'
                  }
                  return acc
                },
                {} as Record<string, string>,
              )}
            >
              <AreaChart data={chartData} margin={{ top: 10, right: -10, left: -10, bottom: 10 }}>
                <defs>
                  {areas.map((area) => (
                    <linearGradient
                      key={area.gradientId}
                      id={area.gradientId}
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='5%'
                        stopColor={`var(--color-${area.dataKey})`}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset='95%'
                        stopColor={`var(--color-${area.dataKey})`}
                        stopOpacity={0}
                      />
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
                  interval='preserveStartEnd'
                />
                {yAxes.map((yAxis) => (
                  <YAxis
                    key={yAxis.yAxisId}
                    yAxisId={yAxis.yAxisId}
                    orientation={yAxis.orientation}
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    stroke='rgba(255, 255, 255, 0.06)'
                    tickFormatter={yAxis.tickFormatter}
                  />
                ))}

                <ChartTooltip
                  content={<ChartTooltipContent indicator='line' isPercentage={isPercentage} />}
                />
                {areas.map((area) => (
                  <Area
                    key={area.dataKey}
                    yAxisId={area.yAxisId}
                    type='monotone'
                    dataKey={area.dataKey}
                    stroke={`var(--color-${area.dataKey})`}
                    strokeWidth={2}
                    fill={`url(#${area.gradientId})`}
                    name={area.name}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
