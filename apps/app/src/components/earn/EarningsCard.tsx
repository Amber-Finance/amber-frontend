import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import GlassCard from '@/components/common/GlassCard'
import { Info } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
// import { useState } from 'react'
// import { EarningsAssetModal } from '@/components/modals/EarningsAssetModal'

type EarningsCardProps = {
  asset: string
  icon?: string
  balance: number
  apr: number
}

export default function EarningsCard({ asset, icon, balance, apr }: EarningsCardProps) {
  // const [isModalOpen, setIsModalOpen] = useState(false)

  // const handleOpenModal = () => {
  //   setIsModalOpen(true)
  // }

  // const handleCloseModal = () => {
  //   setIsModalOpen(false)
  // }

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
              <span className='text-muted-text text-sm'>My Earnings</span>
              <div className='flex items-center'>
                <span className='text-primary-text text-sm'>
                  {balance} {asset}
                </span>
              </div>
            </div>
            <div className='flex justify-between py-2 border-t border-white/5'>
              <span className='text-muted-text text-sm'>Total Deposits</span>
              <div className='flex items-center'>
                <span className='text-primary-text text-sm'>
                  {balance} {asset}
                </span>
              </div>
            </div>
            <div className='flex justify-between py-2 border-t border-white/5'>
              <span className='text-muted-text text-sm'>Net APY</span>
              <div className='flex items-center'>
                <span className='text-primary-text text-sm'>{apr}%</span>
                <Info className='text-muted-text ml-2' size={14} />
              </div>
            </div>
          </div>
          <Button onClick={() => {}} variant='glass' className='w-full'>
            START EARNING
          </Button>
        </CardContent>
      </GlassCard>
      {/* <EarningsAssetModal isOpen={isModalOpen} onClose={handleCloseModal} market={mockMarket} /> */}
    </>
  )
}
