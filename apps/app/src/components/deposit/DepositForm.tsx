import { ArrowRight } from 'lucide-react'

import { InfoCard } from '@/components/deposit'
import { AmountInput } from '@/components/ui/AmountInput'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/slider'

interface DepositFormProps {
  token: {
    symbol: string
    brandColor: string
  }
  currentAmount: string
  usdValue: string
  balance: string
  sliderPercentage: number
  isDepositing: boolean
  isWalletConnected: boolean
  isPending: boolean
  hasAmount: boolean
  onAmountChange: (value: string) => void
  onSliderChange: (value: number[]) => void
  onConnect: () => void
  onDeposit: () => void
  onWithdraw: () => void
}

const getButtonContent = (
  isWalletConnected: boolean,
  isPending: boolean,
  isDepositing: boolean,
  tokenSymbol: string,
) => {
  if (!isWalletConnected) return 'Connect Wallet'

  if (isPending) {
    return (
      <>
        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2' />
        {isDepositing ? 'Depositing...' : 'Withdrawing...'}
      </>
    )
  }

  return (
    <>
      {isDepositing ? 'Deposit' : 'Withdraw'} {tokenSymbol}
      <ArrowRight className='w-4 h-4 ml-1' />
    </>
  )
}

export const DepositForm = ({
  token,
  currentAmount,
  usdValue,
  balance,
  sliderPercentage,
  isDepositing,
  isWalletConnected,
  isPending,
  hasAmount,
  onAmountChange,
  onSliderChange,
  onConnect,
  onDeposit,
  onWithdraw,
}: DepositFormProps) => {
  const onClick = () => {
    if (!isWalletConnected) return onConnect()
    if (isDepositing) return onDeposit()
    return onWithdraw()
  }

  return (
    <InfoCard title={isDepositing ? 'Deposit Amount' : 'Withdraw Amount'}>
      <div className='space-y-2'>
        <AmountInput
          value={currentAmount}
          onChange={(e) => onAmountChange(e.target.value)}
          token={token}
          usdValue={usdValue}
          balance={balance}
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
            onValueChange={onSliderChange}
            max={100}
            min={0}
            step={0.1}
            className='w-full'
            brandColor={token.brandColor}
          />
        </div>

        <Button
          variant='outline-gradient'
          gradientColor={token.brandColor}
          onClick={onClick}
          disabled={!isWalletConnected || isPending || !hasAmount}
          className='w-full'
        >
          {getButtonContent(isWalletConnected, isPending, isDepositing, token.symbol)}
        </Button>
      </div>
    </InfoCard>
  )
}
