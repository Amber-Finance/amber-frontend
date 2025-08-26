import useSWR from 'swr'

import getNeutronRouteInfo, { getNeutronRouteInfoReverse } from '@/api/swap/getNeutronRouteInfo'
import chainConfig from '@/config/chain'
import useDebounce from '@/hooks/useDebounce'

export default function useRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: BigNumber,
  markets: any[],
) {
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)

  // console.log('useRouteInfo', denomIn, denomOut, amount.toString(), markets, chainConfig.id)

  const neutronRoute = useSWR<SwapRouteInfo | null>(
    debouncedAmount !== '0' && markets && amount.gt(0)
      ? ['route', denomIn, denomOut, debouncedAmount, chainConfig.id]
      : null,
    async () => getNeutronRouteInfo(denomIn, denomOut, amount, markets, chainConfig),
  )

  return neutronRoute
}

/**
 * Hook for reverse routing - specify the amount out to get the required amount in
 * Specifically designed for HLS debt repayment scenarios where we need to know
 * how much collateral to swap to get an exact debt amount
 */
export function useRouteInfoReverse(
  denomIn: string,
  denomOut: string,
  amountOut: BigNumber,
  markets: any[],
  slippage?: number,
) {
  const effectiveSlippage = slippage ?? 0.5
  const debouncedAmount = useDebounce<string>(amountOut.toString(), 500)

  const neutronReverseRoute = useSWR<SwapRouteInfo | null>(
    debouncedAmount !== '0' && markets && amountOut.gt(0)
      ? ['reverse-route', denomIn, denomOut, debouncedAmount, effectiveSlippage, chainConfig.id]
      : null,
    async () =>
      getNeutronRouteInfoReverse(
        denomIn,
        denomOut,
        amountOut,
        markets,
        chainConfig,
        effectiveSlippage,
      ),
  )

  return neutronReverseRoute
}
