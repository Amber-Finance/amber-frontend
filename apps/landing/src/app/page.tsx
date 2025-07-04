import Image from 'next/image'

import { Github, Twitter } from 'lucide-react'

import SplineObject from '@/components/SplineObject'
import { Button } from '@/components/ui/Button'

export default function Hero() {
  return (
    <section id='hero' className='w-full min-h-screen relative'>
      {/* Spline Background */}
      <div className='absolute inset-0 w-full h-full z-0'>
        <SplineObject />
      </div>

      <div className='pt-20 relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-[#0a0b10]/50 z-10 pointer-events-none'>
        {/* Gradient Circle Overlay */}
        <div
          className='absolute z-20 pointer-events-none'
          style={{
            left: '50%',
            top: '0%',
            transform: 'translateX(-50%) translateY(-50%)',
            width: '300vh',
            height: '300vh',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, hsla(19, 90.50%, 58.60%, 0.19) 0%, rgba(223, 71, 0, 0.04) 20%, rgba(245, 113, 54, 0.02) 40%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%)',
          }}
        />
        <div className='container z-30 flex flex-col relative pointer-events-none'>
          <div className='mt-20 grid grid-cols-1'>
            <div className='flex flex-col items-center gap-6 pb-8 text-center'>
              <div className='relative w-[370px] lg:w-[740px] h-[130px] lg:h-[260px] mb-4'>
                <Image src='/images/logo-claim-light.svg' alt='logo' fill={true} />
              </div>

              <p className='text-balance text-lg tracking-tight text-white/60 md:text-xl max-w-4xl'>
                Put your liquid staking tokens to work. Earn maximum yield on your Bitcoin LSTs.
                Increase your exposure to maxBTC and leverage loop with smart strategies.
              </p>

              <div className='flex flex-col gap-4 lg:flex-row mt-8 pointer-events-auto'>
                {/* Enter App Button */}
                <Button
                  asChild
                  size='lg'
                  className='bg-gradient-to-r from-[#b1241e] to-[#f57136] text-white hover:from-[#a11e1a] hover:to-[#e6642f] shadow-lg'
                >
                  <a
                    href='https://app.amberfi.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center space-x-2'
                  >
                    <span>Enter App</span>
                  </a>
                </Button>

                {/* Learn More Button */}
                <Button
                  asChild
                  variant='outline'
                  size='lg'
                  className='border-white/20 text-white hover:text-white hover:bg-white/10 backdrop-blur-sm pointer-events-auto'
                >
                  <a
                    href='https://docs.amberfi.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center space-x-2'
                  >
                    <span>Learn More</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className='pb-8'>
          <div className='flex items-center gap-6'>
            <a
              href='https://x.com/amberfi_io'
              target='_blank'
              rel='noopener noreferrer'
              className='text-white/80 hover:text-white transition-colors duration-200 pointer-events-auto'
              aria-label='Follow us on X'
            >
              <Twitter className='w-5 h-5' />
            </a>
            <a
              href='https://github.com/amberfi'
              target='_blank'
              rel='noopener noreferrer'
              className='text-white/80 hover:text-white transition-colors duration-200 pointer-events-auto'
              aria-label='Visit our GitHub'
            >
              <Github className='w-5 h-5' />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
