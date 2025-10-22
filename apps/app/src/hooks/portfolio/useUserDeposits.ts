import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react'

import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useLstMarkets } from '@/hooks/market/useLstMarkets'
import { usePrices } from '@/hooks/market/usePrices'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/formatting/format'

interface DepositPosition {
  denom: string
  symbol: string
  amount: string
  amountFormatted: number
  usdValue: number
  apy: number
  ytdEarnings: number
  ytdEarningsPercent: number
}

/**
 * Hook to get user deposit positions from markets store
 * Returns formatted deposit data for display in portfolio
 * Only returns deposits when wallet is connected
 */
export function useUserDeposits() {
  const { address } = useChain(chainConfig.name)
  const { markets } = useStore()

  // Use price and APY hooks
  usePrices() // Ensures prices are fetched and updated
  const { data: lstMarkets } = useLstMarkets() // Get APY data like DepositCard

  const deposits = useMemo(() => {
    // Return empty array if wallet not connected or no markets
    if (!address || !markets?.length) return []

    const depositPositions: DepositPosition[] = []

    markets.forEach((market) => {
      // Parse deposit amount as string (it's stored as string in the store)
      const depositAmountString = market.deposit || '0'
      const depositAmount = parseFloat(depositAmountString)
      if (depositAmount <= 0) return

      // Get token info
      const token = tokens.find((t) => t.denom === market.asset.denom)
      if (!token) return

      // Calculate USD value using the same method as other parts of the app
      const amountFormatted = depositAmount / Math.pow(10, token.decimals)
      const usdValue = calculateUsdValueLegacy(
        depositAmountString,
        market.price?.price || '0',
        token.decimals,
      )

      // Get APY data from lstMarkets (same as DepositCard)
      // Find matching LST market data for this token
      const lstMarket = lstMarkets?.find((lst) => lst.token.denom === market.asset.denom)
      const supplyApy = lstMarket?.metrics.totalApy || 0

      // Calculate estimated YTD earnings (simplified - based on current APY)
      // This is a rough estimate assuming average holding period
      const timeEstimate = 0.5 // Assume 6 months average
      const estimatedEarnings = usdValue * (supplyApy / 100) * timeEstimate
      const earningsPercent = usdValue > 0 ? (estimatedEarnings / usdValue) * 100 : 0

      // Ensure all numeric fields are valid numbers
      depositPositions.push({
        denom: market.asset.denom,
        symbol: token.symbol,
        amount: depositAmountString,
        amountFormatted: isNaN(amountFormatted) ? 0 : amountFormatted,
        usdValue: isNaN(usdValue) ? 0 : usdValue,
        apy: isNaN(supplyApy) ? 0 : supplyApy,
        ytdEarnings: isNaN(estimatedEarnings) ? 0 : estimatedEarnings,
        ytdEarningsPercent: isNaN(earningsPercent) ? 0 : earningsPercent,
      })
    })

    return depositPositions.sort((a, b) => b.usdValue - a.usdValue) // Sort by USD value descending
  }, [address, markets, lstMarkets])

  // Calculate totals
  const totalValue = deposits.reduce((sum, deposit) => sum + deposit.usdValue, 0)
  const totalEarnings = deposits.reduce((sum, deposit) => sum + deposit.ytdEarnings, 0)
  const avgApy =
    deposits.length > 0
      ? deposits.reduce((sum, deposit) => sum + deposit.apy, 0) / deposits.length
      : 0

  return {
    deposits,
    totalValue,
    totalEarnings,
    avgApy,
    isLoading: !markets,
  }
}
