import { BigNumber } from 'bignumber.js'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

// Get the stored preference or default to true
const getStoredHideZeroBalances = (): boolean => {
  // Check if we're in a browser environment with localStorage available
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('hideZeroBalances')
    // Return stored value if it exists, otherwise default to true
    return stored === null ? true : stored === 'true'
  }
  // Default to true if localStorage is not available
  return true
}

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (
        set: (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void,
      ) => ({
        // Initial state
        markets: null,
        hideZeroBalances: getStoredHideZeroBalances(),
        activeStrategies: [],
        cachedStrategies: {},

        setMarkets: (markets: Market[] | null): void => {
          if (!markets) return
          set({ markets })
        },

        setHideZeroBalances: (hideZeroBalances: boolean): void => {
          // Save to localStorage when value changes
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('hideZeroBalances', hideZeroBalances.toString())
          }
          set({ hideZeroBalances })
        },

        // Update price for a specific market
        updateMarketPrice: (denom: string, priceData: PriceData): void => {
          set((state: StoreState) => {
            if (!state.markets) return { ...state }

            // Create a new array with the updated market
            const updatedMarkets = state.markets.map((market: Market) =>
              market.asset.denom === denom ? { ...market, price: priceData } : market,
            )

            return { markets: updatedMarkets }
          })
        },

        // Update metrics for a specific market
        updateMarketMetrics: (denom: string, metrics: MarketDataItem): void => {
          set((state: StoreState) => {
            if (!state.markets) return { markets: null }

            // Create a new array with the updated market
            const updatedMarkets = state.markets.map((market: Market) =>
              market.asset.denom === denom
                ? { ...market, metrics: { ...market.metrics, ...metrics } }
                : market,
            )

            return { markets: updatedMarkets }
          })
        },

        // Update positions (deposits and debts) for markets
        updateMarketPositions: (positions: {
          deposits: UserPosition[]
          debts: UserPosition[]
        }): void => {
          set((state: StoreState) => {
            if (!state.markets) return { markets: null }

            // Reset all positions to 0 first
            let updatedMarkets = state.markets.map((market: Market) => ({
              ...market,
              deposit: '0',
              debt: '0',
            }))

            // Update with deposit amounts
            if (positions.deposits && positions.deposits.length > 0) {
              updatedMarkets = updatedMarkets.map((market: Market) => {
                const deposit = positions.deposits.find(
                  (d: UserPosition) => d.denom === market.asset.denom,
                )
                return deposit ? { ...market, deposit: deposit.amount } : market
              })
            }

            // Update with debt amounts
            if (positions.debts && positions.debts.length > 0) {
              updatedMarkets = updatedMarkets.map((market: Market) => {
                const debt = positions.debts.find(
                  (d: UserPosition) => d.denom === market.asset.denom,
                )
                return debt ? { ...market, debt: debt.amount } : market
              })
            }

            return { markets: updatedMarkets }
          })
        },

        // Reset positions on disconnect
        resetPositions: (): void => {
          set((state: StoreState) => {
            // If we don't have markets, nothing to reset
            if (!state.markets) return { ...state }

            // Reset all positions to 0
            const updatedMarkets = state.markets.map((market: Market) => ({
              ...market,
              deposit: '0',
              debt: '0',
            }))

            return { markets: updatedMarkets }
          })
        },

        // Set active strategies
        setActiveStrategies: (strategies: ActiveStrategy[]): void => {
          set({ activeStrategies: strategies })
        },

        // Reset active strategies on disconnect
        resetActiveStrategies: (): void => {
          set({ activeStrategies: [] })
        },

        // Strategy caching methods
        cacheStrategy: (strategyId: string, strategy: Strategy): void => {
          set((state: StoreState) => ({
            cachedStrategies: {
              ...state.cachedStrategies,
              [strategyId]: {
                ...strategy,
                cachedAt: Date.now(),
              },
            },
          }))
        },

        getCachedStrategy: (strategyId: string): Strategy | null => {
          const state = useStore.getState()
          const cached = state.cachedStrategies[strategyId]
          if (!cached) return null

          // Check if cache is less than 10 minutes old
          const cacheAge = Date.now() - (cached.cachedAt || 0)
          const maxCacheAge = 10 * 60 * 1000 // 10 minutes

          return cacheAge < maxCacheAge ? cached : null
        },

        clearStrategyCache: (): void => {
          set({ cachedStrategies: {} })
        },
      }),
      {
        name: 'amberfi-storage', // storage key
        partialize: (state: StoreState) => ({
          markets: state.markets,
          activeStrategies: state.activeStrategies,
          cachedStrategies: state.cachedStrategies,
          // You can exclude some state properties from persistence if needed
        }),
      },
    ),
    { name: 'neve-store' }, // Name for Redux DevTools
  ),
)
