import { Metadata } from 'next'

import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

import { metaData } from '../metadata'

export const metadata: Metadata = metaData.swap

export default function SwapPage() {
  return (
    <>
      <Hero
        title='Swap Assets'
        subtitle={<AuroraText>Instant Exchange</AuroraText>}
        description='Swap between different liquid staking tokens with minimal slippage and competitive rates.'
        stats={[
          {
            value: 0,
            label: '24h Volume',
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
