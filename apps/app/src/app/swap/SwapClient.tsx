'use client'

import { useEffect, useState } from 'react'

import { ArrowUpDown, Settings, Wallet } from 'lucide-react'

import { type SwapToken, TokenSelector } from '@/components/common/TokenSelector'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1] as const
const MOCK_RATE = 0.98
const PRICE_IMPACT = 2.0
const MIN_RECEIVED_MULTIPLIER = 0.995

export default function SwapClient() {
  useMarkets()
  const [fromToken, setFromToken] = useState<SwapToken | null>(null)
  const [toToken, setToToken] = useState<SwapToken | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [customSlippage, setCustomSlippage] = useState('')
  const [showSlippagePopover, setShowSlippagePopover] = useState(false)

  const swapTokens: SwapToken[] = [
    {
      symbol: 'maxBTC',
      name: 'MaxBTC Protocol Token',
      icon: '/btcGolden.png',
      balance: '0.00',
      price: 0,
      denom: 'maxbtc',
    },
    ...tokens.map((token) => ({
      symbol: token.symbol,
      name: token.description,
      icon: token.icon,
      balance: '0.00',
      price: 0,
      denom: token.denom,
    })),
  ]

  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      const calculatedAmount = (parseFloat(fromAmount) * MOCK_RATE).toFixed(8)
      setToAmount(calculatedAmount)
    } else {
      setToAmount('')
    }
  }, [fromToken, toToken, fromAmount])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const handleTokenSelect = (token: SwapToken, isFromToken: boolean) => {
    if (isFromToken) {
      setFromToken(token)
      if (toToken?.symbol === token.symbol) {
        setToToken(null)
      }
    } else {
      setToToken(token)
      if (fromToken?.symbol === token.symbol) {
        setFromToken(null)
      }
    }
  }

  const isSwapValid = fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0

  return (
    <>
      <div className='relative w-full py-8 sm:py-12 overflow-hidden px-4 sm:px-8 max-w-6xl mx-auto'>
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
          <CardContent className='sm:py-2 px-2 sm:px-8'>
            <div className='flex items-center justify-between pb-2 gap-1 text-xs text-muted-foreground relative'>
              {/* Settings Button and Popover */}
              <Popover open={showSlippagePopover} onOpenChange={setShowSlippagePopover}>
                <PopoverTrigger asChild>
                  <div className='flex items-center'>
                    <button className='hover:bg-muted/50 p-2 rounded-lg transition-colors flex items-center justify-end'>
                      <Settings className='w-5 h-5' />
                    </button>
                    <span className='ml-2 text-muted-foreground'>{slippage}% Slippage</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align='center'
                  className='min-w-[180px] p-4 flex flex-col items-start gap-2 bg-card'
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
              <div className='flex items-center gap-1'>
                <Wallet className='w-4 h-4' />
                {fromToken?.balance || '0.00'}
              </div>
            </div>
            <div className='relative rounded-xl bg-muted/10 border border-border/30 px-3 pt-2 pb-4 mb-2'>
              <TokenSelector
                token={fromToken}
                onTokenSelect={(token) => handleTokenSelect(token, true)}
                disabledTokens={toToken?.symbol ? [toToken.symbol] : []}
                label='Swap From'
                availableTokens={swapTokens}
              />
              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder='0.00'
                  className='flex-1 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  style={{ minWidth: 0 }}
                />
              </div>
              <div className='text-xs text-muted-foreground mt-1'>$ 0.00</div>
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

            {/* Buy Section */}
            <div className='relative rounded-xl bg-muted/10 border border-border/30 px-3 pt-2 pb-4'>
              <TokenSelector
                token={toToken}
                onTokenSelect={(token) => handleTokenSelect(token, false)}
                disabledTokens={fromToken?.symbol ? [fromToken.symbol] : []}
                label='Swap To'
                availableTokens={swapTokens}
              />
              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  value={toAmount}
                  readOnly
                  placeholder='0.00'
                  className='flex-1 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  style={{ minWidth: 0 }}
                />
              </div>
              <div className='text-xs text-muted-foreground mt-1'>$ 0.00</div>
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
      </div>
    </>
  )
}
