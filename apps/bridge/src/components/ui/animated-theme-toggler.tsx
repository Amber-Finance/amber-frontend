'use client'

import { useRef } from 'react'

import { Moon, SunDim } from 'lucide-react'
import { flushSync } from 'react-dom'

import { useTheme } from '@/components/providers/ThemeProvider'

type Props = {
  className?: string
}

export function AnimatedThemeToggler({ className }: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const changeTheme = async () => {
    if (!buttonRef.current) return

    // Fallback if view transitions are not supported
    if (!('startViewTransition' in document)) {
      flushSync(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
      })
      return
    }

    // Start view transition and wait until ready
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (document as any).startViewTransition(() => {
      flushSync(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
      })
    }).ready

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const y = top + height / 2
    const x = left + width / 2

    const right = window.innerWidth - left
    const bottom = window.innerHeight - top
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom))

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRad}px at ${x}px ${y}px)`],
      },
      {
        duration: 700,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  return (
    <button
      ref={buttonRef}
      onClick={changeTheme}
      className={
        className ??
        'relative tracking-widest flex items-center p-2 text-xs rounded-md transition-all duration-300 border border-transparent text-muted-foreground hover:text-foreground'
      }
      aria-label='Toggle theme'
    >
      <div className='relative h-4 w-4'>
        {resolvedTheme === 'dark' ? <SunDim className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
      </div>
    </button>
  )
}
