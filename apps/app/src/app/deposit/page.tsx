'use client'

import { useState, useEffect } from 'react'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { AnimatedCircularProgressBar } from '@/components/ui/AnimatedCircularProgress'
import { Slider } from '@/components/ui/slider'
import {
  Coins,
  Percent,
  TrendingUp,
  Wallet,
  Zap,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import tokens from '@/config/tokens'
import { useMarkets } from '@/hooks/useMarkets'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/finance'
import { BigNumber } from 'bignumber.js'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { AmountInput } from '@/components/ui/AmountInput'

type TabType = 'deposit' | 'withdraw'

interface TokenData {
  token: {
    symbol: string
    icon: string
    description: string
    protocol: string
    isLST: boolean
    stakingApy: number
    brandColor: string
  }
  metrics: {
    lendingApy: number
    totalApy: number
    balance: number
    deposited: number
    valueUsd: number
    utilizationRate: number
    depositCapUsage: number
    optimalUtilizationRate: number
    collateralTotalUsd: number
    depositCapUsd: number
  }
}

export default function DepositPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('deposit')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)

  useMarkets()
  const { markets } = useStore()

  useEffect(() => {
    const tokenSymbol = searchParams.get('token')
    if (!tokenSymbol) {
      router.push('/')
      return
    }

    // Find the token data
    const tokenData = tokens.find((token) => token.symbol === tokenSymbol)
    if (!tokenData) {
      router.push('/')
      return
    }

    // Find market data for this token
    const market = markets?.find((market) => market.asset.denom === tokenData.denom)
    if (!market) {
      router.push('/')
      return
    }

    const lendingApy = parseFloat(
      convertAprToApy(new BigNumber(market.metrics.liquidity_rate || '0').toString()),
    )

    const totalApy = parseFloat((tokenData.stakingApy + lendingApy).toFixed(2))

    const utilizationRate = parseFloat(
      (parseFloat(market.metrics.utilization_rate || '0') * 100).toFixed(2),
    )

    const depositCap = parseFloat(market.params.deposit_cap || '0')
    const collateralTotal = parseFloat(market.metrics.collateral_total_amount || '0')
    const depositCapUsage =
      depositCap > 0 ? parseFloat(((collateralTotal / depositCap) * 100).toFixed(2)) : 0

    const price = parseFloat(market.price?.price || '0')
    const decimals = market.asset?.decimals || 6
    const collateralTotalUsd = (collateralTotal / Math.pow(10, decimals)) * price
    const depositCapUsd = (depositCap / Math.pow(10, decimals)) * price

    const optimalUtilizationRate =
      parseFloat(market.metrics.interest_rate_model?.optimal_utilization_rate || '0') * 100

    setSelectedToken({
      token: {
        symbol: tokenData.symbol,
        icon: tokenData.icon,
        description: tokenData.description,
        protocol: tokenData.protocol,
        isLST: tokenData.isLST,
        stakingApy: tokenData.stakingApy,
        brandColor: tokenData.brandColor,
      },
      metrics: {
        lendingApy,
        totalApy,
        balance: 10.5, // Mock balance for demo
        deposited: 2.3, // Mock deposited amount
        valueUsd: 42000, // Mock USD value
        utilizationRate,
        depositCapUsage,
        optimalUtilizationRate,
        collateralTotalUsd,
        depositCapUsd,
      },
    })
  }, [searchParams, markets, router])

  if (!selectedToken) {
    return (
      <div className='w-full lg:container mx-auto px-4 py-8'>
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
              <div className='w-8 h-8 bg-muted/40 rounded-full animate-pulse' />
            </div>
            <h3 className='text-lg font-semibold text-foreground'>Loading Token Data</h3>
            <p className='text-muted-foreground'>Fetching token information...</p>
          </div>
        </div>
      </div>
    )
  }

  const { token, metrics } = selectedToken

  const formatBalance = (balance: number) => (balance > 0 ? balance.toFixed(6) : '0.000000')
  const formatUsd = (usd: number) => (usd > 0 ? `$${usd.toFixed(2)}` : '$0.00')
  const formatUsdK = (usd: number) => {
    if (usd >= 1000000000) {
      const billions = usd / 1000000000
      return billions >= 10 ? `$${billions.toFixed(1)}B` : `$${billions.toFixed(2)}B`
    } else if (usd >= 1000000) {
      const millions = usd / 1000000
      return millions >= 10 ? `$${millions.toFixed(1)}M` : `$${millions.toFixed(2)}M`
    } else if (usd >= 1000) {
      const thousands = usd / 1000
      return thousands >= 10 ? `$${thousands.toFixed(0)}K` : `$${thousands.toFixed(1)}K`
    } else {
      return usd >= 100 ? `$${Math.round(usd).toLocaleString()}` : `$${usd.toFixed(2)}`
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    setIsProcessing(true)
    try {
      console.log(`Depositing ${depositAmount} ${token.symbol}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert(`Successfully deposited ${depositAmount} ${token.symbol}!`)
      setDepositAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return

    setIsProcessing(true)
    try {
      console.log(`Withdrawing ${withdrawAmount} ${token.symbol}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert(`Successfully withdrawn ${withdrawAmount} ${token.symbol}!`)
      setWithdrawAmount('')
    } catch (error) {
      console.error('Withdraw failed:', error)
      alert('Withdraw failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0]
    const maxAmount = activeTab === 'deposit' ? metrics.balance : metrics.deposited
    const amount = (maxAmount * percentage) / 100
    if (activeTab === 'deposit') {
      setDepositAmount(amount.toFixed(6))
    } else {
      setWithdrawAmount(amount.toFixed(6))
    }
  }

  const currentAmount = activeTab === 'deposit' ? depositAmount : withdrawAmount
  const maxAmount = activeTab === 'deposit' ? metrics.balance : metrics.deposited
  const percentage = maxAmount > 0 ? (parseFloat(currentAmount || '0') / maxAmount) * 100 : 0
  const estimatedApyEarnings = parseFloat(currentAmount || '0') * (metrics.totalApy / 100)

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-8 mt-20'>
      {/* Back button for both mobile and desktop, outside the grid */}
      <div className='mb-4'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
        >
          <ArrowLeft className='w-4 h-4' />
          Back
        </button>
      </div>

      <div className='relative mb-4 sm:mb-8'>
        <div className='absolute inset-0 z-0 w-full overflow-hidden'>
          <FlickeringGrid
            className='w-full h-full'
            color={token.brandColor}
            squareSize={8}
            gridGap={2}
            flickerChance={0.2}
            maxOpacity={0.3}
            gradientDirection='top-to-bottom'
            height={140}
          />
        </div>

        {/* Header content */}
        <div className='relative z-10'>
          {/* Main header row */}
          <div className='flex flex-row items-center justify-between gap-4 p-4'>
            {/* Token info left */}
            <div className='flex items-center gap-3'>
              <div className='relative w-8 h-8 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  className='object-contain'
                  sizes='32px'
                />
              </div>
              <div>
                <h1 className='text-lg sm:text-xl font-bold text-foreground'>
                  {token.symbol} Deposit
                </h1>
                <p className='text-xs sm:text-sm text-muted-foreground'>{token.protocol}</p>
              </div>
            </div>
            {/* APY right */}
            <div className='text-right'>
              <div className='text-lg sm:text-2xl font-bold' style={{ color: token.brandColor }}>
                <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
              </div>
              <div className='text-xs text-muted-foreground/80 font-medium'>Total APY</div>
            </div>
          </div>

          {/* Tabs below header */}
          <div className='flex gap-1 bg-muted/30 rounded-lg p-1 mt-2 sm:mt-3 w-full sm:w-[400px] lg:w-[550px] ml-auto'>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === 'deposit'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-1 sm:gap-1.5 justify-center'>
                <ArrowUpRight className='w-3 h-3' />
                Deposit
              </div>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-1.5 px-2 sm:px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === 'withdraw'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className='flex items-center gap-1 sm:gap-1.5 justify-center'>
                <ArrowRight className='w-3 h-3' />
                Withdraw
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
        {/* Left Column - Information */}
        <div className='flex-1 space-y-4'>
          {/* Balances Section */}
          <div className='bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4'>
            <h3 className='text-sm font-semibold text-card-foreground mb-3'>Your Balances</h3>
            <div className='space-y-2'>
              <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                <div className='flex items-center gap-2'>
                  <Wallet className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: token.brandColor }} />
                  <span className='text-xs sm:text-sm font-medium'>Available</span>
                </div>
                <div className='text-right'>
                  <div className='text-xs sm:text-sm font-bold text-card-foreground'>
                    {formatBalance(metrics.balance)} {token.symbol}
                  </div>
                  <div className='text-xs text-muted-foreground/80'>
                    {formatUsd(metrics.valueUsd)}
                  </div>
                </div>
              </div>

              {metrics.deposited > 0 && (
                <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                  <div className='flex items-center gap-2'>
                    <Coins className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: token.brandColor }} />
                    <span className='text-xs sm:text-sm font-medium'>Deposited</span>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs sm:text-sm font-bold text-card-foreground'>
                      {formatBalance(metrics.deposited)} {token.symbol}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Yield Breakdown Section */}
          <div className='bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4'>
            <h3 className='text-sm font-semibold text-card-foreground mb-3'>Yield Breakdown</h3>
            <div className='space-y-2'>
              <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                <div className='flex items-center gap-2'>
                  <Zap className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: token.brandColor }} />
                  <span className='text-xs sm:text-sm font-medium'>Staking APY</span>
                </div>
                <span className='text-xs sm:text-sm font-bold text-card-foreground'>
                  {token.stakingApy > 0 ? (
                    <span>
                      <CountingNumber value={token.stakingApy} decimalPlaces={2} />
                    </span>
                  ) : (
                    <span className='text-muted-foreground/90'>N/A</span>
                  )}
                </span>
              </div>

              <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                <div className='flex items-center gap-2'>
                  <Percent className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: token.brandColor }} />
                  <span className='text-xs sm:text-sm font-medium'>{token.protocol} Yield APY</span>
                </div>
                <span className='text-xs sm:text-sm font-bold text-card-foreground'>
                  <CountingNumber value={metrics.lendingApy} decimalPlaces={2} />%
                </span>
              </div>
            </div>
          </div>

          {/* Market Status Section */}
          <div className='bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4'>
            <h3 className='text-sm font-semibold text-card-foreground mb-3'>Market Status</h3>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1 flex flex-col items-center space-y-1.5'>
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={metrics.utilizationRate}
                  gaugePrimaryColor={token.brandColor}
                  gaugeSecondaryColor={`${token.brandColor}20`}
                  className='size-12 sm:size-16 text-xs'
                />
                <div className='text-center'>
                  <div className='text-xs font-medium text-card-foreground'>Utilization</div>
                  <div className='text-xs text-muted-foreground/80'>
                    Optimal:{' '}
                    <CountingNumber value={metrics.optimalUtilizationRate} decimalPlaces={1} />%
                  </div>
                </div>
              </div>

              <div className='flex-1 flex flex-col items-center space-y-1.5'>
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={metrics.depositCapUsage}
                  gaugePrimaryColor={token.brandColor}
                  gaugeSecondaryColor={`${token.brandColor}20`}
                  className='size-12 sm:size-16 text-xs'
                />
                <div className='text-center'>
                  <div className='text-xs font-medium text-card-foreground'>Deposit Cap</div>
                  <div className='text-xs text-muted-foreground/80'>
                    {formatUsdK(metrics.collateralTotalUsd)} / {formatUsdK(metrics.depositCapUsd)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Protocol Details Section */}
          <div className='bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4'>
            <h3 className='text-sm font-semibold text-card-foreground mb-3'>Protocol Details</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                <span className='text-xs text-muted-foreground'>Total Value Locked</span>
                <span className='text-xs font-medium text-card-foreground'>
                  {formatUsdK(metrics.collateralTotalUsd)}
                </span>
              </div>
              <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                <span className='text-xs text-muted-foreground'>Deposit Cap</span>
                <span className='text-xs font-medium text-card-foreground'>
                  {formatUsdK(metrics.depositCapUsd)}
                </span>
              </div>
              <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                <span className='text-xs text-muted-foreground'>Available Capacity</span>
                <span className='text-xs font-medium text-card-foreground'>
                  {formatUsdK(metrics.depositCapUsd - metrics.collateralTotalUsd)}
                </span>
              </div>
              <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
                <span className='text-xs text-muted-foreground'>Risk Level</span>
                <span
                  className='text-xs font-medium text-card-foreground'
                  style={{ color: token.brandColor }}
                >
                  Low
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Input Form */}
        <div className='flex-1'>
          <div className='bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4 lg:sticky lg:top-6'>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-semibold text-card-foreground mb-3'>
                  {activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
                </h3>

                <AmountInput
                  value={currentAmount}
                  onChange={(e) => {
                    if (activeTab === 'deposit') {
                      setDepositAmount(e.target.value)
                    } else {
                      setWithdrawAmount(e.target.value)
                    }
                  }}
                  token={token}
                  usdValue={formatUsd(
                    (parseFloat(currentAmount || '0') || 0) *
                      (metrics.valueUsd / metrics.balance || 1),
                  )}
                  balance={
                    activeTab === 'deposit'
                      ? metrics.balance.toString()
                      : metrics.deposited.toString()
                  }
                />

                <div className='space-y-2 mb-8'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-muted-foreground'>Amount</span>
                    <span className='text-xs font-medium text-card-foreground'>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Slider
                    value={[percentage]}
                    onValueChange={handleSliderChange}
                    max={100}
                    min={0}
                    step={0.1}
                    className='w-full'
                    brandColor={token.brandColor}
                  />
                </div>

                {activeTab === 'deposit' && parseFloat(currentAmount || '0') > 0 && (
                  <div className='p-3 rounded-lg bg-muted/20 border border-border/40 mb-4'>
                    <div className='flex items-center gap-1.5 mb-2'>
                      <TrendingUp className='w-4 h-4' style={{ color: token.brandColor }} />
                      <span className='text-sm font-semibold text-card-foreground'>
                        Estimated Annual Earnings
                      </span>
                    </div>
                    <div className='text-lg font-bold text-card-foreground'>
                      {estimatedApyEarnings.toFixed(6)} {token.symbol}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      ~{formatUsd(estimatedApyEarnings * (metrics.valueUsd / metrics.balance))} USD
                    </div>
                  </div>
                )}

                <div
                  className='p-[1px] inline-block w-full rounded-lg'
                  style={{ background: token.brandColor }}
                >
                  <button
                    onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
                    disabled={isProcessing || !currentAmount || parseFloat(currentAmount) <= 0}
                    className='cursor-pointer bg-card text-white font-medium py-2.5 px-6 w-full h-full rounded-lg text-sm hover:bg-card/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5'
                  >
                    {isProcessing ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        {activeTab === 'deposit' ? 'Depositing...' : 'Withdrawing...'}
                      </>
                    ) : (
                      <>
                        {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} {token.symbol}
                        <ArrowRight className='w-4 h-4' />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
