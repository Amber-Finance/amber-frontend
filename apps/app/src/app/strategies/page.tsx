'use client'

import { useEffect, useMemo, useState } from 'react'

import BigNumber from 'bignumber.js'

import { StrategyCard } from '@/app/strategies/StrategyCard'
import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { useStore } from '@/store/useStore'
import { calculateUsdValue, formatLargeCurrency } from '@/utils/format'

export default function StrategiesOverview() {
  // Fetch markets data using the hook
  const { isLoading: marketsLoading, error: marketsError } = useMarkets()
  const { markets } = useStore()

  // Fetch maxBTC APY data for strategy supply APY simulation
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()

  // Fallback APY in case API fails
  const effectiveMaxBtcApy = maxBtcError ? 6.5 : maxBtcApy

  const [strategies, setStrategies] = useState<Strategy[]>([])

  // Use maxBTC (temporarily wBTC.eureka) for supply APY simulation
  const wbtcEurekaToken = useMemo(
    () =>
      tokens.find((token) => token.symbol === 'wBTC') || {
        chainId: 'neutron-1',
        denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
        symbol: 'wBTC',
        icon: '/images/WBTC.svg',
        description: 'maxBTC (temporarily wBTC.eureka)',
        decimals: 8,
        isLST: true,
        protocol: 'Eureka',
        brandColor: '#F97316', // Eureka orange
      },
    [],
  )

  const wbtcEurekaAsset = useMemo(
    () => ({
      denom: wbtcEurekaToken.denom,
      symbol: wbtcEurekaToken.symbol,
      name: wbtcEurekaToken.symbol,
      description: wbtcEurekaToken.description,
      decimals: wbtcEurekaToken.decimals,
      icon: wbtcEurekaToken.icon,
      brandColor: wbtcEurekaToken.brandColor,
    }),
    [
      wbtcEurekaToken.denom,
      wbtcEurekaToken.symbol,
      wbtcEurekaToken.description,
      wbtcEurekaToken.decimals,
      wbtcEurekaToken.icon,
      wbtcEurekaToken.brandColor,
    ],
  )

  // Generate strategies: maxBTC as collateral, all available tokens as debt assets
  useEffect(() => {
    if (!markets || markets.length === 0) {
      setStrategies([])
      return
    }

    // Filter markets that can be used as debt assets (borrow_enabled and whitelisted)
    // These will be all available tokens that we borrow against maxBTC collateral
    // This creates strategy cards for all deposit options
    const debtMarkets = markets.filter(
      (market) =>
        market.params.red_bank.borrow_enabled &&
        market.params.credit_manager.whitelisted &&
        // Include all assets that can be borrowed, but exclude wBTC since it's our collateral
        market.asset.symbol !== 'wBTC',
    )

    const generatedStrategies = debtMarkets.map((market) => {
      // Find corresponding token from tokens.ts to get brand color and other properties
      const tokenConfig = tokens.find(
        (token) => token.denom === market.asset.denom || token.symbol === market.asset.symbol,
      )

      // Calculate base APY (1x leverage): maxBTC supply APY - borrow APY
      // Use real maxBTC APY data from Amber Finance API with fallback
      const maxBtcSupplyApy = effectiveMaxBtcApy / 100 // Convert percentage to decimal

      const debtBorrowRate = parseFloat(market.metrics.borrow_rate || '0')

      // Base APY = maxBTC supply APY - borrow APY (1x leverage)
      const baseNetApy = maxBtcSupplyApy - debtBorrowRate

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
      // Use the debt market's LTV directly for leverage calculations
      const maxLTV = parseFloat(market.params.max_loan_to_value || '0.8')
      const liquidationThreshold = parseFloat(market.params.liquidation_threshold || '0.85')

      // Max leverage = 1 / (1 - maxLTV)
      // This represents the theoretical maximum leverage before liquidation risk
      const maxLeverage = maxLTV > 0 ? 1 / (1 - maxLTV) : 1

      // Cap leverage at reasonable maximum (10x) for safety
      const cappedMaxLeverage = Math.min(maxLeverage, 10)

      // For all strategies, max borrow = available liquidity
      // (This is already calculated as availableBorrowCapacity above)

      // Calculate max position size in USD (collateral + max borrowable)
      // Using 0.00001 maxBTC as collateral amount
      const collateralAmount = new BigNumber(0.00001)
      const maxBtcPrice = market.price?.price || '0'
      const collateralUsd = new BigNumber(
        calculateUsdValue(collateralAmount.toString(), maxBtcPrice, wbtcEurekaToken.decimals),
      )
      const maxBorrowUsd = collateralUsd.multipliedBy(maxLTV)
      const maxPositionUsd = collateralUsd.plus(maxBorrowUsd)

      return {
        id: `wBTC-${market.asset.symbol}`,
        type: 'Leverage Strategy',
        collateralAsset: wbtcEurekaAsset, // wBTC.eureka is always collateral
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
        isCorrelated: market.asset.symbol.includes('BTC') || market.asset.symbol.includes('btc'), // BTC assets are correlated, others may not be
        liquidity: borrowCapacityUsd,
        liquidityDisplay: formatLargeCurrency(borrowCapacityUsd),
        subText: `Supply maxBTC, borrow ${market.asset.symbol}`,
        supplyApy: maxBtcSupplyApy,
        borrowApy: debtBorrowRate,
        netApy: baseNetApy, // Base APY (1x leverage)
        ltv: maxLTV, // Use actual LTV from market params
        liquidationThreshold: liquidationThreshold, // Use actual liquidation threshold from market params
        // Additional strategy metadata
        maxLeverage: cappedMaxLeverage,
        maxBorrowCapacityUsd: borrowCapacityUsd,
        maxPositionSizeUsd: maxPositionUsd.toNumber(),
        // APY breakdown (supply minus borrow)
        collateralStakingApy: 0,
        collateralTotalApy: maxBtcSupplyApy,
        debtStakingApy: 0,
        debtNetCost: debtBorrowRate,
        hasStakingData: false,
      }
    })

    setStrategies(generatedStrategies)
  }, [markets, wbtcEurekaAsset, effectiveMaxBtcApy])

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
