'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { ArrowRight, ArrowUpDown, ChevronDown, Settings, Zap } from 'lucide-react'

import { AmountInput } from '@/components/ui/AmountInput'
import { Button } from '@/components/ui/Button'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/card'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'

interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance?: string
  price?: number
  denom: string
  brandColor: string
}

export default function SwapPage() {
  useMarkets()

  const [fromToken, setFromToken] = useState<SwapToken | null>(null)
  const [toToken, setToToken] = useState<SwapToken | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [showFromTokenList, setShowFromTokenList] = useState(false)
  const [showToTokenList, setShowToTokenList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Add maxBTC token to the available tokens
  const swapTokens: SwapToken[] = [
    {
      symbol: 'maxBTC',
      name: 'MaxBTC Protocol Token',
      icon: '/btcGolden.png',
      balance: '0.00',
      price: 0,
      denom: 'maxbtc',
      brandColor: '#F59E0B', // Amber color for maxBTC
    },
    ...tokens.map((token) => ({
      symbol: token.symbol,
      name: token.description,
      icon: token.icon,
      balance: '0.00',
      price: 0,
      denom: token.denom,
      brandColor: token.brandColor,
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

  const TokenSelector = ({
    selectedToken,
    onToggle,
    isOpen,
    isFromToken,
  }: {
    selectedToken: SwapToken | null
    onToggle: () => void
    isOpen: boolean
    isFromToken: boolean
  }) => (
    <div className='relative'>
      <button
        onClick={onToggle}
        className='flex items-center gap-2 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors min-w-[140px] bg-background/50'
      >
        {selectedToken ? (
          <>
            <div className='relative w-6 h-6 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-0.5'>
              <Image
                src={selectedToken.icon}
                alt={selectedToken.symbol}
                fill
                className='object-contain'
                sizes='24px'
              />
            </div>
            <span className='font-medium text-foreground'>{selectedToken.symbol}</span>
          </>
        ) : (
          <span className='text-muted-foreground'>Select token</span>
        )}
        <ChevronDown className='w-4 h-4 ml-auto text-muted-foreground' />
      </button>

      {isOpen && (
        <div className='absolute top-full mt-2 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
          {swapTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => handleTokenSelect(token, isFromToken)}
              className='w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors'
              disabled={
                isFromToken ? toToken?.symbol === token.symbol : fromToken?.symbol === token.symbol
              }
            >
              <div className='relative w-8 h-8 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  className='object-contain'
                  sizes='32px'
                />
              </div>
              <div className='text-left'>
                <div className='font-medium text-foreground'>{token.symbol}</div>
                <div className='text-sm text-muted-foreground'>{token.name}</div>
              </div>
              <div className='ml-auto text-right'>
                <div className='text-sm font-medium text-foreground'>{token.balance}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className='w-full min-h-screen flex flex-col items-center justify-start px-4 py-12 bg-background'>
      <div className='relative w-full max-w-5xl mb-10'>
        <div className='absolute inset-0 h-28'>
          <FlickeringGrid
            className='w-full h-full'
            color='#FF6B35'
            squareSize={8}
            gridGap={2}
            flickerChance={0.2}
            maxOpacity={0.3}
            gradientDirection='top-to-bottom'
            height={112}
          />
        </div>
        <div className='relative z-10 flex flex-col items-start justify-center h-28 pl-8'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1'>
            Swap Bitcoin Assets
          </h1>
          <p className='text-sm sm:text-base text-muted-foreground max-w-xl'>
            Trade between Bitcoin LSTs, wBTC, and maxBTC with minimal slippage and competitive rates
          </p>
        </div>
      </div>

      <div className='flex items-start justify-center gap-6 w-full max-w-5xl'>
        {/* Swap Card */}
        <Card className='p-6 bg-card/50 backdrop-blur-sm border border-border/60 max-w-md w-full self-start'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-xl font-semibold text-foreground'>Swap & Bridge</h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='p-2 hover:bg-muted/50 rounded-lg transition-colors'
            >
              <Settings className='w-5 h-5 text-muted-foreground' />
            </button>
          </div>

          {showSettings && (
            <div className='p-4 border border-border/40 rounded-lg bg-muted/20 space-y-4'>
              <div>
                <label className='text-sm font-medium mb-2 block text-foreground'>
                  Slippage Tolerance
                </label>
                <div className='flex gap-2'>
                  {['0.1', '0.5', '1.0'].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        slippage === value
                          ? 'bg-primary text-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type='text'
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className='px-2 py-1 rounded text-sm border border-border/60 bg-background/50 w-16 text-foreground'
                    placeholder='Custom'
                  />
                </div>
              </div>
            </div>
          )}

          <div className='relative'>
            {/* From Token */}
            <div className='pb-6'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium text-foreground'>From</label>
                {fromToken && (
                  <span className='text-xs text-muted-foreground'>
                    Balance: {fromToken.balance}
                  </span>
                )}
              </div>
              <div className='flex gap-3'>
                <TokenSelector
                  selectedToken={fromToken}
                  onToggle={() => setShowFromTokenList(!showFromTokenList)}
                  isOpen={showFromTokenList}
                  isFromToken={true}
                />
                <div className='flex-1'>
                  <AmountInput
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    token={fromToken || { symbol: 'BTC', brandColor: '#F59E0B' }}
                    usdValue='$0.00'
                    balance={fromToken?.balance || '0'}
                    placeholder='0.000000'
                  />
                </div>
              </div>
            </div>

            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'>
              <button
                onClick={handleSwapTokens}
                className='w-12 h-12 flex items-center justify-center rounded-lg bg-background border-2 border-border shadow-lg hover:bg-muted transition-colors duration-150'
                style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)' }}
                aria-label='Swap direction'
              >
                <ArrowUpDown className='w-6 h-6 text-muted-foreground' />
              </button>
            </div>

            {/* To Token */}
            <div className='pt-6'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium text-foreground'>To</label>
                {toToken && (
                  <span className='text-xs text-muted-foreground'>Balance: {toToken.balance}</span>
                )}
              </div>
              <div className='flex gap-3'>
                <TokenSelector
                  selectedToken={toToken}
                  onToggle={() => setShowToTokenList(!showToTokenList)}
                  isOpen={showToTokenList}
                  isFromToken={false}
                />
                <div className='flex-1'>
                  <AmountInput
                    value={toAmount}
                    onChange={() => {}} // Read-only
                    token={toToken || { symbol: 'BTC', brandColor: '#F59E0B' }}
                    usdValue='$0.00'
                    placeholder='0.000000'
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {fromToken && toToken && fromAmount && (
            <div className='p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Rate</span>
                <span className='text-foreground'>
                  1 {fromToken.symbol} ≈ 0.98 {toToken.symbol}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Price Impact</span>
                <span className='text-orange-500'>~2.0%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Minimum Received</span>
                <span className='text-foreground'>
                  {(parseFloat(toAmount) * 0.995).toFixed(8)} {toToken.symbol}
                </span>
              </div>
            </div>
          )}

          <Button
            disabled={!isSwapValid}
            className='w-full py-3 text-lg'
            gradientColor={fromToken?.brandColor}
          >
            {!fromToken || !toToken ? 'Select tokens' : !fromAmount ? 'Enter amount' : 'Swap'}
            <ArrowRight className='w-4 h-4 ml-2' />
          </Button>
        </Card>

        <div className='flex flex-col justify-between h-full min-h-[420px] max-h-full flex-1'>
          <div className='space-y-6'>
            <div className='flex gap-4'>
              <StatCard value={2.4} label='24h Volume' isCurrency={true} prefix='$' suffix='M' />
              <StatCard
                value={45.7}
                label='Total Liquidity'
                isCurrency={true}
                prefix='$'
                suffix='M'
              />
              <StatCard value={0.05} label='Average Slippage' suffix='%' decimalPlaces={2} />
            </div>

            <Card className='p-4 bg-card/50 backdrop-blur-sm border border-border/60'>
              <h3 className='text-lg font-semibold text-foreground flex items-center gap-2'>
                <Zap className='w-5 h-5 text-primary' />
                Popular Pairs
              </h3>
              <div className='space-y-3'>
                {[
                  { from: 'FBTC', to: 'maxBTC', volume: '$1.2M' },
                  { from: 'LBTC', to: 'wBTC', volume: '$890K' },
                  { from: 'solvBTC', to: 'maxBTC', volume: '$650K' },
                  { from: 'eBTC', to: 'FBTC', volume: '$420K' },
                ].map((pair, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors cursor-pointer'
                  >
                    <div className='flex items-center gap-2'>
                      <div className='flex -space-x-1'>
                        <div className='w-6 h-6 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-xs font-medium'>
                          {pair.from.charAt(0)}
                        </div>
                        <div className='w-6 h-6 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-xs font-medium'>
                          {pair.to.charAt(0)}
                        </div>
                      </div>
                      <span className='text-sm font-medium text-foreground'>
                        {pair.from}/{pair.to}
                      </span>
                    </div>
                    <span className='text-xs text-muted-foreground'>{pair.volume}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
