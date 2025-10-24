'use client'

import { MarketInfoCard, RiskAssessmentCard } from '@/components/strategy/cards'
import {
  DepositWithdrawAmountCard,
  LeverageSliderCard,
  SimulationCard,
} from '@/components/strategy/form'
import { Button } from '@/components/ui/Button'
import { LeverageSlider } from '@/components/ui/LeverageSlider'
import { useLeverageSlider } from '@/hooks/strategy'

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

  // Deposit/Withdraw state for modify mode
  depositWithdrawAmount?: string
  setDepositWithdrawAmount?: (value: string) => void
  depositWithdrawMode?: 'deposit' | 'withdraw'
  setDepositWithdrawMode?: (mode: 'deposit' | 'withdraw') => void

  // Active tab for modify mode
  activeTab?: 'deposit' | 'withdraw' | 'modify'

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
  onSwapLoadingChange?: (isLoading: boolean) => void
  onDeploy?: () => Promise<void>
  onModifyLeverage?: () => Promise<void>
  onClosePosition?: () => Promise<void>
  onDepositWithdraw?: () => Promise<void>
  getAvailableLiquidityDisplay: () => string

  // State flags
  isProcessing: boolean
  isClosing: boolean
  isWithdrawing?: boolean
  isFetchingRoute?: boolean
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
  depositWithdrawAmount,
  setDepositWithdrawAmount,
  depositWithdrawMode,
  setDepositWithdrawMode,
  activeTab = 'modify',
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
  onSwapLoadingChange,
  onDeploy,
  onModifyLeverage,
  onClosePosition,
  onDepositWithdraw,
  getAvailableLiquidityDisplay,
  isProcessing,
  isClosing,
  isWithdrawing = false,
  isFetchingRoute = false,
  isDataLoading = false,
  connect,
}: StrategyFormPanelProps) {
  const isModifying = mode === 'modify'

  // Determine what to show based on activeTab
  const showDepositCard = !isModifying || activeTab === 'deposit' || activeTab === 'withdraw'
  const showLeverageCard = !isModifying || activeTab === 'modify'

  // Check if leverage slider should be disabled (when deposit/withdraw amount is set in modify mode)
  const isLeverageDisabled =
    isModifying &&
    Boolean(depositWithdrawAmount && Number.parseFloat(depositWithdrawAmount || '0') > 0)

  // Use leverage slider hook for deploy mode
  // Always respect strategy.maxLeverage as the hard cap
  const effectiveMaxLeverageForDeploy = Math.min(
    strategy.maxLeverage || 12,
    debtBasedLimits?.effectiveMaxLeverage || marketData.dynamicMaxLeverage,
  )

  useLeverageSlider({
    leverage: multiplier,
  })

  // Use leverage slider hook for modify mode
  // Always respect strategy.maxLeverage as the hard cap
  const effectiveMaxLeverageForModify = Math.min(
    strategy.maxLeverage || 12,
    debtBasedLimits?.effectiveMaxLeverage || marketData.dynamicMaxLeverage || 12,
  )

  useLeverageSlider({
    leverage: targetLeverage,
  })

  // Helper functions for button text
  const getDeployButtonText = () => {
    if (!walletData.isWalletConnected) return 'Connect Wallet'
    if (strategy.maxLeverage && multiplier > strategy.maxLeverage) return 'Leverage Too High'
    if (isFetchingRoute) return 'Fetching Route...'
    if (isProcessing) return 'Deploying...'
    return 'Deploy Strategy'
  }

  const getAdjustButtonText = () => {
    if (strategy.maxLeverage && targetLeverage > strategy.maxLeverage) return 'Leverage Too High'
    if (isFetchingRoute) return 'Fetching Route...'
    if (isProcessing) return 'Adjusting...'
    if (hasUserInteraction && !isLeverageDisabled) return `Adjust to ${targetLeverage.toFixed(2)}x`
    return 'Adjust Leverage'
  }

  const getDepositWithdrawButtonText = () => {
    if (isProcessing) {
      return depositWithdrawMode === 'deposit' ? 'Depositing...' : 'Withdrawing...'
    }
    return depositWithdrawMode === 'deposit' ? 'Deposit' : 'Withdraw'
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

  const currentAmount = Number.parseFloat(collateralAmount || '0')

  return (
    <div className='flex-1 order-1 lg:order-2 space-y-4'>
      {/* Amount Input Card - Show in deploy mode or when on deposit/withdraw tab */}
      {showDepositCard && (
        <DepositWithdrawAmountCard
          strategy={strategy}
          activeStrategy={activeStrategy}
          collateralAmount={collateralAmount}
          setCollateralAmount={setCollateralAmount}
          userBalance={walletData.userBalance}
          depositWithdrawAmount={depositWithdrawAmount}
          setDepositWithdrawAmount={setDepositWithdrawAmount}
          depositWithdrawMode={depositWithdrawMode}
          setDepositWithdrawMode={setDepositWithdrawMode}
          activeTab={activeTab}
          displayValues={displayValues}
        />
      )}

      {/* Leverage Slider Card - Show in deploy mode or when on modify tab */}
      {showLeverageCard && !isLeverageDisabled && (
        <LeverageSliderCard
          strategy={strategy}
          leverageSliderComponent={
            isModifying ? (
              <LeverageSlider
                leverage={targetLeverage}
                onLeverageChange={(value: number[]) => {
                  const newLeverage = value[0]
                  if (newLeverage >= 2 && newLeverage <= effectiveMaxLeverageForModify) {
                    setTargetLeverage(newLeverage)
                  }
                }}
                maxLeverage={effectiveMaxLeverageForModify}
                existingPositionLeverage={activeStrategy?.leverage}
                brandColor={strategy.collateralAsset.brandColor || '#F7931A'}
                disabled={!walletData.isWalletConnected}
              />
            ) : (
              <LeverageSlider
                leverage={multiplier}
                onLeverageChange={(value: number[]) => {
                  const newMultiplier = value[0]
                  if (newMultiplier >= 2 && newMultiplier <= effectiveMaxLeverageForDeploy) {
                    setMultiplier(newMultiplier)
                  }
                }}
                maxLeverage={effectiveMaxLeverageForDeploy}
                brandColor={strategy.collateralAsset.brandColor || '#F7931A'}
                disabled={!walletData.isWalletConnected}
              />
            )
          }
          currentAmount={currentAmount}
          positionCalcs={positionCalcs}
          marketData={marketData}
          disabled={isLeverageDisabled}
        />
      )}

      {/* Simulation Card */}
      <SimulationCard
        strategy={strategy}
        displayValues={displayValues}
        currentAmount={currentAmount}
        positionCalcs={positionCalcs}
        onSwapRouteLoaded={onSwapRouteLoaded}
        onSwapLoadingChange={onSwapLoadingChange}
        onSlippageChange={setSlippage}
        marketData={marketData}
        simulatedHealthFactor={simulatedHealthFactor || computedHealthFactor || 0}
        isCalculatingPositions={isCalculatingPositions}
        showSwapDetailsAndSlippage={walletData.isWalletConnected && hasUserInteraction}
        currentLeverage={isModifying ? activeStrategy?.leverage : undefined}
        targetLeverage={isModifying ? targetLeverage : undefined}
        isDepositWithdrawMode={isLeverageDisabled}
      />

      {/* Action Buttons */}
      {isModifying && activeStrategy ? (
        <div className='flex gap-3'>
          {/* Show Deposit/Withdraw button when amount is entered, otherwise show Adjust Leverage */}
          {isLeverageDisabled ? (
            <Button
              onClick={onDepositWithdraw}
              disabled={
                isProcessing ||
                isWithdrawing ||
                !walletData.isWalletConnected ||
                !hasUserInteraction
              }
              variant='default'
              gradientColor={strategy.collateralAsset.brandColor}
              className='flex-1 shadow-md hover:shadow-lg'
            >
              {getDepositWithdrawButtonText()}
            </Button>
          ) : (
            <Button
              onClick={onModifyLeverage}
              disabled={
                isProcessing ||
                isWithdrawing ||
                isFetchingRoute ||
                isCalculatingPositions ||
                !walletData.isWalletConnected ||
                !hasUserInteraction ||
                (strategy.maxLeverage !== undefined && targetLeverage > strategy.maxLeverage)
              }
              variant='default'
              className='flex-1 shadow-md hover:shadow-lg'
            >
              {getAdjustButtonText()}
            </Button>
          )}
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
          onClick={walletData.isWalletConnected ? onDeploy : connect}
          disabled={
            isProcessing ||
            isWithdrawing ||
            isFetchingRoute ||
            isCalculatingPositions ||
            (walletData.isWalletConnected &&
              (!hasValidAmount ||
                hasInsufficientBalance ||
                hasInsufficientLiquidity ||
                (strategy.maxLeverage !== undefined && multiplier > strategy.maxLeverage)))
          }
          variant='default'
          className='w-full'
        >
          {getDeployButtonText()}
        </Button>
      )}

      {/* Market Info Card - Moved below action buttons */}
      <MarketInfoCard
        strategy={strategy}
        displayValues={displayValues}
        getAvailableLiquidityDisplay={getAvailableLiquidityDisplay}
      />

      {/* Risk Assessment Card */}
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
