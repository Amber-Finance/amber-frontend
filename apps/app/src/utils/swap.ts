import BigNumber from 'bignumber.js'

import { SwapRouteInfo } from '@/hooks/useSwap'

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
  return (routeInfo?.amountOut ?? BigNumber(0)).times(1 - slippage / 100)
}

export function getSwapExactInAction(
  coinIn: ActionCoin,
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
