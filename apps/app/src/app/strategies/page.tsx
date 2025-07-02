import { useEffect, useState } from 'react'

import { BigNumber } from 'bignumber.js'
import { IterationCw } from 'lucide-react'

import { StrategyCard } from '@/app/strategies/StrategyCard'
import { StatCard } from '@/components/ui/StatCard'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { useStore } from '@/store/useStore'
import { calculateUsdValue } from '@/utils/format'

export default function StrategiesOverview() {
  // Fetch markets data using the hook
  const { isLoading: marketsLoading, error: marketsError } = useMarkets()
  const { markets } = useStore()

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
  const maxBtcToken = tokens.find((token) => token.symbol === 'wBTC') || {
    chainId: 'neutron-1',
    denom: 'maxbtc',
    symbol: 'MAXBTC',
    icon: '/images/BTC.svg',
    description: 'Max Bitcoin',
    decimals: 8,
    isLST: true,
    protocol: 'Max Protocol',
    brandColor: '#F7931A', // Bitcoin orange
  }

  const maxBtcAsset = {
    denom: maxBtcToken.denom,
    symbol: maxBtcToken.symbol,
    name: maxBtcToken.symbol,
    description: maxBtcToken.description,
    decimals: maxBtcToken.decimals,
    icon: maxBtcToken.icon,
    brandColor: maxBtcToken.brandColor,
  }

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

      const baseNetApy = maxBtcSupplyRate - debtBorrowRate

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
        maxROE: 0,
        isPositive: baseNetApy >= 0,
        hasPoints: false,
        rewards: '-',
        multiplier: 1, // Will be calculated dynamically in StrategyCard
        isCorrelated: true, // All BTC-related assets are correlated
        liquidity: borrowCapacityUsd,
        liquidityDisplay: formatCurrency(new BigNumber(borrowCapacityUsd)),
        subText: `Supply MAXBTC, borrow ${market.asset.symbol}, and loop for amplified exposure`,
        supplyApy: maxBtcSupplyRate,
        borrowApy: debtBorrowRate,
        netApy: baseNetApy, // Base APY for 1x leverage
        ltv: 0.8, // Mock LTV for MAXBTC collateral
        liquidationThreshold: 0.85, // Mock liquidation threshold for MAXBTC
      }
    })

    setStrategies(generatedStrategies)
  }, [markets])

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
      {/* Strategies Header - Custom Hero-like section */}
      <section className='relative w-full py-10 sm:py-20 overflow-hidden px-4 sm:px-8'>
        <div className='flex flex-col lg:flex-row items-start lg:items-end gap-8 lg:gap-12'>
          <div className='flex-1 flex flex-col justify-between gap-6'>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <div className='absolute inset-0 rounded-full blur-md scale-110 opacity-50 bg-gradient-to-r from-orange-500 to-amber-500' />
                <div className='relative w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg'>
                  <IterationCw className='w-6 h-6 text-white' />
                </div>
              </div>
              <div>
                <h1 className='text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-1'>
                  Looping Strategies
                </h1>
                <p className='text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg'>
                  Effortlessly leverage restaking, farm points, arbitrage rates, and more - all with
                  just a few clicks
                </p>
              </div>
            </div>
          </div>

          <div className='flex-1 max-w-lg w-full h-full'>
            <div className='flex flex-row gap-2 sm:gap-3'>
              <StatCard
                value={totalBorrowValue}
                label={
                  <>
                    Total <span className='block sm:inline' /> Borrow
                  </>
                }
                isCurrency={true}
                prefix='$'
              />
              <StatCard
                value={totalSupplyValue}
                label={
                  <>
                    Total <span className='block sm:inline' /> Supply
                  </>
                }
                isCurrency={true}
                prefix='$'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Strategies Grid - Match yields page structure exactly */}
      <div className='w-full pt-6 pb-2'>
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
          <div className='flex flex-wrap gap-4 justify-center'>
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
    </>
  )
}
