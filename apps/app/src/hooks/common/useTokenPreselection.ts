import { useCallback, useEffect, useMemo, useState } from 'react'

import { MAXBTC_DENOM } from '@/constants/query'

export function useTokenPreselection(
  swapTokens: Token[],
  address: string | undefined,
  walletBalances: WalletBalance[],
): UseTokenPreselectionReturn {
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    setHasInitialized(false)
  }, [address])

  const bestToken = useMemo(() => {
    if (!swapTokens.length) return null

    // If connected and have balances, find token with highest USD value
    if (address && walletBalances?.length) {
      const tokenWithHighestValue = swapTokens
        .filter((token) => {
          const balance = walletBalances.find((b) => b.denom === token.denom)
          return balance && parseFloat(balance.amount) > 0
        })
        .reduce(
          (best, current) => {
            const currentValue = parseFloat(current.usdValue)
            const bestValue = parseFloat(best?.usdValue || '0')
            return currentValue > bestValue ? current : best
          },
          null as Token | null,
        )

      if (tokenWithHighestValue) return tokenWithHighestValue
    }

    // Fallback to maxBTC
    return swapTokens.find((token) => token.denom === MAXBTC_DENOM) || null
  }, [swapTokens, address, walletBalances])

  const shouldInitialize =
    !hasInitialized && swapTokens.length > 0 && (address ? walletBalances?.length > 0 : true)

  const markInitialized = useCallback(() => setHasInitialized(true), [])

  return {
    bestToken,
    shouldInitialize,
    markInitialized,
  }
}
