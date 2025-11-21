'use client'

import { useMemo } from 'react'

import { BigNumber } from 'bignumber.js'

import Hero from '@/components/layout/Hero'
import { StrategiesContent } from '@/components/strategy/StrategiesContent'
import { AuroraText } from '@/components/ui/AuroraText'
import tokens from '@/config/tokens'
import { MAXBTC_DENOM } from '@/constants/query'
import { useMarkets, useMaxBtcApy, useTokenSupplies } from '@/hooks/market'
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
  protocolIconLight: '/images/structured.svg',
  protocolIconDark: '/images/structured.svg',
})

const calculateMarketTotals = (
  markets: Market[] | null,
): {
  totalSupplyUsd: number | null
  totalBorrowUsd: number | null
} => {
  if (!markets || markets.length === 0) {
    return {
      totalSupplyUsd: null,
      totalBorrowUsd: null,
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

  // Fetch maxBTC APY data for strategy supply APY simulation
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()

  // Fetch token supplies from credit manager contract
  const { tokenSupplies, isLoading: isLoadingSupplies } = useTokenSupplies()

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
  // Return null when loading
  const marketTotals = useMemo(() => {
    if (marketsLoading) {
      return {
        totalSupplyUsd: null,
        totalBorrowUsd: null,
      }
    }
    return calculateMarketTotals(markets)
  }, [markets, marketsLoading])

  const totalMaxBtcCollateral = useMemo(() => {
    // Return null if loading or no data
    if (isLoadingSupplies || !markets || markets.length === 0) {
      return null
    }

    // Find maxBTC market for price data
    const maxBtcMarket = markets.find((market) => market.asset.denom === MAXBTC_DENOM)

    // Skip if market doesn't have required price data
    if (!maxBtcMarket?.price?.price) {
      return null
    }

    // Get maxBTC balance from token supplies (credit manager contract balance)
    const maxBtcBalance = tokenSupplies[MAXBTC_DENOM] || '0'

    // Calculate USD value
    const maxBtcCollateralUsd = calculateUsdValueLegacy(
      maxBtcBalance,
      maxBtcMarket.price.price,
      maxBtcMarket.asset.decimals,
    )

    return maxBtcCollateralUsd
  }, [markets, tokenSupplies, isLoadingSupplies])

  return (
    <>
      <Hero
        title={<AuroraText>Looping</AuroraText>}
        subtitle='maxBTC Strategies'
        description='Amplify your maxBTC yields with leverage strategies - all with just a few clicks'
        stats={[
          {
            value: marketTotals.totalBorrowUsd,
            label: 'Total Borrowed',
            isCurrency: true,
            prefix: '$ ',
          },
          {
            value: marketTotals.totalSupplyUsd,
            label: 'Total Supplied',
            isCurrency: true,
            prefix: '$ ',
          },
          {
            value: totalMaxBtcCollateral,
            label: 'maxBTC Supplied',
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
