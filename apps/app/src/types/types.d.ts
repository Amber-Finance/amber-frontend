// Deposit position interface for portfolio components
interface DepositPosition {
  denom: string
  symbol: string
  amount: string
  amountFormatted: number
  usdValue: number
  apy: number
  actualPnl: number
  actualPnlPercent: number
}

// Active strategy interface for portfolio components
interface ActiveStrategy {
  accountId: string
  collateralAsset: {
    denom: string
    symbol: string
    amount: string
    amountFormatted: number
    usdValue: number
    decimals: number
    icon: string
  }
  debtAsset: {
    denom: string
    symbol: string
    amount: string
    amountFormatted: number
    usdValue: number
    decimals: number
    icon: string
  }
  supply: {
    denom: string
    symbol: string
    amount: string
    amountFormatted: number
    usdValue: number
    decimals: number
    icon: string
  }
  leverage: number
  netApy: number
  isPositive: boolean
  strategyId: string
  // Actual P&L based on initial_deposit
  initialInvestment: number
  actualPnl: number
  actualPnlPercent: number
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
  asset: TokenInfo
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
  cachedStrategies: Record<string, Strategy & { cachedAt: number }>
  portfolioPositions: PortfolioPositionsResponse | null
  setMarkets: (markets: Market[] | null) => void
  setHideZeroBalances: (hideZeroBalances: boolean) => void
  updateMarketPrice: (denom: string, priceData: PriceData) => void
  updateMarketMetrics: (denom: string, metrics: MarketDataItem) => void
  updateMarketPositions: (positions: { deposits: UserPosition[]; debts: UserPosition[] }) => void
  resetPositions: () => void
  cacheStrategy: (strategyId: string, strategy: Strategy) => void
  getCachedStrategy: (strategyId: string) => Strategy | null
  clearStrategyCache: () => void
  setPortfolioPositions: (positions: PortfolioPositionsResponse | null) => void
  resetPortfolioPositions: () => void
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

interface MarketColumn {
  id: SortColumn
  label: string
  align?: 'left' | 'right'
}

type PnL =
  | 'break_even'
  | {
      profit: Coin
    }
  | {
      loss: Coin
    }

interface ChainConfig {
  name: string
  id: string
  swapFee: number
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
    redBank: string
  }
  queries: {
    allAssetParams: string
    allMarkets: string
  }
}

type Coin = {
  denom: string
  amount: string
}

type SwapRouteInfo = {
  amountOut: BigNumber
  priceImpact: BigNumber
  amountIn?: BigNumber
  fee: BigNumber
  route: import('types/generated/mars-swapper-base/MarsSwapperBase.types').SwapperRoute
  description: string
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

// Portfolio Positions API Response Types
interface PortfolioAccount {
  account_id: string
  deposits: Array<{
    denom: string
    amount: string
  }>
  debts: Array<{
    denom: string
    amount: string
  }>
  lends: Array<{
    denom: string
    amount: string
  }>
  initial_deposit: Array<{
    denom: string
    amount: string
  }>
}

interface PortfolioPositionsResponse {
  total_borrows: string
  total_supplies: string
  redbank_deposits: Array<{
    denom: string
    amount: string
  }>
  redbank_borrow: Array<{
    denom: string
    amount: string
  }>
  redbank_initial_deposits: Array<{
    denom: string
    amount: string
  }>
  accounts: PortfolioAccount[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
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

type Theme = 'dark' | 'light' | 'system'

interface Strategy {
  id: string
  type: string
  collateralAsset: TokenInfo
  debtAsset: TokenInfo
  maxROE: number
  isPositive: boolean
  hasPoints: boolean
  rewards: string
  multiplier: number
  isCorrelated: boolean
  liquidity: number
  liquidityDisplay: string
  subText: string
  isComingSoon?: boolean

  // Enhanced metrics for Δs
  supplyApy: number
  borrowApy: number
  netApy: number
  ltv: number
  liquidationThreshold: number

  // Additional strategy metadata
  maxLeverage?: number
  maxBorrowCapacityUsd?: number
  maxPositionSizeUsd?: number

  // Enhanced APY breakdown with staking components
  collateralStakingApy?: number
  collateralTotalApy?: number
  debtStakingApy?: number
  debtNetCost?: number
  hasStakingData?: boolean

  // Position info
  currentPosition?: {
    collateralAmount: string
    debtAmount: string
    healthFactor: number
  }
}

interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance: string
  rawBalance: number
  price: number
  denom: string
  usdValue: string
  decimals: number
  chainId: string
}
interface SwapRouteInfo {
  amountOut?: BigNumber // Present in forward routing, target in reverse routing
  amountIn?: BigNumber // Present in reverse routing, calculated amount needed
  priceImpact: BigNumber
  fee: BigNumber
  description: string
  route: SwapperRoute
}

type SwapperRoute = {
  duality: DualityRoute
}

interface DualityRoute {
  from: string
  swap_denoms: string[]
  to: string
}
// RedBank TVL API Response
interface RedBankTvlResponse {
  assets: RedBankTvlAsset[]
}

interface RedBankTvlAsset {
  denom: string
  tvl: string
  tvl_share: number
}

interface RedBankDenomDataResponse {
  tvl_historical: TvlHistoricalPoint[]
  tvl_share: number
  unique_wallets: number
  average_lending_apy: number
}

interface TvlHistoricalPoint {
  date: string
  value: string
}


// Types
type TransactionType = 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'swap' | 'strategy'

interface BaseTransactionParams {
  amount: string
  denom: string
  decimals: number
  symbol?: string
}

interface DepositParams extends BaseTransactionParams {
  type: 'deposit'
}

interface WithdrawParams extends BaseTransactionParams {
  type: 'withdraw'
}

interface BorrowParams extends BaseTransactionParams {
  type: 'borrow'
  recipient?: string
}

interface RepayParams extends BaseTransactionParams {
  type: 'repay'
  onBehalfOf?: string
}

interface SwapParams {
  type: 'swap'
  fromToken: SwapToken
  toToken: SwapToken
  amount: string
  routeInfo: SwapRouteInfo
  slippage?: number
}

interface StrategyParams {
  type: 'strategy'
  strategyType: 'create' | 'update' | 'close' | 'delete' | 'decrease'
  accountId?: string
  accountKind?: 'default' | 'high_levered_strategy'
  actions: any[] // Action array from credit manager
  collateralAmount?: string
  multiplier?: number
}

interface DeployStrategyParams {
  type: 'deploy_strategy'
  strategyType: 'create' | 'increase' // create new or increase existing
  accountId?: string // required for increase
  collateralAmount: number
  collateralDenom: string
  collateralDecimals: number
  borrowAmount: number
  borrowDenom: string
  borrowDecimals: number
  swapRoute: any
  swapDestDenom: string
  multiplier: number
  strategy: any // Strategy object
}

interface ManageStrategyParams {
  type: 'manage_strategy'
  actionType: 'close_partial' | 'close_full' // strategy closure actions
  accountId: string
  collateralAmount: number // amount of collateral to swap back
  collateralDenom: string
  collateralDecimals: number
  debtAmount: number // amount of debt to repay
  debtDenom: string
  debtDecimals: number
  swapRoute: any // route to swap collateral back to debt asset
}

// Enhanced functional transaction types
interface BaseTransactionConfig {
  amount: string
  denom: string
  decimals: number
  symbol?: string
}

interface ToastMessages {
  pending?: string
  success?: string
  error?: string
}

interface TransactionResult {
  success: boolean
  result?: any
  error?: string
}

interface StrategyAsset {
  amount: number
  denom: string
  decimals: number
}

interface SwapConfig {
  routeInfo: SwapRouteInfo
  slippage?: string
}

interface DeployStrategyConfig {
  type: 'strategy'
  strategyType: 'create' | 'increase'
  accountId?: string
  collateral: StrategyAsset
  debt: StrategyAsset
  swap: SwapConfig & { destDenom: string }
  multiplier: number
  strategy: any
}

interface ManageStrategyConfig {
  type: 'manage_strategy'
  actionType: 'close_partial' | 'close_full'
  accountId: string
  collateral: StrategyAsset
  debt: StrategyAsset
  swap: SwapConfig
}

interface ModifyLeverageConfig {
  type: 'modify_leverage'
  actionType: 'increase' | 'decrease'
  accountId: string
  currentLeverage: number
  targetLeverage: number
  collateral: StrategyAsset
  debt: StrategyAsset
  swap: SwapConfig
}

interface LeverageModificationParams {
  currentLeverage: number
  targetLeverage: number
  collateralAmount: number
  debtAmount: number
  swapRouteInfo: SwapRouteInfo
}

interface DepositConfig extends BaseTransactionConfig {
  type: 'deposit'
}

interface WithdrawConfig extends BaseTransactionConfig {
  type: 'withdraw'
}

interface BorrowConfig extends BaseTransactionConfig {
  type: 'borrow'
  recipient?: string
}

interface RepayConfig extends BaseTransactionConfig {
  type: 'repay'
  onBehalfOf?: string
}

interface SwapTransactionConfig {
  type: 'swap'
  fromToken: any
  toToken: any
  amount: string
  routeInfo: any
  slippage?: number
}

type TransactionConfig =
  | DepositConfig
  | WithdrawConfig  
  | BorrowConfig
  | RepayConfig
  | SwapTransactionConfig
  | StrategyParams
  | ModifyLeverageConfig
  | DeployStrategyConfig

interface ActiveStrategy {
  accountId: string
  collateralAsset: {
    denom: string
    symbol: string
    amount: string
    amountFormatted: number
    usdValue: number
    decimals: number
    icon: string
    brandColor: string
  }
  debtAsset: {
    denom: string
    symbol: string
    amount: string
    amountFormatted: number
    usdValue: number
    decimals: number
    icon: string
    brandColor: string
  }
  leverage: number
  netApy: number
  isPositive: boolean
  strategyId: string
}

interface DepositState {
  activeTab: 'deposit' | 'withdraw'
  depositAmount: string
  withdrawAmount: string
  sliderPercentage: number
  lastAction: 'deposit' | 'withdraw' | null
}

type DepositAction =
  | { type: 'SET_ACTIVE_TAB'; payload: 'deposit' | 'withdraw' }
  | { type: 'SET_DEPOSIT_AMOUNT'; payload: string }
  | { type: 'SET_WITHDRAW_AMOUNT'; payload: string }
  | { type: 'SET_SLIDER_PERCENTAGE'; payload: number }
  | { type: 'SET_LAST_ACTION'; payload: 'deposit' | 'withdraw' | null }
  | { type: 'UPDATE_AMOUNT_FROM_SLIDER'; payload: { percentage: number; maxAmount: number } }
  | { type: 'UPDATE_SLIDER_FROM_AMOUNT'; payload: { amount: string; maxAmount: number } }
  | { type: 'RESET_AMOUNTS' }
  | { type: 'RESET_STATE' }

interface StrategyState {
  collateralAmount: string
  multiplier: number
  isProcessing: boolean
  error: string | null
  selectedStrategy: string | null
}

type StrategyAction =
  | { type: 'SET_COLLATERAL_AMOUNT'; payload: string }
  | { type: 'SET_MULTIPLIER'; payload: number }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_STRATEGY'; payload: string | null }
  | { type: 'RESET_STATE' }
  | { type: 'RESET_FORM' }


type SwapAction =
  | { type: 'SET_FROM_TOKEN'; payload: string | null }
  | { type: 'SET_TO_TOKEN'; payload: string | null }
  | { type: 'SET_FROM_AMOUNT'; payload: string }
  | { type: 'SET_TO_AMOUNT'; payload: string }
  | { type: 'SET_SLIPPAGE'; payload: number }
  | { type: 'SET_CUSTOM_SLIPPAGE'; payload: string }
  | { type: 'TOGGLE_SLIPPAGE_POPOVER'; payload?: boolean }
  | { type: 'TOGGLE_TOKEN_MODAL'; payload?: boolean }
  | { type: 'SET_SELECTING_FROM'; payload: boolean }
  | { type: 'SET_SWAP_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_SLIDER_PERCENTAGE'; payload: number }
  | { type: 'SWAP_TOKENS' }
  | { type: 'RESET_AMOUNTS' }
  | { type: 'RESET_STATE' }

interface StrategyDeploymentParams {
  collateralAmount: number
  multiplier: number
  swapRouteInfo: SwapRouteInfo
  slippage?: number
}

interface UseStrategyDeploymentProps {
  strategy: Strategy
  executeTransaction: any
  isModifying: boolean
  modifyingAccountId: string | null
}

interface LegacyTransactionParams {
  amount: string
  denom: string
  symbol: string
  decimals: number
}

// Token-related interfaces for hooks
interface Token {
  symbol: string
  name: string
  icon: string
  balance: string
  rawBalance: number
  price: number
  denom: string
  usdValue: string
  decimals: number
}

interface WalletBalance {
  denom: string
  amount: string
}

interface UseTokenPreselectionReturn {
  bestToken: Token | null
  shouldInitialize: boolean
  markInitialized: () => void
}

// Swap utility interfaces
interface Coin {
  denom: string
  amount: string
}

interface SwapAction {
  swap_exact_in: {
    coin_in: Coin
    denom_out: string
    min_receive: string
    route: any
  }
}

type TransactionParams =
  | DepositParams
  | WithdrawParams
  | BorrowParams
  | RepayParams
  | SwapParams
  | StrategyParams
  | DeployStrategyParams
  | ManageStrategyParams

interface AccountIdAndKind {
  id: string
  kind: 'default'
}

interface Icon {
  icon: React.ReactElement
  url: string
  label: string
}

interface StrategyData {
  id: string
  type: string
  collateralAsset: TokenInfo
  debtAsset: TokenInfo
  maxROE: number
  isPositive: boolean
  hasPoints: boolean
  rewards: string
  multiplier: number
  isCorrelated: boolean
  liquidity: number
  liquidityDisplay: string
  subText: string
  supplyApy: number
  borrowApy: number
  netApy: number
  ltv: number
  liquidationThreshold: number
  maxLeverage: number
  maxBorrowCapacityUsd: number
  maxPositionSizeUsd: number
  collateralStakingApy: number
  collateralTotalApy: number
  debtStakingApy: number
  debtNetCost: number
  hasStakingData: boolean
}

interface MarketData {
  asset: TokenInfo
  metrics: {
    collateral_total_amount?: string
    debt_total_amount?: string
    borrow_rate?: string
    liquidity_rate?: string
  }
  params: {
    red_bank: {
      borrow_enabled: boolean
    }
    credit_manager: {
      whitelisted: boolean
    }
    max_loan_to_value?: string
    liquidation_threshold?: string
  }
  price?: {
    price: string
  }
}

interface TokenData {
  symbol: string
  name: string
  icon: string
  balance: string
  rawBalance: number
  price: number
  denom: string
  usdValue: string
  decimals: number
  chainId: string
}

interface TokenBalance {
  denom: string
  amount: string
}

interface MarketData {
  asset: {
    denom: string
    symbol?: string
    decimals: number
  }
  price?: {
    price: string
  }
}

interface UserDepositResponse {
  data: {
    amount: string
  }
}


interface BNCoin {
  denom: string
  amount: string
}

interface DeleteAccountOptions {
  accountId: string
  lends: BNCoin[]
}

interface WithdrawStrategyParams {
  accountId: string
  collateralDenom: string
  collateralAmount: string
  collateralDecimals: number
  debtDenom: string
  debtAmount: string
  debtDecimals: number
}


interface SwapState {
  fromTokenDenom: string | null
  toTokenDenom: string | null
  fromAmount: string
  toAmount: string
  slippage: number
  customSlippage: string
  showSlippagePopover: boolean
  sliderPercentage: number
  isTokenModalOpen: boolean
  selectingFrom: boolean
  isSwapInProgress: boolean
  editingDirection: 'from' | 'to'
}

interface SwapActions {
  setFromTokenDenom: (denom: string | null) => void
  setToTokenDenom: (denom: string | null) => void
  setFromAmount: (amount: string) => void
  setToAmount: (amount: string) => void
  setSlippage: (slippage: number) => void
  setCustomSlippage: (slippage: string) => void
  setShowSlippagePopover: (show: boolean) => void
  setTokenModalOpen: (open: boolean) => void
  setSelectingFrom: (selecting: boolean) => void
  setIsSwapInProgress: (inProgress: boolean) => void
  setEditingDirection: (direction: 'from' | 'to') => void
  resetAmounts: () => void
  swapTokens: () => void
}

interface ChartData {
  date: Date
  formattedDate: string
  [key: string]: any
}

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface YAxisConfig {
  yAxisId: string
  orientation: 'left' | 'right'
  tickFormatter: (value: any) => string
}

interface TvlAsset {
  denom: string
  tvl: string
  tvl_share: number
}

interface RedBankAssetsTvl {
  assets: TvlAsset[]
}