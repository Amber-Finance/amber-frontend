'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { BigNumber } from 'bignumber.js'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Coins,
  Info,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'

import { BalanceRow, InfoCard, MetricRow, ProgressCard } from '@/components/deposit'
import { AmountInput } from '@/components/ui/AmountInput'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
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
import useRedBankAssetsTvl from '@/hooks/redBank/useRedBankAssetsTvl'
import useRedBankDenomData from '@/hooks/redBank/useRedBankDenomData'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/finance'
import { formatCompactCurrency, formatCurrency, formatTokenAmount } from '@/utils/format'

type TabType = 'deposit' | 'withdraw'

export default function DepositClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const action = searchParams.get('action')
    return action === 'withdraw' ? 'withdraw' : 'deposit'
  })
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [sliderPercentage, setSliderPercentage] = useState(0)
  const [lastAction, setLastAction] = useState<'deposit' | 'withdraw' | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeTab === 'withdraw') {
      params.set('action', 'withdraw')
    } else {
      params.delete('action')
    }
    router.replace(`?${params.toString()}`)
  }, [activeTab, router, searchParams])

  useMarkets()
  const { markets } = useStore()
  const { getTokenStakingApy, isLoading: isYieldLoading } = useLstMarkets()
  const { deposit, withdraw, isPending } = useTransactions()

  const { data: walletBalances, isLoading: walletBalancesLoading } = useWalletBalances()

  const tokenSymbol = searchParams.get('token')
  const tokenData = tokens.find((token) => token.symbol === tokenSymbol)
  const market = markets?.find((market) => market.asset.denom === tokenData?.denom)
  const { amount: depositedAmount } = useUserDeposit(tokenData?.denom)

  const { data: redBankAssetsTvl } = useRedBankAssetsTvl()
  const { data: redBankDenomData, tvlGrowth30d } = useRedBankDenomData(tokenData?.denom || '')

  const currentTokenTvlData = redBankAssetsTvl?.assets?.find(
    (asset: any) => asset.denom === tokenData?.denom,
  )
  const currentTokenTvlAmount = new BigNumber(currentTokenTvlData?.tvl).shiftedBy(-6).toString()

  const selectedToken = useMemo(() => {
    if (!tokenSymbol || !tokenData || !market) {
      router.push('/')
      return null
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
    const depositedNumber = new BigNumber(depositedAmount || '0')
      .shiftedBy(-market.asset.decimals)
      .toNumber()
    const balanceNumber = new BigNumber(walletBalance).shiftedBy(-market.asset.decimals).toNumber()
    const price = parseFloat(market.price?.price || '0')
    const valueUsd = balanceNumber * price
    const depositedValueUsd = depositedNumber * price

    return {
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
    }
  }, [tokenSymbol, tokenData, market, router, getTokenStakingApy, walletBalances, depositedAmount])

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
    setDepositAmount('')
    setSliderPercentage(0)
    setLastAction('deposit')
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
    setWithdrawAmount('')
    setSliderPercentage(0)
    setLastAction('withdraw')
  }

  const currentAmount = activeTab === 'deposit' ? depositAmount : withdrawAmount
  const maxAmount = activeTab === 'deposit' ? metrics.balance : metrics.deposited

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0]
    setSliderPercentage(percentage)
    const amount = new BigNumber(maxAmount).multipliedBy(percentage).dividedBy(100).toString()
    if (activeTab === 'deposit') {
      setDepositAmount(amount)
    } else {
      setWithdrawAmount(amount)
    }
  }

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
                <Image
                  src={token.icon}
                  alt={`${token.symbol} token icon`}
                  fill
                  className='object-contain'
                />
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
              <div className='flex items-center gap-1'>
                <div className='text-xs text-muted-foreground/80 font-medium'>Total APY</div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground/60 cursor-help transition-colors' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className='text-left space-y-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-bold text-foreground'>Points Campaign</span>
                      </div>
                      <div className='text-xs text-muted-foreground space-y-1'>
                        <p>• Mars Fragments: ~1% of total APY</p>
                        <p>• Neutron Quarks: ~2% of total APY</p>
                        <p>• Base yield: ~0.5% of total APY</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
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
                icon={Coins}
                label='Deposited'
                value={formatTokenAmount(metrics.deposited, token.symbol)}
                usdValue={
                  metrics.depositedValueUsd > 0
                    ? formatCurrency(metrics.depositedValueUsd)
                    : undefined
                }
                brandColor={token.brandColor}
                actionType={lastAction}
              />
              <BalanceRow
                icon={Wallet}
                label='Available in Wallet'
                value={formatTokenAmount(metrics.balance, token.symbol)}
                usdValue={formatCurrency(metrics.valueUsd)}
                brandColor={token.brandColor}
                actionType={null}
              />
            </div>
          </InfoCard>

          {/* Incentives Breakdown Section */}
          <InfoCard title='Incentives Breakdown'>
            <div className='space-y-4'>
              {/* Yield Section */}
              <div className='space-y-3'>
                <div className='text-sm text-muted-foreground/80 leading-relaxed'>
                  Get native yield in the form of {token.symbol}.
                </div>
                <MetricRow
                  icon={Zap}
                  label={`${token.protocol} Yield`}
                  value={`~${metrics.protocolApy}`}
                  suffix='%'
                  brandColor={token.brandColor}
                />
              </div>

              {/* Points Section */}
              <div className='space-y-3'>
                <div className='text-sm text-muted-foreground/80 leading-relaxed'>
                  By supplying this asset, you automatically farm points for:
                </div>
                <div className='space-y-2'>
                  <MetricRow
                    icon={Zap}
                    label='Mars Fragments'
                    value='~1'
                    suffix='%'
                    brandColor={token.brandColor}
                  />
                  <MetricRow
                    icon={Zap}
                    label='Neutron Quarks'
                    value='~2'
                    suffix='%'
                    brandColor={token.brandColor}
                  />
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Market Status Section */}
          <InfoCard title='Market Status'>
            <div className='flex flex-row gap-4'>
              <ProgressCard
                value={tvlGrowth30d}
                label='TVL Growth (30d)'
                subtitle={`${tvlGrowth30d.toFixed(2)}%`}
                brandColor={token.brandColor}
              />
              <ProgressCard
                value={currentTokenTvlData?.tvl_share}
                label='TVL Share'
                subtitle={`${currentTokenTvlData?.tvl_share.toFixed(2)}% of platform deposits`}
                brandColor={token.brandColor}
              />
            </div>
          </InfoCard>

          {/* Protocol Details Section */}
          <InfoCard title='Protocol Details'>
            <div className='flex flex-wrap gap-2'>
              <MetricRow
                label='Total Value Locked'
                value={formatCompactCurrency(currentTokenTvlAmount)}
                variant='compact'
              />
              <MetricRow
                label='Unique Wallets'
                value={redBankDenomData?.unique_wallets}
                variant='compact'
              />
              <MetricRow
                label='Average Lending APY (30d)'
                value={`${redBankDenomData?.average_lending_apy.toFixed(2)}%`}
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
                  const value = e.target.value
                  if (activeTab === 'deposit') {
                    setDepositAmount(value)
                  } else {
                    setWithdrawAmount(value)
                  }
                  const numValue = parseFloat(value || '0')
                  const newPercentage = maxAmount > 0 ? (numValue / maxAmount) * 100 : 0
                  setSliderPercentage(Math.min(newPercentage, 100))
                }}
                token={token}
                usdValue={formatCurrency(
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
                    {sliderPercentage.toFixed(1)}%
                  </span>
                </div>
                <Slider
                  value={[sliderPercentage]}
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
                    {formatTokenAmount(estimatedApyEarnings, token.symbol)}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    ~
                    {formatCurrency(
                      estimatedApyEarnings * (metrics.valueUsd / metrics.balance || 0),
                    )}{' '}
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

              {/* Asset Actions Section */}
              {activeTab === 'deposit' && (
                <div className='mt-6 pt-6 border-t border-border/40'>
                  <div className='text-center mb-4'>
                    <h4 className='text-sm font-semibold text-foreground mb-1'>
                      Need more {token.symbol}?
                    </h4>
                    <p className='text-xs text-muted-foreground'>
                      Bridge from other chains or swap for {token.symbol}
                    </p>
                  </div>

                  <div className='flex gap-3'>
                    <Button
                      variant='outline'
                      onClick={() => window.open('https://go.skip.build/', '_blank')}
                      className='flex-1 h-10 text-xs font-medium hover:bg-muted/30 transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500' />
                        Bridge Assets
                      </div>
                    </Button>

                    <Button
                      variant='outline'
                      onClick={() => router.push(`/swap?to=${tokenData?.denom}`)}
                      className='flex-1 h-10 text-xs font-medium hover:bg-muted/30 transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500' />
                        Swap Assets
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  )
}
