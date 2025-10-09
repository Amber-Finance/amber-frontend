'use client'

import { useEffect, useState } from 'react'

import chainConfig from '@/config/chain'

type UseSwapRouteParams = {
  borrowAmountForSwap: number
  isLeverageIncrease: boolean
  debtAssetDecimals: number
  debtAssetDenom: string
  collateralAssetDenom: string
  debtAssetSymbol: string
  collateralAssetSymbol: string
  currentLeverage?: number
  targetLeverage?: number
  slippage: number
  enabled: boolean
}

export default function useSwapRoute({
  borrowAmountForSwap,
  isLeverageIncrease,
  debtAssetDecimals,
  debtAssetDenom,
  collateralAssetDenom,
  debtAssetSymbol,
  collateralAssetSymbol,
  currentLeverage,
  targetLeverage,
  slippage,
  enabled,
}: UseSwapRouteParams) {
  const [swapRouteInfo, setSwapRouteInfo] = useState<SwapRouteInfo | null>(null)
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const [swapError, setSwapError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const fetchRoute = async () => {
      if (!borrowAmountForSwap || borrowAmountForSwap <= 0) {
        setSwapRouteInfo(null)
        return
      }

      setIsSwapLoading(true)
      setSwapError(null)

      try {
        const { BigNumber: BN } = await import('bignumber.js')
        const getNeutronRouteInfo = (await import('@/api/swap/getNeutronRouteInfo')).default

        let routeInfo

        if (isLeverageIncrease) {
          const swapAmount = new BN(borrowAmountForSwap).shiftedBy(debtAssetDecimals)
          routeInfo = await getNeutronRouteInfo(
            debtAssetDenom,
            collateralAssetDenom,
            swapAmount,
            [],
            chainConfig,
          )
        } else {
          const { getNeutronRouteInfoReverse } = await import('@/api/swap/getNeutronRouteInfo')
          const debtAmountNeeded = new BN(borrowAmountForSwap).shiftedBy(debtAssetDecimals)
          routeInfo = await getNeutronRouteInfoReverse(
            collateralAssetDenom,
            debtAssetDenom,
            debtAmountNeeded,
            [],
            chainConfig,
            slippage,
          )
        }

        if (!cancelled) setSwapRouteInfo(routeInfo)
      } catch (err) {
        if (!cancelled)
          setSwapError(err instanceof Error ? err : new Error('Failed to fetch swap route'))
      } finally {
        if (!cancelled) setIsSwapLoading(false)
      }
    }

    // Debounce
    const timeout = setTimeout(() => void fetchRoute(), 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [
    enabled,
    borrowAmountForSwap,
    isLeverageIncrease,
    debtAssetDecimals,
    debtAssetDenom,
    collateralAssetDenom,
    currentLeverage,
    targetLeverage,
    slippage,
  ])

  return { swapRouteInfo, isSwapLoading, swapError }
}
