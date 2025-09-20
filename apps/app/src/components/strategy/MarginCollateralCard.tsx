import { useEffect, useState } from 'react'

import { BigNumber } from 'bignumber.js'
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react'

import FormattedValue from '@/components/common/FormattedValue'
import { InfoCard } from '@/components/deposit'
import { AmountInput } from '@/components/ui/AmountInput'
import { InfoAlert } from '@/components/ui/InfoAlert'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import chainConfig from '@/config/chain'
import useDebounce from '@/hooks/useDebounce'

// Helper function to get price impact color
const getPriceImpactColor = (priceImpact: number): string => {
  if (priceImpact > 0) return 'text-green-500'
  if (priceImpact < 0) return 'text-red-500'
  return 'text-muted-foreground'
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
  multiplier: number
  handleMultiplierChange: (value: number[]) => void
  dynamicMaxLeverage: number
  displayValues: {
    walletBalance: string
    usdValue: (amount: number) => string
  }
  userBalance: number
  currentAmount: number
  positionCalcs: {
    borrowAmount: number
    totalPosition: number
  }
  onSwapRouteLoaded?: (swapRouteInfo: SwapRouteInfo | null) => void
  onSlippageChange?: (slippage: number) => void
  hideWalletBalance?: boolean
  hideAmountInput?: boolean
}

export function MarginCollateralCard({
  strategy,
  collateralAmount,
  setCollateralAmount,
  multiplier,
  handleMultiplierChange,
  dynamicMaxLeverage,
  displayValues,
  userBalance,
  currentAmount,
  positionCalcs,
  onSwapRouteLoaded,
  onSlippageChange,
  hideWalletBalance = false,
  hideAmountInput = false,
}: MarginCollateralCardProps) {
  const [swapRouteInfo, setSwapRouteInfo] = useState<SwapRouteInfo | null>(null)
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const [swapError, setSwapError] = useState<Error | null>(null)
  const [slippage, setSlippage] = useState<number>(0.5) // Default 0.5%
  const [slippageInput, setSlippageInput] = useState<string>('0.5') // Input field value
  const [isSlippageExpanded, setIsSlippageExpanded] = useState(false)

  // Debounce borrowAmount to prevent excessive API calls
  const debouncedBorrowAmount = useDebounce(positionCalcs.borrowAmount, 500)

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

  // Fetch swap route when debouncedBorrowAmount changes
  useEffect(() => {
    const fetchSwapRoute = async () => {
      if (!debouncedBorrowAmount || debouncedBorrowAmount <= 0) {
        setSwapRouteInfo(null)
        onSwapRouteLoaded?.(null)
        return
      }

      setIsSwapLoading(true)
      setSwapError(null)

      try {
        const { BigNumber } = await import('bignumber.js')
        const getNeutronRouteInfo = (await import('@/api/swap/getNeutronRouteInfo')).default

        const formattedBorrowAmount = new BigNumber(debouncedBorrowAmount).shiftedBy(
          debtAssetDecimals,
        )

        // Use the established getNeutronRouteInfo function to ensure consistent route formatting
        const routeInfo = await getNeutronRouteInfo(
          debtAssetDenom,
          collateralAssetDenom,
          formattedBorrowAmount,
          [], // assets array - not needed for route structure
          chainConfig,
        )

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
    debouncedBorrowAmount,
    debtAssetDecimals,
    debtAssetDenom,
    collateralAssetDenom,
    debtAssetSymbol,
    collateralAssetSymbol,
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

        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-xs font-medium text-foreground'>Multiplier</span>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-accent-foreground'>
                {multiplier.toFixed(2)}x
              </span>
            </div>
          </div>

          <Slider
            value={[multiplier]}
            onValueChange={handleMultiplierChange}
            max={dynamicMaxLeverage}
            min={2.0}
            step={0.01}
            className='w-full'
            brandColor={strategy.collateralAsset.brandColor || '#F7931A'}
          />

          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>2.0x</span>
            <span>Max {dynamicMaxLeverage.toFixed(1)}x</span>
          </div>

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

                  const variant =
                    slippageWarning.type === 'danger'
                      ? 'red'
                      : slippageWarning.type === 'warning'
                        ? 'yellow'
                        : 'blue'

                  return (
                    <InfoAlert
                      title={
                        slippageWarning.type === 'danger'
                          ? 'TRANSACTION RISK'
                          : slippageWarning.type === 'warning'
                            ? 'SLIPPAGE WARNING'
                            : 'SLIPPAGE INFO'
                      }
                      variant={variant}
                      className='mt-2'
                    >
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

          {/* Swap Details */}
          {currentAmount > 0 && (
            <div className='p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1 text-xs'>
              <div className='font-medium text-foreground mb-2'>Swap Details</div>
              {isSwapLoading || (!swapRouteInfo && !swapError) ? (
                <>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Rate</span>
                    <span className='inline-block h-3 w-24 bg-muted/40 rounded animate-pulse align-middle' />
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Price Impact</span>
                    <span className='inline-block h-3 w-12 bg-muted/40 rounded animate-pulse align-middle' />
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Minimum Received</span>
                    <span className='inline-block h-3 w-24 bg-muted/40 rounded animate-pulse align-middle' />
                  </div>
                </>
              ) : swapError ? (
                <div className='flex items-center justify-center py-2'>
                  <span className='text-muted-foreground'>No route available</span>
                </div>
              ) : swapRouteInfo ? (
                <>
                  {(() => {
                    // Calculate rate and minimum received
                    let rate = 0
                    if (debouncedBorrowAmount > 0 && swapRouteInfo.amountOut.gt(0)) {
                      const inValue = new BigNumber(debouncedBorrowAmount)
                      const outValue = swapRouteInfo.amountOut.shiftedBy(
                        -strategy.collateralAsset.decimals || -8,
                      )
                      rate = outValue.dividedBy(inValue).toNumber()
                    }

                    const slippageMultiplier = 1 - slippage / 100
                    const minimumReceived = swapRouteInfo.amountOut
                      .shiftedBy(-strategy.collateralAsset.decimals || -8)
                      .multipliedBy(slippageMultiplier)

                    const priceImpact = swapRouteInfo.priceImpact.toNumber()

                    return (
                      <>
                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Rate</span>
                          <span>
                            1 {strategy.debtAsset.symbol} ≈{' '}
                            <FormattedValue
                              value={rate}
                              maxDecimals={6}
                              useCompactNotation={false}
                              suffix={` ${strategy.collateralAsset.symbol}`}
                            />
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
                          <span className='text-muted-foreground'>Minimum Received</span>
                          <span>
                            <FormattedValue
                              value={minimumReceived.toNumber()}
                              maxDecimals={8}
                              useCompactNotation={false}
                              suffix={` ${strategy.collateralAsset.symbol}`}
                            />
                          </span>
                        </div>
                      </>
                    )
                  })()}
                </>
              ) : (
                <div className='flex items-center justify-center py-2'>
                  <span className='text-muted-foreground'>No route available</span>
                </div>
              )}
            </div>
          )}

          {/* Leverage Breakdown */}
          <div className='p-2 rounded-lg bg-muted/20 border border-border/50'>
            <div className='text-xs space-y-1'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Your collateral:</span>
                <span className='font-medium'>
                  {currentAmount.toFixed(6)} {strategy.collateralAsset.symbol}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Borrow amount:</span>
                <span className='font-medium'>
                  {positionCalcs.borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total exposure:</span>
                <span className='font-medium'>
                  {positionCalcs.totalPosition.toFixed(6)} {strategy.collateralAsset.symbol}
                </span>
              </div>
              <Separator />
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Leverage ratio:</span>
                <span className='font-medium'>
                  {currentAmount > 0
                    ? (positionCalcs.totalPosition / currentAmount).toFixed(2)
                    : '0.00'}
                  x
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Borrow ratio:</span>
                <span className='font-medium'>
                  {currentAmount > 0
                    ? (positionCalcs.borrowAmount / currentAmount).toFixed(2)
                    : '0.00'}
                  x
                </span>
              </div>
              <Separator />
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Max leverage:</span>
                <span className='font-medium text-accent-foreground'>
                  {dynamicMaxLeverage.toFixed(2)}x
                </span>
              </div>
              <div className='text-xs text-muted-foreground/80'>
                Liquidation occurs at ~15x leverage (LTV: 92%, Threshold: 95%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
