'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { BigNumber } from 'bignumber.js'

import StrategyDeployClient from '@/app/strategies/deploy/StrategyDeployClient'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks'
import { useStore } from '@/store/useStore'

export default function StrategyDeployPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [strategy, setStrategy] = useState<Strategy | null>(null)

  useMarkets()
  const { markets } = useStore()

  useEffect(() => {
    // Parse strategy from URL params (e.g., ?strategy=WBTC-eBTC)
    const strategyId = searchParams.get('strategy')
    if (!strategyId) {
      router.push('/strategies')
      return
    }

    const [collateralSymbol, debtSymbol] = strategyId.split('-')
    if (!collateralSymbol || !debtSymbol) {
      router.push('/strategies')
      return
    }

    // Find collateral token (WBTC.eureka has better liquidity than Axelar bridge)
    const collateralToken = tokens.find((token) => token.symbol === collateralSymbol) || {
      chainId: 'neutron-1',
      denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
      symbol: 'WBTC',
      icon: '/images/WBTC.svg',
      description: 'Wrapped Bitcoin (Eureka)',
      decimals: 8,
      isLST: true,
      protocol: 'Eureka',
      brandColor: '#F97316',
    }

    // Find debt token
    const debtToken = tokens.find((token) => token.symbol === debtSymbol)
    if (!debtToken) {
      router.push('/strategies')
      return
    }

    // Find debt market for real data
    const debtMarket = markets?.find((market) => market.asset.symbol === debtSymbol)
    if (!debtMarket) {
      router.push('/strategies')
      return
    }

    // Find collateral market for LTV calculation (this determines max leverage)
    const collateralMarket = markets?.find((market) => market.asset.denom === collateralToken.denom)
    if (!collateralMarket) {
      router.push('/strategies')
      return
    }

    // Use same approach as strategies page - mock values for WBTC.eureka
    // WBTC.eureka mock values - use realistic supply rate (higher than BTC LST borrow rates)
    const collateralSupplyApy = 0.065 // 6.5% APY mock supply rate for WBTC.eureka

    // Total supply APY (no staking - just supply APY)
    const collateralTotalApy = collateralSupplyApy

    // Get real borrow APY for debt asset (use raw market rate, already in decimal format)
    const debtBorrowApy = parseFloat(debtMarket.metrics.borrow_rate || '0')

    // No staking APY - just borrow APY

    // Calculate base net APY for 1x leverage (no looping)
    const netApy = collateralTotalApy - debtBorrowApy
    // Use COLLATERAL asset's LTV for max leverage calculation, not debt asset's LTV
    const maxLTV = parseFloat(collateralMarket.params.max_loan_to_value || '0.8')
    const maxLeverage = 1 / (1 - maxLTV)
    const liquidationThreshold = parseFloat(debtMarket.params.liquidation_threshold || '0.85')

    // Console log deploy page maxLTV values
    console.log(`🚀 Deploy Page Strategy ${strategyId}:`, {
      maxLTV,
      collateralRawMaxLoanToValue: collateralMarket.params.max_loan_to_value,
      debtRawMaxLoanToValue: debtMarket.params.max_loan_to_value,
      calculatedMaxLeverage: maxLeverage,
      collateralSymbol: collateralSymbol,
      collateralDenom: collateralToken.denom,
      debtSymbol: debtSymbol,
      debtDenom: debtMarket.asset.denom,
    })

    // Calculate available liquidity
    const totalCollateral = new BigNumber(debtMarket.metrics.collateral_total_amount || '0')
    const totalDebt = new BigNumber(debtMarket.metrics.debt_total_amount || '0')
    const availableLiquidity = BigNumber.max(0, totalCollateral.minus(totalDebt)).toNumber()

    const strategyData: Strategy = {
      id: strategyId,
      type: 'multiply',
      collateralAsset: {
        denom: collateralToken.denom,
        symbol: collateralToken.symbol,
        name: collateralToken.description,
        description: collateralToken.description,
        decimals: collateralToken.decimals,
        icon: collateralToken.icon,
        brandColor: collateralToken.brandColor,
      },
      debtAsset: {
        denom: debtToken.denom,
        symbol: debtToken.symbol,
        name: debtToken.description,
        description: debtToken.description,
        decimals: debtToken.decimals,
        icon: debtToken.icon,
        brandColor: debtToken.brandColor,
      },
      maxROE: netApy * 100,
      isPositive: netApy > 0,
      hasPoints: false,
      rewards: '',
      multiplier: 2.0,
      isCorrelated: true,
      liquidity: availableLiquidity,
      liquidityDisplay: `$${(availableLiquidity / 1000000).toFixed(1)}M`,
      subText: `${(netApy * 100).toFixed(2)}% Net APY`,

      // Enhanced metrics for Δs (already in decimal format like StrategyCard)
      supplyApy: collateralSupplyApy, // Already in decimal format (0.065 = 6.5%)
      borrowApy: debtBorrowApy, // Market rate already in decimal format
      netApy: netApy, // Already in decimal format
      ltv: maxLTV,
      liquidationThreshold,

      // Additional strategy metadata
      maxLeverage,
      maxBorrowCapacityUsd: availableLiquidity,
      maxPositionSizeUsd: availableLiquidity * 2,

      // APY breakdown (supply minus borrow - no staking)
      collateralStakingApy: 0,
      collateralTotalApy: collateralTotalApy, // Already in decimal format
      debtStakingApy: 0,
      debtNetCost: debtBorrowApy, // Already in decimal format
      hasStakingData: false, // No staking data
    }

    setStrategy(strategyData)
  }, [searchParams, markets, router])

  if (!strategy) {
    return (
      <div className='w-full lg:container mx-auto px-4 py-8'>
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
              <div className='w-8 h-8 bg-muted/40 rounded-full animate-pulse' />
            </div>
            <h3 className='text-lg font-semibold text-foreground'>Loading Strategy Data</h3>
            <p className='text-sm text-muted-foreground'>Fetching strategy information...</p>
          </div>
        </div>
      </div>
    )
  }

  return <StrategyDeployClient strategy={strategy} />
}
