'use client'

import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

export default function StrategyDeployPage() {
  return (
    <>
      <Hero
        title={<AuroraText>Deploy Strategy</AuroraText>}
        subtitle='Leverage Your Position'
        description='Deploy your leverage strategy with just a few clicks. Set your parameters and start earning amplified yields.'
        stats={[
          {
            value: 0,
            label: 'Active Strategies',
            isCurrency: false,
            prefix: '',
          },
        ]}
      />

      {/* Coming Soon Overlay */}
      <ComingSoonOverlay />
    </>
  )
}
