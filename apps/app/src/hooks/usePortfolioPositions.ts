import { useEffect } from 'react'

import { useChain } from '@cosmos-kit/react'
import useSWR from 'swr'

import getPortfolioPositions from '@/api/getPortfolioPositions'
import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'

/**
 * Hook to fetch and manage portfolio positions
 * Uses useSWR for caching and automatic revalidation
 * Integrates with Zustand store for global state management
 *
 * @returns Portfolio positions data and loading/error states
 */
export function usePortfolioPositions() {
  const { address } = useChain(chainConfig.name)
  const {
    portfolioPositions: cachedPositions,
    setPortfolioPositions,
    resetPortfolioPositions,
  } = useStore()

  // Reset positions when wallet disconnects
  useEffect(() => {
    if (!address) {
      resetPortfolioPositions()
    }
  }, [address, resetPortfolioPositions])

  // Create SWR key - only fetch when wallet is connected
  const swrKey = address ? `portfolio-positions-${address}` : null

  // Use SWR to fetch and cache portfolio positions
  const {
    data: portfolioPositions,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(swrKey, () => getPortfolioPositions(address!), {
    refreshInterval: 5000, // Refresh every 5 seconds
    revalidateOnFocus: true, // Refresh when tab becomes active
    revalidateOnMount: true, // Refresh on mount
    revalidateOnReconnect: true, // Refresh when reconnecting
    fallbackData: cachedPositions || undefined, // Use cached data as fallback from persistent storage
    dedupingInterval: 2000, // Deduplicate requests within 2 seconds
    keepPreviousData: true, // Keep showing previous data while fetching new data
    onSuccess: (data) => {
      if (data) {
        setPortfolioPositions(data)
      }
    },
    onError: (err) => {
      console.error('Error fetching portfolio positions:', err)
    },
  })

  // Calculate derived data
  const totalPositions = portfolioPositions
    ? portfolioPositions.accounts.length + portfolioPositions.redbank_deposits.length
    : 0

  const totalBorrows = portfolioPositions ? parseFloat(portfolioPositions.total_borrows) : 0

  const totalSupplies = portfolioPositions ? parseFloat(portfolioPositions.total_supplies) : 0

  const totalSupplied = totalSupplies - totalBorrows

  return {
    portfolioPositions,
    totalPositions,
    totalBorrows,
    totalSupplies,
    totalSupplied,
    isLoading,
    isValidating,
    error,
    mutate, // Expose mutate for manual revalidation
  }
}
