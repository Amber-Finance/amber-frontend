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

interface SwapBeamDesktopProps {
  fromToken?: string | null
  toToken?: string | null
}

export default function SwapBeamDesktop({ fromToken, toToken }: SwapBeamDesktopProps) {
  const svgWidth = 2000
  const svgHeight = 500
  const positions = Array.from({ length: 6 }, (_, i) => i / 5)
  const path = `M 0 40 Q ${svgWidth / 2} ${svgHeight + 200} ${svgWidth} 40`
  const circleRadius = 32

  const [animateFromToken, setAnimateFromToken] = useState(false)
  const [animateToToken, setAnimateToToken] = useState(false)
  const [showBeam, setShowBeam] = useState(false)

  const getPointAt = (t: number) => {
    const P0 = { x: 0, y: 40 }
    const P1 = { x: svgWidth / 2, y: svgHeight + 200 }
    const P2 = { x: svgWidth, y: 40 }
    const x = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x
    const y = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y
    return { x, y }
  }

  const fromTokenIndex = fromToken ? tokens.findIndex((t) => t.symbol === fromToken) : -1
  const toTokenIndex = toToken ? tokens.findIndex((t) => t.symbol === toToken) : -1

  // Calculate animation timing based on token distance
  const tokenDistance =
    fromTokenIndex >= 0 && toTokenIndex >= 0 ? Math.abs(toTokenIndex - fromTokenIndex) : 0
  const animationDuration = Math.max(1.2, 3.5 - tokenDistance * 0.4)
  const repeatDelay = Math.max(0.1, 3.0 - animationDuration)

  let connectionPath = ''
  if (fromTokenIndex >= 0 && toTokenIndex >= 0) {
    const fromT = positions[fromTokenIndex]
    const toT = positions[toTokenIndex]

    const numSegments = 20
    const pathPoints = []

    for (let i = 0; i <= numSegments; i++) {
      const t = fromT + (toT - fromT) * (i / numSegments)
      const point = getPointAt(t)
      pathPoints.push(`${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    }

    connectionPath = pathPoints.join(' ')
  }

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
      setShowBeam(false)
    }
  }, [toToken, fromToken])

  return (
    <div
      className='select-none absolute left-1/2 z-0 w-full md:top-[80%] xl:top-[60%]'
      style={{ transform: 'translateX(-50%)', zIndex: -10 }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`-50 0 ${svgWidth + 100} ${svgHeight}`}
        className='w-full h-auto'
        style={{ display: 'block', margin: '0 auto' }}
      >
        <defs>
          <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='10' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>

          {/* Animated gradient for the beam - direction based on token selection */}
          <motion.linearGradient
            id='beamGradient'
            gradientUnits='userSpaceOnUse'
            initial={{
              x1: '0%',
              x2: '0%',
              y1: '0%',
              y2: '0%',
            }}
            animate={{
              x1: fromTokenIndex < toTokenIndex ? ['10%', '110%'] : ['90%', '-10%'],
              x2: fromTokenIndex < toTokenIndex ? ['0%', '100%'] : ['100%', '0%'],
              y1: ['0%', '0%'],
              y2: ['0%', '0%'],
            }}
            transition={{
              duration: animationDuration,
              ease: [0.4, 0, 0.6, 1],
              repeat: Infinity,
              repeatDelay: repeatDelay,
            }}
          >
            {fromTokenIndex < toTokenIndex ? (
              <>
                <stop stopColor='#ffaa40' stopOpacity='0' />
                <stop stopColor='#ffaa40' />
                <stop offset='32.5%' stopColor='#9c40ff' />
                <stop offset='100%' stopColor='#9c40ff' stopOpacity='0' />
              </>
            ) : (
              <>
                <stop stopColor='#9c40ff' stopOpacity='0' />
                <stop stopColor='#9c40ff' />
                <stop offset='32.5%' stopColor='#ffaa40' />
                <stop offset='100%' stopColor='#ffaa40' stopOpacity='0' />
              </>
            )}
          </motion.linearGradient>

          <mask id='arc-mask'>
            <rect x='0' y='0' width={svgWidth} height={svgHeight} fill='white' />
            {positions.map((t, i) => {
              const { x, y } = getPointAt(t)
              return <circle key={i} cx={x} cy={y} r={circleRadius + 6} fill='black' />
            })}
          </mask>
        </defs>

        {/* Draw arc with mask so it is not visible under the tokens */}
        <path
          d={path}
          stroke='#fff'
          strokeOpacity='0.1'
          strokeWidth='2'
          fill='none'
          filter='url(#glow)'
          mask='url(#arc-mask)'
        />

        {/* Flashing beam between tokens */}
        {showBeam && fromTokenIndex >= 0 && toTokenIndex >= 0 && (
          <>
            <path
              d={connectionPath}
              stroke='gray'
              strokeWidth='2'
              strokeOpacity='0.2'
              strokeLinecap='round'
              fill='none'
              mask='url(#arc-mask)'
            />

            <path
              d={connectionPath}
              strokeWidth='2'
              stroke='url(#beamGradient)'
              strokeOpacity='1'
              strokeLinecap='round'
              fill='none'
              mask='url(#arc-mask)'
            />
          </>
        )}

        {/* Circles and icons */}
        {positions.map((t, i) => {
          const { x, y } = getPointAt(t)
          const isFromToken = i === fromTokenIndex
          const isToToken = i === toTokenIndex
          const isSelected = isFromToken || isToToken

          return (
            <g key={i} className='group'>
              <motion.circle
                cx={x}
                cy={y}
                r={circleRadius}
                fill='#fff'
                fillOpacity='0.08'
                animate={{
                  stroke:
                    isFromToken && animateFromToken
                      ? '#ffaa40'
                      : isToToken && animateToToken
                        ? '#9c40ff'
                        : 'none',
                  strokeWidth:
                    isFromToken && animateFromToken ? 3 : isToToken && animateToToken ? 3 : 0,
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Brief animated ring only when first selecting tokens */}
              {(isFromToken && animateFromToken) || (isToToken && animateToToken) ? (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={circleRadius + 6}
                  fill='none'
                  stroke={isFromToken ? '#ffaa40' : '#9c40ff'}
                  strokeWidth='2'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              ) : null}

              <foreignObject
                x={x - circleRadius}
                y={y - circleRadius}
                width={circleRadius * 2}
                height={circleRadius * 2}
              >
                <motion.div
                  className='w-full h-full flex items-center justify-center filter grayscale opacity-50'
                  style={{ width: circleRadius * 2, height: circleRadius * 2 }}
                  animate={{
                    filter: isSelected ? 'none' : 'grayscale(100%)',
                    opacity: isSelected ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={tokens[i % tokens.length].icon}
                    alt={tokens[i % tokens.length].symbol}
                    width={32}
                    height={32}
                  />
                </motion.div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
