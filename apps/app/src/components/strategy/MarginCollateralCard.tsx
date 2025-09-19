import { useEffect, useState } from 'react'

import { BigNumber } from 'bignumber.js'

import FormattedValue from '@/components/common/FormattedValue'
import { InfoCard } from '@/components/deposit'
import { AmountInput } from '@/components/ui/AmountInput'
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
  hideWalletBalance = false,
  hideAmountInput = false,
}: MarginCollateralCardProps) {
  const [swapRouteInfo, setSwapRouteInfo] = useState<SwapRouteInfo | null>(null)
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const [swapError, setSwapError] = useState<Error | null>(null)

  // Debounce borrowAmount to prevent excessive API calls
  const debouncedBorrowAmount = useDebounce(positionCalcs.borrowAmount, 500)

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
          strategy.debtAsset.decimals || 6,
        )

        // Use the established getNeutronRouteInfo function to ensure consistent route formatting
        const routeInfo = await getNeutronRouteInfo(
          strategy.debtAsset.denom,
          strategy.collateralAsset.denom,
          formattedBorrowAmount,
          [], // assets array - not needed for route structure
          chainConfig,
        )

        if (!routeInfo) {
          throw new Error(
            `No swap route found between ${strategy.debtAsset.symbol} and ${strategy.collateralAsset.symbol}`,
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
  }, [debouncedBorrowAmount, strategy, onSwapRouteLoaded])
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
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Route</span>
                    <span className='inline-block h-3 w-16 bg-muted/40 rounded animate-pulse align-middle' />
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

                    const slippage = 0.5 // Default slippage
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

                        <div className='flex justify-between'>
                          <span className='text-muted-foreground'>Route</span>
                          <span className='capitalize'>
                            {swapRouteInfo.description || 'duality'}
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
                Based on liquidation threshold: {(strategy.liquidationThreshold || 0.85) * 100}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}
