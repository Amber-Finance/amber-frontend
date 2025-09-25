'use client'

import { ReactNode, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/ui'

interface ChartWrapperProps {
  title: string
  children: ReactNode
  className?: string
  onTimeRangeChange?: (timeRange: string) => void
  defaultTimeRange?: string
  showTimeRangeSelector?: boolean
  tabs?: {
    value: string
    label: string
  }[]
  activeTab?: string
  onTabChange?: (value: string) => void
}

export default function ChartWrapper({
  title,
  children,
  className = '',
  onTimeRangeChange,
  defaultTimeRange = '7',
  showTimeRangeSelector = true,
  tabs,
  activeTab,
  onTabChange,
}: ChartWrapperProps) {
  const [timeRange, setTimeRange] = useState(defaultTimeRange)

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    onTimeRangeChange?.(value)
  }

  return (
    <Card className={cn('bg-card/20 w-full', className)}>
      <CardHeader className='flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-b border-border/40'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1'>
          {tabs && tabs.length > 0 ? (
            <div className='bg-card/20 backdrop-blur-lg rounded-lg p-1'>
              <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className='bg-transparent p-0'>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className='text-sm font-bold'>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          ) : (
            <CardTitle className='text-sm font-bold text-foreground text-center sm:text-left'>
              {title}
            </CardTitle>
          )}
        </div>
        {showTimeRangeSelector && (
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className='w-[160px] rounded-lg' aria-label='Select a value'>
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
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
