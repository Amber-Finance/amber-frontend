'use client'

import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

export default function Home() {
  return (
    <>
      <Hero
        title='Liquid Staking.'
        subtitle={<AuroraText>Solid Yields.</AuroraText>}
        description='Bridge your liquid staking tokens and earn maximum yield. Deposit supported assets to earn real yield.'
        stats={[
          {
            value: 0,
            label: 'Total TVL',
            isCurrency: true,
            prefix: '$',
          },
        ]}
      />

      {/* Coming Soon Overlay */}
      <ComingSoonOverlay />
    </>
  )
}
