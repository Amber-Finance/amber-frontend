'use client'

import DepositCard from '@/components/earn/DepositCard'
import Hero from '@/components/layout/Hero'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/finance'
import { BigNumber } from 'bignumber.js'

export default function Home() {
  // Get market data
  useMarkets()
  const { markets } = useStore()

  // Process markets for display - only show LSTs with yield opportunities
  const lstMarkets =
    markets
      ?.map((market) => {
        // Find token info from tokens.ts
        const tokenData = tokens.find((token) => token.denom === market.asset.denom)

        // Skip if token not found or not an LST
        if (!tokenData?.isLST) {
          return null
        }

        // Calculate lending APY from protocol
        const lendingApy = parseFloat(
          convertAprToApy(new BigNumber(market.metrics.liquidity_rate || '0').toString()),
        )

        // Calculate total APY (staking + lending)
        const totalApy = parseFloat((tokenData.stakingApy + lendingApy).toFixed(2))

        // Calculate utilization rate (already in percentage)
        const utilizationRate = parseFloat(
          (parseFloat(market.metrics.utilization_rate || '0') * 100).toFixed(2),
        )

        // Calculate deposit cap usage percentage
        const depositCap = parseFloat(market.params.deposit_cap || '0')
        const collateralTotal = parseFloat(market.metrics.collateral_total_amount || '0')
        const depositCapUsage =
          depositCap > 0 ? parseFloat(((collateralTotal / depositCap) * 100).toFixed(2)) : 0

        // Calculate USD values for deposit cap display
        const price = parseFloat(market.price?.price || '0')
        const decimals = market.asset?.decimals || 6
        const collateralTotalUsd = (collateralTotal / Math.pow(10, decimals)) * price
        const depositCapUsd = (depositCap / Math.pow(10, decimals)) * price

        // Get optimal utilization rate
        const optimalUtilizationRate =
          parseFloat(market.metrics.interest_rate_model?.optimal_utilization_rate || '0') * 100

        return {
          token: {
            symbol: tokenData.symbol,
            icon: tokenData.icon,
            description: tokenData.description,
            protocol: tokenData.protocol,
            isLST: tokenData.isLST,
            stakingApy: tokenData.stakingApy,
            brandColor: tokenData.brandColor,
          },
          metrics: {
            lendingApy,
            totalApy,
            balance: 0, // TODO: Get from wallet
            deposited: 0, // TODO: Get from user positions
            valueUsd: 0, // TODO: Calculate USD value
            utilizationRate,
            depositCapUsage,
            optimalUtilizationRate,
            collateralTotalUsd,
            depositCapUsd,
          },
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null) || []

  return (
    <>
      {/* Hero Section with Market Data */}
      <Hero markets={lstMarkets} />

      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-2'>
        <div className='space-y-12'>
          {/* Header Section */}
          {/* <div className='text-center space-y-4'>
            <h2 className='text-2xl sm:text-3xl font-bold text-foreground'>
              Liquid Staking Token Deposits
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Earn combined yields by depositing your LSTs. Get both underlying staking rewards plus
              additional lending APY.
            </p>
          </div> */}

          {/* LST Cards Grid */}
          {lstMarkets.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center'>
              {lstMarkets.map((item) => (
                <DepositCard key={item.token.symbol} token={item.token} metrics={item.metrics} />
              ))}
            </div>
          ) : (
            <div className='text-center py-16'>
              <div className='max-w-md mx-auto space-y-4'>
                <div className='w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
                  <div className='w-8 h-8 bg-muted/40 rounded-full animate-pulse' />
                </div>
                <h3 className='text-lg font-semibold text-foreground'>Loading LST Opportunities</h3>
                <p className='text-muted-foreground'>
                  Fetching the latest liquid staking token deposit opportunities...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
