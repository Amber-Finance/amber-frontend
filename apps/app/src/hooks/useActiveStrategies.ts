import { useCallback } from 'react'

import { usePortfolioStrategies } from '@/hooks/usePortfolioData'
import { usePortfolioPositions } from '@/hooks/usePortfolioPositions'
import { useStore } from '@/store/useStore'

/**
 * Hook to get user's active strategies
 * Now uses the centralized portfolio positions endpoint
 *
 * @deprecated Consider using usePortfolioStrategies() directly for better performance
 */
export function useActiveStrategies() {
  const { activeStrategies: cachedStrategies, setActiveStrategies } = useStore()
  const { activeStrategies, isLoading: strategiesLoading } = usePortfolioStrategies()
  const { isLoading: portfolioLoading, error, mutate } = usePortfolioPositions()

  // Update store cache when strategies change
  if (
    activeStrategies.length > 0 &&
    JSON.stringify(activeStrategies) !== JSON.stringify(cachedStrategies)
  ) {
    setActiveStrategies(activeStrategies)
  }

  // Manual refresh function
  const refreshActiveStrategies = useCallback(() => {
    mutate()
  }, [mutate])

  // Use fetched strategies if available, otherwise use cached
  const strategies = activeStrategies.length > 0 ? activeStrategies : cachedStrategies || []

  return {
    activeStrategies: strategies,
    isLoading: portfolioLoading || strategiesLoading,
    isInitialLoading: portfolioLoading || (strategiesLoading && !cachedStrategies?.length),
    error: error?.message || null,
    refreshActiveStrategies,
    hasActiveStrategies: strategies.length > 0,
  }
}
