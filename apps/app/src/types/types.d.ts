// Define the Asset interface
interface Asset {
  denom: string
  symbol: string
  name: string
  description: string
  decimals: number
  icon: string
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

interface PriceData {
  denom: string
  price: string // Price in USD
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

// Base Market interface - core structure of a market
interface Market {
  asset: Asset
  params: MarketParams
  metrics: MarketDataItem
  price: PriceData
  deposit: string // User deposit amount for this market
  debt: string // User debt amount for this market
}

// Market with UI-specific properties, extends Market
interface MarketItem extends Market {
  balanceUsd?: string
  balance?: string
  isBalanceLoading?: boolean
}

// Market with calculated values, extends Market
interface MarketWithValues extends Market {
  calculatedValues: {
    suppliedUsd: number
    borrowedUsd: number
    liquidityUsd: number
    supplyApy: string
    borrowApy: string
  }
}

// Detailed metrics calculated from Market data
interface MarketMetrics {
  reserveSizeUsd: number
  availableLiquidityUsd: number
  depositCap: number
  depositCapUsd: number
  depositCapUsagePercent: number
  utilizationRate: number
  oraclePrice: number
  supplyApy: string
  borrowApy: string
  maxLtv: number
  liquidationThreshold: number
  liquidationPenalty: number
  reserveFactor: number
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

// API Responses
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

interface Token {
  chainId: string
  denom: string
  symbol: string
  icon: string
  description: string
  decimals: number
  isLST: boolean
  stakingApy?: number
  protocol: string
  brandColor: string
}

interface MarketColumn {
  id: SortColumn
  label: string
  align?: 'left' | 'right'
}

interface ChainConfig {
  name: string
  constracts: {
    paramsContract: string
    moneyMarketContract: string
    oracleContract: string
  }
  endpoints: {
    restUrl: string
    rpcUrl: string
  }
  queries: {
    allAssetParams: ing
    allMarkets: string
  }
}

type Coin = {
  denom: string
  amount: string
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
}

/**
 * Format metadata for special handling in components
 */
interface FormatMetadata {
  type: 'standard' | 'subscript'
  value: string
  prefix: string
  // For subscript notation
  zeroCount?: number
  significantDigits?: string
}

interface CollateralResponse {
  data: {
    data: UserPosition[]
  }
}

interface DebtResponse {
  data: UserPosition[]
}

interface UserPosition {
  denom: string
  amount_scaled: string
  amount: string
  emabled: boolean
}

type ActionType = 'supply' | 'withdraw' | 'borrow' | 'repay'

type ExecuteMsg =
  | {
      deposit: {
        on_behalf_of?: string | null
      }
    }
  | {
      withdraw: {
        amount?: Uint128 | null
        denom: string
      }
    }
  | {
      borrow: {
        amount: Uint128
        denom: string
        recipient?: string | null
      }
    }
  | {
      repay: {
        on_behalf_of?: string | null
      }
    }

type Uint128 = string

type Decimal = string
type HlsAssetTypeForAddr =
  | {
      coin: {
        denom: string
      }
    }
  | {
      vault: {
        addr: Addr
      }
    }
type Addr = string
type Uint128 = string
type AccountKind =
  | ('default' | 'high_levered_strategy')
  | {
      fund_manager: {
        vault_addr: string
      }
    }
type Int128 = string
type VaultPositionAmount =
  | {
      unlocked: VaultAmount
    }
  | {
      locking: LockingVaultAmount
    }
type VaultAmount = string
type VaultAmount1 = string
type UnlockingPositions = VaultUnlockingPosition[]
interface HealthComputer {
  asset_params: {
    [k: string]: AssetParamsBaseForAddr
  }
  kind: AccountKind
  oracle_prices: {
    [k: string]: Decimal
  }
  perps_data: PerpsData
  positions: Positions
  vaults_data: VaultsData
}
interface AssetParamsBaseForAddr {
  close_factor: Decimal
  credit_manager: CmSettingsForAddr
  denom: string
  deposit_cap: Uint128
  liquidation_bonus: LiquidationBonus
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
  protocol_liquidation_fee: Decimal
  red_bank: RedBankSettings
}
interface CmSettingsForAddr {
  hls?: HlsParamsBaseForAddr | null
  whitelisted: boolean
  withdraw_enabled: boolean
}
interface HlsParamsBaseForAddr {
  correlations: HlsAssetTypeForAddr[]
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
}
interface LiquidationBonus {
  max_lb: Decimal
  min_lb: Decimal
  slope: Decimal
  starting_lb: Decimal
}
interface RedBankSettings {
  borrow_enabled: boolean
  deposit_enabled: boolean
  withdraw_enabled: boolean
}
interface PerpsData {
  params: {
    [k: string]: PerpParams
  }
}
interface PerpParams {
  closing_fee_rate: Decimal
  denom: string
  enabled: boolean
  liquidation_threshold: Decimal
  max_funding_velocity: Decimal
  max_loan_to_value: Decimal
  max_long_oi_value: Uint128
  max_net_oi_value: Uint128
  max_position_value?: Uint128 | null
  max_short_oi_value: Uint128
  min_position_value: Uint128
  opening_fee_rate: Decimal
  skew_scale: Uint128
}
interface Positions {
  account_id: string
  account_kind: AccountKind
  debts: DebtAmount[]
  deposits: Coin[]
  lends: Coin[]
  perps: PerpPosition[]
  staked_astro_lps: Coin[]
  vaults: VaultPosition[]
}
interface DebtAmount {
  amount: Uint128
  denom: string
  shares: Uint128
}
interface Coin {
  amount: Uint128
  denom: string
  [k: string]: unknown
}
interface PerpPosition {
  base_denom: string
  current_exec_price: Decimal
  current_price: Decimal
  denom: string
  entry_exec_price: Decimal
  entry_price: Decimal
  realized_pnl: PnlAmounts
  size: Int128
  unrealized_pnl: PnlAmounts
}
interface PnlAmounts {
  accrued_funding: Int128
  closing_fee: Int128
  opening_fee: Int128
  pnl: Int128
  price_pnl: Int128
}
interface VaultPosition {
  amount: VaultPositionAmount
  vault: VaultBaseForAddr
}
interface LockingVaultAmount {
  locked: VaultAmount1
  unlocking: UnlockingPositions
}
interface VaultUnlockingPosition {
  coin: Coin
  id: number
}
interface VaultBaseForAddr {
  address: Addr
}
interface VaultsData {
  vault_configs: {
    [k: string]: VaultConfigBaseForAddr
  }
  vault_values: {
    [k: string]: VaultPositionValue
  }
}
interface VaultConfigBaseForAddr {
  addr: Addr
  deposit_cap: Coin
  hls?: HlsParamsBaseForAddr | null
  liquidation_threshold: Decimal
  max_loan_to_value: Decimal
  whitelisted: boolean
}
interface VaultPositionValue {
  base_coin: CoinValue
  vault_coin: CoinValue
}
interface CoinValue {
  amount: Uint128
  denom: string
  value: Uint128
}

// Metric component interfaces
interface MetricCardProps {
  label: string
  value: number | string
  isCurrency?: boolean
  suffix?: string
  useCompactNotation?: boolean
}

interface MetricRowProps {
  label: string
  value: number | string
  isCurrency?: boolean
  suffix?: string
  valueClassName?: string
  maxDecimals?: number
  useCompactNotation?: boolean
}

type SortColumn = 'asset' | 'balance' | 'apy'
type SortDirection = 'asc' | 'desc'

interface MarketWithValues extends Market {
  calculatedValues: {
    suppliedUsd: number
    borrowedUsd: number
    liquidityUsd: number
    supplyApy: string
    borrowApy: string
  }
}

interface MarketColumn {
  id: SortColumn
  label: string
  align?: 'left' | 'right'
}

type Theme = 'dark' | 'light' | 'system'
