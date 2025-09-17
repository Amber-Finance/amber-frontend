import BigNumber from 'bignumber.js'

export function getMinAmountOutFromRouteInfo(
  routeInfo: SwapRouteInfo,
  slippage: number,
): BigNumber {
  return new BigNumber(routeInfo?.amountOut ?? 0).times(1 - slippage / 100)
}

export function getSwapExactInAction(
  coinIn: Coin,
  denomOut: string,
  routeInfo: SwapRouteInfo,
  slippage: number,
) {
  return {
    swap_exact_in: {
      coin_in: coinIn,
      denom_out: denomOut,
      route: routeInfo?.route,
      min_receive: getMinAmountOutFromRouteInfo(routeInfo, slippage).integerValue().toString(),
    },
  }
}
