import Image from 'next/image'

import { OrbitingCircles } from '@/components/ui/orbiting-circles'

export function SecondBentoAnimation() {
  return (
    <div className='absolute flex w-full flex-col items-center justify-center overflow-hidden h-full opacity-60 hover:opacity-100 transition-all duration-300'>
      {/* Logo in center */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Image src='/logo/maxBTC_Token_dark.png' alt='logo' width={100} height={100} />
      </div>
      <OrbitingCircles iconSize={40}>
        <Image src='/images/WBTC.svg' alt='WBTC' width={32} height={32} />
        <Image src='/images/uniBTC.svg' alt='uniBTC' width={32} height={32} />
        <Image src='/images/solvBTC.svg' alt='solvBTC' width={32} height={32} />
      </OrbitingCircles>

      <OrbitingCircles iconSize={40} radius={100} reverse>
        <Image src='/images/pumpBTC.svg' alt='pumpBTC' width={32} height={32} />
        <Image src='/images/LBTC.svg' alt='LBTC' width={32} height={32} />
        <Image src='/images/BTC.svg' alt='BTC' width={32} height={32} />
      </OrbitingCircles>

      <OrbitingCircles iconSize={40} radius={230} reverse>
        <Image src='/images/eBTC.png' alt='eBTC' width={32} height={32} />
        <Image src='/images/WBTC.axl.svg' alt='WBTC.axl' width={32} height={32} />
        <Image src='/images/bedrock.svg' alt='Bedrock' width={32} height={32} />
      </OrbitingCircles>
    </div>
  )
}
