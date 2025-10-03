'use client'

import { use, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import StrategyDeployClient from '@/app/strategies/deploy/StrategyDeployClient'
import tokens from '@/config/tokens'
import { MAXBTC_DENOM } from '@/constants/query'
import { useMarkets } from '@/hooks'
import { useActiveStrategies } from '@/hooks/usePortfolioData'
import { usePrices } from '@/hooks/usePrices'
import { useStore } from '@/store/useStore'

interface StrategyPageProps {
  params: Promise<{
    strategy: string
  }>
}

export default function StrategyPage({ params }: StrategyPageProps) {
  const router = useRouter()
  const [strategy, setStrategy] = useState<Strategy | null>(null)

  // Unwrap params Promise using React.use()
  const resolvedParams = use(params)

  const { isLoading: marketsLoading } = useMarkets()
  const { markets, cacheStrategy, getCachedStrategy } = useStore()

  // Ensure all required data is fetched when visiting strategy page
  useActiveStrategies() // Uses global portfolio data (refreshed automatically on navigation)
  usePrices() // Fetch current prices

  useEffect(() => {
    // Parse strategy from URL params (e.g., maxBTC-WBTC)
    const strategyId = resolvedParams.strategy
    if (!strategyId) {
      router.push('/strategies')
      return
    }

    const [collateralSymbol, debtSymbol] = strategyId.split('-')
    if (!collateralSymbol || !debtSymbol) {
      router.push('/strategies')
      return
    }

    // Try to get cached strategy first
    const cachedStrategy = getCachedStrategy(strategyId)
    if (cachedStrategy) {
      setStrategy(cachedStrategy)
      return
    }

    // If no cache available, wait for markets to load before proceeding
    if (marketsLoading) {
      return
    }

    // Find collateral token (maxBTC for looping strategies)
    const collateralToken = tokens.find((token) => token.symbol === collateralSymbol) || {
      chainId: 'neutron-1',
      denom: MAXBTC_DENOM,
      symbol: 'maxBTC',
      icon: '/images/maxBTC.png',
      description: 'Structured Bitcoin',
      decimals: 8,
      isLST: true,
      protocol: 'Structured Finance',
      brandColor: '#F97316',
      protocolIconLight: '/images/structured/structuredLight.svg',
      protocolIconDark: '/images/structured/structuredDark.svg',
      origin: {
        chainId: '1',
        tokenAddress: '0x0000000000000000000000000000000000000000',
      },
      comingSoon: false,
    }

    // Find debt token
    const debtToken = tokens.find((token) => token.symbol === debtSymbol)
    if (!debtToken) {
      router.push('/strategies')
      return
    }

    // Find debt market for real data - only check after markets have loaded
    const debtMarket = markets?.find((market) => market.asset.symbol === debtSymbol)
    if (!debtMarket) {
      router.push('/strategies')
      return
    }

    // Find collateral market for real data (might not exist for maxBTC)
    const collateralMarket = markets?.find((market) => market.asset.symbol === collateralSymbol)

    const strategyInstance: Strategy = {
      id: strategyId,
      type: 'leverage',
      collateralAsset: collateralToken,
      debtAsset: debtToken,
      maxROE: 0,
      isPositive: true,
      hasPoints: false,
      rewards: '',
      multiplier: 1,
      isCorrelated: true,
      liquidity: 0,
      liquidityDisplay: 'High',
      subText: `Long ${collateralSymbol}`,
      supplyApy: 0,
      borrowApy: 0,
      netApy: 0,
      ltv: collateralMarket ? parseFloat(collateralMarket.params?.max_loan_to_value || '0.8') : 0.8,
      liquidationThreshold: collateralMarket
        ? parseFloat(collateralMarket.params?.liquidation_threshold || '0.85')
        : 0.85,
      maxLeverage: collateralMarket
        ? parseFloat(collateralMarket.params?.max_loan_to_value || '0.8') * 10
        : 5,
      maxBorrowCapacityUsd: 0,
      maxPositionSizeUsd: 0,
      collateralStakingApy: 0,
      collateralTotalApy: 0,
      debtStakingApy: 0,
      debtNetCost: 0,
      hasStakingData: false,
    }

    setStrategy(strategyInstance)

    cacheStrategy(strategyId, strategyInstance)
  }, [resolvedParams.strategy, markets, marketsLoading, router, cacheStrategy, getCachedStrategy])

  if (!strategy) {
    return (
      <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
        <div className='bg-card rounded-lg p-6 text-center'>
          <h2 className='text-xl font-bold text-foreground mb-2'>
            {marketsLoading ? 'Loading Strategy...' : 'Loading Strategy Configuration...'}
          </h2>
          <p className='text-muted-foreground'>
            {marketsLoading
              ? 'Fetching market data and strategy details...'
              : 'Please wait while we load the strategy details.'}
          </p>
        </div>
      </div>
    )
  }

  return <StrategyDeployClient strategy={strategy} />
}
