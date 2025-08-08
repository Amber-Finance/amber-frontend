'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import BigNumber from 'bignumber.js'
import { ArrowUpDown, Settings } from 'lucide-react'

import QuickAmountButtons from '@/app/swap/QuickAmountButtons'
import FormattedValue from '@/components/common/FormattedValue'
import { TokenSelectorModal } from '@/components/common/TokenSelectorModal'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { useSwap } from '@/hooks/useSwap'
import useWalletBalances from '@/hooks/useWalletBalances'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { calculateUsdValue } from '@/utils/format'

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1] as const

export default function SwapClient() {
  const searchParams = useSearchParams()
  useMarkets()
  const { markets } = useStore()
  const { data: walletBalances } = useWalletBalances()
  const { address } = useChain(chainConfig.name)
  const { fetchSwapRoute, executeSwap, isSwapInProgress } = useSwap()

  const [fromTokenDenom, setFromTokenDenom] = useState<string | null>(null)
  const [toTokenDenom, setToTokenDenom] = useState<string | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [customSlippage, setCustomSlippage] = useState('')
  const [showSlippagePopover, setShowSlippagePopover] = useState(false)
  const [isTokenModalOpen, setTokenModalOpen] = useState(false)
  const [selectingFrom, setSelectingFrom] = useState(true)
  const [routeInfo, setRouteInfo] = useState<SwapRouteInfo | null>(null)
  const [debouncedFromAmount, setDebouncedFromAmount] = useState('')

  const swapTokens = useMemo(() => {
    if (!markets || !walletBalances) return []
    const isConnected = !!address

    return tokens.map((token) => {
      const market = markets.find((m) => m.asset.denom === token.denom)
      const walletBalance = walletBalances.find((b) => b.denom === token.denom)
      const decimals = market?.asset?.decimals || 6
      const rawBalance = isConnected && walletBalance?.amount ? Number(walletBalance.amount) : 0

      const adjustedBalance =
        rawBalance > 0 ? new BigNumber(walletBalance!.amount).shiftedBy(-decimals).toNumber() : 0
      const usdValue =
        isConnected && walletBalance?.amount && market?.price?.price && rawBalance > 0
          ? calculateUsdValue(walletBalance.amount, market.price.price, decimals).toString()
          : '0'

      return {
        symbol: token.symbol,
        name: token.description,
        icon: token.icon,
        balance: adjustedBalance.toString(),
        rawBalance,
        price: market?.price?.price ? parseFloat(market.price.price) : 0,
        denom: token.denom,
        usdValue,
        decimals,
      }
    })
  }, [markets, walletBalances, address])

  // Derived tokens
  const fromToken = fromTokenDenom
    ? swapTokens.find((token) => token.denom === fromTokenDenom)
    : null
  const toToken = toTokenDenom ? swapTokens.find((token) => token.denom === toTokenDenom) : null

  const hasInsufficientBalance =
    fromToken && fromAmount && parseFloat(fromAmount) > parseFloat(fromToken.balance)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFromAmount(fromAmount)
    }, 300)
    return () => clearTimeout(timer)
  }, [fromAmount])

  useEffect(() => {
    const fetchRoute = async () => {
      if (!fromToken || !toToken || !debouncedFromAmount || parseFloat(debouncedFromAmount) <= 0) {
        setRouteInfo(null)
        setToAmount('')
        return
      }

      try {
        const route = await fetchSwapRoute(fromToken, toToken, debouncedFromAmount)
        setRouteInfo(route)

        if (route) {
          const toAmountCalculated = route.amountOut.shiftedBy(-toToken.decimals).toFixed(8)
          setToAmount(toAmountCalculated)
        } else {
          setToAmount('')
        }
      } catch (error) {
        console.error('Route fetch failed:', error)
        setRouteInfo(null)
        setToAmount('')
      }
    }

    fetchRoute()
  }, [fromToken, toToken, debouncedFromAmount, slippage, fetchSwapRoute])

  useEffect(() => {
    if (!address) {
      setFromTokenDenom(null)
      setToTokenDenom(null)
    }
  }, [address])

  // Pre-select "to" token from URL parameters
  useEffect(() => {
    const toTokenParam = searchParams.get('to')
    if (toTokenParam && swapTokens.length > 0) {
      const token = swapTokens.find((t) => t.denom === toTokenParam)
      if (token) {
        setToTokenDenom(toTokenParam)
      }
    }
  }, [searchParams, swapTokens])

  const handleSwapTokens = () => {
    const tempDenom = fromTokenDenom
    const tempAmount = fromAmount
    setFromTokenDenom(toTokenDenom)
    setToTokenDenom(tempDenom)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const isSwapValid =
    fromToken &&
    toToken &&
    fromAmount &&
    parseFloat(fromAmount) > 0 &&
    !hasInsufficientBalance &&
    routeInfo &&
    !isSwapInProgress &&
    fromAmount === debouncedFromAmount

  const fromTokenDecimals = fromToken?.decimals || 6
  const toTokenDecimals = toToken?.decimals || 6

  const fromUsdValue = fromToken?.price && fromAmount ? fromToken.price * parseFloat(fromAmount) : 0
  const toUsdValue = toToken?.price && toAmount ? toToken.price * parseFloat(toAmount) : 0

  const handleSwap = async () => {
    try {
      const success = await executeSwap(fromToken!, toToken!, fromAmount, slippage)
      if (success) {
        setFromAmount('')
        setToAmount('')
        setDebouncedFromAmount('')
        setRouteInfo(null)
      }
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }

  return (
    <>
      <div className='relative w-full py-8 sm:py-12 px-4 max-w-6xl mx-auto'>
        <div className='flex flex-col items-center gap-4'>
          <h2 className='text-xl sm:text-4xl font-bold text-foreground'>Swap Bitcoin Assets</h2>
          <p className='text-xs sm:text-base text-muted-foreground max-w-md text-center'>
            Trade between Bitcoin LSTs, wBTC, and maxBTC with minimal slippage and competitive rates
          </p>
        </div>
      </div>
      <div className='w-full max-w-lg mx-auto pb-16'>
        <Card className='bg-card/90 rounded-2xl shadow-xl border-0 py-6'>
          <CardContent className='sm:py-2 px-2 sm:px-4'>
            <div className='flex items-center justify-end pb-2 text-xs text-muted-foreground'>
              {/* Settings Button and Popover */}
              <Popover open={showSlippagePopover} onOpenChange={setShowSlippagePopover}>
                <PopoverTrigger asChild>
                  <div className='flex items-center gap-1'>
                    <span className='text-muted-foreground'>{slippage}% Slippage</span>
                    <button className='hover:bg-muted/50 p-2 rounded-lg transition-colors flex items-center'>
                      <Settings className='w-4 h-4' />
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent align='center' className='min-w-[180px] p-4 bg-card rounded-2xl'>
                  <div className='font-semibold text-sm mb-1'>Slippage</div>
                  <div className='flex gap-2 mb-2'>
                    {SLIPPAGE_OPTIONS.map((val) => (
                      <button
                        key={val}
                        className={cn(
                          'px-3 py-1 rounded-lg border text-sm font-medium transition-colors',
                          slippage === val
                            ? 'bg-primary text-background border-primary'
                            : 'bg-muted/30 border-border hover:bg-muted/50',
                        )}
                        onClick={() => {
                          setSlippage(val)
                          setCustomSlippage('')
                          setShowSlippagePopover(false)
                        }}
                      >
                        {val}%
                      </button>
                    ))}
                    <input
                      type='number'
                      min='0'
                      placeholder='Custom'
                      value={customSlippage}
                      onChange={(e) => setCustomSlippage(e.target.value)}
                      onBlur={() => {
                        if (customSlippage) {
                          setSlippage(Number(customSlippage))
                          setCustomSlippage('')
                          setShowSlippagePopover(false)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customSlippage) {
                          setSlippage(Number(customSlippage))
                          setCustomSlippage('')
                          setShowSlippagePopover(false)
                        }
                      }}
                      className='w-16 px-2 py-1 rounded-lg border border-border bg-muted/20 text-xs outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    />
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    Your swap will fail if the price changes by more than this %.
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* From Section */}
            <div className='relative rounded-xl bg-muted/10 border border-border/30 p-4 mb-2 group'>
              <div className='flex items-center justify-between mb-1'>
                <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                  From
                </div>
                <QuickAmountButtons
                  onSelect={(percent) => {
                    if (fromToken && parseFloat(fromToken.balance) > 0) {
                      const calculatedAmount = parseFloat(fromToken.balance) * percent
                      setFromAmount(calculatedAmount.toFixed(8))
                    }
                  }}
                  disabled={!fromToken || parseFloat(fromToken.balance) <= 0}
                  className='hidden group-hover:flex group-focus-within:flex'
                />
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder='0.00'
                  className={cn(
                    'flex-1 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground',
                    hasInsufficientBalance && 'text-red-500',
                  )}
                />
                {fromAmount && fromAmount !== debouncedFromAmount && (
                  <div className='w-2 h-2 bg-primary/60 rounded-full animate-pulse' />
                )}
                <button
                  onClick={() => {
                    setSelectingFrom(true)
                    setTokenModalOpen(true)
                  }}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20'
                >
                  {fromToken ? (
                    <>
                      <Image
                        src={fromToken.icon}
                        alt={fromToken.symbol}
                        width={24}
                        height={24}
                        className='rounded-full'
                      />
                      <span className='font-semibold'>{fromToken.symbol}</span>
                    </>
                  ) : (
                    <span>Select token</span>
                  )}
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
              </div>
              <div className='flex justify-between mt-2 text-xs text-muted-foreground'>
                <FormattedValue value={fromUsdValue} isCurrency={true} useCompactNotation={false} />
                <FormattedValue
                  value={fromToken?.balance || '0'}
                  maxDecimals={8}
                  suffix={fromToken?.symbol ? ` ${fromToken.symbol}` : ''}
                  useCompactNotation={false}
                  className={cn(hasInsufficientBalance ? 'text-red-500' : 'text-muted-foreground')}
                />
              </div>
            </div>

            {/* Switch Button */}
            <div className='relative flex items-center justify-center mb-2'>
              <button
                onClick={handleSwapTokens}
                className='absolute left-1/2 -translate-x-1/2 bg-background border border-border rounded-full p-2 shadow-lg hover:bg-muted/40 z-10 cursor-pointer transition-transform duration-300 hover:rotate-180'
              >
                <ArrowUpDown className='w-5 h-5 text-primary' />
              </button>
            </div>

            {/* To Section */}
            <div className='relative rounded-xl bg-muted/10 border border-border/30 p-4 mb-2'>
              <div className='mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                To
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  placeholder='0.00'
                  className='flex-1 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground'
                />
                <button
                  onClick={() => {
                    setSelectingFrom(false)
                    setTokenModalOpen(true)
                  }}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20'
                >
                  {toToken ? (
                    <>
                      <Image
                        src={toToken.icon}
                        alt={toToken.symbol}
                        width={24}
                        height={24}
                        className='rounded-full'
                      />
                      <span className='font-semibold'>{toToken.symbol}</span>
                    </>
                  ) : (
                    <span>Select token</span>
                  )}
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
              </div>
              <div className='flex justify-between mt-2 text-xs text-muted-foreground'>
                <FormattedValue value={toUsdValue} isCurrency={true} useCompactNotation={false} />
                <FormattedValue
                  value={toToken?.balance || '0'}
                  maxDecimals={8}
                  suffix={toToken?.symbol ? ` ${toToken.symbol}` : ''}
                  useCompactNotation={false}
                />
              </div>
            </div>

            {/* Swap Info */}
            {fromToken && toToken && fromAmount && (
              <div className='p-3 rounded-lg bg-muted/20 space-y-2 text-sm mt-4'>
                {routeInfo ? (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Rate</span>
                      <span>
                        1 {fromToken.symbol} ≈{' '}
                        <FormattedValue
                          value={routeInfo.amountOut
                            .dividedBy(new BigNumber(fromAmount).shiftedBy(fromTokenDecimals))
                            .toNumber()}
                          maxDecimals={6}
                          useCompactNotation={false}
                          suffix={` ${toToken.symbol}`}
                        />
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Price Impact</span>
                      <span className='text-orange-500'>
                        ~
                        <FormattedValue
                          value={routeInfo.priceImpact}
                          maxDecimals={2}
                          suffix='%'
                          useCompactNotation={false}
                        />
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Minimum Received</span>
                      <FormattedValue
                        value={routeInfo.amountOut
                          .times(1 - slippage / 100)
                          .shiftedBy(-toTokenDecimals)
                          .toNumber()}
                        maxDecimals={8}
                        useCompactNotation={false}
                        suffix={` ${toToken.symbol}`}
                      />
                    </div>
                  </>
                ) : fromAmount ? (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Rate</span>
                      <div className='h-4 w-24 bg-muted/40 rounded animate-pulse' />
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Price Impact</span>
                      <div className='h-4 w-16 bg-muted/40 rounded animate-pulse' />
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Minimum Received</span>
                      <div className='h-4 w-32 bg-muted/40 rounded animate-pulse' />
                    </div>
                  </>
                ) : (
                  <p className='text-center text-muted-foreground py-2'>No route available</p>
                )}
              </div>
            )}

            <Button disabled={!isSwapValid} className='w-full mt-4' onClick={handleSwap}>
              {isSwapInProgress
                ? 'Swapping...'
                : hasInsufficientBalance
                  ? `Insufficient ${fromToken?.symbol}`
                  : !fromToken || !toToken
                    ? 'Select tokens'
                    : !fromAmount
                      ? 'Enter amount'
                      : !routeInfo
                        ? 'No route available'
                        : 'Swap'}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className='flex gap-1 sm:gap-2 mt-4'>
          <StatCard
            value={127}
            label={<span className='text-xs'>Total Liquidity</span>}
            isCurrency={true}
            prefix='$'
          />
          <StatCard
            value={975}
            label={<span className='text-xs'>24h Volume</span>}
            isCurrency={true}
            prefix='$'
          />
          <StatCard
            value={0.02}
            label={<span className='text-xs'>Avg Slippage</span>}
            decimalPlaces={2}
            suffix='%'
          />
        </div>

        <TokenSelectorModal
          open={isTokenModalOpen}
          onOpenChange={setTokenModalOpen}
          tokens={swapTokens}
          selectedToken={selectingFrom ? fromToken : toToken}
          onSelect={(token) => {
            if (selectingFrom) setFromTokenDenom(token.denom)
            else setToTokenDenom(token.denom)
          }}
          isWalletConnected={!!address}
        />
      </div>
    </>
  )
}
