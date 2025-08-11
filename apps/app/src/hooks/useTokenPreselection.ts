import { useEffect, useMemo, useState } from 'react'

interface Token {
  symbol: string
  name: string
  icon: string
  balance: string
  rawBalance: number
  price: number
  denom: string
  usdValue: string
  decimals: number
}

interface WalletBalance {
  denom: string
  amount: string
}

interface UseTokenPreselectionReturn {
  bestToken: Token | null
  shouldInitialize: boolean
  markInitialized: () => void
}

const WBTC_EUREKA_DENOM = 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E'

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

    // Fallback to wBTC
    return swapTokens.find((token) => token.denom === WBTC_EUREKA_DENOM) || null
  }, [swapTokens, address, walletBalances])

  const shouldInitialize =
    !hasInitialized && swapTokens.length > 0 && (address ? walletBalances?.length > 0 : true)

  return {
    bestToken,
    shouldInitialize,
    markInitialized: () => setHasInitialized(true),
  }
}
