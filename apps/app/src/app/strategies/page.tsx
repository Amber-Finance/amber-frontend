'use client'

import { useEffect, useMemo, useState } from 'react'

import { BigNumber } from 'bignumber.js'

import { StrategyCard } from '@/app/strategies/StrategyCard'
import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import tokens from '@/config/tokens'
import { useLstMarkets } from '@/hooks/useLstMarkets'
import { useMarkets } from '@/hooks/useMarkets'
import { useStore } from '@/store/useStore'
import { calculateUsdValue } from '@/utils/format'

export default function StrategiesOverview() {
  // Fetch markets data using the hook
  const { isLoading: marketsLoading, error: marketsError } = useMarkets()
  const { markets } = useStore()

  // Fetch LST markets data for staking APY
  const { getTokenStakingApy } = useLstMarkets()

  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [totalBorrowValue, setTotalBorrowValue] = useState<number>(0)
  const [totalSupplyValue, setTotalSupplyValue] = useState<number>(0)

  useEffect(() => {
    if (markets && markets.length > 0) {
      let totalBorrowValueBN = new BigNumber(0)
      let totalSupplyValueBN = new BigNumber(0)

      markets.forEach((market: Market) => {
        // Calculate borrow total
        if (market.metrics && market.metrics.debt_total_amount && market.price?.price) {
          const borrowValueUsd = calculateUsdValue(
            market.metrics.debt_total_amount,
            market.price.price,
            market.asset.decimals,
          )

          totalBorrowValueBN = totalBorrowValueBN.plus(borrowValueUsd)
        }

        // Calculate supply total
        if (market.metrics && market.metrics.collateral_total_amount && market.price?.price) {
          const supplyValueUsd = calculateUsdValue(
            market.metrics.collateral_total_amount,
            market.price.price,
            market.asset.decimals,
          )

          totalSupplyValueBN = totalSupplyValueBN.plus(supplyValueUsd)
        }
      })

      // Store raw values for StatCard
      setTotalBorrowValue(totalBorrowValueBN.toNumber())
      setTotalSupplyValue(totalSupplyValueBN.toNumber())
    }
  }, [markets])

  // Find MAXBTC token from tokens.ts (using BTC as placeholder since MAXBTC might not exist yet)
  const maxBtcToken = useMemo(
    () =>
      tokens.find((token) => token.symbol === 'wBTC') || {
        chainId: 'neutron-1',
        denom: 'maxbtc',
        symbol: 'MAXBTC',
        icon: '/images/BTC.svg',
        description: 'Max Bitcoin',
        decimals: 8,
        isLST: true,
        protocol: 'Max Protocol',
        brandColor: '#F7931A', // Bitcoin orange
      },
    [],
  )

  const maxBtcAsset = useMemo(
    () => ({
      denom: maxBtcToken.denom,
      symbol: maxBtcToken.symbol,
      name: maxBtcToken.symbol,
      description: maxBtcToken.description,
      decimals: maxBtcToken.decimals,
      icon: maxBtcToken.icon,
      brandColor: maxBtcToken.brandColor,
    }),
    [
      maxBtcToken.denom,
      maxBtcToken.symbol,
      maxBtcToken.description,
      maxBtcToken.decimals,
      maxBtcToken.icon,
      maxBtcToken.brandColor,
    ],
  )

  // Generate strategies: MAXBTC as collateral, other BTC LSTs as debt assets
  useEffect(() => {
    if (!markets || markets.length === 0) {
      setStrategies([])
      return
    }

    // Filter markets that can be used as debt assets (borrow_enabled and whitelisted)
    // These will be the BTC LSTs that we borrow against MAXBTC collateral
    const debtMarkets = markets.filter(
      (market) =>
        market.params.red_bank.borrow_enabled &&
        market.params.credit_manager.whitelisted &&
        // Only include BTC-related assets for borrowing
        (market.asset.symbol.includes('BTC') || market.asset.symbol.includes('btc')),
    )

    const generatedStrategies = debtMarkets.map((market) => {
      // Find corresponding token from tokens.ts to get brand color and other properties
      const tokenConfig = tokens.find(
        (token) => token.denom === market.asset.denom || token.symbol === market.asset.symbol,
      )

      // Calculate base APY (1x leverage): MAXBTC Supply APY - Debt Asset Borrow APY
      // MAXBTC mock values - use realistic supply rate (higher than BTC LST borrow rates)
      const maxBtcSupplyRate = 0.065 // 6.5% APY mock supply rate for MAXBTC

      const debtBorrowRate = parseFloat(market.metrics.borrow_rate || '0')

      // Get staking APY for the debt asset (BTC LST that we're borrowing)
      const debtAssetStakingApyRaw = getTokenStakingApy(market.asset.symbol)
      const debtAssetStakingApy = debtAssetStakingApyRaw > 0 ? debtAssetStakingApyRaw / 100 : 0 // Convert percentage to decimal, hide if zero

      // For MAXBTC collateral, use mock staking APY (since it's not in the API yet)
      const maxBtcStakingApy = 0.025 // 2.5% mock staking APY for MAXBTC

      // Calculate total supply APY for MAXBTC (lending + staking)
      const maxBtcTotalSupplyApy = maxBtcSupplyRate + maxBtcStakingApy

      // For looping strategy calculation at max leverage:
      // At 8x leverage: 9 YBTC supplied, 8 XBTC borrowed
      // APY = 9 × YBTC(supply + staking) - 8 × XBTC(borrow)
      // Normalized per 1 unit: (leverage + 1) × collateral_apy - leverage × debt_borrow_rate

      // Calculate base net APY for 1x leverage (no looping)
      const baseNetApy = maxBtcTotalSupplyApy - debtBorrowRate

      // Calculate available borrow capacity for this debt asset
      // Available liquidity = total collateral - total debt
      const totalCollateral = new BigNumber(market.metrics.collateral_total_amount || '0')
      const totalDebt = new BigNumber(market.metrics.debt_total_amount || '0')
      const availableBorrowCapacity = BigNumber.max(0, totalCollateral.minus(totalDebt))

      // Calculate borrow capacity in USD using this market's price
      const borrowCapacityUsd = calculateUsdValue(
        availableBorrowCapacity.toString(),
        market.price?.price || '0',
        market.asset.decimals,
      )

      // Calculate max leverage based on LTV parameters
      // Since all BTC denoms have the same price, we can use the debt market's LTV directly
      const maxLTV = parseFloat(market.params.max_loan_to_value || '0.8')
      const liquidationThreshold = parseFloat(market.params.liquidation_threshold || '0.85')

      // Max leverage = 1 / (1 - maxLTV)
      // This represents the theoretical maximum leverage before liquidation risk
      const maxLeverage = maxLTV > 0 ? 1 / (1 - maxLTV) : 1

      // Cap leverage at reasonable maximum (10x) for safety
      const cappedMaxLeverage = Math.min(maxLeverage, 10)

      // For BTC strategies, since prices are the same, max borrow = available liquidity
      // (This is already calculated as availableBorrowCapacity above)

      // Calculate max position size in USD (collateral + max borrowable)
      // Using a mock $1000 initial collateral for calculation
      const mockCollateralUsd = new BigNumber(1000)
      const maxBorrowUsd = mockCollateralUsd.multipliedBy(maxLTV)
      const maxPositionUsd = mockCollateralUsd.plus(maxBorrowUsd)

      return {
        id: `MAXBTC-${market.asset.symbol}`,
        type: 'Leverage Strategy',
        collateralAsset: maxBtcAsset, // MAXBTC is always collateral
        debtAsset: {
          denom: market.asset.denom,
          symbol: market.asset.symbol,
          name: market.asset.name,
          description: market.asset.description,
          decimals: market.asset.decimals,
          icon: tokenConfig?.icon || market.asset.icon,
          brandColor: tokenConfig?.brandColor || '#6B7280', // Use token config color or fallback to gray
        },
        maxROE: baseNetApy * cappedMaxLeverage, // Max ROE = base APY * max leverage
        isPositive: baseNetApy >= 0,
        hasPoints: false,
        rewards: '-',
        multiplier: cappedMaxLeverage, // Use calculated max leverage
        isCorrelated: true, // All BTC-related assets are correlated
        liquidity: borrowCapacityUsd,
        liquidityDisplay: formatCurrency(new BigNumber(borrowCapacityUsd)),
        subText: `Supply MAXBTC, borrow ${market.asset.symbol}, and loop for amplified exposure`,
        supplyApy: maxBtcSupplyRate,
        borrowApy: debtBorrowRate,
        netApy: baseNetApy, // Base APY for 1x leverage
        ltv: maxLTV, // Use actual LTV from market params
        liquidationThreshold: liquidationThreshold, // Use actual liquidation threshold from market params
        // Additional strategy metadata
        maxLeverage: cappedMaxLeverage,
        maxBorrowCapacityUsd: borrowCapacityUsd,
        maxPositionSizeUsd: maxPositionUsd.toNumber(),
        // Enhanced APY breakdown
        collateralStakingApy: maxBtcStakingApy,
        collateralTotalApy: maxBtcTotalSupplyApy,
        debtStakingApy: debtAssetStakingApy,
        debtNetCost: debtBorrowRate, // Just the borrow rate for debt cost
        hasStakingData: debtAssetStakingApyRaw > 0, // Flag to show/hide staking info
      }
    })

    setStrategies(generatedStrategies)
  }, [markets, getTokenStakingApy, maxBtcAsset])

  // Format currency values to match Mars format
  function formatCurrency(value: BigNumber): string {
    if (value.isZero()) return '$0'

    const amount = value.toNumber()
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B`
    } else if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(2)}K`
    }
    return `$${amount.toFixed(2)}`
  }

  return (
    <>
      <Hero
        title={<AuroraText>Looping</AuroraText>}
        subtitle='BRT Strategies'
        description='Effortlessly leverage restaking, farm points, arbitrage rates, and more - all with just a few clicks'
        stats={[
          {
            value: totalBorrowValue,
            label: 'Total Borrow',
            isCurrency: true,
            prefix: '$',
          },
          {
            value: totalSupplyValue,
            label: 'Total Supply',
            isCurrency: true,
            prefix: '$',
          },
        ]}
      />

      {/* Strategies Grid - Match yields page structure exactly */}
      <div className='w-full pt-6 pb-2 px-4 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto'>
          {marketsLoading ? (
            <div className='text-center py-12'>
              <div className='max-w-md mx-auto space-y-3'>
                <div className='w-12 h-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
                  <div className='w-6 h-6 bg-muted/40 rounded-full animate-pulse' />
                </div>
                <h3 className='text-base font-semibold text-foreground'>Loading Strategies...</h3>
                <p className='text-sm text-muted-foreground'>
                  Fetching market data to generate looping strategies...
                </p>
              </div>
            </div>
          ) : marketsError ? (
            <div className='text-center py-12'>
              <div className='max-w-md mx-auto space-y-3'>
                <div className='w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center'>
                  <div className='w-6 h-6 bg-red-500/40 rounded-full' />
                </div>
                <h3 className='text-base font-semibold text-red-500'>Error Loading Strategies</h3>
                <p className='text-sm text-muted-foreground'>
                  Failed to fetch market data: {marketsError.message}
                </p>
              </div>
            </div>
          ) : strategies.length > 0 ? (
            <div
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-2xl mx-auto justify-items-center'
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}
            >
              {strategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='max-w-md mx-auto space-y-3'>
                <div className='w-12 h-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
                  <div className='w-6 h-6 bg-muted/40 rounded-full' />
                </div>
                <h3 className='text-base font-semibold text-foreground'>No Strategies Available</h3>
                <p className='text-sm text-muted-foreground'>
                  No looping strategies available with current market data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
