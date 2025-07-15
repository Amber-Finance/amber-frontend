import { useCallback, useState } from 'react'

import { useChain } from '@cosmos-kit/react'
import { route as skipRoute } from '@skip-go/client'
import BigNumber from 'bignumber.js'

import chainConfig from '@/config/chain'

export interface SwapRouteInfo {
  amountOut: BigNumber
  priceImpact: BigNumber
  fee: BigNumber
  description: string
  route: any
}

export interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance?: string
  price?: number
  denom: string
  usdValue?: string
}

// Utility functions from Mars V2
function analyzeVenues(skipRouteResponse: any): 'duality' | 'unknown' {
  if (!skipRouteResponse) return 'unknown'
  if (!skipRouteResponse.swapVenues && !skipRouteResponse.operations) return 'unknown'

  const venuesUsed = new Set<string>()

  skipRouteResponse.swapVenues?.forEach((venue: any) => {
    if (venue?.name) venuesUsed.add(venue.name)
  })

  skipRouteResponse.operations?.forEach((operation: any) => {
    const venueName = operation?.swap?.swapIn?.swapVenue?.name
    if (venueName) venuesUsed.add(venueName)
  })

  if (venuesUsed.size === 0) return 'unknown'
  if (venuesUsed.size > 1) return 'unknown' // Only accept single venue

  const singleVenue = Array.from(venuesUsed)[0]
  if (singleVenue === 'neutron-duality') return 'duality'

  return 'unknown'
}

function extractSwapOperations(skipRouteResponse: any): any[] {
  const firstOperation = (skipRouteResponse.operations?.[0] as any)?.swap?.swapIn?.swapOperations
  return firstOperation || []
}

function createDualityRoute(denomIn: string, denomOut: string, swapOperations: any[]): any {
  const swapDenoms: string[] = [denomIn]

  swapOperations.forEach((op: any) => {
    if (op.denomOut && !swapDenoms.includes(op.denomOut)) {
      swapDenoms.push(op.denomOut)
    }
  })

  // Ensure denomOut is included if not already present
  if (!swapDenoms.includes(denomOut)) {
    swapDenoms.push(denomOut)
  }

  return {
    duality: {
      from: denomIn,
      swap_denoms: swapDenoms,
      to: denomOut,
    },
  }
}

function createSwapDescription(
  denomIn: string,
  denomOut: string,
  fromToken: SwapToken,
  toToken: SwapToken,
): string {
  return `${fromToken.symbol} → ${toToken.symbol}`
}

function buildSwapRouteInfo(
  skipRouteResponse: any,
  route: any,
  description: string,
): SwapRouteInfo {
  let priceImpact = new BigNumber(0)

  if (skipRouteResponse.swapPriceImpactPercent) {
    priceImpact = new BigNumber(skipRouteResponse.swapPriceImpactPercent)
  } else if (skipRouteResponse.usdAmountIn && skipRouteResponse.usdAmountOut) {
    const usdAmountIn = new BigNumber(skipRouteResponse.usdAmountIn)
    const usdAmountOut = new BigNumber(skipRouteResponse.usdAmountOut)

    if (usdAmountIn.gt(0)) {
      // Price impact = ((usdAmountOut - usdAmountIn) / usdAmountIn) * 100
      priceImpact = usdAmountOut.minus(usdAmountIn).dividedBy(usdAmountIn).multipliedBy(100)
    }
  }

  return {
    amountOut: new BigNumber(skipRouteResponse.amountOut || '0'),
    priceImpact,
    fee: new BigNumber(0),
    description,
    route,
  }
}

async function getNeutronRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: string,
  fromToken: SwapToken,
  toToken: SwapToken,
  _slippage: number,
): Promise<SwapRouteInfo | null> {
  try {
    const skipRouteParams = {
      amountIn: amount,
      sourceAssetDenom: denomIn,
      sourceAssetChainId: chainConfig.id.toString(),
      destAssetDenom: denomOut,
      destAssetChainId: chainConfig.id.toString(),
      allowUnsafe: true,
      swapVenues: [{ name: 'neutron-duality', chainId: chainConfig.id }], // Only Duality, no Astroport
      smartSwapOptions: {
        splitRoutes: true,
        evmSwaps: true,
      },
    }

    const skipRouteResponse = await skipRoute(skipRouteParams)

    if (!skipRouteResponse) {
      return null // No fallback
    }

    const venueType = analyzeVenues(skipRouteResponse)

    if (venueType !== 'duality') {
      return null // Only accept Duality routes
    }

    const swapOperations = extractSwapOperations(skipRouteResponse)
    const route = createDualityRoute(denomIn, denomOut, swapOperations)
    const description = createSwapDescription(denomIn, denomOut, fromToken, toToken)
    const routeInfo = buildSwapRouteInfo(skipRouteResponse, route, description)

    return routeInfo
  } catch (error) {
    console.error('Failed to fetch swap route:', error)
    return null // No fallback
  }
}

export function useSwap() {
  const { address } = useChain(chainConfig.name)
  const [isSwapInProgress, setIsSwapInProgress] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)

  const fetchSwapRoute = useCallback(
    async (
      fromToken: SwapToken,
      toToken: SwapToken,
      amount: string,
      slippage: number = 0.5,
    ): Promise<SwapRouteInfo | null> => {
      if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
        return null
      }

      try {
        setSwapError(null)

        // Convert amount to proper format (assuming 6 decimals for most tokens)
        const decimals = 6
        const amountIn = new BigNumber(amount).shiftedBy(decimals).toString()

        return await getNeutronRouteInfo(
          fromToken.denom,
          toToken.denom,
          amountIn,
          fromToken,
          toToken,
          slippage,
        )
      } catch (error: any) {
        console.error('Failed to fetch swap route:', error)
        setSwapError(error.message || 'Failed to fetch swap route')
        return null
      }
    },
    [],
  )

  const executeSwap = useCallback(
    async (
      fromToken: SwapToken,
      toToken: SwapToken,
      amount: string,
      slippage: number = 0.5,
    ): Promise<boolean> => {
      if (!address) {
        setSwapError('Wallet not connected')
        return false
      }

      if (isSwapInProgress) {
        return false
      }

      try {
        setIsSwapInProgress(true)
        setSwapError(null)

        const routeInfo = await fetchSwapRoute(fromToken, toToken, amount, slippage)

        if (!routeInfo) {
          setSwapError('No route available')
          return false
        }

        console.log('Swap Route Info:', routeInfo)
        console.log('Executing swap:', {
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          amount,
          slippage,
          amountOut: routeInfo.amountOut.toString(),
          priceImpact: routeInfo.priceImpact.toString(),
        })

        // TODO: Implement actual swap execution
        // This would involve creating and broadcasting a transaction
        // using the route information from Skip

        return true
      } catch (error: any) {
        console.error('Swap execution failed:', error)
        setSwapError(error.message || 'Swap execution failed')
        return false
      } finally {
        setIsSwapInProgress(false)
      }
    },
    [address, isSwapInProgress, fetchSwapRoute],
  )

  return {
    fetchSwapRoute,
    executeSwap,
    isSwapInProgress,
    swapError,
    clearError: () => setSwapError(null),
  }
}
