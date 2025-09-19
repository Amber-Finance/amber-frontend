'use client'

import Image from 'next/image'

import { useTheme } from '@/components/providers/ThemeProvider'

export function BackgroundGradient() {
  const { resolvedTheme } = useTheme()

  return (
    <div className='fixed inset-0 w-[100vw] h-[100vh] z-[0]'>
      {resolvedTheme === 'dark' ? (
        <Image
          src='/background/bg_gradient_dark.svg'
          alt='Background'
          priority
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      ) : (
        <Image
          src='/background/bg_gradient_light.svg'
          alt='Background'
          priority
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
      <div
        className='absolute inset-0 opacity-30 mix-blend-overlay'
        style={{
          backgroundImage: 'url(/background/noise.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}
