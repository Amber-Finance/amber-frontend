'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { BigNumber } from 'bignumber.js'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Coins,
  Percent,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'

import { BalanceRow, InfoCard, MetricRow, ProgressCard } from '@/components/deposit'
import { AmountInput } from '@/components/ui/AmountInput'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import tokens from '@/config/tokens'
import {
  useLstMarkets,
  useMarkets,
  useTransactions,
  useUserDeposit,
  useWalletBalances,
} from '@/hooks'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/finance'
import { formatCompactCurrency, formatCurrency } from '@/utils/format'

type TabType = 'deposit' | 'withdraw'

interface TokenData {
  token: {
    symbol: string
    icon: string
    description: string
    protocol: string
    isLST: boolean
    brandColor: string
  }
  metrics: {
    protocolApy: number
    stakingApy: number
    totalApy: number
    balance: number
    deposited: number
    valueUsd: number
    depositedValueUsd: number
  }
}

export default function DepositClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('deposit')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)

  useMarkets()
  const { markets } = useStore()
  const { getTokenStakingApy, isLoading: isYieldLoading } = useLstMarkets()
  const { deposit, withdraw, isPending } = useTransactions()

  const { data: walletBalances, isLoading: walletBalancesLoading } = useWalletBalances()

  const tokenSymbol = searchParams.get('token')
  const tokenData = tokens.find((token) => token.symbol === tokenSymbol)
  const market = markets?.find((market) => market.asset.denom === tokenData?.denom)
  const { amount: depositedAmount } = useUserDeposit(tokenData?.denom)

  useEffect(() => {
    if (!tokenSymbol || !tokenData || !market) {
      router.push('/')
      return
    }

    const protocolApy = parseFloat(
      convertAprToApy(new BigNumber(market.metrics.liquidity_rate || '0').toString()),
    )

    // Get real-time staking APY from consolidated hook
    const stakingApy = getTokenStakingApy(tokenData.symbol)

    // Calculate total APY: protocol APY + staking APY
    const totalApy = parseFloat((protocolApy + stakingApy).toFixed(2))

    const walletBalance =
      walletBalances?.find((balance) => balance.denom === tokenData.denom)?.amount || '0'

    const depositedNumber = parseFloat(depositedAmount) / Math.pow(10, market.asset.decimals)
    const balanceNumber = parseFloat(walletBalance) / Math.pow(10, market.asset.decimals)
    const price = parseFloat(market.price?.price || '0')
    const valueUsd = balanceNumber * price
    const depositedValueUsd = depositedNumber * price

    setSelectedToken({
      token: {
        symbol: tokenData.symbol,
        icon: tokenData.icon,
        description: tokenData.description,
        protocol: tokenData.protocol,
        isLST: tokenData.isLST,
        brandColor: tokenData.brandColor,
      },
      metrics: {
        protocolApy,
        stakingApy,
        totalApy,
        balance: balanceNumber,
        deposited: depositedNumber,
        valueUsd,
        depositedValueUsd,
      },
    })
  }, [searchParams, markets, router, getTokenStakingApy])

  if (!selectedToken || walletBalancesLoading) {
    return (
      <div className='w-full lg:container mx-auto px-4 py-8'>
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
              <div className='w-8 h-8 bg-muted/40 rounded-full animate-pulse' />
            </div>
            <h3 className='text-lg font-bold text-foreground'>
              {!selectedToken ? 'Loading Token Data' : 'Loading Wallet Balances'}
            </h3>
            <p className='text-muted-foreground'>
              {!selectedToken ? 'Fetching token information...' : 'Fetching wallet balances...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { token, metrics } = selectedToken

  const formatBalance = (balance: number) => {
    if (balance <= 0) return '0.000000'
    return balance.toFixed(6)
  }
  const formatUsd = (usd: number) => formatCurrency(usd, 2)
  const formatUsdK = (usd: number) => formatCompactCurrency(usd)

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    const market = markets?.find((m) => m.asset.symbol === token.symbol)
    if (!market) {
      console.error('Market not found for token:', token.symbol)
      return
    }

    await deposit({
      amount: depositAmount,
      denom: market.asset.denom,
      symbol: token.symbol,
      decimals: market.asset.decimals,
    })
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return

    const market = markets?.find((m) => m.asset.symbol === token.symbol)
    if (!market) {
      console.error('Market not found for token:', token.symbol)
      return
    }

    await withdraw({
      amount: withdrawAmount,
      denom: market.asset.denom,
      symbol: token.symbol,
      decimals: market.asset.decimals,
    })
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
    <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-4'
      >
        <ArrowLeft className='w-4 h-4' />
        Back
      </button>

      <div className='relative mb-4 sm:mb-6'>
        <div className='absolute inset-0 z-10 w-full overflow-hidden'>
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

        <div className='relative z-20'>
          <div className='flex justify-between p-4'>
            <div className='flex items-center justify-start gap-3'>
              <div className='relative w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
                <Image src={token.icon} alt={token.symbol} fill className='object-contain' />
              </div>
              <div>
                <h2 className='text-lg sm:text-xl font-bold text-foreground'>
                  {token.symbol} Deposit
                </h2>
                <p className='text-xs sm:text-sm text-muted-foreground'>{token.protocol}</p>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-lg sm:text-2xl font-bold' style={{ color: token.brandColor }}>
                <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
              </div>
              <div className='text-xs text-muted-foreground/80 font-medium'>Total APY</div>
            </div>
          </div>

          <div className='flex gap-1 bg-muted/30 rounded-lg p-1 mt-2 sm:mt-3 w-full sm:w-[550px] ml-auto'>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabType)}
              className='w-full'
            >
              <TabsList>
                <TabsTrigger value='deposit'>
                  <div className='flex items-center gap-1 sm:gap-1.5 justify-center'>
                    <ArrowUpRight className='w-3 h-3' />
                    Deposit
                  </div>
                </TabsTrigger>
                <TabsTrigger value='withdraw'>
                  <div className='flex items-center gap-1 sm:gap-1.5 justify-center'>
                    <ArrowRight className='w-3 h-3' />
                    Withdraw
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
        <div className='flex-1 space-y-4 order-2 lg:order-1'>
          {/* Balances Section */}
          <InfoCard title='Your Balances'>
            <div className='flex flex-col gap-2'>
              <BalanceRow
                icon={Wallet}
                label='Available'
                value={`${formatBalance(metrics.balance)} ${token.symbol}`}
                usdValue={formatUsd(metrics.valueUsd)}
                brandColor={token.brandColor}
              />
              <BalanceRow
                icon={Coins}
                label='Deposited'
                value={`${formatBalance(metrics.deposited)} ${token.symbol}`}
                usdValue={
                  metrics.depositedValueUsd > 0 ? formatUsd(metrics.depositedValueUsd) : undefined
                }
                brandColor={token.brandColor}
              />
            </div>
          </InfoCard>

          {/* Yield Breakdown Section */}
          <InfoCard title='Yield Breakdown'>
            <div className='flex flex-col gap-2'>
              <MetricRow
                icon={Zap}
                label='Staking APY'
                value={
                  isYieldLoading
                    ? 'Loading...'
                    : metrics.stakingApy > 0
                      ? metrics.stakingApy
                      : 'N/A'
                }
                suffix={!isYieldLoading && metrics.stakingApy > 0 ? '%' : ''}
                brandColor={token.brandColor}
                showTooltipForNA={true}
              />
              <MetricRow
                icon={Percent}
                label={`${token.protocol} Yield APY`}
                value={metrics.protocolApy}
                suffix='%'
                brandColor={token.brandColor}
              />
            </div>
          </InfoCard>

          {/* Market Status Section */}
          <InfoCard title='Market Status'>
            <div className='flex flex-row gap-4'>
              <ProgressCard
                value={33}
                label='TVL Growth (7d)'
                subtitle={formatUsdK(3095)}
                brandColor={token.brandColor}
              />
              <ProgressCard
                value={53}
                label='TVL Share'
                subtitle='53% of platform deposits'
                brandColor={token.brandColor}
              />
            </div>
          </InfoCard>

          {/* Protocol Details Section */}
          <InfoCard title='Protocol Details'>
            <div className='flex flex-wrap gap-2'>
              <MetricRow label='Total Value Locked' value={formatUsdK(754322)} variant='compact' />
              <MetricRow label='Unique Wallets' value='1104' variant='compact' />
              <MetricRow
                label='Average APY (30d)'
                value={`${metrics.totalApy}%`}
                variant='compact'
              />
              <MetricRow
                label='Withdrawal Conditions'
                value='Instant'
                brandColor={token.brandColor}
                variant='compact'
              />
            </div>
          </InfoCard>
        </div>

        {/* Right Column - Input Form */}
        <div className='flex-1 order-1 lg:order-2'>
          <InfoCard title={activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}>
            <div className='space-y-2'>
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
                    (metrics.valueUsd / metrics.balance || 0),
                )}
                balance={
                  activeTab === 'deposit'
                    ? metrics.balance.toString()
                    : metrics.deposited.toString()
                }
              />

              <div className='flex flex-col gap-4 mb-8'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-muted-foreground'>Amount</span>
                  <span className='text-xs font-medium text-foreground'>
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
                    <span className='text-sm font-bold text-foreground'>
                      Estimated Annual Earnings
                    </span>
                  </div>
                  <div className='text-lg font-bold text-foreground'>
                    {estimatedApyEarnings.toFixed(6)} {token.symbol}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~{formatUsd(estimatedApyEarnings * (metrics.valueUsd / metrics.balance || 0))}{' '}
                    USD
                  </div>
                </div>
              )}

              <Button
                variant='outline-gradient'
                gradientColor={token.brandColor}
                onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
                disabled={isPending || !currentAmount || parseFloat(currentAmount) <= 0}
                className='w-full'
              >
                {isPending ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    {activeTab === 'deposit' ? 'Depositing...' : 'Withdrawing...'}
                  </>
                ) : (
                  <>
                    {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} {token.symbol}
                    <ArrowRight className='w-4 h-4 ml-1' />
                  </>
                )}
              </Button>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  )
}
