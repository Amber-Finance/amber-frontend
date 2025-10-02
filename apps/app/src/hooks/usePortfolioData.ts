import { useMemo } from 'react'

import tokens from '@/config/tokens'
import { useLstMarkets } from '@/hooks/useLstMarkets'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { usePortfolioPositions } from '@/hooks/usePortfolioPositions'
import { usePrices } from '@/hooks/usePrices'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

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
 * Hook to process portfolio positions data into deposits
 * Transforms raw API data from usePortfolioPositions into formatted deposit data
 */
export function usePortfolioDeposits() {
  const { portfolioPositions, isLoading: isPositionsLoading } = usePortfolioPositions()
  const { markets } = useStore()
  const { data: lstMarkets } = useLstMarkets()

  // Ensure prices are loaded
  usePrices()

  const deposits = useMemo(() => {
    if (!portfolioPositions || !markets?.length) return []

    const depositPositions: DepositPosition[] = []

    // Process redbank deposits
    portfolioPositions.redbank_deposits.forEach((deposit) => {
      const token = tokens.find((t) => t.denom === deposit.denom)
      if (!token) return

      const market = markets.find((m) => m.asset.denom === deposit.denom)
      if (!market) return

      const amountFormatted = parseFloat(deposit.amount) / Math.pow(10, token.decimals)
      const usdValue = calculateUsdValueLegacy(
        deposit.amount,
        market.price?.price || '0',
        token.decimals,
      )

      // Get APY data from lstMarkets
      const lstMarket = lstMarkets?.find((lst) => lst.token.denom === deposit.denom)
      const supplyApy = lstMarket?.metrics.totalApy || 0

      // Calculate estimated YTD earnings
      const timeEstimate = 0.5 // 6 months average
      const estimatedEarnings = usdValue * (supplyApy / 100) * timeEstimate
      const earningsPercent = usdValue > 0 ? (estimatedEarnings / usdValue) * 100 : 0

      depositPositions.push({
        denom: deposit.denom,
        symbol: token.symbol,
        amount: deposit.amount,
        amountFormatted: isNaN(amountFormatted) ? 0 : amountFormatted,
        usdValue: isNaN(usdValue) ? 0 : usdValue,
        apy: isNaN(supplyApy) ? 0 : supplyApy,
        ytdEarnings: isNaN(estimatedEarnings) ? 0 : estimatedEarnings,
        ytdEarningsPercent: isNaN(earningsPercent) ? 0 : earningsPercent,
      })
    })

    return depositPositions.sort((a, b) => b.usdValue - a.usdValue)
  }, [portfolioPositions, markets, lstMarkets])

  const totalValue = deposits.reduce((sum, deposit) => sum + deposit.usdValue, 0)
  const totalEarnings = deposits.reduce((sum, deposit) => sum + deposit.ytdEarnings, 0)

  return {
    deposits,
    totalValue,
    totalEarnings,
    isLoading: isPositionsLoading,
  }
}

/**
 * Hook to process portfolio positions data into active strategies
 * Transforms raw API data from usePortfolioPositions into formatted strategy data
 */
export function usePortfolioStrategies() {
  const { portfolioPositions, isLoading: isPositionsLoading } = usePortfolioPositions()
  const { markets } = useStore()
  const { apy: maxBtcApy } = useMaxBtcApy()

  // Ensure prices are loaded
  usePrices()

  const activeStrategies = useMemo(() => {
    if (!portfolioPositions || !markets?.length) return []

    const strategies: ActiveStrategy[] = []

    portfolioPositions.accounts.forEach((account) => {
      // A strategy has both deposits (collateral) and debts
      if (account.deposits.length === 0 || account.debts.length === 0) return

      account.deposits.forEach((depositItem) => {
        account.debts.forEach((debtItem) => {
          const collateralToken = tokens.find((t) => t.denom === depositItem.denom)
          const debtToken = tokens.find((t) => t.denom === debtItem.denom)

          if (!collateralToken || !debtToken) return

          const collateralMarket = markets.find((m) => m.asset.denom === depositItem.denom)
          const debtMarket = markets.find((m) => m.asset.denom === debtItem.denom)

          if (!collateralMarket || !debtMarket) return

          // Calculate formatted amounts and USD values
          const collateralAmountFormatted =
            parseFloat(depositItem.amount) / Math.pow(10, collateralToken.decimals)
          const collateralUsdValue = calculateUsdValueLegacy(
            depositItem.amount,
            collateralMarket.price?.price || '0',
            collateralToken.decimals,
          )

          const debtAmountFormatted = parseFloat(debtItem.amount) / Math.pow(10, debtToken.decimals)
          const debtUsdValue = calculateUsdValueLegacy(
            debtItem.amount,
            debtMarket.price?.price || '0',
            debtToken.decimals,
          )

          // Calculate initial investment from initial_deposit
          const initialDepositItem = account.initial_deposit.find(
            (init) => init.denom === depositItem.denom,
          )
          const initialDepositUsdValue = initialDepositItem
            ? calculateUsdValueLegacy(
                initialDepositItem.amount,
                collateralMarket.price?.price || '0',
                collateralToken.decimals,
              )
            : 0

          // Calculate actual P&L
          // Current position value (equity) = collateral - debt
          const currentPositionValue = collateralUsdValue - debtUsdValue
          // Actual P&L = current value - initial investment
          const actualPnl = currentPositionValue - initialDepositUsdValue
          const actualPnlPercent =
            initialDepositUsdValue > 0 ? (actualPnl / initialDepositUsdValue) * 100 : 0

          // Calculate leverage
          const leverage =
            collateralUsdValue > 0 ? collateralUsdValue / (collateralUsdValue - debtUsdValue) : 1

          // Calculate APYs and net APY
          const collateralApy = parseFloat(collateralMarket.metrics?.liquidity_rate || '0') * 100
          const debtApy = parseFloat(debtMarket.metrics?.borrow_rate || '0') * 100

          // Add maxBTC staking APY if collateral is maxBTC
          const stakingApy = collateralToken.symbol === 'maxBTC' ? maxBtcApy : 0
          const totalCollateralApy = collateralApy + stakingApy

          const netApy = totalCollateralApy * leverage - debtApy * (leverage - 1)

          strategies.push({
            accountId: account.account_id,
            collateralAsset: {
              denom: depositItem.denom,
              symbol: collateralToken.symbol,
              amount: depositItem.amount,
              amountFormatted: collateralAmountFormatted,
              usdValue: collateralUsdValue,
              decimals: collateralToken.decimals,
              icon: collateralToken.icon,
            },
            debtAsset: {
              denom: debtItem.denom,
              symbol: debtToken.symbol,
              amount: debtItem.amount,
              amountFormatted: debtAmountFormatted,
              usdValue: debtUsdValue,
              decimals: debtToken.decimals,
              icon: debtToken.icon,
            },
            supply: {
              denom: depositItem.denom,
              symbol: collateralToken.symbol,
              amount: depositItem.amount,
              amountFormatted: collateralAmountFormatted - debtAmountFormatted,
              usdValue: collateralUsdValue - debtUsdValue, // Net equity: collateral - debt
              decimals: collateralToken.decimals,
              icon: collateralToken.icon,
            },
            leverage,
            netApy,
            isPositive: netApy >= 0,
            strategyId: `${collateralToken.symbol}-${debtToken.symbol}`,
            // Add actual P&L data
            initialInvestment: initialDepositUsdValue,
            actualPnl,
            actualPnlPercent,
          })
        })
      })
    })

    return strategies.sort((a, b) => {
      const aValue = a.collateralAsset.usdValue - a.debtAsset.usdValue
      const bValue = b.collateralAsset.usdValue - b.debtAsset.usdValue
      return bValue - aValue
    })
  }, [portfolioPositions, markets, maxBtcApy])

  return {
    activeStrategies,
    isLoading: isPositionsLoading,
  }
}
