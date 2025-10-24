'use client'

import { useCallback, useMemo } from 'react'

import { BigNumber } from 'bignumber.js'
import { AlertCircle } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { AmountInput } from '@/components/ui/AmountInput'
import { InfoAlert } from '@/components/ui/InfoAlert'
import useHealthComputer from '@/hooks/common/useHealthComputer'

interface DepositWithdrawAmountCardProps {
  strategy: Strategy
  activeStrategy?: ActiveStrategy
  // Deploy mode
  collateralAmount: string
  setCollateralAmount: (value: string) => void
  userBalance: number
  // Modify mode - deposit/withdraw
  depositWithdrawAmount?: string
  setDepositWithdrawAmount?: (value: string) => void
  depositWithdrawMode?: 'deposit' | 'withdraw'
  setDepositWithdrawMode?: (mode: 'deposit' | 'withdraw') => void
  // Active tab from header (to control title and hide internal tabs)
  activeTab?: 'deposit' | 'withdraw' | 'modify'
  // Display
  displayValues: {
    walletBalance: string
    usdValue: (amount: number) => string
  }
}

export function DepositWithdrawAmountCard({
  strategy,
  activeStrategy,
  collateralAmount,
  setCollateralAmount,
  userBalance,
  depositWithdrawAmount,
  setDepositWithdrawAmount,
  depositWithdrawMode = 'deposit',
  setDepositWithdrawMode,
  activeTab,
  displayValues,
}: DepositWithdrawAmountCardProps) {
  const isModifyMode = Boolean(activeStrategy)

  // Determine the title based on activeTab (from header) or mode
  const getCardTitle = () => {
    if (activeTab === 'deposit') return 'Deposit'
    if (activeTab === 'withdraw') return 'Withdraw'
    return 'Margin Collateral'
  }
  const cardTitle = getCardTitle()

  // Create positions for health computer when in modify mode
  const updatedPositions = useMemo(() => {
    if (!activeStrategy) return undefined
    return {
      account_kind: 'default' as const,
      account_id: activeStrategy.accountId,
      lends: [
        {
          denom: strategy.collateralAsset.denom,
          amount: activeStrategy.collateralAsset.amount,
        },
      ],
      debts: [
        {
          denom: strategy.debtAsset.denom,
          amount: activeStrategy.debtAsset.amount,
          shares: '0',
        },
      ],
      deposits: [],
      staked_astro_lps: [],
      perps: [],
      vaults: [],
    }
  }, [activeStrategy, strategy.collateralAsset.denom, strategy.debtAsset.denom])

  // Use health computer to calculate max withdraw amount
  const { computeMaxWithdrawAmount } = useHealthComputer(updatedPositions)

  // Calculate max withdraw using health computer
  const maxWithdrawFromHealthComputer = useMemo(() => {
    if (!activeStrategy || depositWithdrawMode !== 'withdraw') return 0
    const maxWithdrawRaw = computeMaxWithdrawAmount(strategy.collateralAsset.denom)
    return maxWithdrawRaw.shiftedBy(-(strategy.collateralAsset.decimals || 8)).toNumber()
  }, [activeStrategy, depositWithdrawMode, computeMaxWithdrawAmount, strategy.collateralAsset])

  // Calculate available supplies for withdraw (fallback if health computer fails)
  const availableSupplies = useMemo(() => {
    if (!activeStrategy) return 0
    return new BigNumber(activeStrategy.collateralAsset.amountFormatted)
      .minus(activeStrategy.debtAsset.amountFormatted)
      .toNumber()
  }, [activeStrategy])

  // For modify mode, show available based on tab from header
  const maxAmount = useMemo(() => {
    if (!isModifyMode) return userBalance
    // Use activeTab from header if available, otherwise fall back to depositWithdrawMode
    const currentMode = activeTab || depositWithdrawMode
    if (currentMode === 'deposit' || currentMode === 'modify') return userBalance
    // For withdraw, use health computer's max withdraw (safer)
    return maxWithdrawFromHealthComputer > 0 ? maxWithdrawFromHealthComputer : availableSupplies
  }, [
    isModifyMode,
    activeTab,
    depositWithdrawMode,
    userBalance,
    maxWithdrawFromHealthComputer,
    availableSupplies,
  ])

  // Check if user is trying to withdraw max amount (suggesting close position instead)
  const isWithdrawingMax = useMemo(() => {
    if (!isModifyMode || depositWithdrawMode !== 'withdraw' || !depositWithdrawAmount) return false
    const withdrawAmount = Number.parseFloat(depositWithdrawAmount || '0')
    const maxAllowed = Math.min(maxWithdrawFromHealthComputer, availableSupplies)
    // Within 1% of max
    return withdrawAmount >= maxAllowed * 0.99
  }, [
    isModifyMode,
    depositWithdrawMode,
    depositWithdrawAmount,
    maxWithdrawFromHealthComputer,
    availableSupplies,
  ])

  const formatBalance = useCallback(
    (value: number) => {
      return `${value.toFixed(8)} ${strategy.collateralAsset.symbol}`
    },
    [strategy.collateralAsset.symbol],
  )

  // Determine which amount/setter to use
  const currentAmount = isModifyMode ? depositWithdrawAmount || '' : collateralAmount
  const handleAmountChange = (() => {
    if (isModifyMode) {
      return setDepositWithdrawAmount || setCollateralAmount
    }
    return setCollateralAmount
  })()

  return (
    <InfoCard title={cardTitle}>
      <div className='space-y-2'>
        {/* Balance display */}
        <div className='flex justify-between items-center text-xs'>
          <span className='text-muted-foreground'>
            {(() => {
              // Use activeTab from header if available, otherwise fall back to depositWithdrawMode
              const currentMode = activeTab || depositWithdrawMode
              if (isModifyMode && currentMode === 'withdraw') {
                return 'Available to withdraw'
              }
              return 'Wallet balance'
            })()}
          </span>
          <span className='font-medium text-foreground'>{formatBalance(maxAmount)}</span>
        </div>

        {/* Amount input */}
        <AmountInput
          value={currentAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          token={{
            symbol: strategy.collateralAsset.symbol,
            brandColor: strategy.collateralAsset.brandColor || '#F7931A',
            denom: strategy.collateralAsset.denom,
          }}
          balance={maxAmount.toString()}
        />

        {/* Warning when withdrawing max amount */}
        {isWithdrawingMax && (
          <InfoAlert title='Consider Closing Position' variant='blue' className='mt-2'>
            <div className='flex items-start gap-2'>
              <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600' />
              <span className='text-xs'>
                You're withdrawing the maximum safe amount. Consider using the "Close Position"
                button to fully exit your strategy position instead.
              </span>
            </div>
          </InfoAlert>
        )}
      </div>
    </InfoCard>
  )
}
