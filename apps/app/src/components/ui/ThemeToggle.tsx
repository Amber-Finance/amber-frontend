'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/Button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Helper function to determine the next theme
  const getNextTheme = (): Theme => {
    // If explicitly set to dark, switch to light
    if (theme === 'dark') return 'light'
    // If explicitly set to light, switch to dark
    if (theme === 'light') return 'dark'
    // If using system preference, toggle based on current resolved theme
    return resolvedTheme === 'dark' ? 'light' : 'dark'
  }

  return (
    <Button
      variant='hero'
      size='lg'
      onClick={() => setTheme(getNextTheme())}
      aria-label='Toggle theme'
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className='w-4 h-4 md:w-5 md:h-5' />
      ) : (
        <MoonIcon className='w-4 h-4 md:w-5 md:h-5' />
      )}
    </Button>
  )
}

// Sun icon for light mode
function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <circle cx='12' cy='12' r='5' />
      <line x1='12' y1='1' x2='12' y2='3' />
      <line x1='12' y1='21' x2='12' y2='23' />
      <line x1='4.22' y1='4.22' x2='5.64' y2='5.64' />
      <line x1='18.36' y1='18.36' x2='19.78' y2='19.78' />
      <line x1='1' y1='12' x2='3' y2='12' />
      <line x1='21' y1='12' x2='23' y2='12' />
      <line x1='4.22' y1='19.78' x2='5.64' y2='18.36' />
      <line x1='18.36' y1='5.64' x2='19.78' y2='4.22' />
    </svg>
  )
}

// Moon icon for dark mode
function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
    </svg>
  )
}
