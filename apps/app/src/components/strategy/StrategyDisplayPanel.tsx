'use client'

import { StrategyChart } from '@/components/strategies/StrategyChart'
import { ExistingPositionOverviewCard } from '@/components/strategy/ExistingPositionOverviewCard'
import { StrategyFlowCard } from '@/components/strategy/StrategyFlowCard'
import { StrategyPointsCard } from '@/components/strategy/StrategyPointsCard'

interface StrategyDisplayPanelProps {
  strategy: Strategy
  mode: 'deploy' | 'modify'
  activeStrategy?: any
  displayValues: any
  positionCalcs: any
  marketData: any
  collateralSupplyApy: number
  debtBorrowApy: number
  getEstimatedEarningsUsd: () => string
  healthFactor: number
  existingHealthFactor?: number // For ExistingPositionOverviewCard in modify mode
  currentAmount: number
  multiplier: number
  isLoading?: boolean
}

export function StrategyDisplayPanel({
  strategy,
  mode,
  activeStrategy,
  displayValues,
  positionCalcs,
  marketData,
  collateralSupplyApy,
  debtBorrowApy,
  getEstimatedEarningsUsd,
  healthFactor,
  existingHealthFactor,
  currentAmount,
  multiplier,
  isLoading = false,
}: StrategyDisplayPanelProps) {
  // Loading skeleton component
  const CardSkeleton = ({ className = '' }: { className?: string }) => (
    <div className={`bg-card rounded-lg border border-border/20 p-4 space-y-4 ${className}`}>
      <div className='h-6 w-32 bg-muted/40 rounded animate-pulse' />
      <div className='space-y-3'>
        <div className='h-4 w-full bg-muted/40 rounded animate-pulse' />
        <div className='h-4 w-3/4 bg-muted/40 rounded animate-pulse' />
        <div className='h-4 w-1/2 bg-muted/40 rounded animate-pulse' />
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className='flex-1 space-y-4 order-2 lg:order-1'>
        <CardSkeleton className='h-48' />
        <CardSkeleton className='h-96' />
        <CardSkeleton className='h-64' />
      </div>
    )
  }

  return (
    <div className='flex-1 space-y-4 order-2 lg:order-1'>
      {/* Only show ExistingPositionOverviewCard in modify mode when there's an active strategy */}
      {mode === 'modify' && activeStrategy && (
        <ExistingPositionOverviewCard
          strategy={strategy}
          activeStrategy={activeStrategy}
          displayValues={displayValues}
          positionCalcs={positionCalcs}
          getEstimatedEarningsUsd={getEstimatedEarningsUsd}
          healthFactor={existingHealthFactor || healthFactor}
          marketData={marketData}
        />
      )}

      <StrategyChart
        denom={strategy.debtAsset.denom}
        symbol={strategy.debtAsset.symbol}
        brandColor={strategy.debtAsset.brandColor}
        supplyApy={collateralSupplyApy}
        currentBorrowApy={debtBorrowApy}
        className='w-[494px] h-[350px]'
      />

      <StrategyPointsCard strategy={strategy} />

      <StrategyFlowCard
        strategy={strategy}
        activeStrategy={activeStrategy}
        currentAmount={currentAmount}
        multiplier={multiplier}
        positionCalcs={positionCalcs}
        marketData={marketData}
        collateralSupplyApy={collateralSupplyApy}
        debtBorrowApy={debtBorrowApy}
      />
    </div>
  )
}
