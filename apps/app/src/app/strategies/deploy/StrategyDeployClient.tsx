'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'

import { StrategyChart } from '@/components/strategies/StrategyChart'
import { MarginCollateralCard } from '@/components/strategy/MarginCollateralCard'
import { MarketInfoCard } from '@/components/strategy/MarketInfoCard'
import { PositionOverviewCard } from '@/components/strategy/PositionOverviewCard'
import { RiskAssessmentCard } from '@/components/strategy/RiskAssessmentCard'
import { StrategyFlowCard } from '@/components/strategy/StrategyFlowCard'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/useActiveStrategies'
import useHealthComputer from '@/hooks/useHealthComputer'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { usePrices } from '@/hooks/usePrices'
import { useMarketData, useWalletData } from '@/hooks/useStrategyCalculations'
import { useStrategyDeployment } from '@/hooks/useStrategyDeployment'
import { useStrategyLeverageModification } from '@/hooks/useStrategyLeverageModification'
import { usePositionCalculationsWithSimulatedApy } from '@/hooks/useStrategySimulatedApy'
import { useStrategyWithdrawal } from '@/hooks/useStrategyWithdrawal'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'
import { useBroadcast } from '@/utils/broadcast'
import { formatCurrency } from '@/utils/format'
import {
  createDisplayValues,
  createRiskStyles,
  createStrategyRiskStyles,
} from '@/utils/strategyDisplayUtils'

interface StrategyDeployClientProps {
  strategy: Strategy
}

export default function StrategyDeployClient({ strategy }: StrategyDeployClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [collateralAmount, setCollateralAmount] = useState('')
  const [multiplier, setMultiplier] = useState(2)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [cachedSwapRouteInfo, setCachedSwapRouteInfo] = useState<SwapRouteInfo | null>(null)
  const [targetLeverage, setTargetLeverage] = useState(2)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [slippage, setSlippage] = useState(0.5) // Default 0.5% slippage

  // Hooks
  const { markets } = useStore()
  const { executeTransaction } = useBroadcast()
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()
  const { address, connect } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading: isBalancesLoading } = useWalletBalances()
  const { activeStrategies } = useActiveStrategies()
  usePrices()

  // Derived state
  const effectiveMaxBtcApy = maxBtcError ? 0 : maxBtcApy || 0
  const isModifying = searchParams.get('modify') === 'true'
  const modifyingAccountId = searchParams.get('accountId')
  const currentAmount = parseFloat(collateralAmount || '0')
  const collateralSupplyApy = effectiveMaxBtcApy / 100

  // Custom hooks
  const marketData = useMarketData(strategy, markets)
  const walletData = useWalletData(strategy, walletBalances || [], address)
  // Find active strategy - for modify mode, find by accountId
  const activeStrategy =
    isModifying && modifyingAccountId
      ? activeStrategies.find((active) => active.accountId === modifyingAccountId)
      : activeStrategies.find(
          (active) =>
            active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
            active.debtAsset.symbol === strategy.debtAsset.symbol,
        )
  // Create positions for health computer using the specific account ID
  const updatedPositions = useMemo(
    () => ({
      account_kind: 'default' as const,
      account_id: activeStrategy?.accountId || '', // Use the specific account ID for this strategy
      lends: [
        {
          denom: strategy.collateralAsset.denom,
          amount: activeStrategy?.collateralAsset.amount || '',
        },
      ],
      debts: [
        {
          denom: strategy.debtAsset.denom,
          amount: activeStrategy?.debtAsset.amount || '',
          shares: '0',
        },
      ],
      deposits: [],
      staked_astro_lps: [],
      perps: [],
      vaults: [],
    }),
    [
      activeStrategy?.accountId,
      activeStrategy?.collateralAsset.denom,
      activeStrategy?.collateralAsset.amount,
      activeStrategy?.debtAsset.denom,
      activeStrategy?.debtAsset.amount,
    ],
  )

  // Use health computer hook
  const { healthFactor: computedHealthFactor } = useHealthComputer(updatedPositions)

  // Use simulated APY calculations that update based on user input
  // For modify mode, use existing position data but with target leverage for calculations
  const positionCalcs = usePositionCalculationsWithSimulatedApy(
    isModifying && activeStrategy
      ? activeStrategy.collateralAsset.amountFormatted.toString()
      : collateralAmount,
    isModifying && activeStrategy ? targetLeverage : multiplier,
    marketData.collateralMarket?.metrics || null,
    marketData.debtMarket?.metrics || null,
    {
      collateralSupplyApy,
      debtBorrowApy: marketData.debtBorrowApy,
    },
    {
      collateral: strategy.collateralAsset.decimals || 8,
      debt: strategy.debtAsset.decimals || 6,
    },
  )

  const { deployStrategy, fetchSwapRoute } = useStrategyDeployment({
    strategy,
    executeTransaction,
    isModifying,
    modifyingAccountId,
  })

  // Add withdrawal hook for position closing
  const { withdrawFullStrategy, isProcessing: isWithdrawing } = useStrategyWithdrawal()

  const hasLeverageChanged = useMemo(() => {
    return Math.abs(targetLeverage - (activeStrategy?.leverage || 0)) > 0.01
  }, [targetLeverage, activeStrategy])

  // Add leverage modification hook for modify mode - use dummy data if no active strategy
  const leverageModification = useStrategyLeverageModification({
    strategy,
    accountId: activeStrategy?.accountId || '',
    activeStrategy: activeStrategy || {
      accountId: '',
      strategyId: `${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`,
      collateralAsset: {
        denom: strategy.collateralAsset.denom,
        symbol: strategy.collateralAsset.symbol,
        icon: strategy.collateralAsset.icon,
        amount: '0',
        amountFormatted: 0,
        usdValue: 0,
        decimals: strategy.collateralAsset.decimals || 8,
      },
      debtAsset: {
        denom: strategy.debtAsset.denom,
        symbol: strategy.debtAsset.symbol,
        icon: strategy.debtAsset.icon,
        amount: '0',
        amountFormatted: 0,
        usdValue: 0,
        decimals: strategy.debtAsset.decimals || 6,
      },
      leverage: 1,
      netApy: 0,
      isPositive: true,
    },
    slippage,
  })

  // Display values
  const displayValues = createDisplayValues(
    isBalancesLoading,
    walletData.isWalletConnected,
    walletData.userBalance,
    strategy,
    marketData.currentPrice,
    effectiveMaxBtcApy, // Keep static supply APY
    positionCalcs.debtBorrowApy, // Use dynamic borrow APY
  )

  // Risk styles
  const riskStyles = createRiskStyles(positionCalcs.yieldSpread)
  const strategyRiskStyles = createStrategyRiskStyles(strategy.isCorrelated)

  // Validation states
  const hasValidAmount = isModifying
    ? Boolean(activeStrategy)
    : Boolean(collateralAmount && currentAmount > 0)
  const hasInsufficientBalance = isModifying ? false : currentAmount > walletData.userBalance

  // Check available liquidity
  const hasInsufficientLiquidity = useMemo(() => {
    if (!marketData.debtMarket?.metrics || !hasValidAmount) return false

    const borrowAmount = positionCalcs.borrowAmount
    const totalCollateral = new BigNumber(
      marketData.debtMarket.metrics.collateral_total_amount || '0',
    )
    const totalDebt = new BigNumber(marketData.debtMarket.metrics.debt_total_amount || '0')
    const availableLiquidity = totalCollateral.minus(totalDebt)

    const borrowAmountRaw = new BigNumber(borrowAmount)
      .shiftedBy(strategy.debtAsset.decimals || 6)
      .integerValue()

    return borrowAmountRaw.gt(availableLiquidity)
  }, [
    marketData.debtMarket,
    hasValidAmount,
    positionCalcs.borrowAmount,
    strategy.debtAsset.decimals,
  ])

  // Effects
  useEffect(() => {
    if (isModifying && activeStrategy && !hasInitialized) {
      // Pre-fill data from existing position - only once when first entering modify mode
      setCollateralAmount(activeStrategy.collateralAsset.amountFormatted.toString())
      setMultiplier(activeStrategy.leverage)
      setTargetLeverage(activeStrategy.leverage)
      setHasInitialized(true)
    } else if (!isModifying && !hasInitialized) {
      // Set initialized flag for deploy mode as well
      setHasInitialized(true)
    }
  }, [isModifying, activeStrategy, hasInitialized])

  // Reset initialization flag when switching between strategies or accounts
  useEffect(() => {
    setHasInitialized(false)
  }, [modifyingAccountId, strategy.collateralAsset.symbol, strategy.debtAsset.symbol])

  // Handle wallet disconnection in modify mode
  useEffect(() => {
    if (!address && isModifying) {
      // Wallet disconnected while in modify mode, redirect to base strategy page
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('modify')
      newSearchParams.delete('accountId')

      router.replace(`/strategies/deploy?${newSearchParams.toString()}`)
    }
  }, [address, isModifying, searchParams, router])

  // Handle wallet connection in deploy mode - redirect to active strategy if exists
  useEffect(() => {
    if (address && !isModifying && activeStrategy && hasInitialized) {
      // Wallet connected and we're in deploy mode, but user has an active strategy for this pair
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.set('modify', 'true')
      newSearchParams.set('accountId', activeStrategy.accountId)

      router.replace(`/strategies/deploy?${newSearchParams.toString()}`)
    }
  }, [address, isModifying, activeStrategy, searchParams, router, hasInitialized])

  // Clear all data when wallet disconnects
  useEffect(() => {
    if (!address) {
      // Reset all state to initial values when wallet disconnects
      setCollateralAmount('')
      setMultiplier(2)
      setIsProcessing(false)
      setIsClosing(false)
      setCachedSwapRouteInfo(null)
      setTargetLeverage(2)
      setHasInitialized(false)
    }
  }, [address])

  useEffect(() => {
    if (multiplier > marketData.dynamicMaxLeverage && marketData.dynamicMaxLeverage > 0) {
      setMultiplier(Math.min(multiplier, marketData.dynamicMaxLeverage))
    }
  }, [marketData.dynamicMaxLeverage, multiplier])

  // Handlers
  const handleSwapRouteLoaded = useCallback((routeInfo: SwapRouteInfo | null) => {
    setCachedSwapRouteInfo(routeInfo)
  }, [])

  const handleMultiplierChange = (value: number[]) => {
    const newMultiplier = value[0]
    if (newMultiplier >= 2.0 && newMultiplier <= marketData.dynamicMaxLeverage) {
      setMultiplier(newMultiplier)
    }
  }

  const handleLeverageChange = (value: number[]) => {
    const newLeverage = value[0]
    const maxLeverage = 12
    if (newLeverage >= 2.0 && newLeverage <= maxLeverage) {
      setTargetLeverage(newLeverage)
    }
  }

  const handleLeverageModification = async () => {
    if (!activeStrategy || !leverageModification) return

    setIsProcessing(true)
    try {
      const result = await leverageModification.modifyLeverage(targetLeverage)
      if (result.success) {
        toast.success(`Leverage adjusted to ${targetLeverage.toFixed(2)}x successfully!`)
        // Refresh the page data or navigate back
        router.push('/portfolio')
      } else {
        toast.error(result.error || 'Failed to modify leverage')
      }
    } catch (error) {
      console.error('Leverage modification failed:', error)
      toast.error(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeploy = async () => {
    // Validation checks
    if (!walletData.isWalletConnected) return
    if (isBalancesLoading) return
    if (!collateralAmount || currentAmount <= 0) return
    if (hasInsufficientBalance) return
    if (hasInsufficientLiquidity) return

    // Check available liquidity for borrowing
    const borrowAmount = positionCalcs.borrowAmount
    if (marketData.debtMarket) {
      const totalCollateral = new BigNumber(
        marketData.debtMarket.metrics?.collateral_total_amount || '0',
      )
      const totalDebt = new BigNumber(marketData.debtMarket.metrics?.debt_total_amount || '0')
      const availableLiquidity = totalCollateral.minus(totalDebt)

      // Convert borrow amount to the same units as available liquidity (raw units)
      const borrowAmountRaw = new BigNumber(borrowAmount)
        .shiftedBy(strategy.debtAsset.decimals || 6)
        .integerValue()

      if (borrowAmountRaw.gt(availableLiquidity)) {
        const availableLiquidityFormatted = availableLiquidity
          .shiftedBy(-(strategy.debtAsset.decimals || 6))
          .toFixed(2)

        toast.error(
          `Insufficient liquidity. You're trying to borrow ${borrowAmount.toFixed(2)} ${strategy.debtAsset.symbol}, but only ${availableLiquidityFormatted} ${strategy.debtAsset.symbol} is available.`,
        )
        return
      }
    }

    setIsProcessing(true)

    try {
      // Use cached swap route info if available, otherwise fetch it
      const swapRouteInfo = cachedSwapRouteInfo || (await fetchSwapRoute(borrowAmount))

      const result = await deployStrategy({
        collateralAmount: currentAmount,
        multiplier,
        swapRouteInfo,
        slippage,
      })

      // Redirect to portfolio page on successful deployment
      if (result.success) {
        router.push('/portfolio')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getAvailableLiquidityDisplay = () => {
    if (
      marketData.debtMarket?.metrics?.collateral_total_amount &&
      marketData.debtMarket?.metrics?.debt_total_amount
    ) {
      const totalCollateral = new BigNumber(marketData.debtMarket.metrics.collateral_total_amount)
      const totalDebt = new BigNumber(marketData.debtMarket.metrics.debt_total_amount)
      const availableLiquidity = totalCollateral.minus(totalDebt)

      return availableLiquidity.shiftedBy(-(strategy.debtAsset.decimals || 6)).toFixed(2)
    }
    return strategy.liquidityDisplay || 'N/A'
  }

  const getEstimatedEarningsUsd = () => {
    if (marketData.currentPrice > 0) {
      return `~${formatCurrency()(Math.abs(positionCalcs.estimatedYearlyEarnings) * marketData.currentPrice)}`
    }
    return 'N/A'
  }

  const getDeployButtonText = () => {
    if (!walletData.isWalletConnected) return 'Connect Wallet'
    if (isProcessing) return 'Deploying...'
    return 'Deploy Strategy'
  }

  const getAdjustButtonText = () => {
    if (isProcessing) return 'Adjusting...'
    if (hasLeverageChanged) return `Adjust to ${targetLeverage.toFixed(2)}x`
    return 'Adjust Leverage'
  }

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-3'
      >
        <ArrowLeft className='w-4 h-4' />
        Back to Strategies
      </button>

      {/* Header with FlickeringGrid */}
      <div className='relative mb-4 sm:mb-6 bg-card rounded-lg p-4 overflow-hidden'>
        <div className='absolute inset-0 z-10 w-full overflow-hidden'>
          <FlickeringGrid
            className='w-full h-full'
            color={strategy.debtAsset.brandColor}
            squareSize={8}
            gridGap={2}
            flickerChance={0.2}
            maxOpacity={0.2}
            gradientDirection='top-to-bottom'
            height={190}
          />
        </div>

        <div className='relative z-20 '>
          <div className='flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-start gap-4 p-4'>
            <div className='flex items-center justify-start gap-3'>
              <div className='relative'>
                <div className='w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
                  <Image
                    src={strategy.collateralAsset.icon}
                    alt={strategy.collateralAsset.symbol}
                    fill
                    className='object-contain'
                  />
                </div>
                <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border/80 p-1'>
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={12}
                    height={12}
                    className='object-contain'
                  />
                </div>
              </div>
              <div>
                <h2 className='text-base sm:text-xl font-bold text-foreground'>
                  {(() => {
                    if (!isModifying) return 'Deploy'
                    const hasLeverageChanged =
                      Math.abs(targetLeverage - (activeStrategy?.leverage || 0)) > 0.01
                    return hasLeverageChanged ? 'Adjust Leverage' : 'Close'
                  })()}{' '}
                  {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol} Strategy
                </h2>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {(() => {
                    if (!isModifying) {
                      return `Supply ${strategy.collateralAsset.symbol}, borrow ${strategy.debtAsset.symbol}, leverage your position`
                    }
                    const hasLeverageChanged =
                      Math.abs(targetLeverage - (activeStrategy?.leverage || 0)) > 0.01
                    if (hasLeverageChanged) {
                      return `Modify your position leverage from ${activeStrategy?.leverage.toFixed(2)}x to ${targetLeverage.toFixed(2)}x`
                    }
                    return `Close your existing position and withdraw all collateral`
                  })()}
                </p>
              </div>
            </div>

            <div className='text-right'>
              <div
                className='text-4xl font-bold whitespace-nowrap'
                style={{ color: strategy.collateralAsset.brandColor }}
              >
                <CountingNumber
                  value={isNaN(positionCalcs.leveragedApy) ? 0 : positionCalcs.leveragedApy * 100}
                  decimalPlaces={2}
                />
                %
              </div>
              <p className='text-muted-foreground uppercase tracking-wider text-xs text-center font-medium mt-1'>
                Net APY
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
        <div className='flex-1 space-y-4 order-2 lg:order-1'>
          <PositionOverviewCard
            strategy={strategy}
            activeStrategy={isModifying ? activeStrategy : undefined}
            displayValues={displayValues}
            positionCalcs={positionCalcs}
            getEstimatedEarningsUsd={getEstimatedEarningsUsd}
            healthFactor={computedHealthFactor || 0}
          />
          <StrategyChart
            denom={strategy.debtAsset.denom}
            symbol={strategy.debtAsset.symbol}
            brandColor={strategy.debtAsset.brandColor}
            supplyApy={effectiveMaxBtcApy / 100}
            currentBorrowApy={positionCalcs.debtBorrowApy}
            className='w-[494px] h-[350px]'
          />
          <StrategyFlowCard
            strategy={strategy}
            activeStrategy={activeStrategy}
            currentAmount={currentAmount}
            multiplier={multiplier}
            positionCalcs={positionCalcs}
            marketData={marketData}
            collateralSupplyApy={collateralSupplyApy}
            debtBorrowApy={positionCalcs.debtBorrowApy}
          />
        </div>

        {/* Right Column - Input Form */}
        <div className='flex-1 order-1 lg:order-2 space-y-4'>
          {/* Only show input form for deploy mode, not modify mode */}
          {!isModifying && (
            <MarginCollateralCard
              strategy={strategy}
              collateralAmount={collateralAmount}
              setCollateralAmount={setCollateralAmount}
              multiplier={multiplier}
              handleMultiplierChange={handleMultiplierChange}
              dynamicMaxLeverage={marketData.dynamicMaxLeverage}
              displayValues={displayValues}
              userBalance={walletData.userBalance}
              currentAmount={currentAmount}
              positionCalcs={positionCalcs}
              onSwapRouteLoaded={handleSwapRouteLoaded}
              onSlippageChange={setSlippage}
            />
          )}

          {/* Show leverage adjustment for modify mode */}
          {isModifying && activeStrategy && (
            <MarginCollateralCard
              strategy={strategy}
              collateralAmount={activeStrategy.collateralAsset.amountFormatted.toString()}
              setCollateralAmount={() => {}} // Disabled for existing positions
              multiplier={targetLeverage}
              handleMultiplierChange={handleLeverageChange}
              dynamicMaxLeverage={12}
              displayValues={{
                walletBalance: '', // Not used when hidden
                usdValue: (amount: number) =>
                  `$${(amount * parseFloat(marketData.currentPrice.toString())).toFixed(2)}`,
              }}
              userBalance={0} // No additional deposit allowed
              currentAmount={activeStrategy.collateralAsset.amountFormatted} // Use existing position amount
              positionCalcs={positionCalcs} // Use the full position calculations for proper swap details
              onSwapRouteLoaded={handleSwapRouteLoaded}
              onSlippageChange={setSlippage}
              hideWalletBalance={true}
              hideAmountInput={true}
            />
          )}

          {/* Action Buttons */}
          {isModifying && activeStrategy ? (
            <div className='flex gap-3'>
              <Button
                onClick={handleLeverageModification}
                disabled={
                  isProcessing ||
                  isWithdrawing ||
                  !walletData.isWalletConnected ||
                  !hasLeverageChanged ||
                  !leverageModification?.validateLeverageModification(targetLeverage).isValid
                }
                variant='default'
                className='flex-1 shadow-md hover:shadow-lg'
              >
                {getAdjustButtonText()}
              </Button>
              <Button
                onClick={() => {
                  setIsClosing(true)
                  const withdrawParams = {
                    accountId: activeStrategy.accountId,
                    collateralDenom: activeStrategy.collateralAsset.denom,
                    // Use the actual deposit amount, not the calculated amountFormatted
                    collateralAmount: new BigNumber(activeStrategy.collateralAsset.amount)
                      .shiftedBy(-(activeStrategy.collateralAsset.decimals || 8))
                      .toString(),
                    collateralDecimals: activeStrategy.collateralAsset.decimals || 8,
                    debtDenom: activeStrategy.debtAsset.denom,
                    // Use the actual debt amount
                    debtAmount: new BigNumber(activeStrategy.debtAsset.amount)
                      .shiftedBy(-(activeStrategy.debtAsset.decimals || 6))
                      .toString(),
                    debtDecimals: activeStrategy.debtAsset.decimals || 6,
                  }
                  withdrawFullStrategy(withdrawParams)
                    // .then(() => router.push('/strategies'))
                    .catch((error) => {
                      console.error('❌ Strategy close failed:', error)
                      toast.error(
                        error instanceof Error ? error.message : 'Position closure failed',
                      )
                    })
                    .finally(() => setIsClosing(false))
                }}
                disabled={
                  isProcessing || isWithdrawing || !walletData.isWalletConnected || isClosing
                }
                variant='outline'
                className='flex-1'
              >
                {isClosing ? 'Closing...' : 'Close Position'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={!walletData.isWalletConnected ? connect : handleDeploy}
              disabled={
                isProcessing ||
                isWithdrawing ||
                (walletData.isWalletConnected &&
                  (isBalancesLoading ||
                    !hasValidAmount ||
                    hasInsufficientBalance ||
                    hasInsufficientLiquidity))
              }
              variant='default'
              className='w-full'
            >
              {getDeployButtonText()}
            </Button>
          )}

          <MarketInfoCard
            strategy={strategy}
            displayValues={displayValues}
            getAvailableLiquidityDisplay={getAvailableLiquidityDisplay}
          />

          <RiskAssessmentCard
            strategy={strategy}
            positionCalcs={positionCalcs}
            collateralSupplyApy={collateralSupplyApy}
            debtBorrowApy={positionCalcs.debtBorrowApy}
            riskStyles={riskStyles}
            strategyRiskStyles={strategyRiskStyles}
          />
        </div>
      </div>
    </div>
  )
}
