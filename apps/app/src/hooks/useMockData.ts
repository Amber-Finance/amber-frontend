// Mock data hook to replace real API calls during coming soon state
export const useMockMarkets = () => ({
  isLoading: false,
  error: null,
  markets: [],
})

export const useMockLstMarkets = () => ({
  data: [],
  isLoading: false,
  error: null,
  getTokenStakingApy: () => 0,
})

export const useMockRedBankAssetsTvl = () => ({
  data: { assets: [] },
  isLoading: false,
  error: null,
})

export const useMockRedBankDenomData = () => ({
  data: null,
  tvlGrowth30d: 0,
  isLoading: false,
  error: null,
  mutate: () => Promise.resolve(),
})

export const useMockPrices = () => ({
  markets: [],
  isLoading: false,
  error: null,
})

export const useMockUserPositions = () => ({
  isLoading: false,
  isReady: false,
})

export const useMockTransactions = () => ({
  deposit: async () => {},
  withdraw: async () => {},
  isPending: false,
})

export const useMockWalletBalances = () => ({
  data: [],
  isLoading: false,
  error: null,
})

export const useMockUserDeposit = () => ({
  amount: '0',
  isLoading: false,
  error: null,
})
