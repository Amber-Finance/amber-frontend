import { useCallback, useReducer } from 'react'

import { BigNumber } from 'bignumber.js'

import { clamp, safeParseNumber } from '@/utils/functional'

// Initial state
const initialState: DepositState = {
  activeTab: 'deposit',
  depositAmount: '',
  withdrawAmount: '',
  sliderPercentage: 0,
  lastAction: null,
}

// Pure function to calculate amount from percentage
const calculateAmountFromPercentage = (percentage: number, maxAmount: number): string => {
  if (maxAmount <= 0 || percentage <= 0) return ''
  return new BigNumber(maxAmount).multipliedBy(percentage).dividedBy(100).toString()
}

// Pure function to calculate percentage from amount
const calculatePercentageFromAmount = (amount: string, maxAmount: number): number => {
  if (!amount || maxAmount <= 0) return 0
  const parsedAmount = safeParseNumber()(amount)
  return clamp(0)(100)(Math.min((parsedAmount / maxAmount) * 100, 100))
}

// Pure reducer function
const depositReducer = (state: DepositState, action: DepositAction): DepositState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
        // Reset amounts when switching tabs to avoid confusion
        depositAmount: '',
        withdrawAmount: '',
        sliderPercentage: 0,
      }

    case 'SET_DEPOSIT_AMOUNT':
      return { ...state, depositAmount: action.payload }

    case 'SET_WITHDRAW_AMOUNT':
      return { ...state, withdrawAmount: action.payload }

    case 'SET_SLIDER_PERCENTAGE':
      return { ...state, sliderPercentage: action.payload }

    case 'SET_LAST_ACTION':
      return { ...state, lastAction: action.payload }

    case 'UPDATE_AMOUNT_FROM_SLIDER': {
      const { percentage, maxAmount } = action.payload
      const amount = calculateAmountFromPercentage(percentage, maxAmount)

      return {
        ...state,
        sliderPercentage: percentage,
        [state.activeTab === 'deposit' ? 'depositAmount' : 'withdrawAmount']: amount,
      }
    }

    case 'UPDATE_SLIDER_FROM_AMOUNT': {
      const { amount, maxAmount } = action.payload
      const percentage = calculatePercentageFromAmount(amount, maxAmount)

      return {
        ...state,
        sliderPercentage: percentage,
      }
    }

    case 'RESET_AMOUNTS':
      return {
        ...state,
        depositAmount: '',
        withdrawAmount: '',
        sliderPercentage: 0,
      }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

// Custom hook
export const useDepositState = () => {
  const [state, dispatch] = useReducer(depositReducer, initialState)

  // Action creators (pure functions)
  const actions = {
    setActiveTab: useCallback(
      (tab: 'deposit' | 'withdraw') => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
      [],
    ),

    setDepositAmount: useCallback(
      (amount: string) => dispatch({ type: 'SET_DEPOSIT_AMOUNT', payload: amount }),
      [],
    ),

    setWithdrawAmount: useCallback(
      (amount: string) => dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: amount }),
      [],
    ),

    setSliderPercentage: useCallback(
      (percentage: number) => dispatch({ type: 'SET_SLIDER_PERCENTAGE', payload: percentage }),
      [],
    ),

    setLastAction: useCallback(
      (action: 'deposit' | 'withdraw' | null) =>
        dispatch({ type: 'SET_LAST_ACTION', payload: action }),
      [],
    ),

    updateAmountFromSlider: useCallback(
      (percentage: number, maxAmount: number) =>
        dispatch({ type: 'UPDATE_AMOUNT_FROM_SLIDER', payload: { percentage, maxAmount } }),
      [],
    ),

    updateSliderFromAmount: useCallback(
      (amount: string, maxAmount: number) =>
        dispatch({ type: 'UPDATE_SLIDER_FROM_AMOUNT', payload: { amount, maxAmount } }),
      [],
    ),

    resetAmounts: useCallback(() => dispatch({ type: 'RESET_AMOUNTS' }), []),

    resetState: useCallback(() => dispatch({ type: 'RESET_STATE' }), []),
  }

  // Derived state (computed values)
  const computed = {
    currentAmount: state.activeTab === 'deposit' ? state.depositAmount : state.withdrawAmount,
    hasAmount: () => {
      const amount = state.activeTab === 'deposit' ? state.depositAmount : state.withdrawAmount
      return amount !== '' && safeParseNumber()(amount) > 0
    },
    isDepositing: state.activeTab === 'deposit',
    isWithdrawing: state.activeTab === 'withdraw',
  }

  return {
    state,
    actions,
    computed,
  }
}
