import BigNumber from 'bignumber.js'

// The contract expects a simple Coin structure
interface Coin {
  denom: string
  amount: string
}

export interface SwapAction {
  swap_exact_in: {
    coin_in: Coin
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

export function getSwapExactInAction(
  coinIn: Coin,
  denomOut: string,
  routeInfo: SwapRouteInfo,
  slippage: number,
): SwapAction {
  return {
    swap_exact_in: {
      coin_in: coinIn,
      denom_out: denomOut,
      route: routeInfo?.route,
      min_receive: getMinAmountOutFromRouteInfo(routeInfo, slippage).integerValue().toString(),
    },
  }
}
