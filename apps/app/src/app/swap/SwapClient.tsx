'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'
import BigNumber from 'bignumber.js'
import { ArrowUpDown, Settings } from 'lucide-react'

import QuickAmountButtons from '@/app/swap/QuickAmountButtons'
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
import { useStore } from '@/store/useStore'
import { calculateUsdValue, formatCurrency } from '@/utils/format'

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1] as const

export default function SwapClient() {
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
  const [selectingFrom, setSelectingFrom] = useState(true) // true = fromToken, false = toToken
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
      const shiftedBalance = new BigNumber(rawBalance).shiftedBy(-decimals)
      const balance = shiftedBalance.isGreaterThan(0) ? shiftedBalance.toFixed(8) : '0.00000000'

      let usdValue = '$0.00'
      if (isConnected && walletBalance?.amount && market?.price?.price && rawBalance > 0) {
        const usdValueNum = calculateUsdValue(walletBalance.amount, market.price.price, decimals)
        usdValue = `$${usdValueNum.toFixed(2)}`
      }

      return {
        symbol: token.symbol,
        name: token.description,
        icon: token.icon,
        balance,
        rawBalance,
        price: market?.price?.price ? parseFloat(market.price.price) : 0,
        denom: token.denom,
        usdValue,
        decimals,
      }
    })
  }, [markets, walletBalances, address])

  // Derived tokens - always up to date with latest balances
  const fromToken = fromTokenDenom
    ? swapTokens.find((token) => token.denom === fromTokenDenom)
    : null
  const toToken = toTokenDenom ? swapTokens.find((token) => token.denom === toTokenDenom) : null

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
          const toAmountCalculated = route.amountOut.shiftedBy(-toTokenDecimals).toFixed(8)
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
    routeInfo &&
    !isSwapInProgress &&
    fromAmount === debouncedFromAmount

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

  const fromTokenDecimals = fromToken?.decimals || 6
  const toTokenDecimals = toToken?.decimals || 6

  const getUsdValue = (token: any, amount: string) =>
    token?.price && amount ? formatCurrency(parseFloat(amount) * token.price) : '$0.00'

  const fromUsdValue = getUsdValue(fromToken, fromAmount)
  const toUsdValue = getUsdValue(toToken, toAmount)

  return (
    <>
      <div className='relative w-full py-8 sm:py-12 overflow-hidden px-4 max-w-6xl mx-auto'>
        <div className='flex flex-col justify-center items-center gap-4 min-w-0'>
          <h2 className='text-xl sm:text-4xl font-bold text-foreground mb-0'>
            Swap Bitcoin Assets
          </h2>
          <p className='text-xs sm:text-base text-muted-foreground max-w-md text-center'>
            Trade between Bitcoin LSTs, wBTC, and maxBTC with minimal slippage and competitive rates
          </p>
        </div>
      </div>
      <div className='w-full max-w-lg mx-auto pt-0 pb-16'>
        <Card className='bg-card/90 rounded-2xl shadow-xl p-0 border-0 gap-0 py-6'>
          <CardContent className='sm:py-2 px-2 sm:px-4'>
            <div className='flex items-center justify-end pb-2 gap-1 text-xs text-muted-foreground relative'>
              {/* Settings Button and Popover */}
              <Popover open={showSlippagePopover} onOpenChange={setShowSlippagePopover}>
                <PopoverTrigger asChild>
                  <div className='flex items-center'>
                    <span className='text-muted-foreground'>{slippage}% Slippage</span>
                    <button className='hover:bg-muted/50 px-2 rounded-lg transition-colors flex items-center justify-end ml-1'>
                      <Settings className='w-4 h-4' />
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align='center'
                  className='min-w-[180px] p-4 flex flex-col items-start gap-2 bg-card rounded-2xl'
                >
                  <div className='font-semibold text-sm mb-1'>Slippage</div>
                  <div className='flex gap-2 mb-2'>
                    {SLIPPAGE_OPTIONS.map((val) => (
                      <button
                        key={val}
                        className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${slippage === val ? 'bg-primary text-background border-primary' : 'bg-muted/30 border-border hover:bg-muted/50'}`}
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
                      step='0.01'
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
                    if (fromToken && fromToken.balance) {
                      const calculatedAmount = parseFloat(fromToken.balance) * percent
                      setFromAmount(calculatedAmount.toFixed(6))
                    }
                  }}
                  disabled={!fromToken || !fromToken.balance || parseFloat(fromToken.balance) === 0}
                  className='hidden group-hover:flex group-focus-within:flex'
                />
              </div>
              <div className='flex items-center gap-2 relative'>
                <input
                  type='number'
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder='0.00'
                  className='flex-1 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground'
                  style={{ minWidth: 0 }}
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
                    className='w-4 h-4 ml-1'
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
                <span>{fromUsdValue}</span>
                <span>
                  {fromToken?.balance || '0.00'} {fromToken?.symbol}
                </span>
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
                  style={{ minWidth: 0 }}
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
                    className='w-4 h-4 ml-1'
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
                <span>{toUsdValue}</span>
                <span>
                  {toToken?.balance || '0.00'} {toToken?.symbol}
                </span>
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
                        {routeInfo.amountOut
                          .dividedBy(new BigNumber(fromAmount).shiftedBy(fromTokenDecimals))
                          .toFixed(6)}{' '}
                        {toToken.symbol}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Price Impact</span>
                      <span className='text-orange-500'>~{routeInfo.priceImpact.toFixed(2)}%</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Minimum Received</span>
                      <span>
                        {routeInfo.amountOut
                          .times(1 - slippage / 100)
                          .shiftedBy(-toTokenDecimals)
                          .toFixed(8)}{' '}
                        {toToken.symbol}
                      </span>
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
                  <div className='text-center text-muted-foreground py-2'>No route available</div>
                )}
              </div>
            )}

            <Button disabled={!isSwapValid} className='w-full mt-4' onClick={handleSwap}>
              {isSwapInProgress
                ? 'Swapping...'
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

        <div className='max-w-lg w-full mt-4'>
          <div className='flex flex-row gap-1 sm:gap-2'>
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
