'use client'

import { useLeverageSlider } from '@/components/strategy/LeverageSlider'
import { MarginCollateralCard } from '@/components/strategy/MarginCollateralCard'
import { MarketInfoCard } from '@/components/strategy/MarketInfoCard'
import { RiskAssessmentCard } from '@/components/strategy/RiskAssessmentCard'
import { Button } from '@/components/ui/Button'

// Loading skeleton component
const CardSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-card rounded-lg border border-border/20 p-4 space-y-4 ${className}`}>
    <div className='h-6 w-32 bg-muted/40 rounded animate-pulse' />
    <div className='space-y-3'>
      <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
      <div className='h-4 w-3/4 bg-muted/40 rounded animate-pulse' />
      <div className='h-4 w-1/2 bg-muted/40 rounded animate-pulse' />
    </div>
  </div>
)

interface StrategyFormPanelProps {
  strategy: Strategy
  mode: 'deploy' | 'modify'

  // State
  collateralAmount: string
  setCollateralAmount: (value: string) => void
  multiplier: number
  setMultiplier: (value: number) => void
  targetLeverage: number
  setTargetLeverage: (value: number) => void
  slippage: number
  setSlippage: (value: number) => void

  // Data
  activeStrategy?: any
  displayValues: any
  walletData: any
  marketData: any
  debtBasedLimits?: any
  positionCalcs: any
  riskStyles: any
  strategyRiskStyles: any
  collateralSupplyApy: number
  debtBorrowApy: number
  healthFactor: number
  simulatedHealthFactor?: number
  computedHealthFactor?: number

  // Validation
  hasValidAmount: boolean
  hasInsufficientBalance: boolean
  hasInsufficientLiquidity: boolean
  hasUserInteraction: boolean
  isCalculatingPositions: boolean

  // Actions
  onSwapRouteLoaded: (routeInfo: SwapRouteInfo | null) => void
  onDeploy?: () => Promise<void>
  onModifyLeverage?: () => Promise<void>
  onClosePosition?: () => Promise<void>
  getAvailableLiquidityDisplay: () => string

  // State flags
  isProcessing: boolean
  isClosing: boolean
  isWithdrawing?: boolean
  isDataLoading?: boolean

  // Connection
  connect: () => void
}

export function StrategyFormPanel({
  strategy,
  mode,
  collateralAmount,
  setCollateralAmount,
  multiplier,
  setMultiplier,
  targetLeverage,
  setTargetLeverage,
  slippage,
  setSlippage,
  activeStrategy,
  displayValues,
  walletData,
  marketData,
  debtBasedLimits,
  positionCalcs,
  riskStyles,
  strategyRiskStyles,
  collateralSupplyApy,
  debtBorrowApy,
  healthFactor,
  simulatedHealthFactor,
  computedHealthFactor,
  hasValidAmount,
  hasInsufficientBalance,
  hasInsufficientLiquidity,
  hasUserInteraction,
  isCalculatingPositions,
  onSwapRouteLoaded,
  onDeploy,
  onModifyLeverage,
  onClosePosition,
  getAvailableLiquidityDisplay,
  isProcessing,
  isClosing,
  isWithdrawing = false,
  isDataLoading = false,
  connect,
}: StrategyFormPanelProps) {
  const isModifying = mode === 'modify'

  // Use leverage slider hook for deploy mode
  const deployLeverageSlider = useLeverageSlider({
    leverage: multiplier,
    onLeverageChange: (value: number[]) => {
      const newMultiplier = value[0]
      const effectiveMaxLeverage =
        debtBasedLimits?.effectiveMaxLeverage || marketData.dynamicMaxLeverage
      if (newMultiplier >= 2.0 && newMultiplier <= effectiveMaxLeverage) {
        setMultiplier(newMultiplier)
      }
    },
    maxLeverage: debtBasedLimits?.effectiveMaxLeverage || marketData.dynamicMaxLeverage,
    brandColor: strategy.collateralAsset.brandColor || '#F7931A',
  })

  // Use leverage slider hook for modify mode
  const modifyLeverageSlider = useLeverageSlider({
    leverage: targetLeverage,
    onLeverageChange: (value: number[]) => {
      const newLeverage = value[0]
      const effectiveMaxLeverage =
        debtBasedLimits?.effectiveMaxLeverage || marketData.dynamicMaxLeverage || 12
      if (newLeverage >= 2.0 && newLeverage <= effectiveMaxLeverage) {
        setTargetLeverage(newLeverage)
      }
    },
    maxLeverage: debtBasedLimits?.effectiveMaxLeverage || marketData.dynamicMaxLeverage || 12,
    existingPositionLeverage: activeStrategy?.leverage,
    brandColor: strategy.collateralAsset.brandColor || '#F7931A',
  })

  // Helper functions for button text
  const getDeployButtonText = () => {
    if (!walletData.isWalletConnected) return 'Connect Wallet'
    if (isProcessing) return 'Deploying...'
    return 'Deploy Strategy'
  }

  const getAdjustButtonText = () => {
    if (isProcessing) return 'Adjusting...'
    const hasLeverageChanged =
      activeStrategy && Math.abs(targetLeverage - activeStrategy.leverage) > 0.01
    if (hasLeverageChanged) return `Adjust to ${targetLeverage.toFixed(2)}x`
    return 'Adjust Leverage'
  }

  if (isDataLoading) {
    return (
      <div className='flex-1 order-1 lg:order-2 space-y-4'>
        <CardSkeleton className='h-80' />
        <CardSkeleton className='h-12' />
        <CardSkeleton className='h-48' />
        <CardSkeleton className='h-32' />
      </div>
    )
  }

  const currentAmount = parseFloat(collateralAmount || '0')
  const hasLeverageChanged =
    activeStrategy && Math.abs(targetLeverage - activeStrategy.leverage) > 0.01

  return (
    <div className='flex-1 order-1 lg:order-2 space-y-4'>
      {/* Input Form - Different for deploy vs modify */}
      {!isModifying && (
        <MarginCollateralCard
          strategy={strategy}
          collateralAmount={collateralAmount}
          setCollateralAmount={setCollateralAmount}
          leverageSliderComponent={deployLeverageSlider.SliderComponent}
          displayValues={displayValues}
          userBalance={walletData.userBalance}
          currentAmount={currentAmount}
          positionCalcs={positionCalcs}
          onSwapRouteLoaded={onSwapRouteLoaded}
          onSlippageChange={setSlippage}
          marketData={marketData}
          collateralSupplyApy={collateralSupplyApy}
          debtBorrowApy={debtBorrowApy}
          simulatedHealthFactor={simulatedHealthFactor || computedHealthFactor || 0}
          showPositionTable={hasUserInteraction}
          isCalculatingPositions={isCalculatingPositions}
          showSwapDetailsAndSlippage={true}
        />
      )}

      {/* Modify Mode Form */}
      {isModifying && activeStrategy && (
        <MarginCollateralCard
          strategy={strategy}
          collateralAmount={activeStrategy.collateralAsset.amountFormatted.toString()}
          setCollateralAmount={() => {}} // Disabled for existing positions
          leverageSliderComponent={modifyLeverageSlider.SliderComponent}
          displayValues={{
            walletBalance: '',
            usdValue: (amount: number) =>
              `$${(amount * parseFloat(marketData.currentPrice.toString())).toFixed(2)}`,
          }}
          userBalance={0}
          currentAmount={activeStrategy.collateralAsset.amountFormatted}
          positionCalcs={positionCalcs}
          onSwapRouteLoaded={onSwapRouteLoaded}
          onSlippageChange={setSlippage}
          hideWalletBalance={true}
          hideAmountInput={true}
          marketData={marketData}
          collateralSupplyApy={collateralSupplyApy}
          debtBorrowApy={debtBorrowApy}
          simulatedHealthFactor={simulatedHealthFactor || computedHealthFactor || 0}
          showPositionTable={hasUserInteraction}
          isCalculatingPositions={isCalculatingPositions}
          showSwapDetailsAndSlippage={hasLeverageChanged && hasUserInteraction}
          currentLeverage={activeStrategy.leverage}
          targetLeverage={targetLeverage}
        />
      )}

      {/* Action Buttons */}
      {isModifying && activeStrategy ? (
        <div className='flex gap-3'>
          <Button
            onClick={onModifyLeverage}
            disabled={
              isProcessing || isWithdrawing || !walletData.isWalletConnected || !hasLeverageChanged
            }
            variant='default'
            className='flex-1 shadow-md hover:shadow-lg'
          >
            {getAdjustButtonText()}
          </Button>
          <Button
            onClick={onClosePosition}
            disabled={isProcessing || isWithdrawing || !walletData.isWalletConnected || isClosing}
            variant='outline'
            className='flex-1'
          >
            {isClosing ? 'Closing...' : 'Close Position'}
          </Button>
        </div>
      ) : (
        <Button
          onClick={!walletData.isWalletConnected ? connect : onDeploy}
          disabled={
            isProcessing ||
            isWithdrawing ||
            (walletData.isWalletConnected &&
              (!hasValidAmount || hasInsufficientBalance || hasInsufficientLiquidity))
          }
          variant='default'
          className='w-full'
        >
          {getDeployButtonText()}
        </Button>
      )}

      {/* Market Info and Risk Assessment Cards */}
      <MarketInfoCard
        strategy={strategy}
        displayValues={displayValues}
        getAvailableLiquidityDisplay={getAvailableLiquidityDisplay}
      />

      <RiskAssessmentCard
        strategy={strategy}
        positionCalcs={positionCalcs}
        collateralSupplyApy={collateralSupplyApy}
        debtBorrowApy={debtBorrowApy}
        riskStyles={riskStyles}
        strategyRiskStyles={strategyRiskStyles}
      />
    </div>
  )
}
