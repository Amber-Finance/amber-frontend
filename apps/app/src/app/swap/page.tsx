'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { ArrowUpDown, Settings, ChevronDown, Info } from 'lucide-react'

interface SwapToken {
  symbol: string
  name: string
  icon: string
  balance?: string
  price?: number
  denom: string
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
      denom: 'maxbtc'
    },
    ...tokens.map(token => ({
      symbol: token.symbol,
      name: token.description,
      icon: token.icon,
      balance: '0.00',
      price: 0,
      denom: token.denom
    }))
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

  const handleMaxClick = () => {
    if (fromToken?.balance) {
      setFromAmount(fromToken.balance)
    }
  }

  const isSwapValid = fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0

  const TokenSelector = ({ 
    selectedToken, 
    onToggle, 
    isOpen, 
    isFromToken 
  }: { 
    selectedToken: SwapToken | null
    onToggle: () => void
    isOpen: boolean
    isFromToken: boolean
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors min-w-[140px]"
      >
        {selectedToken ? (
          <>
            <img src={selectedToken.icon} alt={selectedToken.symbol} className="w-6 h-6 rounded-full" />
            <span className="font-medium">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-muted-foreground">Select token</span>
        )}
        <ChevronDown className="w-4 h-4 ml-auto" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {swapTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => handleTokenSelect(token, isFromToken)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
              disabled={isFromToken ? toToken?.symbol === token.symbol : fromToken?.symbol === token.symbol}
            >
              <img src={token.icon} alt={token.symbol} className="w-8 h-8 rounded-full" />
              <div className="text-left">
                <div className="font-medium">{token.symbol}</div>
                <div className="text-sm text-muted-foreground">{token.name}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm font-medium">{token.balance}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className='w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl sm:text-5xl font-bold text-foreground'>
            Swap Bitcoin Assets
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Trade between Bitcoin LSTs, wBTC, and maxBTC with minimal slippage and competitive rates
          </p>
        </div>

        {/* Main Swap Interface */}
        <div className='max-w-md mx-auto'>
          <Card className='p-6 space-y-4'>
            {/* Header with Settings */}
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Swap</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className='p-2 hover:bg-muted/50 rounded-lg transition-colors'
              >
                <Settings className='w-5 h-5' />
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className='p-4 border rounded-lg bg-muted/20 space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>Slippage Tolerance</label>
                  <div className='flex gap-2'>
                    {['0.1', '0.5', '1.0'].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`px-3 py-1 rounded text-sm ${
                          slippage === value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                    <input
                      type="text"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className='px-2 py-1 rounded text-sm border bg-background w-16'
                      placeholder='Custom'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* From Token */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium'>From</label>
                {fromToken && (
                  <span className='text-xs text-muted-foreground'>
                    Balance: {fromToken.balance}
                  </span>
                )}
              </div>
              <div className='flex gap-2'>
                <TokenSelector
                  selectedToken={fromToken}
                  onToggle={() => setShowFromTokenList(!showFromTokenList)}
                  isOpen={showFromTokenList}
                  isFromToken={true}
                />
                <div className='flex-1 relative'>
                  <input
                    type="text"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.0"
                    className='w-full p-3 rounded-lg border bg-background text-right text-lg'
                  />
                  <button
                    onClick={handleMaxClick}
                    className='absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-primary/10 text-primary px-2 py-1 rounded'
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className='flex justify-center'>
              <button
                onClick={handleSwapTokens}
                className='p-2 hover:bg-muted/50 rounded-lg transition-colors border'
              >
                <ArrowUpDown className='w-5 h-5' />
              </button>
            </div>

            {/* To Token */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium'>To</label>
                {toToken && (
                  <span className='text-xs text-muted-foreground'>
                    Balance: {toToken.balance}
                  </span>
                )}
              </div>
              <div className='flex gap-2'>
                <TokenSelector
                  selectedToken={toToken}
                  onToggle={() => setShowToTokenList(!showToTokenList)}
                  isOpen={showToTokenList}
                  isFromToken={false}
                />
                <div className='flex-1'>
                  <input
                    type="text"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className='w-full p-3 rounded-lg border bg-muted/20 text-right text-lg'
                  />
                </div>
              </div>
            </div>

            {/* Swap Info */}
            {fromToken && toToken && fromAmount && (
              <div className='p-3 rounded-lg bg-muted/20 space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Rate</span>
                  <span>1 {fromToken.symbol} ≈ 0.98 {toToken.symbol}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Price Impact</span>
                  <span className='text-orange-500'>~2.0%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Minimum Received</span>
                  <span>{(parseFloat(toAmount) * 0.995).toFixed(8)} {toToken.symbol}</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <Button
              disabled={!isSwapValid}
              className='w-full py-3 text-lg'
            >
              {!fromToken || !toToken 
                ? 'Select tokens' 
                : !fromAmount 
                ? 'Enter amount' 
                : 'Swap'
              }
            </Button>

            {/* Warning */}
            <div className='flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20'>
              <Info className='w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0' />
              <p className='text-xs text-orange-700 dark:text-orange-300'>
                Trading crypto involves risk. Always verify the details before confirming any transaction.
              </p>
            </div>
          </Card>
        </div>

        {/* Trading Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
          <Card className='p-6 text-center'>
            <div className='text-2xl font-bold text-primary'>$2.4M</div>
            <div className='text-sm text-muted-foreground'>24h Volume</div>
          </Card>
          <Card className='p-6 text-center'>
            <div className='text-2xl font-bold text-primary'>$45.7M</div>
            <div className='text-sm text-muted-foreground'>Total Liquidity</div>
          </Card>
          <Card className='p-6 text-center'>
            <div className='text-2xl font-bold text-primary'>0.05%</div>
            <div className='text-sm text-muted-foreground'>Average Slippage</div>
          </Card>
        </div>
      </div>
    </div>
  )
}
