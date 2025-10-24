'use client'

import { useEffect, useState } from 'react'

import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { SimulatedPositionOverview } from '@/components/strategy/display/SimulatedPositionOverview'
import { getPriceImpactWarning } from '@/components/strategy/helpers'
import { InfoAlert } from '@/components/ui/InfoAlert'
import useSwapRoute from '@/hooks/swap/useSwapRoute'

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

interface SimulationCardProps {
  strategy: Strategy
  displayValues: {
    usdValue: (amount: number) => string
  }
  currentAmount: number
  positionCalcs: {
    borrowAmount: number
    totalPosition: number
    estimatedYearlyEarnings: number
    leveragedApy: number
  }
  onSwapRouteLoaded?: (swapRouteInfo: SwapRouteInfo | null) => void
  onSwapLoadingChange?: (isLoading: boolean) => void
  onSlippageChange?: (slippage: number) => void
  marketData?: {
    currentPrice: number
    debtMarket?: any
  }
  simulatedHealthFactor?: number
  isCalculatingPositions?: boolean
  showSwapDetailsAndSlippage?: boolean
  currentLeverage?: number
  targetLeverage?: number
  isDepositWithdrawMode?: boolean
}

export function SimulationCard({
  strategy,
  displayValues,
  currentAmount,
  positionCalcs,
  onSwapRouteLoaded,
  onSwapLoadingChange,
  onSlippageChange,
  marketData,
  simulatedHealthFactor = 0,
  isCalculatingPositions = false,
  showSwapDetailsAndSlippage = true,
  currentLeverage,
  targetLeverage,
  isDepositWithdrawMode = false,
}: SimulationCardProps) {
  const [slippage, setSlippage] = useState<number>(0.5)
  const [slippageInput, setSlippageInput] = useState<string>('0.5')
  const [isSlippageExpanded, setIsSlippageExpanded] = useState(false)

  const borrowAmountForSwap = positionCalcs.borrowAmount

  // Determine swap direction
  let isLeverageIncrease: boolean
  if ((positionCalcs as any).isLeverageIncrease !== undefined) {
    isLeverageIncrease = (positionCalcs as any).isLeverageIncrease
  } else if (currentLeverage && targetLeverage) {
    isLeverageIncrease = targetLeverage > currentLeverage
  } else {
    isLeverageIncrease = true
  }

  // Handle slippage changes
  const handleSlippageChange = (newSlippage: number) => {
    setSlippage(newSlippage)
    setSlippageInput(newSlippage.toString())
    onSlippageChange?.(newSlippage)
  }

  const handleSlippageInputChange = (value: string) => {
    setSlippageInput(value)
  }

  const handleSlippageInputBlur = () => {
    const trimmedValue = slippageInput.trim()

    if (!trimmedValue) {
      handleSlippageChange(0.5)
      return
    }

    const numValue = Number.parseFloat(trimmedValue)

    if (Number.isNaN(numValue)) {
      handleSlippageChange(0.5)
      return
    }

    if (numValue < 0.01) {
      handleSlippageChange(0.01)
    } else if (numValue > 50) {
      handleSlippageChange(50)
    } else {
      handleSlippageChange(Math.round(numValue * 100) / 100)
    }
  }

  // Extract strategy-specific values
  const debtAssetDecimals = strategy.debtAsset.decimals || 6
  const debtAssetDenom = strategy.debtAsset.denom
  const collateralAssetDenom = strategy.collateralAsset.denom
  const debtAssetSymbol = strategy.debtAsset.symbol
  const collateralAssetSymbol = strategy.collateralAsset.symbol

  // Use swap route hook - disable when in deposit/withdraw mode (no swapping needed)
  const { swapRouteInfo, isSwapLoading, swapError } = useSwapRoute({
    borrowAmountForSwap,
    isLeverageIncrease,
    debtAssetDecimals,
    debtAssetDenom,
    collateralAssetDenom,
    debtAssetSymbol,
    collateralAssetSymbol,
    slippage,
    enabled: showSwapDetailsAndSlippage && !isDepositWithdrawMode,
  })

  // Notify parent of loading state
  useEffect(() => {
    onSwapLoadingChange?.(isSwapLoading)
  }, [isSwapLoading, onSwapLoadingChange])

  // Notify parent of route info
  useEffect(() => {
    if (!swapRouteInfo) return
    onSwapRouteLoaded?.(swapRouteInfo)
  }, [swapRouteInfo, onSwapRouteLoaded])

  if (!showSwapDetailsAndSlippage || currentAmount === 0) {
    return null
  }

  return (
    <InfoCard title={isDepositWithdrawMode ? 'Position Simulation' : 'Simulation & Swap Details'}>
      <div className='space-y-2'>
        {/* Collapsible Slippage Settings - Only show when swapping */}
        {!isDepositWithdrawMode && (
          <div className='space-y-2'>
            <button
              onClick={() => setIsSlippageExpanded(!isSlippageExpanded)}
              className='flex items-center justify-between w-full text-xs font-medium text-foreground hover:text-accent-foreground transition-colors'
            >
              <div className='flex items-center gap-2'>
                <span>Slippage Tolerance</span>
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
                {/* Info message */}
                <div className='flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20'>
                  <Info className='h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <p className='text-xs text-blue-700 dark:text-blue-300'>
                    If price changes unfavorably during the transaction by more than this amount,
                    the transaction will revert.
                  </p>
                </div>

                <div className='relative'>
                  <input
                    type='text'
                    value={slippageInput}
                    onChange={(e) => handleSlippageInputChange(e.target.value)}
                    onBlur={handleSlippageInputBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur()
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
                  {[0.1, 0.5, 1, 2].map((preset) => (
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

        {/* Simulated Position Overview - hide swap details in deposit/withdraw mode */}
        <SimulatedPositionOverview
          strategy={strategy}
          displayValues={displayValues}
          positionCalcs={positionCalcs}
          healthFactor={simulatedHealthFactor}
          marketData={marketData}
          isCalculatingPositions={isCalculatingPositions}
          isSwapLoading={isSwapLoading}
          showSwapDetails={!isDepositWithdrawMode}
          swapRouteInfo={swapRouteInfo}
          swapError={swapError}
          isLeverageIncrease={isLeverageIncrease}
          initialCollateralAmount={currentAmount}
        />

        {/* Price Impact Warning - only show when swapping */}
        {!isDepositWithdrawMode &&
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
                      Price Impact: {Math.abs(priceImpact).toPrecision(4)}% • Min Received:{' '}
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
      </div>
    </InfoCard>
  )
}
