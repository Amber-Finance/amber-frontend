import { useMemo } from 'react'

interface SwapButtonProps {
  state: SwapState
  isWalletConnected: boolean
  showInsufficientFunds: boolean
  fromToken: any
  toToken: any
  routeInfo: any
  isRouteLoading: boolean
  isDebouncePending: boolean
}

export const useSwapButton = ({
  state,
  isWalletConnected,
  showInsufficientFunds,
  fromToken,
  toToken,
  routeInfo,
  isRouteLoading,
  isDebouncePending,
}: SwapButtonProps) => {
  const label = useMemo(() => {
    if (!isWalletConnected) return 'Connect Wallet'
    if (state.isSwapInProgress) return 'Swapping...'
    if (isRouteLoading || isDebouncePending) return 'Loading route...'
    if (showInsufficientFunds) return `Insufficient ${fromToken?.symbol} Balance`
    if (!fromToken || !toToken) return 'Select tokens'
    if (!state.fromAmount || !state.toAmount) return 'Enter amount'
    if (!routeInfo) return 'No route available'
    return 'Swap'
  }, [
    isWalletConnected,
    state.isSwapInProgress,
    isRouteLoading,
    isDebouncePending,
    showInsufficientFunds,
    fromToken?.symbol,
    fromToken,
    toToken,
    state.fromAmount,
    state.toAmount,
    routeInfo,
  ])

  const isDisabled = useMemo(
    () =>
      !!(
        !isWalletConnected ||
        !fromToken ||
        !toToken ||
        !state.fromAmount ||
        !state.toAmount ||
        state.isSwapInProgress ||
        isDebouncePending ||
        isRouteLoading ||
        showInsufficientFunds ||
        routeInfo === null
      ),
    [
      isWalletConnected,
      fromToken,
      toToken,
      state.fromAmount,
      state.toAmount,
      state.isSwapInProgress,
      isDebouncePending,
      isRouteLoading,
      showInsufficientFunds,
      routeInfo,
    ],
  )

  return { label, isDisabled }
}
