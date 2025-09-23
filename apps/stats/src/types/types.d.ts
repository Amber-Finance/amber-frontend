interface ChainConfig {
  name: string
  id: string
  contracts: {
    redBank: string
    incentives: string
    oracle: string
    params: string
    creditManager: string
    accountNft: string
    perps: string
    pyth: string
    swapper: string
    dualitySwapper: string
  }
  endpoints: {
    restUrl: string
    rpcUrl: string
    fallbackRpc?: string
    fallbackRpcs?: string[]
    routes?: string
    amberBackend: string
  }
  queries: {
    allAssetParams: string
    allMarkets: string
  }
}

interface TokenInfo {
  chainId: string
  denom: string
  symbol: string
  icon: string
  description: string
  protocolIconLight: string
  protocolIconDark: string
  decimals: number
  isLST: boolean
  stakingApy?: number
  protocol: string
  brandColor: string
  origin: {
    chainId: string
    tokenAddress: string
  }
  comingSoon: boolean
}

interface AssetParamsResponse {
  data: MarketResponse[]
}

interface MarketResponse {
  denom: string
  credit_manager: {
    whitelisted: boolean
    withdraw_enabled: boolean
    hls: null
  }
  red_bank: {
    deposit_enabled: boolean
    borrow_enabled: boolean
    withdraw_enabled: boolean
  }
  max_loan_to_value: string
  liquidation_threshold: string
  liquidation_bonus: {
    starting_lb: string
    slope: string
    min_lb: string
    max_lb: string
  }
  protocol_liquidation_fee: string
  deposit_cap: string
  close_factor: string
}

interface MarketDataResponse {
  data: {
    data: MarketDataItem[]
  }
}

interface MarketParams {
  denom: string
  credit_manager: {
    whitelisted: boolean
    withdraw_enabled: boolean
    hls: null
  }
  red_bank: {
    deposit_enabled: boolean
    borrow_enabled: boolean
    withdraw_enabled: boolean
  }
  max_loan_to_value: string
  liquidation_threshold: string
  liquidation_bonus: {
    starting_lb: string
    slope: string
    min_lb: string
    max_lb: string
  }
  protocol_liquidation_fee: string
  deposit_cap: string
  close_factor: string
}

interface MarketDataItem {
  collateral_total_amount: string
  debt_total_amount: string
  utilization_rate: string
  denom: string
  reserve_factor: string
  interest_rate_model: {
    optimal_utilization_rate: string
    base: string
    slope_1: string
    slope_2: string
  }
  borrow_rate: string
  liquidity_rate: string
  [key: string]: string | unknown
}

interface PriceData {
  denom: string
  price: string // Price in USD
}

interface Market {
  asset: TokenInfo
  params: MarketParams
  metrics: MarketDataItem
  price: PriceData
  deposit: string // User deposit amount for this market
  debt: string // User debt amount for this market
}

interface StoreState {
  markets: Market[] | null
  hideZeroBalances: boolean
  setMarkets: (markets: Market[] | null) => void
  setHideZeroBalances: (hideZeroBalances: boolean) => void
  updateMarketPrice: (denom: string, priceData: PriceData) => void
  updateMarketMetrics: (denom: string, metrics: MarketDataItem) => void
  updateMarketPositions: (positions: { deposits: UserPosition[]; debts: UserPosition[] }) => void
  resetPositions: () => void
}

interface UserPosition {
  denom: string
  amount_scaled: string
  amount: string
  emabled: boolean
}

/**
 * Options for formatting values
 */
interface FormatValueOptions {
  /** Is this a currency/dollar value (affects decimal places) */
  isCurrency?: boolean
  /** Should compact notation be used for large values (K, M, B) */
  useCompactNotation?: boolean
  /** Significant digits to show for small non-currency values */
  significantDigits?: number
  /** Decimal places to show for regular values */
  decimalPlaces?: number
  /** Threshold for using subscript notation */
  smallValueThreshold?: number
  /** Threshold for using compact notation */
  largeValueThreshold?: number
  /** Token decimals for zero value formatting */
  tokenDecimals?: number
}

interface FormatMetadata {
  type: 'standard' | 'subscript'
  value: string
  prefix: string
  // For subscript notation
  zeroCount?: number
  significantDigits?: string
}
