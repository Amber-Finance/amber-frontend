'use client'

import Image from 'next/image'

import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'

interface StrategyHeaderProps {
  strategy: Strategy
  mode: 'deploy' | 'modify'
  activeStrategy?: any
  leveragedApy: number
  isLoading?: boolean
  currentLeverage?: number
  targetLeverage?: number
}

export function StrategyHeader({
  strategy,
  mode,
  activeStrategy,
  leveragedApy,
  isLoading = false,
  currentLeverage,
  targetLeverage,
}: StrategyHeaderProps) {
  const getTitle = () => {
    if (mode === 'deploy') return 'Deploy'
    if (mode === 'modify') return 'Adjust Leverage'
    return ''
  }

  const getDescription = () => {
    if (mode === 'deploy') {
      return `Supply ${strategy.collateralAsset.symbol}, borrow ${strategy.debtAsset.symbol}, leverage your position`
    }

    if (mode === 'modify' && currentLeverage && targetLeverage) {
      return `Modify your position leverage from ${currentLeverage.toFixed(2)}x to ${targetLeverage.toFixed(2)}x`
    }

    return `Modify your existing position leverage`
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className='relative mb-4 sm:mb-6 bg-card rounded-lg p-4 overflow-hidden'>
        <div className='absolute inset-0 z-10 w-full overflow-hidden'>
          <FlickeringGrid
            className='w-full h-full'
            color={strategy.debtAsset.brandColor}
            squareSize={8}
            gridGap={2}
            flickerChance={0.2}
            maxOpacity={0.2}
            gradientDirection='top-to-bottom'
            height={190}
          />
        </div>
        <div className='relative z-20'>
          <div className='flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-start gap-4 p-4'>
            <div className='flex items-center justify-start gap-3'>
              <div className='relative'>
                <div className='w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
                  <Image
                    src={strategy.collateralAsset.icon}
                    alt={strategy.collateralAsset.symbol}
                    fill
                    className='object-contain'
                  />
                </div>
                <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border/80 p-1'>
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={12}
                    height={12}
                    className='object-contain'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <div className='h-6 w-48 bg-muted/40 rounded animate-pulse' />
                <div className='h-4 w-64 bg-muted/40 rounded animate-pulse' />
              </div>
            </div>
            <div className='text-right space-y-2'>
              <div className='h-12 w-24 bg-muted/40 rounded animate-pulse' />
              <div className='h-3 w-16 bg-muted/40 rounded animate-pulse mx-auto' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative mb-4 sm:mb-6 bg-card rounded-lg p-4 overflow-hidden'>
      <div className='absolute inset-0 z-10 w-full overflow-hidden'>
        <FlickeringGrid
          className='w-full h-full'
          color={strategy.debtAsset.brandColor}
          squareSize={8}
          gridGap={2}
          flickerChance={0.2}
          maxOpacity={0.2}
          gradientDirection='top-to-bottom'
          height={190}
        />
      </div>

      <div className='relative z-20'>
        <div className='flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-start gap-4 p-4'>
          <div className='flex items-center justify-start gap-3'>
            <div className='relative'>
              <div className='w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  fill
                  className='object-contain'
                />
              </div>
              <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border/80 p-1'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  width={12}
                  height={12}
                  className='object-contain'
                />
              </div>
            </div>
            <div>
              <h2 className='text-base sm:text-xl font-bold text-foreground'>
                {getTitle()} {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol} Strategy
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground'>{getDescription()}</p>
            </div>
          </div>

          <div className='text-right'>
            <div
              className='text-4xl font-bold whitespace-nowrap'
              style={{ color: strategy.collateralAsset.brandColor }}
            >
              <CountingNumber
                value={isNaN(leveragedApy) ? 0 : leveragedApy * 100}
                decimalPlaces={2}
              />
              %
            </div>
            <p className='text-muted-foreground uppercase tracking-wider text-xs text-center font-medium mt-1'>
              Net APY
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
