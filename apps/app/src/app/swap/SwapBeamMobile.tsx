'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'

import { motion } from 'framer-motion'

const tokens = [
  { symbol: 'wBTC', icon: '/images/WBTC.svg' },
  { symbol: 'LBTC', icon: '/images/LBTC.svg' },
  { symbol: 'uniBTC', icon: '/images/uniBTC.svg' },
  { symbol: 'maxBTC', icon: '/images/maxBTC.png' },
  { symbol: 'eBTC', icon: '/images/eBTC.svg' },
  { symbol: 'solvBTC', icon: '/images/solvBTC.svg' },
]

interface SwapBeamMobileProps {
  fromToken?: string | null
  toToken?: string | null
}

export default function SwapBeamMobile({ fromToken, toToken }: SwapBeamMobileProps) {
  const [animateFromToken, setAnimateFromToken] = useState(false)
  const [animateToToken, setAnimateToToken] = useState(false)
  const [showBeam, setShowBeam] = useState(false)

  const fromTokenData = fromToken ? tokens.find((t) => t.symbol === fromToken) : null
  const toTokenData = toToken ? tokens.find((t) => t.symbol === toToken) : null

  // Positions for the two tokens (left and right)
  const fromPosition = { x: 80, y: 100 }
  const toPosition = { x: 280, y: 100 }

  // Calculate the direct path between tokens
  const connectionPath = `M ${fromPosition.x},${fromPosition.y} L ${toPosition.x},${toPosition.y}`

  useEffect(() => {
    if (fromToken) {
      setAnimateFromToken(true)
      const timer = setTimeout(() => setAnimateFromToken(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [fromToken])

  useEffect(() => {
    if (toToken) {
      setAnimateToToken(true)
      const timer = setTimeout(() => setAnimateToToken(false), 1000)

      if (fromToken) {
        setShowBeam(true)
      }

      return () => clearTimeout(timer)
    } else {
      console.log('Hiding beam animation')
      setShowBeam(false)
    }
  }, [toToken, fromToken])

  // Don't render anything if no tokens are selected
  if ((!fromTokenData && !toTokenData) || !fromToken || !toToken) {
    return null
  }

  return (
    <div className='select-none relative w-full h-48 flex items-center justify-between'>
      <svg viewBox='0 0 360 200' className='w-full h-auto' style={{ display: 'block' }}>
        <defs>
          <filter id='mobileGlow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='8' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>

          {/* Animated gradient for the beam - similar to desktop */}
          <motion.linearGradient
            id='mobileBeamGradient'
            gradientUnits='userSpaceOnUse'
            initial={{
              x1: '10%',
              x2: '0%',
              y1: '0%',
              y2: '0%',
            }}
            animate={{
              x1: ['10%', '110%'],
              x2: ['0%', '100%'],
              y1: ['0%', '0%'],
              y2: ['0%', '0%'],
            }}
            transition={{
              duration: 1.5,
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          >
            <stop stopColor='#ffaa40' stopOpacity='0' />
            <stop stopColor='#ffaa40' />
            <stop offset='32.5%' stopColor='#9c40ff' />
            <stop offset='100%' stopColor='#9c40ff' stopOpacity='0' />
          </motion.linearGradient>
        </defs>

        {/* Flashing beam between tokens - similar to desktop */}
        {showBeam && fromTokenData && toTokenData && (
          <>
            {/* Base subtle path */}
            <path
              d={connectionPath}
              stroke='gray'
              strokeWidth='2'
              strokeOpacity='0.2'
              strokeLinecap='round'
              fill='none'
            />

            {/* Animated beam using gradient animation */}
            <path
              d={connectionPath}
              strokeWidth='3'
              stroke='url(#mobileBeamGradient)'
              strokeOpacity='1'
              strokeLinecap='round'
              fill='none'
            />
          </>
        )}

        {/* From Token */}
        {fromTokenData && (
          <g transform={`translate(${fromPosition.x}, ${fromPosition.y})`}>
            <circle r='32' fill='#fff' fillOpacity='0.08' />

            {/* Animated stroke circle - only during selection animation */}
            <motion.circle
              r='32'
              fill='none'
              stroke='#ffaa40'
              strokeWidth='3'
              initial={{ opacity: 0 }}
              animate={{
                opacity: animateFromToken ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Pulsing ring - only animates once when selected */}
            {animateFromToken && (
              <motion.circle
                r='38'
                fill='none'
                stroke='#ffaa40'
                strokeWidth='2'
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  ease: 'easeOut',
                }}
              />
            )}

            <foreignObject x='-32' y='-32' width='64' height='64'>
              <motion.div
                className='w-full h-full flex items-center justify-center filter grayscale opacity-50'
                style={{ width: 64, height: 64 }}
                animate={{
                  filter: 'none',
                  opacity: 1,
                  scale: animateFromToken ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Image src={fromTokenData.icon} alt={fromTokenData.symbol} width={32} height={32} />
              </motion.div>
            </foreignObject>
          </g>
        )}

        {/* To Token */}
        {toTokenData && (
          <g transform={`translate(${toPosition.x}, ${toPosition.y})`}>
            <circle r='32' fill='#fff' fillOpacity='0.08' />

            {/* Animated stroke circle - only during selection animation */}
            <motion.circle
              r='32'
              fill='none'
              stroke='#9c40ff'
              strokeWidth='3'
              initial={{ opacity: 0 }}
              animate={{
                opacity: animateToToken ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Pulsing ring - only animates once when selected */}
            {animateToToken && (
              <motion.circle
                r='38'
                fill='none'
                stroke='#9c40ff'
                strokeWidth='2'
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  ease: 'easeOut',
                }}
              />
            )}

            <foreignObject x='-32' y='-32' width='64' height='64'>
              <motion.div
                className='w-full h-full flex items-center justify-center filter grayscale opacity-50'
                style={{ width: 64, height: 64 }}
                animate={{
                  filter: 'none',
                  opacity: 1,
                  scale: animateToToken ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Image src={toTokenData.icon} alt={toTokenData.symbol} width={32} height={32} />
              </motion.div>
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  )
}
