import { ComponentPropsWithoutRef } from 'react'

import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<'div'> {
  speed?: number
  colorFrom?: string
  colorTo?: string
}

export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      style={
        {
          '--bg-size': `${speed * 300}%`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={cn(
        `inline animate-gradient bg-gradient-to-r from-[var(--color-from)] via-[var(--color-to)] to-[var(--color-from)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

interface AnimatedGradientTextWithIconProps extends ComponentPropsWithoutRef<'div'> {
  iconLeft?: React.ReactNode
  text: string
  iconRight?: React.ReactNode
}

export function AnimatedGradientTextWithIcon({
  iconLeft,
  text,
  iconRight,
  ...props
}: AnimatedGradientTextWithIconProps) {
  return (
    <div className='group relative mx-auto flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] '>
      <span
        className={cn(
          'absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]',
        )}
        style={{
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'subtract',
          WebkitClipPath: 'padding-box',
        }}
      />
      {iconLeft}
      <hr className='mx-2 h-4 w-px shrink-0 bg-neutral-500' />
      <AnimatedGradientText {...props} className='text-sm font-medium'>
        {text}
      </AnimatedGradientText>
      {iconRight ? (
        iconRight
      ) : (
        <ChevronRight className='ml-1 size-4 stroke-neutral-500 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5' />
      )}
    </div>
  )
}
