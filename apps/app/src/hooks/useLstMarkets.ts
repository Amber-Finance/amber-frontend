import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import tokens from '@/config/tokens'
import { convertAprToApy } from '@/utils/finance'

export interface LstMarketData {
  token: {
    symbol: string
    icon: string
    description: string
    protocol: string
    isLST: boolean
    stakingApy: number
    brandColor: string
  }
  metrics: {
    lendingApy: number
    totalApy: number
    balance: number
    deposited: number
    valueUsd: number
    utilizationRate: number
    depositCapUsage: number
    optimalUtilizationRate: number
    collateralTotalUsd: number
    depositCapUsd: number
  }
}

export function useLstMarkets(): LstMarketData[] {
  const { markets } = useStore()

  const lstMarkets = useMemo(() => {
    if (!markets) return []

    return markets
      .map((market) => {
        // Find token info from tokens.ts
        const tokenData = tokens.find((token) => token.denom === market.asset.denom)

        // Skip if token not found or not an LST
        if (!tokenData?.isLST) {
          return null
        }

        // Calculate protocol APY from the market
        const protocolApy = parseFloat(
          convertAprToApy(market.metrics.liquidity_rate || '0'),
        )

        // Calculate total APY (staking + protocol)
        const totalApy = parseFloat((tokenData.stakingApy + protocolApy).toFixed(2))

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
            lendingApy: protocolApy,
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
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [markets])

  return lstMarkets
} 