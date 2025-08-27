'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { useTheme } from 'next-themes'

export default function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with consistent dimensions during SSR
    return (
      <div className='flex items-center gap-2'>
        <div className='relative flex items-center'>
          <div className='w-[142px] h-[50px]' />
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <div className='relative flex items-center'>
        <Image
          src={
            resolvedTheme === 'dark'
              ? '/logo/logo-simple/logo-light-400x140.svg'
              : '/logo/logo-simple/logo-dark-400x140.svg'
          }
          alt='Amber Finance'
          width={142}
          height={50}
          className='h-8 w-auto'
        />
      </div>
    </div>
  )
}
