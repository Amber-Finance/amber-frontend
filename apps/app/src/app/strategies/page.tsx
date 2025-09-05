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
  // Extract token from strategy parameter (e.g., "maxBTC-LBTC" -> "LBTC")
  let tokenSymbol = null
  if (params.strategy) {
    const lastToken = params.strategy.split('-').pop()
    tokenSymbol = lastToken || null
  }
  return generateStrategiesMetadata(tokenSymbol)
}

export default function StrategiesOverview() {
  return (
    <>
      <Hero
        title={<AuroraText>Looping</AuroraText>}
        subtitle='BRT Strategies'
        description='Effortlessly leverage restaking, farm points, arbitrage rates, and more - all with just a few clicks'
        stats={[
          {
            value: 0,
            label: 'Total Borrow',
            isCurrency: true,
            prefix: '$',
          },
          {
            value: 0,
            label: 'Total Supply',
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
