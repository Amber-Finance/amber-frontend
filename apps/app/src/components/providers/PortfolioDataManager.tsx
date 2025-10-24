'use client'

import { useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { usePortfolioData } from '@/hooks/portfolio'

// Routes that should trigger a portfolio refresh when navigated to
const PORTFOLIO_ROUTES = ['/portfolio', '/strategies', '/deposit']

/**
 * Portfolio Data Manager
 * Manages global portfolio data fetching and refresh logic
 *
 * Features:
 * - Fetches portfolio data from API immediately on load
 * - Shows cached data while fetching (stale-while-revalidate)
 * - Processes deposits and strategies
 * - Stores everything in Zustand (single source of truth)
 * - Auto-refreshes every 60 seconds (1 minute)
 * - Refreshes on navigation to portfolio-related pages
 * - Persists data in Zustand store (survives navigation & refresh)
 *
 * This component doesn't render anything, it just manages data
 */
export function PortfolioDataManager() {
  const pathname = usePathname()
  const { mutate } = usePortfolioData()

  // Proactively refresh portfolio data when navigating to portfolio-related pages
  // This ensures fresh data is fetched immediately, while showing cached data
  useEffect(() => {
    const shouldRefresh = PORTFOLIO_ROUTES.some((route) => pathname?.startsWith(route))

    if (shouldRefresh) {
      mutate()
    }
  }, [pathname, mutate])

  return null
}
