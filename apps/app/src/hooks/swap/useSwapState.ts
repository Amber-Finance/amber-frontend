import { useCallback, useReducer } from 'react'

import { safeParseNumber } from '@/utils/common/functional'

// Initial state
const initialState: SwapState = {
  fromTokenDenom: null,
  toTokenDenom: null,
  fromAmount: '',
  toAmount: '',
  editingDirection: 'from',
  slippage: 0.5,
  customSlippage: '',
  showSlippagePopover: false,
  isTokenModalOpen: false,
  selectingFrom: true,
  isSwapInProgress: false,
  sliderPercentage: 0,
}

// Pure reducer function
const swapReducer = (state: SwapState, action: SwapAction): SwapState => {
  switch (action.type) {
    case 'SET_FROM_TOKEN':
      return { ...state, fromTokenDenom: action.payload }

    case 'SET_TO_TOKEN':
      return { ...state, toTokenDenom: action.payload }

    case 'SET_FROM_AMOUNT':
      return { ...state, fromAmount: action.payload }

    case 'SET_TO_AMOUNT':
      return { ...state, toAmount: action.payload }

    case 'SET_SLIPPAGE':
      return {
        ...state,
        slippage: action.payload,
        customSlippage: '',
      }

    case 'SET_CUSTOM_SLIPPAGE':
      return { ...state, customSlippage: action.payload }

    case 'TOGGLE_SLIPPAGE_POPOVER':
      return {
        ...state,
        showSlippagePopover: action.payload ?? !state.showSlippagePopover,
      }

    case 'TOGGLE_TOKEN_MODAL':
      return {
        ...state,
        isTokenModalOpen: action.payload ?? !state.isTokenModalOpen,
      }

    case 'SET_SELECTING_FROM':
      return { ...state, selectingFrom: action.payload }

    case 'SET_SWAP_IN_PROGRESS':
      return { ...state, isSwapInProgress: action.payload }

    case 'SET_SLIDER_PERCENTAGE':
      return { ...state, sliderPercentage: action.payload }

    case 'SWAP_TOKENS':
      return {
        ...state,
        fromTokenDenom: state.toTokenDenom,
        toTokenDenom: state.fromTokenDenom,
        fromAmount: state.toAmount,
        toAmount: state.fromAmount,
      }

    case 'RESET_AMOUNTS':
      return {
        ...state,
        fromAmount: '',
        toAmount: '',
        sliderPercentage: 0,
      }

    case 'RESET_STATE':
      return { ...initialState, slippage: state.slippage } // Keep slippage setting

    default:
      return state
  }
}

// Custom hook
export const useSwapState = () => {
  const [state, dispatch] = useReducer(swapReducer, initialState)

  // Action creators (pure functions)
  const actions = {
    setFromToken: useCallback(
      (denom: string | null) => dispatch({ type: 'SET_FROM_TOKEN', payload: denom }),
      [],
    ),

    setToToken: useCallback(
      (denom: string | null) => dispatch({ type: 'SET_TO_TOKEN', payload: denom }),
      [],
    ),

    setFromAmount: useCallback(
      (amount: string) => dispatch({ type: 'SET_FROM_AMOUNT', payload: amount }),
      [],
    ),

    setToAmount: useCallback(
      (amount: string) => dispatch({ type: 'SET_TO_AMOUNT', payload: amount }),
      [],
    ),

    setSlippage: useCallback(
      (slippage: number) => dispatch({ type: 'SET_SLIPPAGE', payload: slippage }),
      [],
    ),

    setCustomSlippage: useCallback(
      (slippage: string) => dispatch({ type: 'SET_CUSTOM_SLIPPAGE', payload: slippage }),
      [],
    ),

    toggleSlippagePopover: useCallback(
      (show?: boolean) => dispatch({ type: 'TOGGLE_SLIPPAGE_POPOVER', payload: show }),
      [],
    ),

    toggleTokenModal: useCallback(
      (show?: boolean) => dispatch({ type: 'TOGGLE_TOKEN_MODAL', payload: show }),
      [],
    ),

    setSelectingFrom: useCallback(
      (selecting: boolean) => dispatch({ type: 'SET_SELECTING_FROM', payload: selecting }),
      [],
    ),

    setSwapInProgress: useCallback(
      (inProgress: boolean) => dispatch({ type: 'SET_SWAP_IN_PROGRESS', payload: inProgress }),
      [],
    ),

    setSliderPercentage: useCallback(
      (percentage: number) => dispatch({ type: 'SET_SLIDER_PERCENTAGE', payload: percentage }),
      [],
    ),

    swapTokens: useCallback(() => dispatch({ type: 'SWAP_TOKENS' }), []),

    resetAmounts: useCallback(() => dispatch({ type: 'RESET_AMOUNTS' }), []),

    resetState: useCallback(() => dispatch({ type: 'RESET_STATE' }), []),
  }

  // Derived state (computed values)
  const computed = {
    hasFromToken: state.fromTokenDenom !== null,
    hasToToken: state.toTokenDenom !== null,
    hasAmount: state.fromAmount !== '' && safeParseNumber()(state.fromAmount) > 0,
    canSwap:
      state.fromTokenDenom !== null &&
      state.toTokenDenom !== null &&
      state.fromAmount !== '' &&
      !state.isSwapInProgress,
  }

  return {
    state,
    actions,
    computed,
  }
}
