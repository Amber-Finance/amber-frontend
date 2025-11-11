import { useCallback, useMemo } from 'react'

import { BigNumber } from 'bignumber.js'
import useSWR from 'swr'

import tokens from '@/config/tokens'
import { useWalletBalances } from '@/hooks/wallet'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/data/finance'

interface BtcYieldData {
  symbol: string
  apy: number
}

interface AmberApiResponse {
  btcYield: BtcYieldData[]
  apys: {
    fbtc: string
    lbtc: string
    solvbtc: string
    ebtc: string
    unibtc: string
    wbtc: string
    maxbtc: string
  }
}

const fetcher = async (url: string): Promise<AmberApiResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch BTC yields')
  }
  return response.json()
}

export interface LstMarketData {
  token: TokenInfo
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
  const getTokenStakingApy = useCallback(
    (symbol: string): number => {
      if (!stakingData) return 0

      // For maxBTC, check the apys object
      if (symbol.toLowerCase() === 'maxbtc' && stakingData.apys?.maxbtc) {
        return parseFloat(stakingData.apys.maxbtc)
      }

      // For other tokens, check btcYield array first
      if (stakingData.btcYield) {
        const tokenData = stakingData.btcYield.find((token) => token.symbol === symbol)
        if (tokenData?.apy) return tokenData.apy
      }

      // Fallback to apys object for other tokens
      if (stakingData.apys) {
        const symbolKey = symbol.toLowerCase() as keyof typeof stakingData.apys
        const apyValue = stakingData.apys[symbolKey]
        if (apyValue) return parseFloat(apyValue)
      }

      return 0
    },
    [stakingData],
  )

  const lstMarkets = useMemo(() => {
    const currentMarkets = markets || []

    return currentMarkets
      .map((market) => {
        // Find token info from tokens.ts
        const tokenData = tokens.find((token) => token.denom === market.asset.denom)
        // Skip if token not found or not an LST
        if (!tokenData?.isLST) {
          return null
        }
        // Include tokens that have deposit enabled (even if borrow is not enabled)
        // This allows tokens like maxBTC to be shown on the deposit page
        if (!market.params.red_bank.deposit_enabled) {
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

        // Get user deposit amount for this market
        const userDeposit = market.deposit || '0'
        const deposited = parseFloat(new BigNumber(userDeposit).shiftedBy(-decimals).toString())

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
            denom: tokenData.denom,
            chainId: tokenData.chainId,
            decimals: tokenData.decimals,
            origin: tokenData.origin,
            comingSoon: tokenData.comingSoon,
          },
          metrics: {
            lendingApy,
            stakingApy,
            totalApy,
            balance,
            deposited,
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
