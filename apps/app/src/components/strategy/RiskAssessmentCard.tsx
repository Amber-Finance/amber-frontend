import { Info } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { InfoAlert } from '@/components/ui/InfoAlert'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Separator } from '@/components/ui/separator'

interface RiskAssessmentCardProps {
  strategy: Strategy
  positionCalcs: {
    yieldSpread: number
  }
  collateralSupplyApy: number
  debtBorrowApy: number
  riskStyles: {
    colorClasses: string
    textColor: string
    subtextColor: string
    description: string
  }
  strategyRiskStyles: {
    colorClasses: string
    textColor: string
    subtextColor: string
  }
}

export function RiskAssessmentCard({
  strategy,
  positionCalcs,
  collateralSupplyApy,
  debtBorrowApy,
  riskStyles,
  strategyRiskStyles,
}: RiskAssessmentCardProps) {
  return (
    <InfoCard title='Risk Assessment'>
      <div className='space-y-3 text-xs'>
        {/* Yield Spread - Primary Risk Metric */}
        <div className={`p-3 rounded-lg border ${riskStyles.colorClasses}`}>
          <div className='flex justify-between items-center mb-2'>
            <span className='font-medium text-foreground'>Yield Spread</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-xs max-w-xs'>
                  Difference between underlying staking APY and borrow rate. Negative spread means
                  you pay more to borrow than you earn from staking.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className={`text-lg font-bold ${riskStyles.textColor}`}>
            {positionCalcs.yieldSpread >= 0 ? '+' : ''}
            {(positionCalcs.yieldSpread * 100).toFixed(2)}%
          </div>
          <div className={`text-xs mt-1 ${riskStyles.subtextColor}`}>{riskStyles.description}</div>
        </div>

        {/* Risk Breakdown */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Underlying Staking APY</span>
            <span className='font-medium text-emerald-600 dark:text-emerald-400'>
              {(collateralSupplyApy * 100).toFixed(2)}%
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Borrow Rate</span>
            <span className='font-medium text-orange-600 dark:text-orange-400'>
              {(debtBorrowApy * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <Separator />

        <div className='space-y-1'>
          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Max LTV</span>
            <span className='font-medium text-foreground'>
              {strategy.ltv ? `${(strategy.ltv * 100).toFixed(0)}%` : '80%'}
            </span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-muted-foreground'>Liquidation Threshold</span>
            <span className='font-medium text-foreground'>95%</span>
          </div>
        </div>

        <Separator />

        {/* Strategy Risk Info */}
        <InfoAlert
          title={strategy.isCorrelated ? 'Correlated Asset Strategy' : 'Risk Warning'}
          variant={strategy.isCorrelated ? 'blue' : 'yellow'}
        >
          {strategy.isCorrelated
            ? 'Liquidation occurs when borrow rate > supply rate. Negative yield spread erodes collateral over time, increasing leverage. At max leverage, partial liquidation occurs.'
            : 'Leveraged positions amplify both gains and losses. Monitor your position carefully.'}
        </InfoAlert>
      </div>
    </InfoCard>
  )
}
