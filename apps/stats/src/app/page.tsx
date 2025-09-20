'use client'

import { useMemo } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { BigNumber } from 'bignumber.js'

import AllMarketsBarChart from '@/components/AllMarketsBarChart'
import TokenIconsRow from '@/components/TokenIconsRow'
import TokenMetricsCards from '@/components/TokenMetricsCards'
import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

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

export default function Home() {
  useMarkets()
  const { markets } = useStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get selected token from URL params, default to first token
  const selectedTokenSymbol = searchParams.get('token') || tokens[0]?.symbol || 'LBTC'
  const selectedToken = tokens.find((token) => token.symbol === selectedTokenSymbol) || tokens[0]

  const handleTokenSelect = (tokenSymbol: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('token', tokenSymbol)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  console.log(markets, 'markets')
  const marketTotals = useMemo(() => calculateMarketTotals(markets), [markets])

  return (
    <div className='space-y-8'>
      <Hero
        title='Stats'
        subtitle={<AuroraText>Dashboard</AuroraText>}
        description='Analytics and monitoring dashboard of Amber Finance.'
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
      <AllMarketsBarChart />
      <TokenIconsRow selectedToken={selectedToken} onTokenSelect={handleTokenSelect} />
      <TokenMetricsCards selectedToken={selectedToken} markets={markets} />
    </div>
  )
}
