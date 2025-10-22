'use client'

import { useMemo } from 'react'

import { BigNumber } from 'bignumber.js'

import Hero from '@/components/layout/Hero'
import { StrategiesContent } from '@/components/strategy/StrategiesContent'
import { AuroraText } from '@/components/ui/AuroraText'
import tokens from '@/config/tokens'
import { MAXBTC_DENOM } from '@/constants/query'
import { useMarkets, useMaxBtcApy } from '@/hooks/market'
import { useActiveStrategies } from '@/hooks/portfolio'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/formatting/format'
import { generateStrategies, processStrategies } from '@/utils/strategy/strategyUtils'

// Pure function to create default maxBTC token
const createDefaultMaxBtcToken = () => ({
  chainId: 'neutron-1',
  denom: MAXBTC_DENOM,
  symbol: 'maxBTC',
  icon: '/images/maxBTC.png',
  description: 'Structured Bitcoin',
  decimals: 8,
  isLST: true,
  protocol: 'Structured Finance',
  brandColor: '#F97316',
  origin: {
    chainId: '1',
    tokenAddress: '0x0000000000000000000000000000000000000000', // Factory token on Neutron
  },
  comingSoon: false,
  protocolIconLight: '/images/structured/structuredLight.svg',
  protocolIconDark: '/images/structured/structuredDark.svg',
})

const calculateMarketTotals = (markets: Market[] | null) => {
  if (!markets || markets.length === 0) {
    return {
      totalSupplyUsd: 0,
      totalBorrowUsd: 0,
    }
  }

  let totalSupplyUsd = new BigNumber(0)
  let totalBorrowUsd = new BigNumber(0)

  markets.forEach((market) => {
    // Skip markets without required data
    if (!market.price?.price || !market.metrics) return

    // Calculate total supply (collateral) in USD
    if (market.metrics.collateral_total_amount) {
      const supplyUsd = calculateUsdValueLegacy(
        market.metrics.collateral_total_amount,
        market.price.price,
        market.asset.decimals,
      )
      totalSupplyUsd = totalSupplyUsd.plus(supplyUsd)
    }

    // Calculate total borrows (debt) in USD
    if (market.metrics.debt_total_amount) {
      const borrowUsd = calculateUsdValueLegacy(
        market.metrics.debt_total_amount,
        market.price.price,
        market.asset.decimals,
      )
      totalBorrowUsd = totalBorrowUsd.plus(borrowUsd)
    }
  })

  return {
    totalSupplyUsd: totalSupplyUsd.toNumber(),
    totalBorrowUsd: totalBorrowUsd.toNumber(),
  }
}

export default function StrategiesOverview() {
  // Fetch markets data using the hook
  const { isLoading: marketsLoading, error: marketsError } = useMarkets()
  const { markets } = useStore()

  // Fetch active strategies (uses global portfolio data, refreshed automatically on navigation)
  useActiveStrategies()

  // Fetch maxBTC APY data for strategy supply APY simulation
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()

  // Fallback APY in case API fails
  const effectiveMaxBtcApy = maxBtcError ? 0 : maxBtcApy

  // Use maxBTC for supply APY simulation
  const maxBtcToken = useMemo(
    () =>
      tokens.find((token) => token.symbol.toLowerCase() === 'maxbtc') || createDefaultMaxBtcToken(),
    [],
  )

  // Generate strategies using functional approach
  const strategies: StrategyData[] = useMemo(() => {
    if (!markets || markets.length === 0) {
      return []
    }

    const rawStrategies = generateStrategies(markets, maxBtcToken, tokens, effectiveMaxBtcApy)

    return processStrategies(rawStrategies)
  }, [markets, maxBtcToken, effectiveMaxBtcApy])

  // Calculate market totals for Hero stats
  const marketTotals = useMemo(() => calculateMarketTotals(markets), [markets])

  return (
    <>
      <Hero
        title={<AuroraText>Looping</AuroraText>}
        subtitle='maxBTC Strategies'
        description='Amplify your maxBTC yields with leverage strategies - all with just a few clicks'
        stats={[
          {
            value: marketTotals.totalBorrowUsd,
            label: 'Total Borrow',
            isCurrency: true,
            prefix: '$ ',
          },
          {
            value: marketTotals.totalSupplyUsd,
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
