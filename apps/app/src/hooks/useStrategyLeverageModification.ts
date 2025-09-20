import { useCallback, useState } from 'react'

import { BigNumber } from 'bignumber.js'

import getNeutronRouteInfo, { getNeutronRouteInfoReverse } from '@/api/swap/getNeutronRouteInfo'
import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'
import { useBroadcast } from '@/utils/broadcast'
import {
  calculateCurrentLeverage,
  convertLeverageChangeToTokenAmounts,
  validateLeverageChange,
} from '@/utils/leverageCalculations'

interface UseStrategyLeverageModificationProps {
  strategy: Strategy
  accountId: string
  activeStrategy: ActiveStrategy
  slippage?: number
}

interface LeverageModificationResult {
  success: boolean
  error?: string
  newHealthFactor?: number
}

export const useStrategyLeverageModification = ({
  strategy,
  accountId,
  activeStrategy,
  slippage = 0.5,
}: UseStrategyLeverageModificationProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const { executeTransaction } = useBroadcast()
  const { markets } = useStore()

  const validateLeverageModification = useCallback(
    (targetLeverage: number): { isValid: boolean; error?: string; newHealthFactor?: number } => {
      if (!markets || !activeStrategy) {
        return { isValid: false, error: 'Market data not available' }
      }

      const collateralMarket = markets.find(
        (m) => m.asset.denom === activeStrategy.collateralAsset.denom,
      )
      const debtMarket = markets.find((m) => m.asset.denom === activeStrategy.debtAsset.denom)

      if (!collateralMarket || !debtMarket) {
        return { isValid: false, error: 'Market data not found' }
      }

      const maxLoanToValue = parseFloat(collateralMarket.params?.max_loan_to_value || '0.8')

      const validation = validateLeverageChange(
        activeStrategy.collateralAsset.usdValue,
        activeStrategy.debtAsset.usdValue,
        targetLeverage,
        maxLoanToValue,
        1.0,
      )

      return validation
    },
    [markets, activeStrategy],
  )

  const fetchSwapRoute = useCallback(
    async (
      fromDenom: string,
      toDenom: string,
      amount: BigNumber,
    ): Promise<SwapRouteInfo | null> => {
      try {
        const routeResult = await getNeutronRouteInfo(
          fromDenom,
          toDenom,
          amount,
          markets?.map((m) => m.asset) || [],
          chainConfig,
        )

        if (!routeResult) {
          throw new Error('Could not find swap route')
        }

        return routeResult
      } catch (error) {
        console.error('Route fetching failed:', error)
        return null
      }
    },
    [markets],
  )

  const prepareSwapRoute = useCallback(
    async (isIncreasing: boolean, tokenAmounts: any): Promise<SwapRouteInfo | null> => {
      if (!activeStrategy) return null

      if (isIncreasing && tokenAmounts.additionalBorrowAmount) {
        const borrowAmount = new BigNumber(tokenAmounts.additionalBorrowAmount)
        return await fetchSwapRoute(
          activeStrategy.debtAsset.denom,
          activeStrategy.collateralAsset.denom,
          borrowAmount,
        )
      }

      if (!isIncreasing && tokenAmounts.debtToRepay) {
        // Use reverse routing for decrease leverage: specify exact debt amount to repay
        const debtAmount = new BigNumber(tokenAmounts.debtToRepay)

        try {
          const routeResult = await getNeutronRouteInfoReverse(
            activeStrategy.collateralAsset.denom,
            activeStrategy.debtAsset.denom,
            debtAmount,
            markets?.map((m) => m.asset) || [],
            chainConfig,
          )

          if (!routeResult?.amountIn) {
            console.error('Reverse routing failed for leverage modification')
            return null
          }

          return routeResult
        } catch (error) {
          console.error('Error in reverse routing for leverage modification:', error)
          return null
        }
      }

      return null
    },
    [
      fetchSwapRoute,
      markets,
      activeStrategy?.debtAsset?.denom,
      activeStrategy?.collateralAsset?.denom,
    ],
  )

  const createTransactionConfig = useCallback(
    (
      isIncreasing: boolean,
      currentLeverage: number,
      targetLeverage: number,
      tokenAmounts: any,
      swapRouteInfo: SwapRouteInfo,
    ): ModifyLeverageConfig => ({
      type: 'modify_leverage',
      actionType: isIncreasing ? 'increase' : 'decrease',
      accountId,
      currentLeverage,
      targetLeverage,
      collateral: {
        amount: (() => {
          if (isIncreasing) return 0

          // For decrease leverage with reverse routing, use the exact amount from route
          if (swapRouteInfo.amountIn) {
            return swapRouteInfo.amountIn
              .shiftedBy(-(activeStrategy.collateralAsset.decimals || 8))
              .toNumber()
          }

          // Fallback to calculated amount
          return new BigNumber(tokenAmounts.collateralToWithdraw || '0')
            .shiftedBy(-(activeStrategy.collateralAsset.decimals || 8))
            .toNumber()
        })(),
        denom: activeStrategy.collateralAsset.denom,
        decimals: activeStrategy.collateralAsset.decimals || 8,
      },
      debt: {
        amount: isIncreasing
          ? new BigNumber(tokenAmounts.additionalBorrowAmount || '0')
              .shiftedBy(-(activeStrategy.debtAsset.decimals || 6))
              .toNumber()
          : 0,
        denom: activeStrategy.debtAsset.denom,
        decimals: activeStrategy.debtAsset.decimals || 6,
      },
      swap: {
        routeInfo: swapRouteInfo,
        slippage: slippage.toString(),
      },
    }),
    [accountId, activeStrategy, slippage],
  )

  const modifyLeverage = useCallback(
    async (targetLeverage: number): Promise<LeverageModificationResult> => {
      setIsProcessing(true)

      try {
        if (!activeStrategy) {
          return { success: false, error: 'No active strategy found' }
        }

        const validation = validateLeverageModification(targetLeverage)
        if (!validation.isValid) {
          return { success: false, error: validation.error }
        }

        if (!markets) {
          return { success: false, error: 'Market data not available' }
        }

        const collateralMarket = markets.find(
          (m) => m.asset.denom === activeStrategy.collateralAsset.denom,
        )
        const debtMarket = markets.find((m) => m.asset.denom === activeStrategy.debtAsset.denom)

        if (!collateralMarket || !debtMarket) {
          return { success: false, error: 'Market data not found' }
        }

        const currentLeverage = calculateCurrentLeverage(
          activeStrategy.collateralAsset.usdValue,
          activeStrategy.debtAsset.usdValue,
        )

        const isIncreasing = targetLeverage > currentLeverage

        const tokenAmounts = convertLeverageChangeToTokenAmounts(
          activeStrategy.collateralAsset.amount,
          activeStrategy.debtAsset.amount,
          collateralMarket.price?.price || '0',
          debtMarket.price?.price || '0',
          targetLeverage,
          activeStrategy.collateralAsset.decimals || 8,
          activeStrategy.debtAsset.decimals || 6,
        )

        const swapRouteInfo = await prepareSwapRoute(isIncreasing, tokenAmounts)
        if (!swapRouteInfo) {
          return { success: false, error: 'Could not find swap route for leverage modification' }
        }

        const config = createTransactionConfig(
          isIncreasing,
          currentLeverage,
          targetLeverage,
          tokenAmounts,
          swapRouteInfo,
        )

        const result = await executeTransaction(config, {
          pending: `${isIncreasing ? 'Increasing' : 'Decreasing'} leverage to ${targetLeverage.toFixed(2)}x...`,
          success: `Leverage ${isIncreasing ? 'increased' : 'decreased'} successfully to ${targetLeverage.toFixed(2)}x!`,
          error: `Failed to ${isIncreasing ? 'increase' : 'decrease'} leverage`,
        })

        return {
          success: result.success,
          error: result.error,
          newHealthFactor: validation.newHealthFactor,
        }
      } catch (error) {
        console.error('Leverage modification failed:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [
      validateLeverageModification,
      markets,
      activeStrategy,
      prepareSwapRoute,
      createTransactionConfig,
      executeTransaction,
    ],
  )

  const getMaxSafeLeverage = useCallback((): number => {
    if (!markets || !activeStrategy) return 1

    const collateralMarket = markets.find(
      (m) => m.asset.denom === activeStrategy.collateralAsset.denom,
    )
    if (!collateralMarket) return 1

    const maxLoanToValue = parseFloat(collateralMarket.params?.max_loan_to_value || '0.8')
    const minHealthFactor = 1.0 // below 1.0 is liquidation

    // Calculate max safe leverage: maxLev = LTV / (LTV - (1/minHF))
    const theoreticalMaxLeverage = maxLoanToValue / (maxLoanToValue - 1 / minHealthFactor)

    // Apply additional safety buffer
    return Math.max(1, theoreticalMaxLeverage * 0.95)
  }, [markets, activeStrategy])

  return {
    modifyLeverage,
    validateLeverageModification,
    getMaxSafeLeverage,
    isProcessing,
  }
}
