'use client'

import ChartWrapper from '@/components/charts/ChartWrapper'
import InterestRateChart from '@/components/charts/InterestRateChart'

interface InterestRateModelChartProps {
  selectedToken: TokenInfo
  markets: Market[] | null
}

export default function InterestRateModelChart({
  selectedToken,
  markets,
}: InterestRateModelChartProps) {
  const market = markets?.find((market) => market.asset.denom === selectedToken.denom)

  if (!market?.metrics?.interest_rate_model || !market?.params?.red_bank?.borrow_enabled) {
    return null
  }

  return (
    <ChartWrapper
      title={`${selectedToken.symbol} Interest Rate Model`}
      showTimeRangeSelector={false}
    >
      <InterestRateChart
        interestRateModel={market.metrics.interest_rate_model}
        reserveFactor={parseFloat(market.metrics.reserve_factor || '0') / 100}
        currentUtilization={parseFloat(market.metrics.utilization_rate || '0')}
        brandColor={selectedToken.brandColor}
      />
    </ChartWrapper>
  )
}
