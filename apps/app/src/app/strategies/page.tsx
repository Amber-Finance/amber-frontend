import { Metadata } from 'next'

import StrategiesOverview from '@/app/strategies/StrategiesOverview'
import { generateStrategiesMetadata } from '@/app/strategies/generateStrategiesMetadata'

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

export default function StrategiesPage() {
  return <StrategiesOverview />
}
