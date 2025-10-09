import useSWR from 'swr'

import getNeutronRouteInfo, { getNeutronRouteInfoReverse } from '@/api/swap/getNeutronRouteInfo'
import chainConfig from '@/config/chain'
import { useDebounce } from '@/hooks/common'

export default function useRouteInfo(
  denomIn: string,
  denomOut: string,
  amount: BigNumber,
  markets: any[],
  slippage?: number,
) {
  const effectiveSlippage = slippage ?? 0.5
  const debouncedAmount = useDebounce<string>(amount.toString(), 500)
  const neutronRoute = useSWR<SwapRouteInfo | null>(
    debouncedAmount !== '0' && markets && amount.gt(0)
      ? ['route', denomIn, denomOut, debouncedAmount, effectiveSlippage, chainConfig.id]
      : null,
    async () => getNeutronRouteInfo(denomIn, denomOut, amount, markets, chainConfig),
  )

  return neutronRoute
}

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
