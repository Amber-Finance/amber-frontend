'use client'

import { useMemo } from 'react'

import Hero from '@/components/layout/Hero'
import { StrategiesContent } from '@/components/strategies/StrategiesContent'
import { AuroraText } from '@/components/ui/AuroraText'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { useStore } from '@/store/useStore'
import { generateStrategies, processStrategies } from '@/utils/strategyUtils'

// Pure function to create default WBTC token
const createDefaultWbtcToken = () => ({
  chainId: 'neutron-1',
  denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
  symbol: 'WBTC',
  icon: '/images/WBTC.svg',
  description: 'maxBTC (temporarily WBTC.eureka)',
  decimals: 8,
  isLST: true,
  protocol: 'Eureka',
  brandColor: '#F97316',
})

export default function StrategiesOverview() {
  // Fetch markets data using the hook
  const { isLoading: marketsLoading, error: marketsError } = useMarkets()
  const { markets } = useStore()

  // Fetch maxBTC APY data for strategy supply APY simulation
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()

  // Fallback APY in case API fails
  const effectiveMaxBtcApy = maxBtcError ? 0 : maxBtcApy

  // Use maxBTC (temporarily WBTC.eureka) for supply APY simulation
  const wbtcEurekaToken = useMemo(
    () => tokens.find((token) => token.symbol === 'WBTC') || createDefaultWbtcToken(),
    [],
  )

  // Generate strategies using functional approach
  const strategies: StrategyData[] = useMemo(() => {
    if (!markets || markets.length === 0) {
      return []
    }

    const rawStrategies = generateStrategies(markets, wbtcEurekaToken, tokens, effectiveMaxBtcApy)

    return processStrategies(rawStrategies)
  }, [markets, wbtcEurekaToken, effectiveMaxBtcApy])

  return (
    <>
      <Hero
        title={<AuroraText>Looping</AuroraText>}
        subtitle='BRT Strategies'
        description='Effortlessly leverage arbitrage rates and more - all with just a few clicks'
        stats={[
          {
            value: 0,
            label: 'Total Borrow',
            isCurrency: true,
            prefix: '$ ',
          },
          {
            value: 0,
            label: 'Total Supply',
            isCurrency: true,
            prefix: '$ ',
          },
        ]}
      />

      {/* Strategies Grid - Match yields page structure exactly */}
      <div className='w-full pt-6 pb-2 px-4 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto'>
          <StrategiesContent
            marketsLoading={marketsLoading}
            marketsError={marketsError}
            strategies={strategies}
          />
        </div>
      </div>
    </>
  )
}
