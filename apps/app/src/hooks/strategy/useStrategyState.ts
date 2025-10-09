import React, { useCallback, useReducer } from 'react'

import { clamp, safeParseNumber } from '@/utils/common/functional'
import { calculatePositionMetrics } from '@/utils/strategy/strategyUtils'

// Initial state
const initialState: StrategyState = {
  collateralAmount: '',
  multiplier: 1.5,
  isProcessing: false,
  error: null,
  selectedStrategy: null,
}

// Pure reducer function
const strategyReducer = (state: StrategyState, action: StrategyAction): StrategyState => {
  switch (action.type) {
    case 'SET_COLLATERAL_AMOUNT':
      return {
        ...state,
        collateralAmount: action.payload,
        error: null, // Clear error when user changes input
      }

    case 'SET_MULTIPLIER':
      return {
        ...state,
        multiplier: clamp(1)(10)(action.payload), // Clamp between 1 and 10
        error: null,
      }

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isProcessing: false }

    case 'SET_SELECTED_STRATEGY':
      return { ...state, selectedStrategy: action.payload }

    case 'RESET_FORM':
      return {
        ...state,
        collateralAmount: '',
        multiplier: 1.5,
        error: null,
      }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

// Custom hook
export const useStrategyState = () => {
  const [state, dispatch] = useReducer(strategyReducer, initialState)

  // Action creators (pure functions)
  const actions = {
    setCollateralAmount: useCallback(
      (amount: string) => dispatch({ type: 'SET_COLLATERAL_AMOUNT', payload: amount }),
      [],
    ),

    setMultiplier: useCallback(
      (multiplier: number) => dispatch({ type: 'SET_MULTIPLIER', payload: multiplier }),
      [],
    ),

    setProcessing: useCallback(
      (processing: boolean) => dispatch({ type: 'SET_PROCESSING', payload: processing }),
      [],
    ),

    setError: useCallback(
      (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
      [],
    ),

    setSelectedStrategy: useCallback(
      (strategy: string | null) => dispatch({ type: 'SET_SELECTED_STRATEGY', payload: strategy }),
      [],
    ),

    resetForm: useCallback(() => dispatch({ type: 'RESET_FORM' }), []),

    resetState: useCallback(() => dispatch({ type: 'RESET_STATE' }), []),
  }

  // Derived state (computed values)
  const computed = {
    currentAmount: safeParseNumber()(state.collateralAmount),
    hasValidAmount: state.collateralAmount !== '' && safeParseNumber()(state.collateralAmount) > 0,
    canDeploy:
      state.collateralAmount !== '' &&
      safeParseNumber()(state.collateralAmount) > 0 &&
      !state.isProcessing &&
      !state.error,

    // Calculate position metrics based on current inputs
    getPositionMetrics: (supplyApy: number, borrowApy: number) => {
      const amount = safeParseNumber()(state.collateralAmount)
      if (amount <= 0) {
        return {
          borrowAmount: 0,
          totalSupplied: 0,
          leveragedApy: 0,
          estimatedYearlyEarnings: 0,
          netApy: 0,
        }
      }
      return calculatePositionMetrics(amount, state.multiplier, supplyApy, borrowApy)
    },
  }

  return {
    state,
    actions,
    computed,
  }
}

// Higher-order hook for strategy-specific state
export const useStrategyStateWithDefaults = (
  defaultStrategy?: string,
  defaultMultiplier?: number,
) => {
  const strategyState = useStrategyState()

  // Set defaults on mount if provided
  React.useEffect(() => {
    if (defaultStrategy && !strategyState.state.selectedStrategy) {
      strategyState.actions.setSelectedStrategy(defaultStrategy)
    }
    if (defaultMultiplier && strategyState.state.multiplier === 1.5) {
      strategyState.actions.setMultiplier(defaultMultiplier)
    }
  }, [defaultStrategy, defaultMultiplier])

  return strategyState
}
