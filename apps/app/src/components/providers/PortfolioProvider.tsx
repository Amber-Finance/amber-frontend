'use client'

import { usePortfolioPositions } from '@/hooks/usePortfolioPositions'

/**
 * Portfolio Provider Component
 * Initializes and maintains portfolio positions data globally
 *
 * Features:
 * - Fetches portfolio data once on mount
 * - Auto-refreshes every 5 seconds
 * - Persists data in Zustand store (survives navigation)
 * - Provides data to all child components via Zustand
 *
 * Usage: Place in root layout to make portfolio data available app-wide
 */
export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  // Initialize portfolio positions hook at the root level
  // This runs once and maintains data throughout the app lifecycle
  usePortfolioPositions()

  // Just pass through children - data is available via Zustand store
  return <>{children}</>
}
