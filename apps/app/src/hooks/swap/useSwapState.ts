import { useState } from 'react'

export const useSwapState = () => {
  const [state, setState] = useState<SwapState>({
    fromTokenDenom: null,
    toTokenDenom: null,
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    customSlippage: '',
    showSlippagePopover: false,
    sliderPercentage: 0,
    isTokenModalOpen: false,
    selectingFrom: true,
    isSwapInProgress: false,
    editingDirection: 'from',
  })

  const actions: SwapActions = {
    setFromTokenDenom: (denom) => setState((prev) => ({ ...prev, fromTokenDenom: denom })),
    setToTokenDenom: (denom) => setState((prev) => ({ ...prev, toTokenDenom: denom })),
    setFromAmount: (amount) => setState((prev) => ({ ...prev, fromAmount: amount })),
    setToAmount: (amount) => setState((prev) => ({ ...prev, toAmount: amount })),
    setSlippage: (slippage) => setState((prev) => ({ ...prev, slippage })),
    setCustomSlippage: (customSlippage) => setState((prev) => ({ ...prev, customSlippage })),
    setShowSlippagePopover: (show) => setState((prev) => ({ ...prev, showSlippagePopover: show })),
    setTokenModalOpen: (open) => setState((prev) => ({ ...prev, isTokenModalOpen: open })),
    setSelectingFrom: (selecting) => setState((prev) => ({ ...prev, selectingFrom: selecting })),
    setIsSwapInProgress: (inProgress) =>
      setState((prev) => ({ ...prev, isSwapInProgress: inProgress })),
    setEditingDirection: (direction) =>
      setState((prev) => ({ ...prev, editingDirection: direction })),

    resetAmounts: () => setState((prev) => ({ ...prev, fromAmount: '', toAmount: '' })),

    swapTokens: () =>
      setState((prev) => ({
        ...prev,
        fromTokenDenom: prev.toTokenDenom,
        toTokenDenom: prev.fromTokenDenom,
        fromAmount: prev.toAmount,
        toAmount: prev.fromAmount,
        editingDirection: 'from',
      })),
  }

  return { state, actions }
}
