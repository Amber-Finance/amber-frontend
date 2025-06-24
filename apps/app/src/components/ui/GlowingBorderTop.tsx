import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlowingBorderTopProps extends React.ComponentProps<'span'> {
  className?: string
  gradientColor?: string
}

export default function GlowingBorderTop({
  className,
  gradientColor,
  ...props
}: GlowingBorderTopProps) {
  return (
    <span
      className={cn(
        'absolute top-0 left-0 h-[1px] w-full rounded-t-[inherit] bg-gradient-to-r from-transparent via-[var(--button-span-gradient)] to-transparent pointer-events-none z-20',
        className,
      )}
      style={
        gradientColor
          ? ({
              '--button-span-gradient': gradientColor,
            } as React.CSSProperties)
          : undefined
      }
      {...props}
    />
  )
}
