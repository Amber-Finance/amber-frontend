'use client'

import { useRouter } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'

import { ActiveDepositCard } from '@/app/portfolio/ActiveDepositCard'
import { ActiveStrategyCard } from '@/app/portfolio/ActiveStrategyCard'
import Hero from '@/components/layout/Hero'
import { WalletBalances } from '@/components/portfolio/WalletBalances'
import { AuroraText } from '@/components/ui/AuroraText'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import {
  SkeletonDepositCard,
  SkeletonStatsCard,
  SkeletonStrategyCard,
} from '@/components/ui/SkeletonCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import chainConfig from '@/config/chain'
import { useActiveStrategies, useDeposits, usePortfolioPositions } from '@/hooks/portfolio'

const Portfolio = () => {
  const router = useRouter()
  const { address, connect } = useChain(chainConfig.name)

  // Get all data from Zustand (populated by PortfolioDataManager)
  const portfolioPositions = usePortfolioPositions()
  const deposits = useDeposits()
  const activeStrategies = useActiveStrategies()

  // Calculate loading state - if no data yet and wallet connected, show loading
  const isLoading = !portfolioPositions && !!address

  // Calculate totals from raw positions data (API returns strings)
  const parseTotalValue = (value: string | undefined | null): number => {
    if (!value) return 0
    const parsed = parseFloat(String(value))
    return !isNaN(parsed) && isFinite(parsed) ? parsed : 0
  }

  const totalBorrows = parseTotalValue(portfolioPositions?.total_borrows)
  const totalSupplies = parseTotalValue(portfolioPositions?.total_supplies)
  const depositsValue = (deposits || []).reduce((sum, deposit) => sum + (deposit.usdValue || 0), 0)
  const depositsEarnings = (deposits || []).reduce(
    (sum, deposit) => sum + (deposit.actualPnl || 0),
    0,
  )

  // Calculate totals from real data using proper position value calculation
  const totalStrategiesValue = (activeStrategies || []).reduce((sum, strategy) => {
    // Position value = collateral - debt (net equity)
    const positionValue =
      (strategy.collateralAsset?.usdValue || 0) - (strategy.debtAsset?.usdValue || 0)
    return sum + Math.max(positionValue, 0) // Only count positive position values
  }, 0)

  // Use the pre-calculated USD values from the API
  const totalBorrowedValue = totalBorrows
  const totalSuppliedValue = totalSupplies

  // Total assets = total_supplies - total_borrows (API provides aggregated values)
  // This represents net equity: all collateral minus all debt
  const totalPortfolioValueCalc = (totalSupplies || 0) - (totalBorrows || 0)
  const totalPortfolioValue =
    !isNaN(totalPortfolioValueCalc) && isFinite(totalPortfolioValueCalc)
      ? totalPortfolioValueCalc
      : 0

  // Calculate total PnL using actual P&L from strategies and estimated earnings from deposits
  const totalPnLRaw =
    (activeStrategies || []).reduce((sum, strategy) => {
      // Use actual P&L calculated from initial_deposit
      return sum + (strategy.actualPnl || 0)
    }, 0) + (depositsEarnings || 0)

  const totalPnL = !isNaN(totalPnLRaw) ? totalPnLRaw : 0

  // Calculate weighted APY based on position values
  const totalPositionValue = (totalStrategiesValue || 0) + (depositsValue || 0)
  const weightedApyRaw =
    totalPositionValue > 0
      ? ((activeStrategies || []).reduce((sum, strategy) => {
          const positionValue = Math.max(
            (strategy.collateralAsset?.usdValue || 0) - (strategy.debtAsset?.usdValue || 0),
            0,
          )
          return sum + (strategy.netApy || 0) * positionValue
        }, 0) +
          (deposits || []).reduce(
            (sum, deposit) => sum + (deposit.apy || 0) * (deposit.usdValue || 0),
            0,
          )) /
        totalPositionValue
      : 0

  const weightedApy = !isNaN(weightedApyRaw) ? weightedApyRaw : 0

  const stats = [
    {
      title: 'Total Equity',
      value: totalPortfolioValue || 0,
      prefix: '$ ',
    },
    {
      title: 'Strategies Equity',
      value: (activeStrategies || []).reduce(
        (sum, strategy) => sum + (strategy.supply?.usdValue || 0),
        0,
      ),
      prefix: '$ ',
    },
    {
      title: 'Deposits Equity',
      value: (deposits || []).reduce((sum, deposit) => sum + (deposit.usdValue || 0), 0),
      prefix: '$ ',
    },
    {
      title: 'Unrealized P&L',
      value: totalPnL || 0,
      prefix: '$ ',
    },
    {
      title: 'Weighted APY',
      value: weightedApy,
      suffix: ' %',
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
            prefix: '$ ',
          },
          {
            value: totalSuppliedValue,
            label: 'Total Supply',
            isCurrency: true,
            prefix: '$ ',
          },
        ]}
      />

      {/* Wallet Balances Section */}
      <WalletBalances />

      <div className='w-full py-6  px-4 sm:px-6 lg:px-8'>
        <div className='w-full mx-auto'>
          {/* Portfolio Overview Stats */}
          <div className='grid grid-cols-1 gap-6 mb-16 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
            {isLoading && !portfolioPositions
              ? // Show skeleton loading
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonStatsCard key={`skeleton-stat-${i + 1}`} />
                ))
              : stats.map((stat, index) => {
                  return (
                    <Card
                      key={`stat-${stat.title}`}
                      className='group relative overflow-hidden bg-card border border-border/50 backdrop-blur-xl transition-all duration-300 '
                    >
                      <CardContent className=''>
                        <div className='space-y-2'>
                          <p className='text-xs text-muted-foreground uppercase tracking-wider font-medium'>
                            {stat.title}
                          </p>
                          <div className='flex flex-row items-center gap-1 text-base font-funnel sm:text-lg lg:text-2xl text-foreground transition-transform duration-300'>
                            {stat.prefix && <span className='text-primary'>{stat.prefix}</span>}
                            <CountingNumber
                              value={Number(stat.value)}
                              decimalPlaces={stat.prefix || stat.suffix ? 2 : 0}
                            />
                            {stat.suffix && <span className='text-primary'>{stat.suffix}</span>}
                          </div>
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
              {isLoading && !portfolioPositions && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonStrategyCard key={`skeleton-strategy-${i + 1}`} />
                  ))}
                </div>
              )}

              {/* Strategy Cards */}
              {!isLoading && portfolioPositions && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20'>
                  {activeStrategies.length === 0 && deposits.length > 0 ? (
                    <div className='col-span-full'>
                      <div className='flex flex-col items-center justify-center py-12 px-8 text-center'>
                        <div className='space-y-4 max-w-lg mx-auto'>
                          {/* Title */}
                          <h3 className='text-xl font-funnel font-semibold text-foreground'>
                            <span className='text-foreground text-md'>No Active Strategies</span>
                          </h3>

                          {/* Description */}
                          <p className='text-foreground/70 leading-relaxed'>
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
                      <ActiveStrategyCard
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
                  <span className='text-foreground text-md'>Connect Your Wallet</span>
                </h3>

                {/* Description */}
                <p className='text-foreground/70 leading-relaxed'>
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
            !isLoading &&
            portfolioPositions && (
              <div className='flex flex-col items-center justify-center py-20 px-8 text-center'>
                <div className='space-y-6 max-w-lg mx-auto'>
                  {/* Title */}
                  <h3 className='text-2xl font-funnel font-semibold text-foreground'>
                    <span className='text-foreground text-md'>No Positions Found</span>
                  </h3>

                  {/* Description */}
                  <p className='text-foreground/70 leading-relaxed'>
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
                    <p className='text-foreground/80 font-medium'>
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
              {isLoading && !portfolioPositions && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonDepositCard key={`skeleton-deposit-${i + 1}`} />
                  ))}
                </div>
              )}

              {/* Deposit Cards */}
              {!isLoading && portfolioPositions && (
                <div>
                  {(() => {
                    if (deposits.length === 0 && activeStrategies.length > 0) {
                      return (
                        <div className='flex flex-col items-center justify-center py-12 px-8 text-center'>
                          <div className='space-y-4 max-w-lg mx-auto'>
                            {/* Title */}
                            <h3 className='text-xl font-funnel font-semibold text-foreground'>
                              <span className='text-foreground text-md'>No Active Deposits</span>
                            </h3>

                            {/* Description */}
                            <p className='text-foreground/70 leading-relaxed'>
                              You don't have any deposit positions yet. Make a deposit to start
                              earning traditional yield on your assets.
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
                      )
                    }

                    if (deposits.length > 0) {
                      return (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                          {deposits.map((deposit, index) => (
                            <ActiveDepositCard
                              key={deposit.denom}
                              deposit={deposit}
                              index={index}
                            />
                          ))}
                        </div>
                      )
                    }

                    return null
                  })()}
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
