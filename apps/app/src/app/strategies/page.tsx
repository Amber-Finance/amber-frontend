'use client'

import { Landmark, Coins } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/separator'
import { useMarkets, useLstMarkets } from '@/hooks'

export default function StrategiesPage() {
  // Get market data
  useMarkets()
  const { data: lstMarkets } = useLstMarkets()

  const strategies = [
    {
      id: 1,
      name: 'Conservative Yield',
      description: 'Low-risk strategy focusing on established LST protocols with stable yields',
      riskLevel: 'Low',
      targetApy: '2-5%',
      recommendedTokens: ['LBTC', 'uniBTC'],
      features: [
        'Established protocols',
        'Lower volatility',
        'Consistent yields',
        'High liquidity',
      ],
      color: 'emerald',
    },
    {
      id: 2,
      name: 'Balanced Growth',
      description: 'Moderate risk strategy diversifying across multiple LST protocols',
      riskLevel: 'Medium',
      targetApy: '4-8%',
      recommendedTokens: ['LBTC', 'solvBTC', 'uniBTC', 'wBTC'],
      features: [
        'Diversified exposure',
        'Balanced risk-reward',
        'Protocol diversification',
        'Regular rebalancing',
      ],
      color: 'blue',
    },
    {
      id: 3,
      name: 'High Yield Pursuit',
      description: 'Higher risk strategy targeting maximum yields from newer protocols',
      riskLevel: 'High',
      targetApy: '6-12%',
      recommendedTokens: ['FBTC', 'pumpBTC', 'eBTC'],
      features: [
        'Maximum yield potential',
        'Early protocol access',
        'Higher volatility',
        'Active management required',
      ],
      color: 'orange',
    },
  ]

  const getMarketInfo = (symbol: string) => {
    return lstMarkets.find((market) => market.token.symbol === symbol)
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'Medium':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'High':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className='w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 pt-28 pb-12'>
      <div className='space-y-8'>
        {/* Header Section */}
        <div className='text-center space-y-4'>
          <h1 className='text-3xl sm:text-4xl font-bold text-foreground'>
            Yield Farming Strategies
          </h1>
          <p className='text-base text-muted-foreground max-w-2xl mx-auto'>
            Discover curated strategies to maximize your Bitcoin yields. Each strategy is designed
            for different risk appetites and helps you enter yield farming with your LSTs.
          </p>
        </div>

        {/* Strategy Cards */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className='p-5 space-y-5 border-2 hover:border-primary/20 transition-colors'
            >
              {/* Strategy Header */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl font-bold text-foreground'>{strategy.name}</h3>
                  <Badge className={getRiskBadgeColor(strategy.riskLevel)}>
                    {strategy.riskLevel} Risk
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground'>{strategy.description}</p>
                <div className='text-xl font-bold text-primary'>{strategy.targetApy}</div>
              </div>

              <Separator />

              {/* Recommended Tokens */}
              <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-foreground'>Recommended Tokens</h4>
                <div className='space-y-2'>
                  {strategy.recommendedTokens.map((symbol) => {
                    const marketInfo = getMarketInfo(symbol)
                    if (!marketInfo) return null

                    return (
                      <div
                        key={symbol}
                        className='flex items-center justify-between p-2 rounded-lg bg-muted/20'
                      >
                        <div className='flex items-center gap-2'>
                          <img
                            src={marketInfo.token.icon}
                            alt={symbol}
                            className='w-6 h-6 rounded-full'
                          />
                          <div>
                            <div className='text-sm font-medium'>{symbol}</div>
                            <div className='text-xs text-muted-foreground'>
                              {marketInfo.token.protocol}
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-sm font-semibold text-primary'>
                            {marketInfo.metrics.totalApy.toFixed(2)}%
                          </div>
                          <div className='text-xs text-muted-foreground'>Total APY</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Strategy Features */}
              <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-foreground'>Key Features</h4>
                <ul className='space-y-1'>
                  {strategy.features.map((feature, index) => (
                    <li
                      key={index}
                      className='flex items-center gap-2 text-xs text-muted-foreground'
                    >
                      <div className='w-1 h-1 rounded-full bg-primary flex-shrink-0' />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className='flex gap-2'>
                <Button className='flex-1 py-2 px-3 bg-primary hover:bg-primary/90 text-foreground rounded-lg text-xs font-medium transition-colors'>
                  <span className='flex items-center gap-1.5'>
                    <Landmark className='w-3 h-3' />
                    Bridge
                  </span>
                </Button>
                <Button className='flex-1 py-2 px-3 border border-border/50 hover:border-border hover:bg-muted/50 bg-background rounded-lg text-xs font-medium transition-colors'>
                  <span className='flex items-center gap-1.5 text-foreground'>
                    <Coins className='w-3 h-3' />
                    Deposit
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className='bg-muted/20 rounded-xl p-6 space-y-5'>
          <h2 className='text-xl font-bold text-center text-foreground'>Strategy Guidelines</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            <div className='text-center space-y-2'>
              <div className='text-3xl'>🎯</div>
              <h3 className='text-sm font-semibold'>Risk Assessment</h3>
              <p className='text-xs text-muted-foreground'>
                Understand your risk tolerance before choosing a strategy
              </p>
            </div>
            <div className='text-center space-y-2'>
              <div className='text-3xl'>🔄</div>
              <h3 className='text-sm font-semibold'>Diversification</h3>
              <p className='text-xs text-muted-foreground'>
                Spread investments across multiple protocols and tokens
              </p>
            </div>
            <div className='text-center space-y-2'>
              <div className='text-3xl'>📈</div>
              <h3 className='text-sm font-semibold'>Monitor Performance</h3>
              <p className='text-xs text-muted-foreground'>
                Regularly review and adjust your strategy as needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
