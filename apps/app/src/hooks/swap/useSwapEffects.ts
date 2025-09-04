import { useEffect } from 'react'

interface SwapEffectsProps {
  actions: SwapActions
  address: string | undefined
  searchParams: URLSearchParams
  swapTokens: any[]
  bestToken: any
  shouldInitialize: boolean
  markInitialized: () => void
}

export const useSwapEffects = ({
  actions,
  address,
  searchParams,
  swapTokens,
  bestToken,
  shouldInitialize,
  markInitialized,
}: SwapEffectsProps) => {
  // Clear tokens when wallet disconnects
  useEffect(() => {
    if (!address) {
      actions.setFromTokenDenom(null)
      actions.setToTokenDenom(null)
    }
  }, [address, actions])

  // Handle URL params and token initialization
  useEffect(() => {
    const toTokenParam = searchParams.get('to')
    if (toTokenParam && swapTokens.length > 0) {
      const token = swapTokens.find((t) => t.denom === toTokenParam)
      if (token) {
        actions.setToTokenDenom(toTokenParam)
      }
    }

    if (shouldInitialize && bestToken) {
      actions.setFromTokenDenom(bestToken.denom)
      markInitialized()
    }
  }, [searchParams, swapTokens.length, shouldInitialize, bestToken, actions, markInitialized])
}
