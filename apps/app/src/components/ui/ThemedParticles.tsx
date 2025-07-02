'use client'

import { Particles } from '@/components/ui/Particles'
import { useTheme } from '@/components/providers/ThemeProvider'

interface ThemedParticlesProps {
  className?: string
  quantity?: number
  ease?: number
  size?: number
  staticity?: number
  refresh?: boolean
}

export function ThemedParticles({
  className = 'absolute inset-0 z-0',
  quantity = 150,
  ease = 70,
  size = 0.6,
  staticity = 30,
  refresh = false,
}: ThemedParticlesProps) {
  const { theme } = useTheme()

  // Use different colors and properties based on theme
  // Light mode: Darker, more visible color with good contrast and slightly larger particles
  // Dark mode: Bitcoin orange with standard settings
  const particleColor = theme === 'light' ? '#8b4513' : '#f7931a' // Saddle brown for light mode, Bitcoin orange for dark mode
  const particleSize = theme === 'light' ? size * 1.2 : size // Slightly larger particles in light mode for better visibility
  const particleQuantity = theme === 'light' ? Math.floor(quantity * 0.8) : quantity // Fewer particles in light mode to avoid clutter

  return (
    <Particles
      className={className}
      quantity={particleQuantity}
      ease={ease}
      color={particleColor}
      size={particleSize}
      staticity={staticity}
      refresh={refresh}
    />
  )
}
