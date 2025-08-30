import { formatCurrency } from '@/utils/format'
import { formatBalance } from '@/hooks/useStrategyCalculations'
import { ArrowRight, Wallet } from 'lucide-react'

const formatUsd = (usd: number): string => formatCurrency(usd, 2)

export const createDisplayValues = (
  isBalancesLoading: boolean,
  isWalletConnected: boolean,
  userBalance: number,
  strategy: Strategy,
  currentPrice: number,
  effectiveMaxBtcApy: number,
  debtBorrowApy: number,
) => {
  const getWalletBalance = (): string => {
    if (isBalancesLoading) return 'Loading...'
    if (!isWalletConnected) return 'N/A - Connect Wallet'
    if (userBalance > 0) return `${formatBalance(userBalance)} ${strategy.collateralAsset.symbol}`
    return `0.000000 ${strategy.collateralAsset.symbol}`
  }

  return {
    walletBalance: getWalletBalance(),
    usdValue: (amount: number) => (currentPrice > 0 ? formatUsd(amount * currentPrice) : 'N/A'),
    currentPrice: currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : 'N/A',
    supplyApy: effectiveMaxBtcApy > 0 ? `${effectiveMaxBtcApy.toFixed(2)}%` : 'N/A',
    borrowApy: debtBorrowApy > 0 ? `${(debtBorrowApy * 100).toFixed(2)}%` : 'N/A',
  }
}

export const createRiskStyles = () => ({
  colorClasses:
    'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-900/20 dark:border-emerald-700/40',
  textColor: 'text-emerald-600 dark:text-emerald-400',
  subtextColor: 'text-emerald-700/80 dark:text-emerald-400/80',
  description: 'Healthy positive spread',
})

export const createStrategyRiskStyles = (isCorrelated: boolean) => ({
  colorClasses: isCorrelated
    ? 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-900/20 dark:border-blue-700/30'
    : 'bg-amber-500/10 border-amber-500/20 dark:bg-amber-900/20 dark:border-amber-700/30',
  textColor: isCorrelated
    ? 'text-blue-700 dark:text-blue-400'
    : 'text-amber-700 dark:text-amber-400',
  subtextColor: isCorrelated
    ? 'text-blue-700/80 dark:text-blue-400/80'
    : 'text-amber-700/80 dark:text-amber-400/80',
})

export const CreateButtonContent = (
  isProcessing: boolean,
  isModifying: boolean,
  isWalletConnected: boolean,
  isBalancesLoading: boolean,
  hasInsufficientBalance: boolean,
  hasValidAmount: boolean,
) => {
  if (isProcessing) {
    return (
      <>
        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2' />
        {isModifying ? 'Modifying Position...' : 'Opening Position...'}
      </>
    )
  }
  if (!isWalletConnected) return <>Connect Wallet</>
  if (isBalancesLoading) return <>Loading Balance...</>
  if (hasInsufficientBalance) return <>Insufficient Balance</>
  if (!hasValidAmount) return <>Enter Amount</>

  return (
    <>
      {isModifying ? 'Modify Position' : 'Open Position'}
      <ArrowRight className='w-4 h-4 ml-2' />
    </>
  )
}
