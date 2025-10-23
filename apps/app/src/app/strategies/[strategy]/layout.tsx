import { Metadata } from 'next'

import { generateStrategiesMetadata } from '@/app/strategies/generateStrategiesMetadata'

interface StrategyLayoutProps {
  children: React.ReactNode
  params: Promise<{
    strategy: string
  }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ strategy: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  // Extract token from strategy parameter (e.g., "maxBTC-solvBTC" -> "solvBTC")
  let tokenSymbol = null
  if (resolvedParams.strategy) {
    const lastToken = resolvedParams.strategy.split('-').pop()
    tokenSymbol = lastToken || null
  }
  return generateStrategiesMetadata(tokenSymbol)
}

export default function StrategyLayout({ children }: StrategyLayoutProps) {
  return <>{children}</>
}
