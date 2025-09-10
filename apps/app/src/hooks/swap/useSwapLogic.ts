import { useEffect, useMemo } from 'react'

import BigNumber from 'bignumber.js'

import tokens from '@/config/tokens'
import { useMarkets, useTokenPreselection } from '@/hooks'
import useRouteInfo, { useRouteInfoReverse } from '@/hooks/swap/useRouteInfo'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

interface SwapLogicProps {
  state: SwapState
  actions: SwapActions
  address: string | undefined
}

export const useSwapLogic = ({ state, actions, address }: SwapLogicProps) => {
  useMarkets()
  const { markets } = useStore()
  const { data: walletBalances } = useWalletBalances()

  const swapTokens = useMemo(() => {
    if (!markets || !walletBalances) return []
    const isConnected = !!address

    return tokens.map((token) => {
      const market = markets.find((m) => m.asset.denom === token.denom)
      const walletBalance = walletBalances.find((b) => b.denom === token.denom)
      const decimals = market?.asset?.decimals ?? token.decimals ?? 8

      const rawBalance = isConnected && walletBalance?.amount ? Number(walletBalance.amount) : 0

      const adjustedBalance =
        rawBalance > 0 ? new BigNumber(walletBalance!.amount).shiftedBy(-decimals).toNumber() : 0

      const usdValue =
        isConnected && walletBalance?.amount && market?.price?.price && rawBalance > 0
          ? calculateUsdValueLegacy(
              Number(walletBalance.amount),
              market.price.price,
              decimals,
            ).toString()
          : '0'

      return {
        symbol: token.symbol,
        name: token.description,
        icon: token.icon,
        balance: adjustedBalance.toString(),
        rawBalance,
        price: market?.price?.price ? parseFloat(market.price.price) : 0,
        denom: token.denom,
        usdValue,
        decimals,
        chainId: 'neutron-1',
        description: token.description,
        isLST: token.isLST,
        protocol: token.protocol,
        brandColor: token.brandColor,
      }
    })
  }, [markets, walletBalances, address])

  const { bestToken, shouldInitialize, markInitialized } = useTokenPreselection(
    swapTokens,
    address,
    walletBalances,
  )

  const fromToken = state.fromTokenDenom
    ? swapTokens.find((t) => t.denom === state.fromTokenDenom)
    : null
  const toToken = state.toTokenDenom ? swapTokens.find((t) => t.denom === state.toTokenDenom) : null

  const {
    data: forwardRouteInfo,
    isLoading: isForwardRouteLoading,
    error: forwardRouteError,
  } = useRouteInfo(
    fromToken?.denom || '',
    toToken?.denom || '',
    new BigNumber(state.fromAmount || '0').shiftedBy(fromToken?.decimals || 8),
    markets || [],
    state.slippage,
  )

  const {
    data: reverseRouteInfo,
    isLoading: isReverseRouteLoading,
    error: reverseRouteError,
  } = useRouteInfoReverse(
    fromToken?.denom || '',
    toToken?.denom || '',
    new BigNumber(state.toAmount || '0').shiftedBy(toToken?.decimals || 8),
    markets || [],
    state.slippage,
  )

  const hasInsufficientBalance =
    fromToken &&
    state.fromAmount &&
    new BigNumber(state.fromAmount).isGreaterThan(fromToken.balance)

  const isDebouncePending = false // Simplified for now

  const routeInfo = state.editingDirection === 'from' ? forwardRouteInfo : reverseRouteInfo
  const isRouteLoading =
    state.editingDirection === 'from' ? isForwardRouteLoading : isReverseRouteLoading
  const routeError = state.editingDirection === 'from' ? forwardRouteError : reverseRouteError

  // Update amounts based on route info
  useEffect(() => {
    if (state.editingDirection === 'from') {
      if (forwardRouteInfo?.amountOut && toToken) {
        const toAmountCalculated = new BigNumber(forwardRouteInfo.amountOut).shiftedBy(
          -toToken.decimals,
        )
        const newToAmount = toAmountCalculated.toString()
        if (state.toAmount !== newToAmount) {
          actions.setToAmount(newToAmount)
        }
      } else if (!forwardRouteInfo && state.toAmount !== '') {
        actions.setToAmount('')
      }
    } else if (state.editingDirection === 'to') {
      if (reverseRouteInfo && (reverseRouteInfo as any).amountIn && fromToken) {
        const fromAmountCalculated = new BigNumber((reverseRouteInfo as any).amountIn).shiftedBy(
          -fromToken.decimals,
        )
        const newFromAmount = fromAmountCalculated.toString()
        if (state.fromAmount !== newFromAmount) {
          actions.setFromAmount(newFromAmount)
        }
      } else if (!reverseRouteInfo && state.fromAmount !== '') {
        actions.setFromAmount('')
      }
    }
  }, [
    state.editingDirection,
    forwardRouteInfo,
    reverseRouteInfo,
    toToken,
    fromToken,
    state.toAmount,
    state.fromAmount,
  ])

  const fromUsdValue =
    fromToken?.price && state.fromAmount ? fromToken.price * parseFloat(state.fromAmount) : 0
  const toUsdValue =
    toToken?.price && state.toAmount ? toToken.price * parseFloat(state.toAmount) : 0

  const isWalletConnected = !!address
  const showInsufficientFunds = isWalletConnected && hasInsufficientBalance

  const getDisabledTokens = () => {
    if (state.selectingFrom) {
      return state.toTokenDenom ? [state.toTokenDenom] : []
    }
    return state.fromTokenDenom ? [state.fromTokenDenom] : []
  }

  return {
    swapTokens,
    bestToken,
    shouldInitialize,
    markInitialized,
    fromToken,
    toToken,
    hasInsufficientBalance,
    routeInfo,
    isRouteLoading,
    routeError,
    isDebouncePending,
    fromUsdValue,
    toUsdValue,
    isWalletConnected,
    showInsufficientFunds,
    disabledTokens: getDisabledTokens(),
  }
}
