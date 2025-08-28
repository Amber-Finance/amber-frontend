'use client'

import { useEffect, useMemo, useState } from 'react'
import React, { useRef } from 'react'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import BigNumber from 'bignumber.js'
import { ArrowUpDown, Settings } from 'lucide-react'

import QuickAmountButtons from '@/app/swap/QuickAmountButtons'
import { SwapRouteInfo } from '@/app/swap/SwapRouteInfo'
import TokenPathBackground from '@/app/swap/TokenPathBackground'
import FormattedValue from '@/components/common/FormattedValue'
import { TokenSelectorModal } from '@/components/common/TokenSelectorModal'
import { AuroraText } from '@/components/ui/AuroraText'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useMarkets, useTokenPreselection } from '@/hooks'
import useRouteInfo, { useRouteInfoReverse } from '@/hooks/swap/useRouteInfo'
import { useSwap } from '@/hooks/swap/useSwap'
import useDebounce from '@/hooks/useDebounce'
import useWalletBalances from '@/hooks/useWalletBalances'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { calculateUsdValue } from '@/utils/format'

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1] as const

function formatWithThousandsSeparator(value: string) {
  if (!value) return ''
  const [int, dec] = value.split('.')
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted
}

function stripNonNumericExceptDot(value: string) {
  return value.replace(/[^\d.]/g, '')
}

export default function SwapClient() {
  const searchParams = useSearchParams()
  useMarkets()
  const { markets } = useStore()
  const { data: walletBalances } = useWalletBalances()
  const { address } = useChain(chainConfig.name)

  const [fromTokenDenom, setFromTokenDenom] = useState<string | null>(null)
  const [toTokenDenom, setToTokenDenom] = useState<string | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [customSlippage, setCustomSlippage] = useState('')
  const [showSlippagePopover, setShowSlippagePopover] = useState(false)
  const [isTokenModalOpen, setTokenModalOpen] = useState(false)
  const [selectingFrom, setSelectingFrom] = useState(true)
  const [isSwapInProgress, setIsSwapInProgress] = useState(false)
  const [editingDirection, setEditingDirection] = useState<'from' | 'to'>('from')
  const fromInputRef = useRef<HTMLInputElement>(null)
  const debouncedFromAmount = useDebounce(fromAmount, 300)
  const debouncedToAmount = useDebounce(toAmount, 300)

  const { executeSwap } = useSwap()

  const swapTokens = useMemo(() => {
    if (!markets || !walletBalances) return []
    const isConnected = !!address

    return tokens.map((token) => {
      const market = markets.find((m) => m.asset.denom === token.denom)
      const walletBalance = walletBalances.find((b) => b.denom === token.denom)
      const decimals = market?.asset?.decimals ?? token.decimals ?? 8

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
        chainId: chainConfig.name,
      }
    })
  }, [markets, walletBalances, address])

  const { bestToken, shouldInitialize, markInitialized } = useTokenPreselection(
    swapTokens,
    address,
    walletBalances,
  )

  const fromToken = fromTokenDenom ? swapTokens.find((t) => t.denom === fromTokenDenom) : null
  const toToken = toTokenDenom ? swapTokens.find((t) => t.denom === toTokenDenom) : null

  const hasInsufficientBalance =
    fromToken && fromAmount && parseFloat(fromAmount) > parseFloat(fromToken.balance)

  const { data: forwardRouteInfo, isLoading: isForwardRouteLoading } = useRouteInfo(
    fromToken?.denom || '',
    toToken?.denom || '',
    new BigNumber(debouncedFromAmount || '0').shiftedBy(fromToken?.decimals || 8),
    markets || [],
    slippage,
  )

  const { data: reverseRouteInfo, isLoading: isReverseRouteLoading } = useRouteInfoReverse(
    fromToken?.denom || '',
    toToken?.denom || '',
    new BigNumber(debouncedToAmount || '0').shiftedBy(toToken?.decimals || 8),
    markets || [],
    slippage,
  )

  const routeInfo = editingDirection === 'from' ? forwardRouteInfo : reverseRouteInfo
  const isRouteLoading = editingDirection === 'from' ? isForwardRouteLoading : isReverseRouteLoading

  useEffect(() => {
    if (editingDirection === 'from') {
      if (forwardRouteInfo && forwardRouteInfo.amountOut && toToken) {
        const toAmountCalculated = new BigNumber(forwardRouteInfo.amountOut).shiftedBy(
          -toToken.decimals,
        )
        setToAmount(toAmountCalculated.toString())
      } else if (!forwardRouteInfo) {
        setToAmount('')
      }
    } else if (editingDirection === 'to') {
      if (reverseRouteInfo && (reverseRouteInfo as any).amountIn && fromToken) {
        const fromAmountCalculated = new BigNumber((reverseRouteInfo as any).amountIn).shiftedBy(
          -fromToken.decimals,
        )
        setFromAmount(fromAmountCalculated.toString())
      } else if (!reverseRouteInfo) {
        setFromAmount('')
      }
    }
  }, [editingDirection, forwardRouteInfo, reverseRouteInfo, toToken, fromToken])

  useEffect(() => {
    if (!address) {
      setFromTokenDenom(null)
      setToTokenDenom(null)
    }
  }, [address])

  useEffect(() => {
    const toTokenParam = searchParams.get('to')
    if (toTokenParam && swapTokens.length > 0) {
      const token = swapTokens.find((t) => t.denom === toTokenParam)
      if (token) {
        setToTokenDenom(toTokenParam)
      }
    }

    if (shouldInitialize) {
      if (bestToken) {
        setFromTokenDenom(bestToken.denom)
      }
      markInitialized()
    }
  }, [searchParams, swapTokens.length, shouldInitialize, bestToken, markInitialized])

  const handleSwapTokens = () => {
    const tempDenom = fromTokenDenom
    const tempAmount = fromAmount
    setFromTokenDenom(toTokenDenom)
    setToTokenDenom(tempDenom)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
    setEditingDirection('from')
  }

  const fromUsdValue = fromToken?.price && fromAmount ? fromToken.price * parseFloat(fromAmount) : 0
  const toUsdValue = toToken?.price && toAmount ? toToken.price * parseFloat(toAmount) : 0

  const handleSwap = async () => {
    if (!routeInfo || !fromToken || !toToken) return

    // console.log('handleSwap', routeInfo, fromToken, toToken, fromAmount, slippage)
    setIsSwapInProgress(true)
    try {
      const success = await executeSwap(routeInfo, fromToken, toToken, fromAmount, slippage)
      if (success) {
        setFromAmount('')
        setToAmount('')
        setEditingDirection('from')
      }
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setIsSwapInProgress(false)
    }
  }
  const isWalletConnected = !!address
  const showInsufficientFunds = isWalletConnected && hasInsufficientBalance

  const swapButtonLabel = !isWalletConnected
    ? 'Connect Wallet'
    : isSwapInProgress
      ? 'Swapping...'
      : isRouteLoading
        ? 'Loading route...'
        : showInsufficientFunds
          ? `Insufficient ${fromToken?.symbol} Balance`
          : !fromToken || !toToken
            ? 'Select tokens'
            : !fromAmount || !toAmount
              ? 'Enter amount'
              : !routeInfo
                ? 'No route available'
                : 'Swap'

  return (
    <>
      <TokenPathBackground />
      <div className='relative w-full py-8 sm:py-10 px-4 max-w-6xl mx-auto'>
        <div className='flex flex-col items-center gap-4'>
          <h1 className='text-3xl lg:text-5xl font-funnel leading-tight'>
            Swap <AuroraText>Bitcoin Assets</AuroraText>
          </h1>
          <p className='text-xs sm:text-base text-muted-foreground max-w-md text-center'>
            Trade between BRTs, wBTC, and maxBTC with minimal slippage and competitive rates
          </p>
        </div>
      </div>
      <div className='w-full max-w-lg mx-auto pb-16'>
        <Card className='bg-card rounded-2xl shadow-xl border border-border/30 py-2'>
          <CardContent className='sm:py-2 px-2'>
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
            <div className='relative rounded-xl bg-muted/10 border border-border/30 p-4 group'>
              <div className='flex items-center justify-between mb-1'>
                <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                  From
                </div>
                <QuickAmountButtons
                  onSelect={(percent) => {
                    if (fromToken && parseFloat(fromToken.balance) > 0) {
                      const calculatedAmount = parseFloat(fromToken.balance) * percent
                      setFromAmount(calculatedAmount.toFixed(8))
                      setEditingDirection('from')
                    }
                  }}
                  disabled={!fromToken || parseFloat(fromToken.balance) <= 0}
                  className='hidden group-hover:flex group-focus-within:flex'
                />
              </div>
              <div className='relative my-3'>
                <input
                  ref={fromInputRef}
                  type='text'
                  value={formatWithThousandsSeparator(fromAmount)}
                  onChange={(e) => {
                    // Get raw value without commas
                    const raw = stripNonNumericExceptDot(e.target.value.replace(/,/g, ''))
                    // Prevent multiple decimals
                    const parts = raw.split('.')
                    let clean = parts[0]
                    if (parts.length > 1) {
                      clean += '.' + parts.slice(1).join('')
                    }
                    setFromAmount(clean)
                    setEditingDirection('from')
                    setTimeout(() => {
                      if (fromInputRef.current) {
                        fromInputRef.current.selectionStart = fromInputRef.current.value.length
                        fromInputRef.current.selectionEnd = fromInputRef.current.value.length
                      }
                    }, 0)
                  }}
                  placeholder='0.00'
                  className={cn(
                    'w-full pr-32 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground',
                    showInsufficientFunds && 'text-red-500',
                  )}
                />
                <button
                  onClick={() => {
                    setSelectingFrom(true)
                    setTokenModalOpen(true)
                  }}
                  className='absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-border bg-muted/20 min-w-[100px] sm:min-w-[140px] text-sm sm:text-base'
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
              <div className='relative'>
                <input
                  type='text'
                  value={formatWithThousandsSeparator(toAmount)}
                  onChange={(e) => {
                    // Get raw value without commas
                    const raw = stripNonNumericExceptDot(e.target.value.replace(/,/g, ''))
                    // Prevent multiple decimals
                    const parts = raw.split('.')
                    let clean = parts[0]
                    if (parts.length > 1) {
                      clean += '.' + parts.slice(1).join('')
                    }
                    setToAmount(clean)
                    setEditingDirection('to')
                  }}
                  placeholder='0.00'
                  className='w-full pr-32 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground'
                />
                <button
                  onClick={() => {
                    setSelectingFrom(false)
                    setTokenModalOpen(true)
                  }}
                  className='absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20 min-w-[100px] sm:min-w-[140px] text-sm sm:text-base'
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
              <div className='flex justify-between my-3 text-xs text-muted-foreground'>
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
            {fromToken && toToken && (fromAmount || toAmount) && (
              <SwapRouteInfo
                amountIn={fromAmount}
                amountOut={routeInfo?.amountOut || new BigNumber(0)}
                priceImpact={routeInfo?.priceImpact?.toNumber() || 0}
                fromToken={fromToken}
                toToken={toToken}
                slippage={slippage}
                isRouteLoading={isRouteLoading}
                route={routeInfo?.route}
                isDebouncePending={
                  editingDirection === 'from'
                    ? fromAmount !== debouncedFromAmount
                    : toAmount !== debouncedToAmount
                }
              />
            )}

            <Button
              disabled={
                !!(
                  !isWalletConnected ||
                  !fromToken ||
                  !toToken ||
                  !fromAmount ||
                  !toAmount ||
                  isSwapInProgress ||
                  isRouteLoading ||
                  showInsufficientFunds ||
                  !routeInfo
                )
              }
              className='w-full h-12'
              onClick={() => {
                if (!isWalletConnected) return

                handleSwap()
              }}
            >
              {swapButtonLabel}
            </Button>
          </CardContent>
        </Card>
        <TokenSelectorModal
          open={isTokenModalOpen}
          onOpenChange={setTokenModalOpen}
          tokens={swapTokens}
          selectedToken={selectingFrom ? fromToken : toToken}
          onSelect={(token) => {
            if (selectingFrom) {
              setFromTokenDenom(token.denom)
            } else {
              setToTokenDenom(token.denom)
            }
          }}
          isWalletConnected={!!address}
          disabledTokens={
            selectingFrom
              ? toTokenDenom
                ? [toTokenDenom]
                : []
              : fromTokenDenom
                ? [fromTokenDenom]
                : []
          }
        />
      </div>
    </>
  )
}
