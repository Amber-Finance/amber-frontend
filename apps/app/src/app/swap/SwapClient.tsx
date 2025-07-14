'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'
import BigNumber from 'bignumber.js'
import { ArrowUpDown, Settings } from 'lucide-react'

import { TokenSelectorModal } from '@/components/common/TokenSelectorModal'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'
import { calculateUsdValue } from '@/utils/format'

import QuickAmountButtons from './QuickAmountButtons'

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1] as const
const MOCK_RATE = 0.98
const PRICE_IMPACT = 2.0
const MIN_RECEIVED_MULTIPLIER = 0.995

interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance?: string
  price?: number
  denom: string
  usdValue?: string
}

export default function SwapClient() {
  useMarkets()
  const { markets } = useStore()
  const { data: walletBalances, isLoading: walletBalancesLoading } = useWalletBalances()
  const { address } = useChain(chainConfig.name)

  const [fromToken, setFromToken] = useState<SwapToken | null>(null)
  const [toToken, setToToken] = useState<SwapToken | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [customSlippage, setCustomSlippage] = useState('')
  const [showSlippagePopover, setShowSlippagePopover] = useState(false)
  const [isTokenModalOpen, setTokenModalOpen] = useState(false)
  const [selectingFrom, setSelectingFrom] = useState(true) // true = fromToken, false = toToken

  const swapTokens = useMemo(() => {
    if (!markets || !walletBalances) return []
    const isConnected = !!address
    return [
      {
        symbol: 'maxBTC',
        name: 'MaxBTC Protocol Token',
        icon: '/btcGolden.png',
        balance: '0.00000000',
        rawBalance: 0,
        price: 0,
        denom: 'maxbtc',
        usdValue: '$0.00',
      },
      ...tokens.map((token) => {
        const market = markets.find((m) => m.asset.denom === token.denom)
        const walletBalance = walletBalances.find((b) => b.denom === token.denom)
        const decimals = market?.asset?.decimals || 6
        let rawBalance = 0
        let shiftedBalance = new BigNumber(0)
        let usdValueNum = 0
        if (isConnected && walletBalance?.amount) {
          rawBalance = Number(walletBalance.amount)
          shiftedBalance = new BigNumber(rawBalance).shiftedBy(-decimals)
          if (market?.price?.price && rawBalance > 0) {
            usdValueNum = calculateUsdValue(walletBalance.amount, market.price.price, decimals)
          }
        }
        const balance = shiftedBalance.isGreaterThan(0) ? shiftedBalance.toFixed(8) : '0.00000000'
        const usdValue = usdValueNum > 0 ? `$${usdValueNum.toFixed(2)}` : '$0.00'
        return {
          symbol: token.symbol,
          name: token.description,
          icon: token.icon,
          balance,
          rawBalance,
          price: market?.price?.price ? parseFloat(market.price.price) : 0,
          denom: token.denom,
          usdValue,
        }
      }),
    ]
  }, [markets, walletBalances, address])

  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      const calculatedAmount = (parseFloat(fromAmount) * MOCK_RATE).toFixed(8)
      setToAmount(calculatedAmount)
    } else {
      setToAmount('')
    }
  }, [fromToken, toToken, fromAmount])

  useEffect(() => {
    if (!fromToken && swapTokens.length > 0) {
      setFromToken(swapTokens.find((token) => token.symbol === 'solvBTC') || swapTokens[0])
    }
  }, [swapTokens, fromToken])

  useEffect(() => {
    if (!address) {
      setFromToken(null)
      setToToken(null)
    }
  }, [address])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const isSwapValid = fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0

  if (walletBalancesLoading) {
    return (
      <div className='w-full py-8 sm:py-12 overflow-hidden px-4 sm:px-8 max-w-6xl mx-auto'>
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
              <div className='w-8 h-8 bg-muted/40 rounded-full animate-pulse' />
            </div>
            <h3 className='text-lg font-bold text-foreground'>Loading Wallet Balances</h3>
            <p className='text-muted-foreground'>Fetching your token balances...</p>
          </div>
        </div>
      </div>
    )
  }

  const fromUsdValue =
    fromToken && fromToken.price && fromAmount
      ? (parseFloat(fromAmount) * fromToken.price).toFixed(2)
      : '0.00'
  const toUsdValue =
    toToken && toToken.price && toAmount
      ? (parseFloat(toAmount) * toToken.price).toFixed(2)
      : '0.00'

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
                    <button className='hover:bg-muted/50 p-2 rounded-lg transition-colors flex items-center justify-end ml-1'>
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
                      setFromAmount((parseFloat(fromToken.balance) * percent).toString())
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
                <span>${fromUsdValue}</span>
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
                <span>${toUsdValue}</span>
                <span>
                  {toToken?.balance || '0.00'} {toToken?.symbol}
                </span>
              </div>
            </div>

            {/* Swap Info */}
            {fromToken && toToken && fromAmount && (
              <div className='p-3 rounded-lg bg-muted/20 space-y-2 text-sm mt-4'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Rate</span>
                  <span>
                    1 {fromToken.symbol} ≈ {MOCK_RATE} {toToken.symbol}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Price Impact</span>
                  <span className='text-orange-500'>~{PRICE_IMPACT}%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Minimum Received</span>
                  <span>
                    {(parseFloat(toAmount) * MIN_RECEIVED_MULTIPLIER).toFixed(8)} {toToken.symbol}
                  </span>
                </div>
              </div>
            )}

            <Button disabled={!isSwapValid} className='w-full mt-4'>
              {!fromToken || !toToken ? 'Select tokens' : !fromAmount ? 'Enter amount' : 'Swap'}
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
            if (selectingFrom) setFromToken(token)
            else setToToken(token)
          }}
          isWalletConnected={!!address}
        />
      </div>
    </>
  )
}
