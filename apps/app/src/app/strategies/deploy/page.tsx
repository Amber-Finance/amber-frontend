import { Metadata } from 'next'

import { generateStrategiesMetadata } from '@/app/strategies/generateStrategiesMetadata'
import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ strategy?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  // Extract token from strategy parameter (e.g., "maxBTC-eBTC" -> "eBTC")
  let tokenSymbol = null
  if (params.strategy) {
    const lastToken = params.strategy.split('-').pop()
    tokenSymbol = lastToken || null
  }
  return generateStrategiesMetadata(tokenSymbol)
}

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
