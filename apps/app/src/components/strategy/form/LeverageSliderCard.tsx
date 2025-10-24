'use client'

import Image from 'next/image'

import { AlertTriangle } from 'lucide-react'

import TokenBalance from '@/components/common/TokenBalance'
import { InfoCard } from '@/components/deposit'
import { getLeverageWarning } from '@/components/strategy/helpers'
import { InfoAlert } from '@/components/ui/InfoAlert'
import { Separator } from '@/components/ui/separator'

interface LeverageSliderCardProps {
  strategy: Strategy
  leverageSliderComponent?: React.ReactNode
  currentAmount: number
  positionCalcs: {
    totalPosition: number
  }
  marketData?: {
    debtMarket?: any
  }
  disabled?: boolean
}

export function LeverageSliderCard({
  strategy,
  leverageSliderComponent,
  currentAmount,
  positionCalcs,
  marketData,
  disabled = false,
}: LeverageSliderCardProps) {
  // Create debt coin for TokenBalance component
  const debtCoin: Coin = {
    denom: strategy.debtAsset.denom,
    amount: marketData?.debtMarket?.metrics?.collateral_total_amount || '0',
  }

  return (
    <InfoCard title='Leverage'>
      <div className='space-y-2'>
        {/* Available Debt Section */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold text-foreground'>Available Debt</span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-xs text-muted-foreground flex items-center gap-2'>
              <Image
                src={strategy.debtAsset.icon}
                alt={strategy.debtAsset.symbol}
                width={20}
                height={20}
                unoptimized={true}
              />
              <span className='text-sm font-medium text-foreground'>
                {strategy.debtAsset.symbol}
              </span>
            </span>
            <TokenBalance
              coin={debtCoin}
              size='md'
              align='right'
              className='flex flex-col justify-end items-end'
            />
          </div>
        </div>

        <Separator />

        {/* Leverage Slider */}
        {leverageSliderComponent && (
          <div className={`space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {leverageSliderComponent}
            {disabled && (
              <p className='text-xs text-muted-foreground text-center'>
                Leverage adjustment disabled while deposit/withdraw amount is set
              </p>
            )}
          </div>
        )}

        {/* Leverage Warning */}
        {(() => {
          const currentLeverage =
            currentAmount > 0 ? positionCalcs.totalPosition / currentAmount : 0
          const leverageWarning = getLeverageWarning(currentLeverage, strategy.maxLeverage)
          if (!leverageWarning) return null

          return (
            <InfoAlert title='HIGH LEVERAGE WARNING' variant='yellow' className='mt-2'>
              <div className='flex items-center justify-start gap-2'>
                <AlertTriangle className='h-4 w-4 flex-shrink-0 text-yellow-600' />
                <span>{leverageWarning.message}</span>
              </div>
            </InfoAlert>
          )
        })()}
      </div>
    </InfoCard>
  )
}
