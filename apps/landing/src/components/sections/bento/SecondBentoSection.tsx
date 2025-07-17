import Image from 'next/image'

import { OrbitingCircles } from '@/components/ui/OrbitingCircle'

export function SecondBentoAnimation() {
  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-hidden'>
      <div className='pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-background to-transparent z-20'></div>
      <div className='pointer-events-none absolute top-0 left-0 h-20 w-full bg-gradient-to-b from-background to-transparent z-20'></div>

      <div className='absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 size-16 bg-secondary p-2 rounded-full z-30 md:bottom-0 md:top-auto'>
        <Image src='/favicon.svg' alt='Amber Logo' width={40} height={40} className='w-10 h-10' />
      </div>
      <div className='relative flex h-full w-full items-center justify-center overflow-hidden'>
        <div className='relative flex h-full w-full items-center justify-center translate-y-0 md:translate-y-32'>
          <OrbitingCircles index={0} iconSize={60} radius={100} reverse speed={1}>
            <Image src='/images/WBTC.svg' alt='WBTC' width={32} height={32} />
            <Image src='/images/uniBTC.svg' alt='uniBTC' width={32} height={32} />
            <Image src='/images/solvBTC.svg' alt='solvBTC' width={32} height={32} />
          </OrbitingCircles>

          <OrbitingCircles index={1} iconSize={60} speed={0.5}>
            <Image src='/images/pumpBTC.svg' alt='pumpBTC' width={32} height={32} />
            <Image src='/images/LBTC.svg' alt='LBTC' width={32} height={32} />
            <Image src='/images/BTC.svg' alt='BTC' width={32} height={32} />
          </OrbitingCircles>

          <OrbitingCircles index={2} iconSize={60} radius={230} reverse speed={0.5}>
            <Image src='/images/eBTC.png' alt='eBTC' width={32} height={32} />
            <Image src='/images/WBTC.axl.svg' alt='WBTC.axl' width={32} height={32} />
            <Image src='/images/bedrock.svg' alt='Bedrock' width={32} height={32} />
          </OrbitingCircles>
        </div>
      </div>
    </div>
  )
}
