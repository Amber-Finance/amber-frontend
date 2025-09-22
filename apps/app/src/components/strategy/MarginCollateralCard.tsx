import { useEffect, useState } from 'react'

import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react'

import FormattedValue from '@/components/common/FormattedValue'
import { InfoCard } from '@/components/deposit'
import { NewPositionTable } from '@/components/strategy/NewPositionTable'
import { AmountInput } from '@/components/ui/AmountInput'
import { InfoAlert } from '@/components/ui/InfoAlert'
import { Separator } from '@/components/ui/separator'
import chainConfig from '@/config/chain'

// Helper function to get price impact color
const getPriceImpactColor = (priceImpact: number): string => {
  const absoluteImpact = Math.abs(priceImpact)
  if (absoluteImpact >= 5) return 'text-red-500 font-medium'
  if (absoluteImpact >= 2) return 'text-yellow-600 font-medium'
  if (absoluteImpact >= 1) return 'text-yellow-500'
  if (priceImpact > 0) return 'text-green-500'
  return 'text-muted-foreground'
}

// Helper function to get price impact warning
const getPriceImpactWarning = (
  priceImpact: number,
): { type: 'info' | 'warning' | 'danger'; message: string } | null => {
  const absoluteImpact = Math.abs(priceImpact)

  if (absoluteImpact >= 5) {
    return {
      type: 'danger',
      message:
        'Very high price impact detected! You will lose a significant amount due to price impact. Consider reducing your trade size.',
    }
  }
  if (absoluteImpact >= 2) {
    return {
      type: 'warning',
      message:
        'High price impact detected. This trade will move the market price significantly against you.',
    }
  }
  if (absoluteImpact >= 1) {
    return {
      type: 'info',
      message: 'Moderate price impact. Your trade will affect the market price slightly.',
    }
  }
  return null
}

// Helper function to validate slippage
const getSlippageWarning = (
  slippage: number,
): { type: 'info' | 'warning' | 'danger'; message: string } | null => {
  if (slippage > 5) {
    return {
      type: 'danger',
      message:
        'Slippage exceeds the safety threshold. You may lose a significant amount due to slippage.',
    }
  }
  if (slippage > 2) {
    return {
      type: 'warning',
      message: 'High slippage detected. Consider reducing slippage tolerance.',
    }
  }
  if (slippage < 0.05) {
    return {
      type: 'warning',
      message:
        'Very low slippage will likely cause transaction failures. Increase slippage tolerance.',
    }
  }
  if (slippage < 0.1) {
    return {
      type: 'info',
      message: 'Low slippage may cause transaction failures in volatile markets.',
    }
  }
  return null
}

// Helper function to check leverage liquidation risk
// Note: With LTV 0.92 and LiqThreshold 0.95, liquidation occurs at ~15x leverage
// However, we cap maximum leverage at 12x for safety, so no warnings needed
const getLeverageWarning = (
  leverage: number,
): { type: 'warning' | 'danger'; message: string } | null => {
  // Since we cap leverage at 12x (well below 15x liquidation threshold),
  // no leverage warnings are needed
  return null
}

interface MarginCollateralCardProps {
  strategy: Strategy
  collateralAmount: string
  setCollateralAmount: (value: string) => void
  leverageSliderComponent?: React.ReactNode
  displayValues: {
    walletBalance: string
    usdValue: (amount: number) => string
  }
  userBalance: number
  currentAmount: number
  positionCalcs: {
    borrowAmount: number
    totalPosition: number
    estimatedYearlyEarnings: number
    leveragedApy: number
  }
  onSwapRouteLoaded?: (swapRouteInfo: SwapRouteInfo | null) => void
  onSlippageChange?: (slippage: number) => void
  hideWalletBalance?: boolean
  hideAmountInput?: boolean
  // New props for NewPositionTable
  marketData?: {
    currentPrice: number
  }
  collateralSupplyApy?: number
  debtBorrowApy?: number
  simulatedHealthFactor?: number
  showPositionTable?: boolean
  isCalculatingPositions?: boolean
  showSwapDetailsAndSlippage?: boolean
  // For leverage modification - to determine swap direction
  currentLeverage?: number
  targetLeverage?: number
}

export function MarginCollateralCard({
  strategy,
  collateralAmount,
  setCollateralAmount,
  leverageSliderComponent,
  displayValues,
  userBalance,
  currentAmount,
  positionCalcs,
  onSwapRouteLoaded,
  onSlippageChange,
  hideWalletBalance = false,
  hideAmountInput = false,
  marketData,
  collateralSupplyApy = 0,
  debtBorrowApy = 0,
  simulatedHealthFactor = 0,
  showPositionTable = false,
  isCalculatingPositions = false,
  showSwapDetailsAndSlippage = true,
  currentLeverage,
  targetLeverage,
}: MarginCollateralCardProps) {
  const [swapRouteInfo, setSwapRouteInfo] = useState<SwapRouteInfo | null>(null)
  const [unitRateInfo, setUnitRateInfo] = useState<SwapRouteInfo | null>(null)
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const [swapError, setSwapError] = useState<Error | null>(null)
  const [lastFetchedAmount, setLastFetchedAmount] = useState<number>(0)
  const [slippage, setSlippage] = useState<number>(0.5) // Default 0.5%
  const [slippageInput, setSlippageInput] = useState<string>('0.5') // Input field value
  const [isSlippageExpanded, setIsSlippageExpanded] = useState(false)

  // Use the already debounced borrowAmount from positionCalcs (no double debouncing)
  const borrowAmountForSwap = positionCalcs.borrowAmount

  // Determine swap direction based on leverage change
  // For modify mode, check if we have the isLeverageIncrease field from calculations
  // Otherwise fall back to comparing current vs target leverage
  let isLeverageIncrease: boolean

  if ((positionCalcs as any).isLeverageIncrease !== undefined) {
    isLeverageIncrease = (positionCalcs as any).isLeverageIncrease
  } else if (currentLeverage && targetLeverage) {
    isLeverageIncrease = targetLeverage > currentLeverage
  } else {
    isLeverageIncrease = true // Default to increase for new positions
  }

  // Track when calculations are in progress (use isCalculatingPositions from parent)
  // This is already handled by the parent component's debounce logic

  // Handle slippage changes and notify parent
  const handleSlippageChange = (newSlippage: number) => {
    setSlippage(newSlippage)
    setSlippageInput(newSlippage.toString())
    onSlippageChange?.(newSlippage)
  }

  // Handle input field changes (allow free editing)
  const handleSlippageInputChange = (value: string) => {
    setSlippageInput(value)
  }

  // Validate and apply slippage when user leaves input field
  const handleSlippageInputBlur = () => {
    const trimmedValue = slippageInput.trim()

    // Handle empty input
    if (!trimmedValue) {
      handleSlippageChange(0.5) // Default to 0.5%
      return
    }

    const numValue = parseFloat(trimmedValue)

    // Handle invalid numbers
    if (isNaN(numValue)) {
      handleSlippageChange(0.5) // Reset to default
      return
    }

    // Apply bounds validation
    if (numValue < 0.01) {
      handleSlippageChange(0.01)
    } else if (numValue > 50) {
      handleSlippageChange(50)
    } else {
      // Apply the valid value (round to 2 decimal places)
      handleSlippageChange(Math.round(numValue * 100) / 100)
    }
  }
  // Extract strategy-specific values to avoid unnecessary re-renders
  const debtAssetDecimals = strategy.debtAsset.decimals || 6
  const debtAssetDenom = strategy.debtAsset.denom
  const collateralAssetDenom = strategy.collateralAsset.denom
  const debtAssetSymbol = strategy.debtAsset.symbol
  const collateralAssetSymbol = strategy.collateralAsset.symbol

  // Fetch unit rate (1 unit) to show accurate exchange rate based on swap direction
  useEffect(() => {
    const fetchUnitRate = async () => {
      try {
        const { BigNumber } = await import('bignumber.js')
        const getNeutronRouteInfo = (await import('@/api/swap/getNeutronRouteInfo')).default

        // Determine swap direction and use appropriate asset for unit rate
        let fromDenom, toDenom, fromDecimals

        if (isLeverageIncrease) {
          // Increasing leverage: borrow debt asset, swap to collateral
          fromDenom = debtAssetDenom
          toDenom = collateralAssetDenom
          fromDecimals = debtAssetDecimals
        } else {
          // Decreasing leverage: withdraw collateral, swap to debt asset
          fromDenom = collateralAssetDenom
          toDenom = debtAssetDenom
          fromDecimals = strategy.collateralAsset.decimals || 8
        }

        // Use 1 unit of the "from" asset to get the true unit rate
        const oneUnit = new BigNumber(1).shiftedBy(fromDecimals)

        const routeInfo = await getNeutronRouteInfo(
          fromDenom,
          toDenom,
          oneUnit,
          [], // assets array - not needed for route structure
          chainConfig,
        )

        setUnitRateInfo(routeInfo)
      } catch (err) {
        console.warn('Failed to fetch unit rate:', err)
        setUnitRateInfo(null)
      }
    }

    fetchUnitRate()
  }, [
    debtAssetDenom,
    collateralAssetDenom,
    debtAssetDecimals,
    isLeverageIncrease,
    strategy.collateralAsset.decimals,
  ])

  // Fetch swap route when borrowAmountForSwap changes
  useEffect(() => {
    const fetchSwapRoute = async () => {
      if (!borrowAmountForSwap || borrowAmountForSwap <= 0) {
        setSwapRouteInfo(null)
        onSwapRouteLoaded?.(null)
        setLastFetchedAmount(0)
        return
      }

      // Skip if the amount hasn't changed significantly (less than 1% difference)
      const percentageDiff =
        Math.abs(borrowAmountForSwap - lastFetchedAmount) / Math.max(lastFetchedAmount, 1)
      if (lastFetchedAmount > 0 && percentageDiff < 0.01) {
        return
      }

      setIsSwapLoading(true)
      setSwapError(null)
      setLastFetchedAmount(borrowAmountForSwap)

      try {
        const { BigNumber } = await import('bignumber.js')
        const getNeutronRouteInfo = (await import('@/api/swap/getNeutronRouteInfo')).default

        // Determine swap direction and format amount accordingly
        let fromDenom, toDenom, routeInfo

        if (isLeverageIncrease) {
          // Increasing leverage: borrow debt asset, swap to collateral
          fromDenom = debtAssetDenom
          toDenom = collateralAssetDenom
          const swapAmount = new BigNumber(borrowAmountForSwap).shiftedBy(debtAssetDecimals)

          // Forward routing: we know input amount (debt to borrow), get output amount (collateral)
          routeInfo = await getNeutronRouteInfo(
            fromDenom,
            toDenom,
            swapAmount,
            [], // assets array - not needed for route structure
            chainConfig,
          )
        } else {
          // Decreasing leverage: withdraw collateral, swap to debt asset
          fromDenom = collateralAssetDenom
          toDenom = debtAssetDenom

          // Reverse routing: we know output amount (debt to repay), get input amount (collateral)
          const { getNeutronRouteInfoReverse } = await import('@/api/swap/getNeutronRouteInfo')
          const debtAmountNeeded = new BigNumber(borrowAmountForSwap).shiftedBy(debtAssetDecimals)

          routeInfo = await getNeutronRouteInfoReverse(
            fromDenom,
            toDenom,
            debtAmountNeeded,
            [], // assets array - not needed for route structure
            chainConfig,
            slippage, // Use current slippage
          )
        }

        if (!routeInfo) {
          throw new Error(
            `No swap route found between ${debtAssetSymbol} and ${collateralAssetSymbol}`,
          )
        }

        setSwapRouteInfo(routeInfo)
        onSwapRouteLoaded?.(routeInfo)
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Failed to fetch swap route')
        setSwapError(errorMessage)
        onSwapRouteLoaded?.(null)
      } finally {
        setIsSwapLoading(false)
      }
    }

    fetchSwapRoute()
  }, [
    borrowAmountForSwap,
    debtAssetDecimals,
    debtAssetDenom,
    collateralAssetDenom,
    debtAssetSymbol,
    collateralAssetSymbol,
    isLeverageIncrease,
    strategy.collateralAsset.decimals,
    onSwapRouteLoaded,
  ])
  return (
    <InfoCard title='Margin Collateral'>
      <div className='space-y-2'>
        {!hideWalletBalance && (
          <div className='flex justify-between items-center text-xs'>
            <span className='text-muted-foreground'>Wallet balance</span>
            <span className='font-medium text-foreground'>{displayValues.walletBalance}</span>
          </div>
        )}

        {!hideAmountInput && (
          <AmountInput
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            token={{
              symbol: strategy.collateralAsset.symbol,
              brandColor: strategy.collateralAsset.brandColor || '#F7931A',
              denom: strategy.collateralAsset.denom,
            }}
            balance={userBalance.toString()}
          />
        )}

        {!hideAmountInput && <Separator />}

        {leverageSliderComponent && <div className='space-y-2'>{leverageSliderComponent}</div>}

        {/* Leverage Warning */}
        {(() => {
          const currentLeverage =
            currentAmount > 0 ? positionCalcs.totalPosition / currentAmount : 0
          const leverageWarning = getLeverageWarning(currentLeverage)
          if (!leverageWarning) return null

          return (
            <InfoAlert
              title={
                leverageWarning.type === 'danger' ? 'LIQUIDATION RISK' : 'HIGH LEVERAGE WARNING'
              }
              variant={leverageWarning.type === 'danger' ? 'red' : 'yellow'}
              className='mt-2'
            >
              <div className='flex items-start gap-2'>
                <AlertTriangle
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${leverageWarning.type === 'danger' ? 'text-red-600' : 'text-yellow-600'}`}
                />
                <span>{leverageWarning.message}</span>
              </div>
            </InfoAlert>
          )
        })()}

        {/* Collapsible Slippage Settings */}
        {showSwapDetailsAndSlippage && (
          <div className='space-y-2'>
            <button
              onClick={() => setIsSlippageExpanded(!isSlippageExpanded)}
              className='flex items-center justify-between w-full text-xs font-medium text-foreground hover:text-accent-foreground transition-colors'
            >
              <div className='flex items-center gap-2'>
                <span>Slippage</span>
                <span className='text-muted-foreground'>({slippage}%)</span>
              </div>
              {isSlippageExpanded ? (
                <ChevronUp className='h-3 w-3' />
              ) : (
                <ChevronDown className='h-3 w-3' />
              )}
            </button>

            {isSlippageExpanded && (
              <div className='space-y-3 pt-1'>
                <div className='relative'>
                  <input
                    type='text'
                    value={slippageInput}
                    onChange={(e) => handleSlippageInputChange(e.target.value)}
                    onBlur={handleSlippageInputBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur() // Trigger onBlur validation
                      }
                    }}
                    className='w-full h-8 text-xs px-3 pr-6 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none transition-colors'
                    placeholder='0.5'
                  />
                  <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none'>
                    %
                  </span>
                </div>

                {/* Quick slippage buttons */}
                <div className='flex gap-1'>
                  {[0.1, 0.5, 1.0, 2.0].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSlippageChange(preset)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                        slippage === preset
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>

                {/* Slippage Warning */}
                {(() => {
                  const slippageWarning = getSlippageWarning(slippage)
                  if (!slippageWarning) return null

                  let variant: 'red' | 'yellow' | 'blue'
                  let title: string

                  if (slippageWarning.type === 'danger') {
                    variant = 'red'
                    title = 'TRANSACTION RISK'
                  } else if (slippageWarning.type === 'warning') {
                    variant = 'yellow'
                    title = 'SLIPPAGE WARNING'
                  } else {
                    variant = 'blue'
                    title = 'SLIPPAGE INFO'
                  }

                  return (
                    <InfoAlert title={title} variant={variant} className='mt-2'>
                      <div className='flex items-start gap-2'>
                        {slippageWarning.type === 'info' ? (
                          <Info className='h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600' />
                        ) : (
                          <AlertTriangle
                            className={`h-4 w-4 mt-0.5 flex-shrink-0 ${slippageWarning.type === 'danger' ? 'text-red-600' : 'text-yellow-600'}`}
                          />
                        )}
                        <span>{slippageWarning.message}</span>
                      </div>
                    </InfoAlert>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* Swap Details */}
        {currentAmount > 0 && showSwapDetailsAndSlippage && (
          <div className='p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1 text-xs'>
            <div className='font-medium text-foreground mb-2'>Swap Details</div>
            {(() => {
              if (isCalculatingPositions || isSwapLoading || (!swapRouteInfo && !swapError)) {
                const swapLabel = isLeverageIncrease
                  ? 'Borrow to be swapped'
                  : 'Collateral to be swapped'
                const receiveLabel = isLeverageIncrease ? 'Added Collateral' : 'Debt Repay'

                return (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{swapLabel}</span>
                      <span className='inline-block h-4 w-24 bg-muted/40 rounded animate-pulse' />
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Rate</span>
                      <span className='inline-block h-4 w-28 bg-muted/40 rounded animate-pulse' />
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Price Impact</span>
                      <span className='inline-block h-4 w-12 bg-muted/40 rounded animate-pulse' />
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{receiveLabel}</span>
                      <span className='inline-block h-4 w-24 bg-muted/40 rounded animate-pulse' />
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Total Exposure</span>
                      <span className='inline-block h-4 w-20 bg-muted/40 rounded animate-pulse' />
                    </div>
                  </>
                )
              } else if (swapError) {
                return (
                  <div className='flex items-center justify-center py-2'>
                    <span className='text-muted-foreground'>No route available</span>
                  </div>
                )
              } else if (swapRouteInfo) {
                // Calculate unit rate from dedicated unit rate query (not trade-specific)
                let rate = 0
                let fromAssetSymbol, toAssetSymbol

                if (isLeverageIncrease) {
                  fromAssetSymbol = strategy.debtAsset.symbol
                  toAssetSymbol = strategy.collateralAsset.symbol
                } else {
                  fromAssetSymbol = strategy.collateralAsset.symbol
                  toAssetSymbol = strategy.debtAsset.symbol
                }

                if (unitRateInfo?.amountOut?.gt(0)) {
                  // Unit rate: 1 from asset = X to assets
                  const toAssetDecimals = isLeverageIncrease
                    ? (strategy.collateralAsset.decimals ?? 8)
                    : (strategy.debtAsset.decimals ?? 6)

                  const outValue = unitRateInfo.amountOut.shiftedBy(-toAssetDecimals)
                  rate = outValue.toNumber() // This is already per 1 unit of from asset
                }

                const slippageMultiplier = 1 - slippage / 100
                const toAssetDecimals = isLeverageIncrease
                  ? strategy.collateralAsset.decimals || 8
                  : strategy.debtAsset.decimals || 6
                const minimumReceived = swapRouteInfo.amountOut
                  .shiftedBy(-toAssetDecimals)
                  .multipliedBy(slippageMultiplier)

                const priceImpact = swapRouteInfo.priceImpact.toNumber()

                const swapLabel = isLeverageIncrease
                  ? 'Borrow to be swapped'
                  : 'Collateral to be swapped'
                const swapSuffix = isLeverageIncrease
                  ? strategy.debtAsset.symbol
                  : strategy.collateralAsset.symbol
                const receiveLabel = isLeverageIncrease ? 'Added Collateral' : 'Debt Repay'

                return (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{swapLabel}</span>
                      <span>
                        <FormattedValue
                          value={borrowAmountForSwap}
                          maxDecimals={8}
                          useCompactNotation={false}
                          suffix={` ${swapSuffix}`}
                        />
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Rate</span>
                      <span>
                        {rate > 0 ? (
                          <>
                            1 {fromAssetSymbol} ≈{' '}
                            <FormattedValue
                              value={rate}
                              maxDecimals={6}
                              useCompactNotation={false}
                              suffix={` ${toAssetSymbol}`}
                            />
                          </>
                        ) : (
                          <span className='inline-block h-4 w-28 bg-muted/40 rounded animate-pulse' />
                        )}
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Price Impact</span>
                      <span className={getPriceImpactColor(priceImpact)}>
                        {priceImpact > 0 ? '+' : ''}
                        <FormattedValue
                          value={Math.abs(priceImpact)}
                          maxDecimals={2}
                          suffix='%'
                          useCompactNotation={false}
                        />
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{receiveLabel}</span>
                      <span>
                        <FormattedValue
                          value={minimumReceived.toNumber()}
                          maxDecimals={8}
                          useCompactNotation={false}
                          suffix={` ${toAssetSymbol}`}
                        />
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Total Exposure</span>
                      <span>
                        <FormattedValue
                          value={positionCalcs.totalPosition}
                          maxDecimals={8}
                          useCompactNotation={false}
                          suffix={` ${strategy.collateralAsset.symbol}`}
                        />
                      </span>
                    </div>
                  </>
                )
              } else {
                return (
                  <div className='flex items-center justify-center py-2'>
                    <span className='text-muted-foreground'>No route available</span>
                  </div>
                )
              }
            })()}
          </div>
        )}

        {/* Price Impact Warning */}
        {currentAmount > 0 &&
          showSwapDetailsAndSlippage &&
          swapRouteInfo &&
          (() => {
            const priceImpact = swapRouteInfo.priceImpact.toNumber()
            const priceImpactWarning = getPriceImpactWarning(priceImpact)
            if (!priceImpactWarning) return null

            let variant: 'red' | 'yellow' | 'blue'
            let title: string

            if (priceImpactWarning.type === 'danger') {
              variant = 'red'
              title = 'HIGH PRICE IMPACT'
            } else if (priceImpactWarning.type === 'warning') {
              variant = 'yellow'
              title = 'PRICE IMPACT WARNING'
            } else {
              variant = 'blue'
              title = 'PRICE IMPACT INFO'
            }

            return (
              <InfoAlert title={title} variant={variant} className='mb-4'>
                <div className='flex items-start gap-2'>
                  {priceImpactWarning.type === 'info' ? (
                    <Info className='h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600' />
                  ) : (
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        priceImpactWarning.type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    />
                  )}
                  <div className='space-y-1'>
                    <span>{priceImpactWarning.message}</span>
                    <div className='text-xs text-muted-foreground'>
                      Price Impact: {Math.abs(priceImpact).toFixed(2)}% • Min Received:{' '}
                      {swapRouteInfo.amountOut
                        .shiftedBy(
                          -(isLeverageIncrease
                            ? strategy.collateralAsset.decimals || 8
                            : strategy.debtAsset.decimals || 6),
                        )
                        .multipliedBy(1 - slippage / 100)
                        .toFixed(6)}{' '}
                      {isLeverageIncrease
                        ? strategy.collateralAsset.symbol
                        : strategy.debtAsset.symbol}
                    </div>
                  </div>
                </div>
              </InfoAlert>
            )
          })()}

        {/* New Position Table */}
        {showPositionTable && marketData && (
          <>
            {isCalculatingPositions ? (
              <div className='bg-card rounded-lg border border-border/20 p-4 space-y-4'>
                <div className='h-6 w-40 bg-muted/40 rounded animate-pulse' />
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className='h-4 w-24 bg-muted/40 rounded animate-pulse' />
                    <div className='h-6 w-32 bg-muted/40 rounded animate-pulse' />
                    <div className='h-3 w-20 bg-muted/40 rounded animate-pulse' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 w-28 bg-muted/40 rounded animate-pulse' />
                    <div className='h-6 w-36 bg-muted/40 rounded animate-pulse' />
                    <div className='h-3 w-24 bg-muted/40 rounded animate-pulse' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 w-20 bg-muted/40 rounded animate-pulse' />
                    <div className='h-6 w-28 bg-muted/40 rounded animate-pulse' />
                    <div className='h-3 w-16 bg-muted/40 rounded animate-pulse' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 w-32 bg-muted/40 rounded animate-pulse' />
                    <div className='h-6 w-24 bg-muted/40 rounded animate-pulse' />
                    <div className='h-3 w-20 bg-muted/40 rounded animate-pulse' />
                  </div>
                </div>
              </div>
            ) : (
              <NewPositionTable
                strategy={strategy}
                positionCalcs={positionCalcs}
                collateralAmount={collateralAmount}
                marketData={marketData}
                collateralSupplyApy={collateralSupplyApy}
                debtBorrowApy={debtBorrowApy}
                simulatedHealthFactor={simulatedHealthFactor}
              />
            )}
          </>
        )}
      </div>
    </InfoCard>
  )
}
