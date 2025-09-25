'use client'

import { useState } from 'react'

import AllMarketsBarChart from '@/components/charts/AllMarketsBarChart'
import ChartWrapper from '@/components/charts/ChartWrapper'
import ProtocolTotalsLineChart from '@/components/charts/ProtocolTotalsLineChart'

export default function CombinedChartsWithTabs() {
  const [activeTab, setActiveTab] = useState('assets')
  const [timeRange, setTimeRange] = useState('7')

  const tabs = [
    { value: 'assets', label: 'Asset Totals' },
    { value: 'protocol', label: 'Protocol Totals' },
  ]

  return (
    <ChartWrapper
      title=''
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onTimeRangeChange={setTimeRange}
    >
      {activeTab === 'assets' ? (
        <AllMarketsBarChart timeRange={timeRange} />
      ) : (
        <ProtocolTotalsLineChart timeRange={timeRange} />
      )}
    </ChartWrapper>
  )
}
