import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'

import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DepositHeaderProps {
  token: {
    symbol: string
    icon: string
    protocol: string
    brandColor: string
  }
  totalApy: number
  activeTab: 'deposit' | 'withdraw'
  onTabChange: (value: 'deposit' | 'withdraw') => void
}

// Helper component for asset stats link
const AssetStatsLink = ({
  symbol,
  label,
  icon,
}: {
  symbol: string
  label: string
  icon: string
}) => (
  <Link
    href={`https://stats.amberfi.io/?token=${symbol}`}
    target='_blank'
    rel='noopener noreferrer'
    className='inline-flex items-center gap-1.5 px-2 py-1 text-[10px] sm:text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md transition-all duration-200 group'
  >
    <div className='relative w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0'>
      <Image src={icon} alt={symbol} fill sizes='16px' className='object-contain' />
    </div>
    <span>{label}</span>
    <ExternalLink className='w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 group-hover:opacity-100' />
  </Link>
)

export const DepositHeader = ({ token, totalApy, activeTab, onTabChange }: DepositHeaderProps) => (
  <div className='relative mb-4 sm:mb-6 bg-card rounded-lg p-4 overflow-hidden'>
    <div className='absolute inset-0 z-10 w-full overflow-hidden'>
      <FlickeringGrid
        className='w-full h-full'
        color={token.brandColor}
        squareSize={8}
        gridGap={2}
        flickerChance={0.2}
        maxOpacity={0.2}
        gradientDirection='top-to-bottom'
        height={210}
      />
    </div>

    <div className='relative z-20'>
      <div className='flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-start gap-4 p-4'>
        <div className='flex items-center justify-start gap-3'>
          <div className='relative w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
            <Image
              src={token.icon}
              alt={`${token.symbol} token icon`}
              fill
              sizes='40px'
              className='object-contain'
            />
          </div>
          <div className='space-y-2'>
            <h2 className='text-base sm:text-2xl font-bold text-foreground'>
              {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} {token.symbol}
            </h2>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              {activeTab === 'deposit'
                ? `Supply ${token.symbol} and earn yield plus points`
                : `Withdraw your deposited ${token.symbol}`}
            </p>

            <div className='flex flex-wrap gap-2 pt-1'>
              <AssetStatsLink
                symbol={token.symbol}
                label={`${token.symbol} Stats`}
                icon={token.icon}
              />
            </div>
          </div>
        </div>

        <div className='text-right'>
          <div className='text-4xl font-bold whitespace-nowrap' style={{ color: token.brandColor }}>
            <CountingNumber value={totalApy} decimalPlaces={2} />%
          </div>
          <p className='text-muted-foreground uppercase tracking-wider text-xs text-center font-medium mt-1'>
            Total APY
          </p>
        </div>
      </div>

      <div className='flex gap-1 bg-muted/30 rounded-lg p-1 mt-2 sm:mt-3 w-full sm:w-[400px] mx-auto'>
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as 'deposit' | 'withdraw')}
          className='w-full'
        >
          <TabsList>
            <TabsTrigger value='deposit'>
              <div className='flex items-center gap-1 sm:gap-1.5 justify-center'>
                <ArrowUpRight className='w-3 h-3' />
                Deposit
              </div>
            </TabsTrigger>
            <TabsTrigger value='withdraw'>
              <div className='flex items-center gap-1 sm:gap-1.5 justify-center'>
                <ArrowRight className='w-3 h-3' />
                Withdraw
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  </div>
)
