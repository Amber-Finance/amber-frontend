import BigNumber from 'bignumber.js'

interface ActionCoin {
  denom: string
  amount: {
    exact: string
  }
}

export interface SwapAction {
  swap_exact_in: {
    coin_in: ActionCoin
    denom_out: string
    min_receive: string
    route: any
  }
}

export function getMinAmountOutFromRouteInfo(
  routeInfo: SwapRouteInfo,
  slippage: number,
): BigNumber {
  return new BigNumber(routeInfo?.amountOut ?? 0).times(1 - slippage / 100)
}

// export function getSwapExactInAction(
//   coinIn: ActionCoin,
//   denomOut: string,
//   routeInfo: SwapRouteInfo,
//   slippage: number,
// ): SwapAction {
//   return {
//     swap_exact_in: {
//       coin_in: coinIn,
//       denom_out: denomOut,
//       route: routeInfo?.route,
//       min_receive: getMinAmountOutFromRouteInfo(routeInfo, slippage).integerValue().toString(),
//     },
//   }
// }

export function getSwapExactInAction(
  coinIn: ActionCoin,
  denomOut: string,
  routeInfo: SwapRouteInfo,
  slippage: number,
): SwapAction {
  // Clean the route structure to match what the contract expects
  let cleanRoute: any = null

  if (routeInfo?.route?.astro) {
    cleanRoute = {
      astro: {
        swaps: routeInfo.route.astro.swaps.map((swap: any) => ({
          from: swap.from,
          to: swap.to,
        })),
      },
    }
  } else if (routeInfo?.route?.duality) {
    cleanRoute = {
      duality: {
        from: routeInfo.route.duality.from,
        swap_denoms: routeInfo.route.duality.swap_denoms,
        to: routeInfo.route.duality.to,
      },
    }
  }

  return {
    swap_exact_in: {
      coin_in: coinIn,
      denom_out: denomOut,
      route: cleanRoute,
      min_receive: getMinAmountOutFromRouteInfo(routeInfo, slippage).integerValue().toString(),
    },
  }
}
