import { RouteRequest, route as skipRoute } from '@skip-go/client'
import BigNumber from 'bignumber.js'

import { BN, byDenom, toIntegerString } from '@/utils/helpers'

type VenueType = 'duality' | 'unknown'

function analyzeVenues(skipRouteResponse: any): VenueType {
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

function createSwapDescription(denomIn: string, denomOut: string, assets: TokenInfo[]): string {
  return [
    assets.find(byDenom(denomIn))?.symbol || denomIn,
    assets.find(byDenom(denomOut))?.symbol || denomOut,
  ].join(' -> ')
}

function buildSwapRouteInfo(
  skipRouteResponse: any,
  route: any,
  description: string,
  isReverse: boolean = false,
): SwapRouteInfo {
  let priceImpact = BN('0')

  if (skipRouteResponse.swapPriceImpactPercent) {
    priceImpact = BN(skipRouteResponse.swapPriceImpactPercent)
  } else if (skipRouteResponse.usdAmountIn && skipRouteResponse.usdAmountOut) {
    const usdAmountIn = BN(skipRouteResponse.usdAmountIn)
    const usdAmountOut = BN(skipRouteResponse.usdAmountOut)

    if (usdAmountIn.gt(0)) {
      priceImpact = usdAmountOut.minus(usdAmountIn).dividedBy(usdAmountIn).multipliedBy(100)
    }
  }

  const routeInfo: SwapRouteInfo = {
    amountOut: BN(skipRouteResponse.amountOut || '0'),
    priceImpact,
    fee: BN('0'),
    description,
    route,
  }

  return routeInfo
}

/**
 * Shared internal function for both normal and reverse routing
 */
async function getNeutronRouteInfoInternal(
  denomIn: string,
  denomOut: string,
  assets: TokenInfo[],
  chainConfig: ChainConfig,
  routeParams: any,
  isReverse: boolean = false,
): Promise<SwapRouteInfo | null> {
  try {
    const amountInWithDecimals = new BigNumber(routeParams.amountIn).integerValue().toString()

    const skipRouteParams = {
      amount_in: amountInWithDecimals,
      source_asset_chain_id: chainConfig.id,
      source_asset_denom: denomIn,
      dest_asset_chain_id: chainConfig.id,
      dest_asset_denom: denomOut,
      smart_relay: true,
      experimental_features: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
      allow_multi_tx: true,
      allow_unsafe: true,
      smart_swap_options: {
        split_routes: true,
        evm_swaps: true,
      },
      // Force only Duality swaps for Mars strategies
      swapVenues: [{ name: 'neutron-duality', chainId: chainConfig.id }],
      go_fast: false,
    }

    const skipRouteResponse = await skipRoute(skipRouteParams as RouteRequest)

    if (!skipRouteResponse) {
      throw new Error('No route response from Skip API')
    }

    const venueType = analyzeVenues(skipRouteResponse)

    if (venueType === 'unknown') {
      // Log the actual venues found for debugging
      const venues = new Set<string>()
      skipRouteResponse.swapVenues?.forEach((venue: any) => {
        if (venue?.name) venues.add(venue.name)
      })
      skipRouteResponse.operations?.forEach((operation: any) => {
        const venueName = operation?.swap?.swapIn?.swapVenue?.name
        if (venueName) venues.add(venueName)
      })

      console.error('No Duality routes available. Found venues:', Array.from(venues))
      console.error(
        'This route requires cross-chain swaps which are not supported in Mars credit manager',
      )
      throw new Error(
        `No direct Duality swap available between these assets. Mars strategies only support native Neutron swaps, not cross-chain routes.`,
      )
    }

    const swapOperations = extractSwapOperations(skipRouteResponse)

    const route = createDualityRoute(denomIn, denomOut, swapOperations)

    const description = createSwapDescription(denomIn, denomOut, assets)

    const routeInfo = buildSwapRouteInfo(skipRouteResponse, route, description, isReverse)

    if (!routeInfo.amountOut.gt(0))
      routeInfo.amountOut = routeInfo.amountOut
        .times(1 - chainConfig.swapFee)
        .integerValue(BigNumber.ROUND_FLOOR)

    return routeInfo
  } catch (error) {
    console.error('There was an error getting the route info', error)
    throw error
  }
}

/**
 * Reverse routing function that uses minAmountOut instead of amountIn
 */
/**
 * Implements reverse routing using Skip API's native reverse swap support
 * Uses the swapOut operation to specify exact output amount needed
 */
export async function getNeutronRouteInfoReverse(
  denomIn: string,
  denomOut: string,
  amountOut: BigNumber,
  assets: TokenInfo[],
  chainConfig: ChainConfig,
  slippage?: number, // Will use default from settings if not provided
): Promise<SwapRouteInfo | null> {
  // Use default slippage from settings if not provided
  const effectiveSlippage = slippage ?? 0.5

  try {
    const skipRouteParams = {
      source_asset_chain_id: chainConfig.id,
      source_asset_denom: denomIn,
      dest_asset_chain_id: chainConfig.id,
      dest_asset_denom: denomOut,
      smart_relay: true,
      experimental_features: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
      allow_multi_tx: true,
      allow_unsafe: true,
      smart_swap_options: {
        split_routes: true,
        evm_swaps: true,
      },
      swapVenues: [{ name: 'neutron-duality', chainId: chainConfig.id }],
      experimentalFeatures: ['stargate', 'eureka'],
      smartRelay: true,
      go_fast: false,
      // Use reverse routing parameters
      amount_out: toIntegerString(amountOut),
    }

    const skipRouteResponse = await skipRoute(skipRouteParams as any)

    if (!skipRouteResponse) {
      throw new Error('No route response from Skip API')
    }

    const venueType = analyzeVenues(skipRouteResponse)

    if (venueType === 'unknown') {
      // Log the actual venues found for debugging
      const venues = new Set<string>()
      skipRouteResponse.swapVenues?.forEach((venue: any) => {
        if (venue?.name) venues.add(venue.name)
      })
      skipRouteResponse.operations?.forEach((operation: any) => {
        const venueName = operation?.swap?.swapIn?.swapVenue?.name
        if (venueName) venues.add(venueName)
      })

      console.error(
        'No Duality routes available for reverse routing. Found venues:',
        Array.from(venues),
      )
      throw new Error(
        `No direct Duality swap available between these assets. Mars strategies only support native Neutron swaps, not cross-chain routes.`,
      )
    }

    const swapOperations = extractSwapOperations(skipRouteResponse)

    const route = createDualityRoute(denomIn, denomOut, swapOperations)

    const description = createSwapDescription(denomIn, denomOut, assets)

    const routeInfo = buildSwapRouteInfo(skipRouteResponse, route, description, false)

    // For reverse routing, add the amountIn that Skip calculated
    if (skipRouteResponse.amountIn) {
      ;(routeInfo as any).amountIn = BN(skipRouteResponse.amountIn)
    } else {
      ;(routeInfo as any).amountIn = null
    }

    // Ensure amountOut matches what we requested
    routeInfo.amountOut = amountOut

    return routeInfo
  } catch (error) {
    // Fallback to binary search if native reverse routing fails
    try {
      return await binarySearchReverseRouting(
        denomIn,
        denomOut,
        amountOut,
        assets,
        chainConfig,
        effectiveSlippage,
      )
    } catch (fallbackError) {
      console.error('Both reverse routing methods failed', error, fallbackError)
      throw error
    }
  }
}

/**
 * Binary search approach to find the right input amount for exact output
 * Much more precise than the previous iterative approach
 */
async function binarySearchReverseRouting(
  denomIn: string,
  denomOut: string,
  targetAmountOut: BigNumber,
  assets: TokenInfo[],
  chainConfig: ChainConfig,
  slippage: number,
): Promise<SwapRouteInfo | null> {
  // Work with integers from the start - convert target to integer
  const targetAmountOutInt = BN(toIntegerString(targetAmountOut))

  // Use slippage to define realistic search bounds
  let low = targetAmountOutInt.times(1 - slippage).integerValue(BigNumber.ROUND_CEIL) // Minimum amount (target - slippage)
  let high = targetAmountOutInt.times(1 + slippage).integerValue(BigNumber.ROUND_CEIL) // Maximum amount (target + slippage)
  let bestRoute: SwapRouteInfo | null = null
  let bestAmountIn = BN('0')

  const tolerance = BigNumber.max(BN(toIntegerString(targetAmountOutInt.times(0.0005))), BN('1')) // 0.05% tolerance, minimum 1
  const maxIterations = 10

  for (let i = 0; i < maxIterations; i++) {
    const mid = BN(toIntegerString(low.plus(high).dividedBy(2))) // Always integer

    try {
      const route = await getNeutronRouteInfoInternal(
        denomIn,
        denomOut,
        assets,
        chainConfig,
        { amountIn: mid.toString() },
        false,
      )

      if (!route || route.amountOut.isZero()) {
        low = mid.plus(1) // Try higher amount
        continue
      }

      const diff = route.amountOut.minus(targetAmountOutInt)

      // Save the best route so far
      if (!bestRoute || diff.abs().lt(bestRoute.amountOut.minus(targetAmountOutInt).abs())) {
        bestRoute = route
        bestAmountIn = mid
      }

      // Check if we're within tolerance
      if (diff.abs().lte(tolerance)) {
        break
      }

      // Adjust search range (keep integers)
      if (diff.gt(0)) {
        // We got more than needed, try smaller input
        high = mid.minus(1) // Ensure we don't get stuck
      } else {
        // We got less than needed, try larger input
        low = mid.plus(1) // Ensure we don't get stuck
      }
    } catch (error) {
      low = mid.plus(1) // Try higher amount on error (keep integers)
    }
  }

  if (bestRoute) {
    // Add the calculated amountIn to the route
    ;(bestRoute as any).amountIn = bestAmountIn
    return bestRoute
  }

  throw new Error('No route found through binary search')
}

export default async function getNeutronRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: BigNumber,
  assets: TokenInfo[],
  chainConfig: ChainConfig,
): Promise<SwapRouteInfo | null> {
  return getNeutronRouteInfoInternal(
    denomIn,
    denomOut,
    assets,
    chainConfig,
    { amountIn: amount.toString() },
    false, // isReverse
  )
}
