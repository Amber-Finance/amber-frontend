'use client'

import { NeutronRewardsBadge } from '@/components/common/NeutronRewardsBadge'
import { InfoCard, MetricRow } from '@/components/deposit'

interface StrategyPointsCardProps {
  strategy: Strategy
}

export function StrategyPointsCard({ strategy }: StrategyPointsCardProps) {
  return (
    <InfoCard title='Additional Rewards'>
      <div className='space-y-4'>
        {/* Earning Points Section */}
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
          </div>
        </div>

        {/* Neutron Rewards APY Section */}
        <div className='pt-3 border-t border-border/20'>
          <NeutronRewardsBadge
            symbol={`maxbtc-${strategy.debtAsset.symbol.toLowerCase()}`}
            variant='default'
          />
        </div>
      </div>
    </InfoCard>
  )
}
