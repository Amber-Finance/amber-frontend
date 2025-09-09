'use client'

import { useEffect, useMemo } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { ArrowLeft, Coins, Wallet } from 'lucide-react'

import { BalanceRow, InfoCard, MetricRow } from '@/components/deposit'
import { AssetActions } from '@/components/deposit/AssetActions'
import { DepositForm } from '@/components/deposit/DepositForm'
import { DepositHeader } from '@/components/deposit/DepositHeader'
import ProgressCard from '@/components/deposit/ProgressCard'
import { useTheme } from '@/components/providers/ThemeProvider'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useLstMarkets, useMarkets, useTransactions } from '@/hooks'
import useRedBankAssetsTvl from '@/hooks/redBank/useRedBankAssetsTvl'
import useRedBankDenomData from '@/hooks/redBank/useRedBankDenomData'
import { useDepositState } from '@/hooks/useDepositState'
import { useStore } from '@/store/useStore'
import {
  getNeutronIcon,
  getProtocolPoints,
  getProtocolPointsIcon,
} from '@/utils/depositCardHelpers'
import { formatCompactCurrency, formatCurrencyLegacy } from '@/utils/format'

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
  const { data: lstMarkets, isLoading: walletBalancesLoading } = useLstMarkets()
  const { deposit, withdraw, isPending } = useTransactions()

  const { isWalletConnected, connect } = useChain(chainConfig.name)
  const { theme } = useTheme()

  const tokenSymbol = searchParams.get('token')
  const tokenData = tokens.find((token) => token.symbol === tokenSymbol)

  // Find the market data from lstMarkets for consistency
  const lstMarketData = lstMarkets?.find((item) => item.token.symbol === tokenSymbol)

  // Get market for price data (needed for DepositForm)
  const market = markets?.find((market) => market.asset.denom === tokenData?.denom)
  const { data: redBankAssetsTvl } = useRedBankAssetsTvl()
  const { data: redBankDenomData, tvlGrowth30d } = useRedBankDenomData(tokenData?.denom || '')

  const currentTokenTvlData = redBankAssetsTvl?.assets?.find(
    (asset: any) => asset.denom === tokenData?.denom,
  )
  const currentTokenTvlAmount = new BigNumber(currentTokenTvlData?.tvl).shiftedBy(-6).toString()

  // Redirect if required data is missing
  if (!tokenSymbol || !tokenData || !lstMarketData) {
    router.push('/')
    return null
  }

  const protocolPoints = getProtocolPoints(lstMarketData.token.symbol)
  const protocolPointsIcon = getProtocolPointsIcon(lstMarketData.token.symbol, theme)
  const neutronIcon = getNeutronIcon(theme)

  if (walletBalancesLoading) {
    return (
      <div className='w-full lg:container mx-auto px-4 py-8'>
        <div className='text-center py-16'>
          <div className='max-w-md mx-auto space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
              <div className='w-8 h-8 bg-muted/40 rounded-full animate-pulse' />
            </div>
            <h3 className='text-lg font-bold text-foreground'>Loading Wallet Balances</h3>
            <p className='text-muted-foreground'>Fetching wallet balances...</p>
          </div>
        </div>
      </div>
    )
  }

  const { token, metrics, rawAmounts } = lstMarketData

  const availableToken = {
    denom: token.denom,
    amount: rawAmounts.balance,
  }
  const depositedToken = {
    denom: token.denom,
    amount: rawAmounts.deposited,
  }

  const handleDeposit = async () => {
    if (!computed.hasAmount()) return

    const market = markets?.find((m) => m.asset.symbol === token.symbol)
    if (!market) {
      console.error('Market not found for token:', token.symbol)
      return
    }

    await deposit({
      amount: state.depositAmount,
      denom: market.asset.denom,
      symbol: token.symbol,
      decimals: market.asset.decimals,
    })
    actions.resetAmounts()
    actions.setLastAction('deposit')
  }

  const handleWithdraw = async () => {
    if (!computed.hasAmount()) return

    const market = markets?.find((m) => m.asset.symbol === token.symbol)
    if (!market) {
      console.error('Market not found for token:', token.symbol)
      return
    }

    await withdraw({
      amount: state.withdrawAmount,
      denom: market.asset.denom,
      symbol: token.symbol,
      decimals: market.asset.decimals,
    })
    actions.resetAmounts()
    actions.setLastAction('withdraw')
  }

  const maxAmount = computed.isDepositing ? metrics.balance : metrics.deposited

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
        totalApy={metrics.totalApy}
        activeTab={state.activeTab}
        onTabChange={(value) => actions.setActiveTab(value)}
      />

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
        <div className='flex-1 space-y-4 order-2 lg:order-1'>
          {/* Balances Section */}
          <InfoCard title='Your Balances'>
            <div className='flex flex-col gap-2'>
              <BalanceRow
                icon={Coins}
                label='Deposited'
                coin={depositedToken}
                brandColor={token.brandColor}
                actionType={state.lastAction}
              />
              <BalanceRow
                icon={Wallet}
                label='Available in Wallet'
                coin={availableToken}
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
                  customIcon={token.icon}
                  label={'Amber Finance Yield'}
                  value={`~${metrics.lendingApy}`}
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
                  {/* Neutron Points */}
                  <MetricRow
                    customIcon={neutronIcon}
                    label='Neutron Points'
                    value=''
                    suffix=''
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
                value={currentTokenTvlData?.tvl_share ?? 0}
                label='TVL Share'
                subtitle={`${(currentTokenTvlData?.tvl_share ?? 0).toFixed(2)}% of platform deposits`}
                brandColor={token.brandColor}
              />
            </div>
          </InfoCard>

          {/* Protocol Details Section */}
          <InfoCard title='Protocol Details'>
            <div className='flex flex-wrap gap-2'>
              <MetricRow
                label='Total Value Locked'
                value={formatCompactCurrency(parseFloat(currentTokenTvlAmount))}
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
          <DepositForm
            token={token}
            currentAmount={computed.currentAmount.toString()}
            balance={
              computed.isDepositing ? metrics.balance.toString() : metrics.deposited.toString()
            }
            sliderPercentage={state.sliderPercentage}
            isDepositing={computed.isDepositing}
            isWalletConnected={isWalletConnected}
            isPending={isPending}
            hasAmount={computed.hasAmount()}
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
            <AssetActions tokenSymbol={token.symbol} tokenDenom={tokenData?.denom} />
          )}
        </div>
      </div>
    </div>
  )
}
