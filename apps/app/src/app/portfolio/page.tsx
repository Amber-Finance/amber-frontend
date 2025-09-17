'use client'

import { useRouter } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'

import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/useActiveStrategies'
import { useUserDeposits } from '@/hooks/useUserDeposits'
import useUserPositions from '@/hooks/useUserPositions'

import { ActivePositionCard } from './ActivePositionCard'
import { DepositPositionCard } from './DepositPositionCard'

// import useWalletBalances from '@/hooks/useWalletBalances' // Available for future features

// Helper function to determine change type color
const getChangeTypeColor = (changeType: string): string => {
  if (changeType === 'positive') return 'text-green-500'
  if (changeType === 'negative') return 'text-red-500'
  if (changeType === 'neutral') return 'text-muted-foreground'
  return 'text-muted-foreground'
}

const Portfolio = () => {
  const router = useRouter()
  const { address, connect } = useChain(chainConfig.name)

  // Real data hooks
  const {
    activeStrategies,
    isLoading: strategiesLoading,
    isInitialLoading: strategiesInitialLoading,
    error: strategiesError,
  } = useActiveStrategies()

  const {
    deposits,
    totalValue: depositsValue,
    totalEarnings: depositsEarnings,
    isLoading: depositsLoading,
  } = useUserDeposits()

  // Ensure user positions are loaded (this hook manages the markets store)
  const { isLoading: positionsLoading } = useUserPositions()

  // Note: walletBalances currently unused but available for future features
  // const { data: walletBalances, isLoading: balancesLoading } = useWalletBalances()

  // Calculate totals from real data using proper position value calculation
  const totalStrategiesValue = activeStrategies.reduce((sum, strategy) => {
    // Position value = collateral - debt (net equity)
    const positionValue = strategy.collateralAsset.usdValue - strategy.debtAsset.usdValue
    return sum + Math.max(positionValue, 0) // Only count positive position values
  }, 0)

  const totalBorrowedValue = activeStrategies.reduce(
    (sum, strategy) => sum + strategy.debtAsset.usdValue,
    0,
  )

  const totalSuppliedValue = activeStrategies.reduce(
    (sum, strategy) => sum + strategy.collateralAsset.usdValue,
    0,
  )

  // Total assets = all deposits (from strategies) + all deposits (pure) + all strategies (equity)
  // This includes the full collateral value from strategies plus pure deposits
  const totalPortfolioValue = totalSuppliedValue + depositsValue

  // Calculate total PnL based on strategy performance and deposit earnings
  const totalPnL =
    activeStrategies.reduce((sum, strategy) => {
      const positionValue = Math.max(
        strategy.collateralAsset.usdValue - strategy.debtAsset.usdValue,
        0,
      )
      const netApy = strategy.netApy / 100
      const timeEstimate = 1 / 12 // Assume 1 month average
      const estimatedPnl = positionValue * netApy * timeEstimate
      return sum + estimatedPnl
    }, 0) + depositsEarnings

  // Calculate weighted APY based on position values
  const totalPositionValue = totalStrategiesValue + depositsValue
  const weightedApy =
    totalPositionValue > 0
      ? (activeStrategies.reduce((sum, strategy) => {
          const positionValue = Math.max(
            strategy.collateralAsset.usdValue - strategy.debtAsset.usdValue,
            0,
          )
          return sum + strategy.netApy * positionValue
        }, 0) +
          deposits.reduce((sum, deposit) => sum + deposit.apy * deposit.usdValue, 0)) /
        totalPositionValue
      : 0

  // Total active positions (strategies + deposits)
  const totalActivePositions = activeStrategies.length + deposits.length

  // Calculate P&L percentage
  const pnlPercentage = totalPositionValue > 0 ? (totalPnL / totalPositionValue) * 100 : 0

  // Helper functions for formatting
  const formatPercentage = (value: number) =>
    value === 0 ? '0.00%' : `${value >= 0 ? '+' : '-'}${value.toFixed(2)}%`
  const formatCurrency = (value: number) =>
    value === 0
      ? '$0.00'
      : `${value >= 0 ? '+' : '-'}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const getChangeType = (value: number) =>
    value === 0 ? 'neutral' : value >= 0 ? 'positive' : 'negative'

  const stats = [
    {
      title: 'Total Assets',
      value: `$${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: formatPercentage(pnlPercentage),
      changeType: getChangeType(pnlPercentage),
    },
    {
      title: 'Active Positions',
      value: `${totalActivePositions}`,
      change: `$${(totalStrategiesValue + depositsValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      changeType: 'neutral',
    },
    {
      title: 'Unrealized P&L',
      value: formatCurrency(totalPnL),
      change: formatPercentage(pnlPercentage),
      changeType: getChangeType(totalPnL),
    },
    {
      title: 'Weighted APY',
      value: formatPercentage(weightedApy),
      change: weightedApy === 0 ? '0.00%' : `${Math.abs(weightedApy).toFixed(2)}%`,
      changeType: getChangeType(weightedApy),
    },
  ]

  return (
    <>
      <Hero
        title={<AuroraText>Portfolio</AuroraText>}
        subtitle='Your Positions'
        description='Manage your active strategies and track your performance'
        stats={[
          {
            value: totalBorrowedValue,
            label: 'Total Borrow',
            isCurrency: true,
            prefix: '$',
            abbreviated: false,
          },
          {
            value: totalSuppliedValue + depositsValue,
            label: 'Total Supply',
            isCurrency: true,
            prefix: '$',
            abbreviated: false,
          },
        ]}
      />

      <div className='w-full py-6  px-4 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto'>
          {/* Portfolio Overview Stats */}
          <div className='grid grid-cols-1 gap-6 mb-16 md:grid-cols-2 lg:grid-cols-4'>
            {stats.map((stat, index) => {
              return (
                <Card
                  key={`stat-${stat.title}`}
                  className='group relative overflow-hidden bg-card/20 border border-border/50 backdrop-blur-xl transition-all duration-300 '
                >
                  <CardContent className=''>
                    <div className='space-y-2'>
                      <p className='text-xs text-muted-foreground uppercase tracking-wider font-medium'>
                        {stat.title}
                      </p>
                      <p className='text-2xl font-funnel font-bold text-foreground'>{stat.value}</p>
                      <p className={`text-sm font-medium ${getChangeTypeColor(stat.changeType)}`}>
                        {stat.change}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Active Strategies Section - Only show when wallet is connected */}
          {address && (
            <div className='mb-16'>
              {activeStrategies.length > 0 && (
                <div className='flex items-center justify-between mb-8'>
                  <div>
                    <h2 className='text-2xl font-funnel font-bold text-foreground mb-1'>
                      Active Strategies
                    </h2>
                    <p className='text-muted-foreground'>Leveraged yield optimization positions</p>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Badge
                      variant='secondary'
                      className='px-3 py-1 bg-foreground/10 text-foreground border-border/20 font-medium'
                    >
                      {activeStrategies.length} Position{activeStrategies.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {(strategiesLoading || strategiesInitialLoading) && (
                <div className='text-center py-12'>
                  <div className='max-w-md mx-auto space-y-3'>
                    <div className='w-12 h-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
                      <div className='w-6 h-6 bg-muted/40 rounded-full animate-pulse' />
                    </div>
                    <h3 className='text-base font-semibold text-foreground'>
                      Loading Positions...
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Fetching your active strategy positions...
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {strategiesError && (
                <div className='text-center py-12'>
                  <div className='max-w-md mx-auto space-y-3'>
                    <div className='w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center'>
                      <div className='w-6 h-6 bg-red-500/40 rounded-full' />
                    </div>
                    <h3 className='text-base font-semibold text-red-500'>
                      Error Loading Positions
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Failed to fetch your positions: {strategiesError}
                    </p>
                  </div>
                </div>
              )}

              {/* Strategy Cards */}
              {!strategiesLoading && !strategiesInitialLoading && !strategiesError && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20'>
                  {activeStrategies.length === 0 && deposits.length > 0 ? (
                    <div className='col-span-full'>
                      <div className='flex flex-col items-center justify-center py-12 px-8 text-center'>
                        <div className='space-y-4 max-w-lg mx-auto'>
                          {/* Title */}
                          <h3 className='text-xl font-funnel font-semibold text-foreground'>
                            <AuroraText>No Active Strategies</AuroraText>
                          </h3>

                          {/* Description */}
                          <p className='text-muted-foreground leading-relaxed'>
                            You don't have any active strategy positions yet. Deploy your first
                            strategy to start earning leveraged yield on your assets.
                          </p>

                          {/* Action Button */}
                          <div className='pt-2'>
                            <Button
                              variant='default'
                              size='lg'
                              onClick={() => router.push('/strategies')}
                              className='px-8'
                            >
                              View Strategies
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    activeStrategies.map((strategy, index) => (
                      <ActivePositionCard
                        key={strategy.accountId}
                        strategy={strategy}
                        index={index}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Show empty state when no positions and wallet not connected */}
          {!address && activeStrategies.length === 0 && deposits.length === 0 && (
            <div className='flex flex-col items-center justify-center py-20 px-8 text-center'>
              <div className='space-y-6 max-w-lg mx-auto'>
                {/* Title */}
                <h3 className='text-2xl font-funnel font-semibold text-foreground'>
                  <AuroraText>Connect Your Wallet</AuroraText>
                </h3>

                {/* Description */}
                <p className='text-muted-foreground leading-relaxed'>
                  Connect your wallet to view your active strategies and deposit positions, and
                  start earning yield on your assets.
                </p>

                {/* Action Button */}
                <div className='pt-2'>
                  <Button variant='default' size='lg' onClick={() => connect()} className='px-8'>
                    Connect Wallet
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Show empty state when wallet connected but no positions at all */}
          {address &&
            activeStrategies.length === 0 &&
            deposits.length === 0 &&
            !strategiesLoading &&
            !strategiesInitialLoading &&
            !depositsLoading &&
            !positionsLoading && (
              <div className='flex flex-col items-center justify-center py-20 px-8 text-center'>
                <div className='space-y-6 max-w-lg mx-auto'>
                  {/* Title */}
                  <h3 className='text-2xl font-funnel font-semibold text-foreground'>
                    <AuroraText>No Positions Found</AuroraText>
                  </h3>

                  {/* Description */}
                  <p className='text-muted-foreground leading-relaxed'>
                    You don't have any active strategies or deposit positions yet. Deploy your first
                    strategy or make a deposit to start earning yield on your assets.
                  </p>

                  {/* Action Buttons */}
                  <div className='pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center'>
                    <Button
                      variant='default'
                      size='lg'
                      onClick={() => router.push('/strategies')}
                      className='px-8'
                    >
                      View Strategies
                    </Button>
                    <Button
                      variant='outline'
                      size='lg'
                      onClick={() => router.push('/')}
                      className='px-8'
                    >
                      View Deposits
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* Fixed Yield Deposits Section - Only show when wallet is connected */}
          {address && (
            <div className='border-t border-border/20 pt-20'>
              {deposits.length > 0 && (
                <div className='flex items-center justify-between mb-12'>
                  <div>
                    <h2 className='text-2xl font-funnel font-bold text-foreground mb-2'>
                      Active Deposits
                    </h2>
                    <p className='text-muted-foreground font-medium'>
                      Traditional yield-bearing positions
                    </p>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Badge
                      variant='secondary'
                      className='px-4 py-2 bg-foreground/10 text-foreground border-border/20 font-medium'
                    >
                      {deposits.length} Position{deposits.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {(depositsLoading || positionsLoading) && (
                <div className='text-center py-12'>
                  <div className='max-w-md mx-auto space-y-3'>
                    <div className='w-12 h-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
                      <div className='w-6 h-6 bg-muted/40 rounded-full animate-pulse' />
                    </div>
                    <h3 className='text-base font-semibold text-foreground'>Loading Deposits...</h3>
                    <p className='text-sm text-muted-foreground'>
                      Fetching your deposit positions...
                    </p>
                  </div>
                </div>
              )}

              {/* Deposit Cards */}
              {!depositsLoading && !positionsLoading && (
                <div>
                  {deposits.length === 0 && activeStrategies.length > 0 ? (
                    <div className='flex flex-col items-center justify-center py-12 px-8 text-center'>
                      <div className='space-y-4 max-w-lg mx-auto'>
                        {/* Title */}
                        <h3 className='text-xl font-funnel font-semibold text-foreground'>
                          <AuroraText>No Active Deposits</AuroraText>
                        </h3>

                        {/* Description */}
                        <p className='text-muted-foreground leading-relaxed'>
                          You don't have any deposit positions yet. Make a deposit to start earning
                          traditional yield on your assets.
                        </p>

                        {/* Action Button */}
                        <div className='pt-2'>
                          <Button
                            variant='default'
                            size='lg'
                            onClick={() => router.push('/')}
                            className='px-8'
                          >
                            View Deposits
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : deposits.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                      {deposits.map((deposit, index) => (
                        <DepositPositionCard key={deposit.denom} deposit={deposit} index={index} />
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Portfolio
