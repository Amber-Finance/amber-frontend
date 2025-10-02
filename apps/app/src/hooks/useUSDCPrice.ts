import { useEffect, useState } from 'react'

import tokens from '@/config/tokens'
import { fetchMissingPrice } from '@/hooks/fetchMissingPrice'

export const useUSDCPrice = () => {
  const [usdcPrice, setUsdcPrice] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUSDCPrice = async () => {
      const usdcToken = tokens.find((t) => t.symbol === 'USDC')

      if (usdcToken && usdcPrice === '0') {
        setIsLoading(true)
        setError(null)

        try {
          await fetchMissingPrice(usdcToken.denom, usdcToken.decimals, (denom, priceData) => {
            setUsdcPrice(priceData.price)
            setIsLoading(false)
          })
        } catch (error) {
          console.error('Error fetching USDC price:', error)
          setError(error as Error)
          setIsLoading(false)
        }
      }
    }

    fetchUSDCPrice()
  }, [usdcPrice])

  return {
    usdcPrice,
    isLoading,
    error,
  }
}
