'use client'

import { useEffect, useState } from 'react'

import { ArrowUpDown, ChevronDown, Settings, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'

interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance?: string
  price?: number
  denom: string
}

export default function SwapClient() {
  useMarkets()

  const [fromToken, setFromToken] = useState<SwapToken | null>(null)
  const [toToken, setToToken] = useState<SwapToken | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [showFromTokenList, setShowFromTokenList] = useState(false)
  const [showToTokenList, setShowToTokenList] = useState(false)

  // Add maxBTC token to the available tokens
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

  // Calculate exchange rate and to amount
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      // Simple 1:1 mock calculation for demo
      // In real implementation, this would use AMM pricing
      const mockRate = 0.98 // 2% slippage for demo
      const calculatedAmount = (parseFloat(fromAmount) * mockRate).toFixed(8)
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
      setShowFromTokenList(false)
      // If same token selected for both, clear the other
      if (toToken?.symbol === token.symbol) {
        setToToken(null)
      }
    } else {
      setToToken(token)
      setShowToTokenList(false)
      // If same token selected for both, clear the other
      if (fromToken?.symbol === token.symbol) {
        setFromToken(null)
      }
    }
  }

  const isSwapValid = fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0

  return (
    <>
      <div className='relative w-full py-8 sm:py-12 overflow-hidden px-4 sm:px-8 max-w-6xl mx-auto mt-10'>
        <div className='flex flex-col justify-center items-center gap-4 min-w-0'>
          <h2 className='text-xl sm:text-4xl font-bold text-foreground mb-0'>
            Swap Bitcoin Assets
          </h2>
          <p className='text-xs sm:text-base text-muted-foreground max-w-md'>
            Trade between Bitcoin LSTs, wBTC, and maxBTC with minimal slippage and competitive rates
          </p>
        </div>
      </div>
      <div className='w-full max-w-lg mx-auto pt-0 pb-16'>
        <Card className='bg-card/90 rounded-2xl shadow-xl p-0 border-0 gap-0 py-6'>
          <CardContent className='py-2 px-8'>
            <div className='flex items-center justify-between pb-2 gap-1 text-xs text-muted-foreground mt-4'>
              <button className='hover:bg-muted/50 rounded-lg transition-colors flex items-center justify-end '>
                <Settings className='w-5 h-5' />
              </button>
              <div className='flex items-center gap-1'>
                <Wallet className='w-4 h-4' />
                {fromToken?.balance || '0.00'}
              </div>
            </div>
            <div className='relative rounded-xl bg-muted/10 border border-border/30 px-3 pt-2 pb-4 mb-6'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-muted-foreground font-medium'>Swap From</span>
                <button
                  onClick={() => setShowFromTokenList(!showFromTokenList)}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border font-semibold shadow-sm hover:bg-muted/30 min-w-[110px]'
                >
                  {fromToken ? (
                    <>
                      <img
                        src={fromToken.icon}
                        alt={fromToken.symbol}
                        className='w-6 h-6 rounded-full'
                      />
                      <span className='text-sm'>{fromToken.symbol}</span>
                    </>
                  ) : (
                    <span className='text-muted-foreground'>Select</span>
                  )}
                  <ChevronDown className='w-4 h-4' />
                </button>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder='0.00'
                  className='flex-1 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground'
                  style={{ minWidth: 0 }}
                />
              </div>
              <div className='text-xs text-muted-foreground mt-1'>$ 0.00</div>
              {/* Token List Dropdown */}
              {showFromTokenList && (
                <div className='absolute left-0 right-0 top-full mt-2 z-50 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                  {swapTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => handleTokenSelect(token, true)}
                      className='w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors'
                      disabled={toToken?.symbol === token.symbol}
                    >
                      <img src={token.icon} alt={token.symbol} className='w-8 h-8 rounded-full' />
                      <div className='text-left'>
                        <div className='font-medium'>{token.symbol}</div>
                        <div className='text-sm text-muted-foreground'>{token.name}</div>
                      </div>
                      <div className='ml-auto text-right'>
                        <div className='text-sm font-medium'>{token.balance}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Switch Button (overlapping separator) */}
            <div className='relative flex items-center justify-center mb-6'>
              <Separator className='bg-border/60' />
              <button
                onClick={handleSwapTokens}
                className='absolute left-1/2 -translate-x-1/2 bg-background border border-border rounded-full p-2 shadow-lg hover:bg-muted/40 transition z-10 cursor-pointer transition-transform duration-300 hover:rotate-180'
                style={{ top: '-18px' }}
              >
                <ArrowUpDown className='w-5 h-5 text-primary' />
              </button>
            </div>

            {/* Buy Section */}
            <div className='relative rounded-xl bg-muted/10 border border-border/30 px-3 pt-2 pb-4'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-muted-foreground font-medium'>Swap To</span>
                <button
                  onClick={() => setShowToTokenList(!showToTokenList)}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border font-semibold shadow-sm hover:bg-muted/30 min-w-[110px]'
                >
                  {toToken ? (
                    <>
                      <img
                        src={toToken.icon}
                        alt={toToken.symbol}
                        className='w-6 h-6 rounded-full'
                      />
                      <span className='text-sm'>{toToken.symbol}</span>
                    </>
                  ) : (
                    <span className='text-muted-foreground'>Select</span>
                  )}
                  <ChevronDown className='w-4 h-4' />
                </button>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  value={toAmount}
                  readOnly
                  placeholder='0.00'
                  className='flex-1 bg-transparent text-xl font-semibold text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground'
                  style={{ minWidth: 0 }}
                />
              </div>
              <div className='text-xs text-muted-foreground mt-1'>$ 0.00</div>
              {/* Token List Dropdown */}
              {showToTokenList && (
                <div className='absolute left-0 right-0 top-full mt-2 z-50 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                  {swapTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => handleTokenSelect(token, false)}
                      className='w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors'
                      disabled={fromToken?.symbol === token.symbol}
                    >
                      <img src={token.icon} alt={token.symbol} className='w-8 h-8 rounded-full' />
                      <div className='text-left'>
                        <div className='font-medium'>{token.symbol}</div>
                        <div className='text-sm text-muted-foreground'>{token.name}</div>
                      </div>
                      <div className='ml-auto text-right'>
                        <div className='text-sm font-medium'>{token.balance}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Swap Button */}
            <Button disabled={!isSwapValid} variant='outline-gradient' className='w-full mt-4'>
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
