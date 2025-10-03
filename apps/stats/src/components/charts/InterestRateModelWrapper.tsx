'use client'

import { HelpCircle } from 'lucide-react'

import ChartWrapper from '@/components/charts/ChartWrapper'
import InterestRateChart from '@/components/charts/InterestRateChart'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'

interface Props {
  selectedToken: TokenInfo
  markets: Market[] | null
}

export default function InterestRateModelWrapper({ selectedToken, markets }: Props) {
  const market = markets?.find((market) => market.asset.denom === selectedToken.denom)

  if (!market?.metrics?.interest_rate_model || !market?.params?.red_bank?.borrow_enabled) {
    return null
  }

  return (
    <ChartWrapper
      title={
        <div className='flex items-center justify-between w-full'>
          <span>{selectedToken.symbol} Interest Rate Model</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className='w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help' />
            </TooltipTrigger>
            <TooltipContent className='max-w-[600px] p-3' sideOffset={15} side='bottom' align='end'>
              <p className='mb-1'>How Interest Rate Model Works</p>
              <p className='text-muted-foreground'>
                Interest rates are determined dynamically based on the utilization rate of the
                asset. The utilization rate is the ratio between the total borrowed amount and the
                total supplied amount.
                <br />
                When utilization is below the optimal level (80%), interest rates increase gradually
                to incentivize borrowing. Above the optimal level, rates increase more steeply to
                encourage more deposits and less borrowing, ensuring liquidity for withdrawals.
                <br />
                The model adjusts dynamically to market conditions, targeting an equilibrium that
                maximizes capital efficiency while maintaining adequate liquidity. The reserve
                factor (10%) determines how much of the interest paid by borrowers is kept as
                protocol reserves versus distributed to suppliers.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      }
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
