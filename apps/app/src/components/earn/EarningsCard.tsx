import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import GlassCard from '@/components/common/GlassCard'
import { Info } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { EarningsAssetModal } from '@/components/modals/EarningsAssetModal'

type EarningsCardProps = {
  asset: string
  icon?: string
  balance: number
  apr: number
}

export default function EarningsCard({ asset, icon, balance, apr }: EarningsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // This is a placeholder. We will need to adjust it based on the actual data available.
  const mockMarket = {
    asset: {
      denom: 'eth',
      symbol: asset,
      name: asset,
      icon: icon || '',
      decimals: 18,
    },
    calculatedValues: {
      suppliedUsd: 0,
      borrowedUsd: 0,
      supplyApy: apr.toString(),
      borrowApy: '0',
      liqLtv: '0',
      vaultTotal: 1854202, // Mock data based on the image
      layerTotal: 31384430, // Mock data based on the image
    },
    user: {
      walletBalance: balance,
      deposits: 0,
    },
  }

  return (
    <>
      <GlassCard>
        <CardHeader className='p-0'>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className='text-primary-text text-xl font-semibold'>
                {balance} {asset}
              </CardTitle>
              <CardDescription className='text-muted-text text-sm'>$0.00</CardDescription>
            </div>
            {icon && (
              <div className='w-12 h-12 relative'>
                <Image src={icon} alt={asset} layout='fill' objectFit='contain' />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className='p-0 mt-auto'>
          <div className='border-t border-white/5 my-1'>
            <div className='flex justify-between py-2'>
              <span className='text-muted-text text-sm'>My wallet balance</span>
              <div className='flex items-center'>
                <span className='text-primary-text text-sm'>
                  {balance} {asset}
                </span>
              </div>
            </div>
            <div className='flex justify-between py-2 border-t border-white/5'>
              <span className='text-muted-text text-sm'>Earnings</span>
              <div className='flex items-center'>
                <span className='text-primary-text text-sm'>
                  {balance} {asset}
                </span>
              </div>
            </div>
            <div className='flex justify-between py-2 border-t border-white/5'>
              <span className='text-muted-text text-sm'>Net APR</span>
              <div className='flex items-center'>
                <span className='text-primary-text text-sm'>{apr}%</span>
                <Info className='text-muted-text ml-2' size={14} />
              </div>
            </div>
          </div>
          <Button
            onClick={handleOpenModal}
            className='w-full cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 text-primary-text font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm shadow-lg hover:shadow-xl'
          >
            START EARNING
          </Button>
        </CardContent>
      </GlassCard>
      <EarningsAssetModal isOpen={isModalOpen} onClose={handleCloseModal} market={mockMarket} />
    </>
  )
}
