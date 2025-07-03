'use client'

import { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { ArrowLeft, ArrowRight, Info, RotateCcw, Target, TrendingUp, Wallet } from 'lucide-react'

import { StrategyFlow } from '@/app/strategies/deploy/StrategyFlow'
import { AmountInput } from '@/components/ui/AmountInput'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/utils/format'

interface StrategyDeployClientProps {
  strategy: Strategy
}

export default function StrategyDeployClient({ strategy }: StrategyDeployClientProps) {
  const router = useRouter()
  const [collateralAmount, setCollateralAmount] = useState('')
  const [multiplier, setMultiplier] = useState(1.5)
  const [isProcessing, setIsProcessing] = useState(false)

  const formatBalance = (balance: number) => {
    if (balance <= 0) return '0.000000'
    return balance.toFixed(6)
  }

  const formatUsd = (usd: number) => formatCurrency(usd, 2)

  const handleDeploy = async () => {
    console.log(
      `Deploying strategy: ${collateralAmount} ${strategy.collateralAsset.symbol} at ${multiplier}x leverage`,
    )
    setIsProcessing(true)
    // Simulate deployment
    setTimeout(() => setIsProcessing(false), 3000)
  }

  const handleMultiplierChange = (value: number[]) => {
    setMultiplier(value[0])
  }

  const currentAmount = parseFloat(collateralAmount || '0')
  const borrowAmount = currentAmount * (multiplier - 1)
  const totalPosition = currentAmount * multiplier

  // Dynamic APY calculation based on multiplier (using strategy prop data)
  const collateralTotalApy = strategy.collateralTotalApy || strategy.supplyApy || 0
  const debtBorrowApy = strategy.borrowApy || 0
  const leveragedApy = multiplier * collateralTotalApy - (multiplier - 1) * debtBorrowApy

  // Calculate estimated annual earnings properly (convert from decimal to amount)
  const estimatedYearlyEarnings = currentAmount * leveragedApy

  const liquidationPrice = 95000 * (1 - 1 / multiplier + 0.05) // Simplified calculation
  const currentPrice = 95000 // Mock current BTC price

  // Mock user balance data
  const userBalance = 10.5
  const userBalanceUsd = 103000

  return (
    <div className='w-full max-w-7xl mx-auto px-4 py-4'>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-3'
      >
        <ArrowLeft className='w-4 h-4' />
        Back to Strategies
      </button>

      {/* Header with FlickeringGrid */}
      <div className='relative mb-4'>
        <div className='absolute inset-0 z-10 w-full overflow-hidden rounded-lg'>
          <FlickeringGrid
            className='w-full h-full'
            color={strategy.collateralAsset.brandColor}
            squareSize={8}
            gridGap={2}
            flickerChance={0.2}
            maxOpacity={0.2}
            gradientDirection='top-to-bottom'
            height={80}
          />
        </div>

        <div className='relative z-20 p-3 rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm'>
          <div className='flex justify-between items-start'>
            <div className='flex items-center gap-3'>
              {/* Token Icons */}
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
                <h1 className='text-lg font-semibold text-foreground'>
                  {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol} Strategy
                </h1>
                <p className='text-xs text-muted-foreground'>
                  Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol},
                  leverage your position
                </p>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-lg font-semibold text-accent-foreground'>
                <CountingNumber value={leveragedApy * 100} decimalPlaces={2} />%
              </div>
              <div className='text-xs text-muted-foreground'>Current APY</div>
            </div>
          </div>

          {/* Strategy Type */}
          <div className='mt-2'>
            <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
              <Target className='w-3 h-3 text-accent-foreground' />
              Multiply Strategy
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Left Column - Strategy Input */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Margin Collateral Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                <Wallet className='w-4 h-4 text-accent-foreground' />
                Margin Collateral
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Wallet balance</span>
                <span className='font-medium text-foreground'>
                  {formatBalance(userBalance)} {strategy.collateralAsset.symbol}
                </span>
              </div>

              <AmountInput
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                token={{
                  symbol: strategy.collateralAsset.symbol,
                  brandColor: strategy.collateralAsset.brandColor || '#F7931A',
                }}
                usdValue={formatUsd((currentAmount || 0) * (userBalanceUsd / userBalance))}
                balance={userBalance.toString()}
              />

              <Separator />

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs font-medium text-foreground'>Multiplier</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-accent-foreground'>
                      {multiplier.toFixed(2)}x
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='text-xs'>Leverage multiplier for your position</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Slider
                  value={[multiplier]}
                  onValueChange={handleMultiplierChange}
                  max={strategy.maxLeverage || 5}
                  min={1}
                  step={0.1}
                  className='w-full'
                  brandColor={strategy.collateralAsset.brandColor || '#F7931A'}
                />

                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>1.0x</span>
                  <span>Max {(strategy.maxLeverage || 5).toFixed(1)}x</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Overview Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                <Target className='w-4 h-4 text-accent-foreground' />
                Position Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-2'>
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Current price</span>
                      <span className='font-medium text-foreground'>
                        ${currentPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Liquidation price</span>
                      <span className='font-medium text-orange-600 dark:text-orange-400'>
                        ${liquidationPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-1'>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Long exposure</span>
                      <div className='text-right'>
                        <div className='font-medium text-foreground'>
                          {totalPosition.toFixed(6)} {strategy.collateralAsset.symbol}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          ~{formatUsd(totalPosition * (userBalanceUsd / userBalance))}
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Short exposure</span>
                      <div className='text-right'>
                        <div className='font-medium text-foreground'>
                          {borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          ~{formatUsd(borrowAmount * (userBalanceUsd / userBalance))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 dark:bg-emerald-900/20 dark:border-emerald-700/30'>
                    <div className='text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1'>
                      Est. Annual Earnings
                    </div>
                    <div className='font-semibold text-emerald-600 dark:text-emerald-300 text-sm'>
                      {estimatedYearlyEarnings.toFixed(6)} {strategy.collateralAsset.symbol}
                    </div>
                    <div className='text-xs text-emerald-600/80 dark:text-emerald-400/80'>
                      ~{formatUsd(estimatedYearlyEarnings * (userBalanceUsd / userBalance))}
                    </div>
                  </div>

                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>ROE</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className='font-medium text-foreground cursor-help'>0.00%</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='text-xs'>Current return on equity based on price change</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Your LTV (LLTV)</span>
                      <span className='font-medium text-foreground'>∞ (-%)</span>
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Your health</span>
                      <span className='font-medium text-foreground'>-</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Flow Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                <RotateCcw className='w-4 h-4 text-muted-foreground' />
                Strategy Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <StrategyFlow />

                {/* Flow Explanations */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-2 text-xs'>
                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <Wallet className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>1. Deposit</div>
                    <div className='text-muted-foreground text-xs'>
                      Supply {strategy.collateralAsset.symbol} as collateral to the protocol
                    </div>
                  </div>

                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <ArrowRight className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>2. Borrow</div>
                    <div className='text-muted-foreground text-xs'>
                      Borrow {strategy.debtAsset.symbol} against your{' '}
                      {strategy.collateralAsset.symbol} collateral
                    </div>
                  </div>

                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <RotateCcw className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>3. Swap</div>
                    <div className='text-muted-foreground text-xs'>
                      Swap borrowed {strategy.debtAsset.symbol} for more{' '}
                      {strategy.collateralAsset.symbol}
                    </div>
                  </div>

                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <TrendingUp className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>4. Re-deposit</div>
                    <div className='text-muted-foreground text-xs'>
                      Supply new {strategy.collateralAsset.symbol} to multiply your position
                    </div>
                  </div>
                </div>

                {/* Strategy Summary */}
                <div className='p-2 rounded-lg bg-muted/20 border border-border/50'>
                  <div className='text-xs text-muted-foreground'>
                    <strong className='text-foreground'>How it works:</strong> This strategy
                    leverages your {strategy.collateralAsset.symbol} position by borrowing{' '}
                    {strategy.debtAsset.symbol} and swapping it for more{' '}
                    {strategy.collateralAsset.symbol}. The cycle repeats until you reach your target
                    leverage multiplier, amplifying both potential gains and risks.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Market Details */}
        <div className='space-y-4'>
          {/* Market Info Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='text-sm font-semibold'>Market</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Image
                    src={strategy.collateralAsset.icon}
                    alt={strategy.collateralAsset.symbol}
                    width={16}
                    height={16}
                  />
                  <span className='font-medium text-foreground text-sm'>
                    {strategy.collateralAsset.symbol}
                  </span>
                </div>

                <div className='space-y-1 text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Supply APY</span>
                    <span className='font-medium text-accent-foreground'>
                      {((strategy.supplyApy || 0) * 100).toFixed(2)}%
                    </span>
                  </div>

                  {strategy.collateralStakingApy && strategy.collateralStakingApy > 0 && (
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Staking APY</span>
                      <span className='font-medium text-accent-foreground'>
                        {(strategy.collateralStakingApy * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground font-medium'>Total APY</span>
                    <span className='font-semibold text-accent-foreground'>
                      {(collateralTotalApy * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={16}
                    height={16}
                  />
                  <span className='font-medium text-foreground text-sm'>
                    {strategy.debtAsset.symbol}
                  </span>
                </div>

                <div className='space-y-1 text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Borrow APY</span>
                    <span className='font-medium text-orange-600 dark:text-orange-400'>
                      {((strategy.borrowApy || 0) * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Available</span>
                    <span className='font-medium text-foreground'>
                      {strategy.liquidityDisplay || '$0'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Metrics Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                <Info className='w-4 h-4 text-muted-foreground' />
                Risk Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-1 text-xs'>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Max LTV</span>
                <span className='font-medium text-foreground'>
                  {strategy.ltv ? `${(strategy.ltv * 100).toFixed(0)}%` : '80%'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Liquidation Threshold</span>
                <span className='font-medium text-foreground'>
                  {strategy.liquidationThreshold
                    ? `${(strategy.liquidationThreshold * 100).toFixed(0)}%`
                    : '85%'}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Max Leverage</span>
                <span className='font-medium text-foreground'>
                  {(strategy.maxLeverage || 5).toFixed(1)}x
                </span>
              </div>

              <Separator />

              <div className='p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 dark:bg-amber-900/20 dark:border-amber-700/30'>
                <div className='text-amber-700 dark:text-amber-400 font-medium text-xs mb-1'>
                  Risk Warning
                </div>
                <div className='text-amber-700/80 dark:text-amber-400/80 text-xs'>
                  Leveraged positions amplify both gains and losses. Monitor your position
                  carefully.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Position Button */}
          <div className='relative group/button'>
            <div
              className='absolute inset-0 rounded-lg blur-md opacity-0 group-hover/button:opacity-50 transition-all duration-500 scale-105'
              style={{
                background: `linear-gradient(135deg, ${strategy.collateralAsset.brandColor}, ${strategy.debtAsset.brandColor})`,
              }}
            />
            <div
              className='relative p-[2px] rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out'
              style={{
                background: `linear-gradient(135deg, ${strategy.collateralAsset.brandColor}, ${strategy.debtAsset.brandColor})`,
              }}
            >
              <Button
                onClick={handleDeploy}
                disabled={isProcessing || !collateralAmount || currentAmount <= 0}
                variant='outline'
                className='relative w-full font-semibold text-foreground border-0 bg-card hover:bg-background/90 transition-all duration-300 ease-out overflow-hidden group/btn rounded-md'
              >
                <div
                  className='absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700'
                  style={{
                    background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)`,
                    transform: 'translateX(-100%)',
                  }}
                />
                <span className='relative z-10 flex items-center gap-2 text-xs'>
                  {isProcessing ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Opening Position...
                    </>
                  ) : (
                    <>
                      Open Position
                      <ArrowRight className='w-4 h-4' />
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
