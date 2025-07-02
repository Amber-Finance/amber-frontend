import { useMemo } from 'react'
import useSWR from 'swr'
import { BigNumber } from 'bignumber.js'
import { useStore } from '@/store/useStore'
import tokens from '@/config/tokens'
import { convertAprToApy } from '@/utils/finance'
import useWalletBalances from '@/hooks/useWalletBalances'

interface BtcYieldData {
  symbol: string
  apy: number
}

interface AmberApiResponse {
  btcYield: BtcYieldData[]
}

const fetcher = async (url: string): Promise<AmberApiResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch BTC yields')
  }
  return response.json()
}

export interface LstMarketData {
  token: {
    symbol: string
    icon: string
    description: string
    protocol: string
    isLST: boolean
    brandColor: string
    protocolIconLight?: string
    protocolIconDark?: string
  }
  metrics: {
    lendingApy: number
    stakingApy: number
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

export function useLstMarkets(): {
  data: LstMarketData[]
  isLoading: boolean
  error: Error | null
  getTokenStakingApy: (symbol: string) => number
} {
  const { markets } = useStore()

  // Fetch wallet balances
  const { data: walletBalances, isLoading: isWalletLoading } = useWalletBalances()

  // Fetch staking yields from Amber Finance API
  const {
    data: stakingData,
    error: stakingError,
    isLoading: isStakingLoading,
  } = useSWR<AmberApiResponse>('https://api.amberfi.io/api/btc', fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: false,
  })

  // Helper function to get staking APY for a specific token
  const getTokenStakingApy = (symbol: string): number => {
    if (!stakingData?.btcYield) return 0
    const tokenData = stakingData.btcYield.find((token) => token.symbol === symbol)
    return tokenData?.apy || 0
  }

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
        const lendingApy = parseFloat(convertAprToApy(market.metrics.liquidity_rate || '0'))

        // Get staking APY from Amber Finance API
        const stakingApy = getTokenStakingApy(tokenData.symbol)

        // Calculate total APY
        const totalApy = parseFloat((lendingApy + stakingApy).toFixed(2))

        // Get wallet balance for this token
        const walletBalance = walletBalances?.find(
          (balance) => balance.denom === market.asset.denom,
        )
        const rawBalance = walletBalance?.amount || '0'

        // Convert balance to readable format
        const decimals = market.asset?.decimals || 6
        const balance = parseFloat(new BigNumber(rawBalance).shiftedBy(-decimals).toString())

        // Calculate USD value of balance
        const price = parseFloat(market.price?.price || '0')
        const valueUsd = balance * price

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
            brandColor: tokenData.brandColor,
            protocolIconLight: tokenData.protocolIconLight,
            protocolIconDark: tokenData.protocolIconDark,
          },
          metrics: {
            lendingApy,
            stakingApy,
            totalApy,
            balance,
            deposited: 0, // TODO: Get from user positions
            valueUsd,
            utilizationRate,
            depositCapUsage,
            optimalUtilizationRate,
            collateralTotalUsd,
            depositCapUsd,
          },
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [markets, stakingData, walletBalances, getTokenStakingApy])

  return {
    data: lstMarkets,
    isLoading: isStakingLoading || isWalletLoading,
    error: stakingError,
    getTokenStakingApy,
  }
}
