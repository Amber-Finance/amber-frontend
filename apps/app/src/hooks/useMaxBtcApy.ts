import useSWR from 'swr'

interface MaxBtcApiResponse {
  maxBtcData: {
    apy: number
  }
}

const fetcher = async (url: string): Promise<MaxBtcApiResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch maxBTC APY data')
  }
  return response.json()
}

export function useMaxBtcApy(): {
  apy: number
  isLoading: boolean
  error: Error | null
} {
  const { data, error, isLoading } = useSWR<MaxBtcApiResponse>(
    'https://api.amberfi.io/api/maxbtc',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      onError: (err) => {
        console.warn('Failed to fetch maxBTC APY:', err.message)
      },
    },
  )

  return {
    apy: data?.maxBtcData?.apy || 0,
    isLoading,
    error,
  }
}
