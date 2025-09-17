'use client'

import { useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { ArrowLeft } from 'lucide-react'

import TokenBalance from '@/components/common/TokenBalance'
import { InfoCard, MetricRow } from '@/components/deposit'
import { AssetActions } from '@/components/deposit/AssetActions'
import { DepositChart } from '@/components/deposit/DepositChart'
import { DepositForm } from '@/components/deposit/DepositForm'
import { DepositHeader } from '@/components/deposit/DepositHeader'
import ProgressCard from '@/components/deposit/ProgressCard'
import { useTheme } from '@/components/providers/ThemeProvider'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useLstMarkets, useMarkets, useTransactions } from '@/hooks'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import useDenomData from '@/hooks/redBank/useDenomData'
import { useDepositState } from '@/hooks/useDepositState'
import { usePrices } from '@/hooks/usePrices'
import { useDepositSimulatedApy } from '@/hooks/useSimulatedApy'
import { useUserDeposit } from '@/hooks/useUserDeposit'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useWithdrawValidation } from '@/hooks/useWithdrawValidation'
import { useStore } from '@/store/useStore'
import { getProtocolPoints, getProtocolPointsIcon } from '@/utils/depositCardHelpers'
import { convertAprToApy } from '@/utils/finance'
import { formatCompactCurrency, formatNumber } from '@/utils/format'

export default function DepositClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const depositState = useDepositState()
  const { state, actions, computed } = depositState

  // Initialize tab from URL params
  useEffect(() => {
    const action = searchParams.get('action')
    const initialTab = action === 'withdraw' ? 'withdraw' : 'deposit'
    if (state.activeTab !== initialTab) {
      actions.setActiveTab(initialTab)
    }
  }, [searchParams])

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (state.activeTab === 'withdraw') {
      params.set('action', 'withdraw')
    } else {
      params.delete('action')
    }
    router.replace(`?${params.toString()}`)
  }, [state.activeTab, router])

  useMarkets()
  const { markets } = useStore()
  usePrices() // Automatically fetches prices on mount
  const { data: lstMarkets, isLoading: walletBalancesLoading, getTokenStakingApy } = useLstMarkets()
  const { deposit, withdraw, isPending } = useTransactions()

  // Prices are automatically fetched by usePrices hook with revalidateOnMount: true
  // No need for manual refetching here

  const { isWalletConnected, connect } = useChain(chainConfig.name)
  const { theme } = useTheme()

  const tokenSymbol = searchParams.get('token')
  const tokenData = tokens.find((token) => token.symbol === tokenSymbol)
  const market = markets?.find((market) => market.asset.denom === tokenData?.denom)

  const { data: walletBalances } = useWalletBalances()
  const { amount: depositedAmount } = useUserDeposit(tokenData?.denom)
  const walletBalanceAmount =
    walletBalances?.find((balance) => balance.denom === tokenData?.denom)?.amount || '0'

  const withdrawValidation = useWithdrawValidation(
    state.withdrawAmount,
    tokenData?.denom || '',
    depositedAmount,
  )

  const lstMarketData = lstMarkets?.find((item) => item.token.symbol === tokenSymbol)

  const { data: assetsTvl } = useAssetsTvl()
  const { data: assetMetrics, tvlGrowth30d } = useDenomData(tokenData?.denom || '')

  const currentTokenTvlData = assetsTvl?.assets?.find(
    (asset: any) => asset.denom === tokenData?.denom,
  )
  const currentTokenTvlAmount = new BigNumber(currentTokenTvlData?.tvl).shiftedBy(-6).toString()

  // Calculate simulated APY based on user input - must be called at top level
  const simulatedApys = useDepositSimulatedApy(
    computed.currentAmount.toString(),
    computed.isDepositing ? 'deposit' : 'withdraw',
    market?.asset.decimals || 8,
    market?.metrics || null,
    market?.metrics
      ? convertAprToApy(new BigNumber(market.metrics.liquidity_rate || '0').toString())
      : '0',
  )

  // Redirect if required data is missing
  if (!tokenSymbol || !tokenData || !lstMarketData || !market) {
    router.push('/')
    return null
  }

  const protocolApy = parseFloat(
    convertAprToApy(new BigNumber(market.metrics.liquidity_rate || '0').toString()),
  )

  // Get real-time staking APY from consolidated hook
  const stakingApy = getTokenStakingApy(tokenData.symbol)

  // Use simulated APY if user has input, otherwise use current APY
  const hasValidInput = computed.currentAmount && parseFloat(computed.currentAmount) > 0
  const currentProtocolApy = hasValidInput ? parseFloat(simulatedApys.lend) : protocolApy

  // Calculate total APY: dynamic protocol APY + staking APY
  const totalApy = parseFloat((currentProtocolApy + stakingApy).toFixed(2))

  const protocolPoints = getProtocolPoints(lstMarketData.token.symbol)
  const protocolPointsIcon = getProtocolPointsIcon(lstMarketData.token.symbol, theme)

  if (walletBalancesLoading) {
    return (
      <div className='w-full lg:container mx-auto px-4 py-8'>
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
              <div className='w-8 h-8 bg-muted/40 rounded-full animate-pulse' />
            </div>
            <h3 className='text-lg font-bold text-foreground'>Loading</h3>
            <p className='text-muted-foreground'>Fetching wallet balances...</p>
          </div>
        </div>
      </div>
    )
  }

  const { token, metrics } = lstMarketData

  const availableToken = {
    denom: token.denom,
    amount: walletBalanceAmount,
  }
  const depositedToken = {
    denom: token.denom,
    amount: depositedAmount,
  }

  const handleDeposit = async () => {
    if (!hasValidAmount()) return

    await deposit({
      amount: state.depositAmount,
      denom: tokenData!.denom,
      symbol: token.symbol,
      decimals: tokenData!.decimals,
    })
    actions.resetAmounts()
    actions.setLastAction('deposit')
  }

  const handleWithdraw = async () => {
    if (!hasValidAmount()) return

    if (!withdrawValidation.isValid) {
      console.error('Withdrawal validation failed:', withdrawValidation.errorMessage)
      return
    }

    await withdraw({
      amount: state.withdrawAmount,
      denom: tokenData!.denom,
      symbol: token.symbol,
      decimals: tokenData!.decimals,
    })
    actions.resetAmounts()
    actions.setLastAction('withdraw')
  }

  const maxAmount = computed.isDepositing
    ? new BigNumber(walletBalanceAmount).shiftedBy(-tokenData!.decimals).toNumber()
    : new BigNumber(depositedAmount).shiftedBy(-tokenData!.decimals).toNumber()

  const hasValidAmount = () => {
    const amount = computed.currentAmount
    if (amount === '') return false

    try {
      const parsedAmount = new BigNumber(amount)
      if (parsedAmount.isLessThanOrEqualTo(0) || !parsedAmount.isFinite()) return false

      const maxAmountBN = new BigNumber(maxAmount)
      const isWithinBalance = parsedAmount.isLessThanOrEqualTo(maxAmountBN)

      // For withdrawals, also check liquidity validation
      if (computed.isWithdrawing) {
        return isWithinBalance && withdrawValidation.isValid
      }

      return isWithinBalance
    } catch {
      return false
    }
  }

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0]
    actions.updateAmountFromSlider(percentage, maxAmount)
  }

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-4'
      >
        <ArrowLeft className='w-4 h-4' />
        Back
      </button>

      <DepositHeader
        token={token}
        totalApy={totalApy}
        activeTab={state.activeTab}
        onTabChange={(value) => {
          actions.setActiveTab(value)
          // Pre-populate withdraw amount with deposited amount when switching to withdraw
          if (value === 'withdraw' && depositedAmount) {
            const depositedAmountFormatted = new BigNumber(depositedAmount)
              .shiftedBy(-tokenData!.decimals)
              .toString()
            actions.setWithdrawAmount(depositedAmountFormatted)
            // Update slider to match the deposited amount
            const maxWithdrawAmount = new BigNumber(depositedAmount)
              .shiftedBy(-tokenData!.decimals)
              .toNumber()
            actions.updateSliderFromAmount(depositedAmountFormatted, maxWithdrawAmount)
          }
        }}
      />

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
        <div className='flex-1 space-y-4 order-2 lg:order-1'>
          {/* Balances Section */}
          <InfoCard title='Your Balances'>
            <div className='space-y-2'>
              {/* Deposited Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Deposited</span>
                  <TokenBalance coin={depositedToken} size='sm' />
                </div>
              </div>

              {/* Available Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>Available in Wallet</span>
                  <TokenBalance coin={availableToken} size='sm' />
                </div>
              </div>
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
                  customIcon={token.icon}
                  label={'Amber Finance Yield'}
                  value={`~${currentProtocolApy}`}
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
                  {/* Protocol Points, only if available */}
                  {protocolPoints?.protocolPoint && protocolPointsIcon && (
                    <MetricRow
                      customIcon={protocolPointsIcon}
                      label={protocolPoints.protocolPoint}
                      value={protocolPoints.multiplier}
                      suffix=' multiplier'
                      brandColor={token.brandColor}
                    />
                  )}
                  {/* Mars Fragments */}
                  <MetricRow
                    customIcon='/images/marsFragments/mars-fragments.svg'
                    label='Mars Fragments'
                    value=''
                    suffix=''
                    brandColor={token.brandColor}
                  />
                  {/* Neutron Rewards */}
                  <MetricRow
                    customIcon='/images/neutron/neutron.svg'
                    label='Neutron Rewards'
                    value=''
                    suffix=''
                    brandColor={token.brandColor}
                  />
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Right Column - Input Form */}
        <div className='flex-1 order-1 lg:order-2 flex flex-col'>
          <DepositForm
            token={token}
            currentAmount={computed.currentAmount.toString()}
            balance={
              computed.isDepositing
                ? new BigNumber(walletBalanceAmount).shiftedBy(-tokenData!.decimals).toString()
                : withdrawValidation.maxWithdrawable
            }
            sliderPercentage={state.sliderPercentage}
            isDepositing={computed.isDepositing}
            isWalletConnected={isWalletConnected}
            isPending={isPending}
            hasAmount={hasValidAmount()}
            validationError={computed.isWithdrawing ? withdrawValidation.errorMessage : undefined}
            onAmountChange={(value) => {
              if (computed.isDepositing) {
                actions.setDepositAmount(value)
              } else {
                actions.setWithdrawAmount(value)
              }
              actions.updateSliderFromAmount(value, maxAmount)
            }}
            onSliderChange={handleSliderChange}
            onConnect={connect}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />

          {/* Asset Actions Section */}
          {computed.isDepositing && (
            <div className='flex-1 flex flex-col'>
              <AssetActions tokenSymbol={token.symbol} tokenDenom={tokenData?.denom} />
            </div>
          )}
        </div>
      </div>

      {/* Market Status and Protocol Details Row */}
      <div className='flex flex-col lg:flex-row gap-4 lg:gap-8 mt-4 '>
        {/* Market Status Section */}
        <div className='flex-1'>
          <InfoCard title='Market Status'>
            <div className='flex flex-row gap-4'>
              <ProgressCard
                value={tvlGrowth30d}
                label='TVL Growth (30d)'
                subtitle={`${formatNumber(2)(tvlGrowth30d)}%`}
                brandColor={token.brandColor}
              />
              <ProgressCard
                value={currentTokenTvlData?.tvl_share ?? 0}
                label='TVL Share'
                subtitle={`${(currentTokenTvlData?.tvl_share ?? 0).toFixed(2)}% of platform deposits`}
                brandColor={token.brandColor}
              />
            </div>
          </InfoCard>
        </div>

        {/* Protocol Details Section */}
        <div className='flex-1'>
          <InfoCard title='Protocol Details'>
            <div className='flex flex-wrap gap-2 py-[20px]'>
              <MetricRow
                label='Total Value Locked'
                value={formatCompactCurrency(parseFloat(currentTokenTvlAmount))}
                variant='compact'
              />
              <MetricRow
                label='Unique Wallets'
                value={assetMetrics?.unique_wallets}
                variant='compact'
              />
              <MetricRow
                label='Average Lending APY (30d)'
                value={`${assetMetrics?.average_lending_apy.toFixed(2)}%`}
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
      </div>
      <div className='mt-4'>
        {tokenData?.denom && <DepositChart denom={tokenData.denom} brandColor={token.brandColor} />}
      </div>
    </div>
  )
}
