import { useEffect, useState } from 'react'

import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { NewPositionTable } from '@/components/strategy/NewPositionTable'
import { AmountInput } from '@/components/ui/AmountInput'
import { InfoAlert } from '@/components/ui/InfoAlert'
import { Separator } from '@/components/ui/separator'
// chainConfig no longer needed here; used inside hook
import useSwapRoute from '@/hooks/swap/useSwapRoute'

import SwapDetails from './SwapDetails'
import { getLeverageWarning, getPriceImpactWarning } from './strategyHelpers'

// helper functions moved to `strategyHelpers.ts`

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

// helper functions moved to `strategyHelpers.ts`

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
  // (metadata tracking removed — hook handles caching/debounce)
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

  // Use extracted hook for swap route logic
  const { swapRouteInfo, isSwapLoading, swapError } = useSwapRoute({
    borrowAmountForSwap,
    isLeverageIncrease,
    debtAssetDecimals,
    debtAssetDenom,
    collateralAssetDenom,
    debtAssetSymbol,
    collateralAssetSymbol,
    currentLeverage,
    targetLeverage,
    slippage,
    enabled: showSwapDetailsAndSlippage,
  })

  // Notify parent when route info becomes available
  useEffect(() => {
    if (!swapRouteInfo) return
    onSwapRouteLoaded?.(swapRouteInfo)
  }, [swapRouteInfo, onSwapRouteLoaded])
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
          <SwapDetails
            isCalculatingPositions={isCalculatingPositions}
            isSwapLoading={isSwapLoading}
            showSwapDetailsAndSlippage={showSwapDetailsAndSlippage}
            swapRouteInfo={swapRouteInfo}
            swapError={swapError}
            isLeverageIncrease={isLeverageIncrease}
            debtAssetDecimals={debtAssetDecimals}
            strategy={strategy}
            positionCalcs={positionCalcs}
            debtAssetDenom={debtAssetDenom}
            collateralAssetDenom={collateralAssetDenom}
          />
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
                    <div className='text-sm text-muted-foreground'>
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
              <div className='p-2 rounded-lg bg-muted/20 border border-border/50 space-y-4'>
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
                swapRouteInfo={swapRouteInfo}
                isLeverageIncrease={isLeverageIncrease}
              />
            )}
          </>
        )}
      </div>
    </InfoCard>
  )
}
