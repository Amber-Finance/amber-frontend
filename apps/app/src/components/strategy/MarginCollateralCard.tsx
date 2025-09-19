import { useEffect, useState } from 'react'

import { BigNumber } from 'bignumber.js'
import { Info } from 'lucide-react'

import FormattedValue from '@/components/common/FormattedValue'
import { InfoCard } from '@/components/deposit'
import { AmountInput } from '@/components/ui/AmountInput'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
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
        const { route } = await import('@skip-go/client')
        const formattedBorrowAmount = new BigNumber(debouncedBorrowAmount)
          .shiftedBy(strategy.debtAsset.decimals || 6)
          .integerValue(BigNumber.ROUND_DOWN)
          .toString()

        const skipRouteParams = {
          amount_in: formattedBorrowAmount,
          source_asset_chain_id: chainConfig.id,
          source_asset_denom: strategy.debtAsset.denom,
          dest_asset_chain_id: chainConfig.id,
          dest_asset_denom: strategy.collateralAsset.denom,
          smart_relay: true,
          experimental_features: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
          allow_multi_tx: true,
          allow_unsafe: true,
          smart_swap_options: {
            split_routes: true,
            evm_swaps: true,
          },
          swapVenues: [{ name: 'neutron-duality', chainId: chainConfig.id }],
          go_fast: false,
        }

        const skipRouteResponse = await route(skipRouteParams as any)

        if (!skipRouteResponse?.operations || skipRouteResponse?.operations?.length === 0) {
          throw new Error(
            `No swap route found between ${strategy.debtAsset.symbol} and ${strategy.collateralAsset.symbol}`,
          )
        }

        // Extract swap operations from Skip response
        const extractSwapOperations = (skipResponse: any): any[] => {
          const firstOperation = skipResponse.operations?.[0]?.swap?.swapIn?.swapOperations
          return firstOperation || []
        }

        const swapOperations = extractSwapOperations(skipRouteResponse)
        const amountOut = skipRouteResponse.amountOut || '0'

        // Calculate price impact and other details
        const amountInBN = new BigNumber(formattedBorrowAmount)
        const amountOutBN = new BigNumber(amountOut)

        // Simple price impact calculation (this might need refinement based on your specific needs)
        const expectedOut = amountInBN // 1:1 ratio as baseline
        const priceImpact = expectedOut.gt(0)
          ? amountOutBN.minus(expectedOut).dividedBy(expectedOut).multipliedBy(100).toNumber()
          : 0

        const routeInfo: SwapRouteInfo = {
          amountOut: amountOutBN,
          priceImpact: new BigNumber(priceImpact),
          fee: new BigNumber(0), // You might need to extract this from the route
          route: { duality: swapOperations }, // Assuming duality route
          description: 'duality',
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
        <div className='flex justify-between items-center text-xs'>
          <span className='text-muted-foreground'>Wallet balance</span>
          <span className='font-medium text-foreground'>{displayValues.walletBalance}</span>
        </div>

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

        <Separator />

        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-xs font-medium text-foreground'>Multiplier</span>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-accent-foreground'>
                {multiplier.toFixed(2)}x
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs max-w-xs'>
                    Leverage multiplier: {multiplier}x means you'll have {multiplier}x exposure to{' '}
                    {strategy.collateralAsset.symbol}. You supply {currentAmount.toFixed(6)} and
                    borrow {positionCalcs.borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Slider
            value={[multiplier]}
            onValueChange={handleMultiplierChange}
            max={dynamicMaxLeverage}
            min={1}
            step={0.01}
            className='w-full'
            brandColor={strategy.collateralAsset.brandColor || '#F7931A'}
          />

          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>1.0x</span>
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
              ) : null}
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
