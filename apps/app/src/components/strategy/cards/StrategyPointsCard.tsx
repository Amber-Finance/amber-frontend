'use client'

import { InfoCard, MetricRow } from '@/components/deposit'

interface StrategyPointsCardProps {
  strategy: Strategy
}

export function StrategyPointsCard({ strategy }: StrategyPointsCardProps) {
  return (
    <InfoCard title='Earning Points'>
      <div className='space-y-3'>
        <div className='text-sm text-muted-foreground/80 leading-relaxed'>
          By deploying this strategy, you automatically farm points for:
        </div>
        <div className='space-y-2'>
          {/* Structured Points - Always show for strategies with 2x multiplier */}
          <MetricRow
            customIcon='/images/structured.svg'
            label='Structured Points'
            value='2x'
            suffix=' multiplier'
            brandColor={strategy.debtAsset.brandColor}
          />
          {/* Mars Fragments */}
          <MetricRow
            customIcon='/images/marsFragments/mars-fragments.svg'
            label='Mars Fragments'
            value=''
            suffix=''
            brandColor={strategy.debtAsset.brandColor}
          />
          {/* Neutron Rewards - Always 1x for strategies */}
          <MetricRow
            customIcon='/images/neutron/neutron.svg'
            label='Neutron Rewards'
            value='1x'
            suffix=' multiplier'
            brandColor={strategy.debtAsset.brandColor}
          />
        </div>
      </div>
    </InfoCard>
  )
}
