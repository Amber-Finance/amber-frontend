'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'

import { motion } from 'framer-motion'

const tokens = [
  { symbol: 'wBTC', icon: '/images/WBTC.svg' },
  { symbol: 'LBTC', icon: '/images/LBTC.svg' },
  { symbol: 'uniBTC', icon: '/images/uniBTC.svg' },
  { symbol: 'eBTC', icon: '/images/eBTC.svg' },
  { symbol: 'maxBTC', icon: '/images/maxBTC.png' },
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
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // 3D Tilted Elliptical Orbit Configuration
  const svgWidth = 360
  const svgHeight = 180
  const centerX = svgWidth / 2
  const centerY = svgHeight / 2
  const ellipseRadiusX = 180
  const ellipseRadiusY = 65
  const circleRadius = 18
  const animationDuration = 2.0
  const repeatDelay = 1.0

  // Calculate 3D elliptical orbital positions
  const getOrbitPosition = (index: number, isSelected: boolean = false) => {
    const angle = (index / 6) * Math.PI * 2 - Math.PI / 2

    // Tokens should be ON the ellipse line
    const baseX = Math.cos(angle) * ellipseRadiusX
    const baseY = Math.sin(angle) * ellipseRadiusY

    // Back tokens are "further away"
    const normalizedY = (baseY + ellipseRadiusY) / (ellipseRadiusY * 2)
    const zDepth = Math.sin(normalizedY * Math.PI) * 0.7

    // Tokens further back are slightly more transparent
    const perspectiveOpacity = 1 - zDepth * 0.3

    const x = centerX + baseX
    const y = centerY + baseY

    return {
      x,
      y,
      scale: isSelected ? 1.4 : 0.8, // Bigger if selected
      opacity: isSelected ? 1 : perspectiveOpacity, // Full opacity if selected
      zDepth: isSelected ? 0 : zDepth, // No depth if selected
      angle,
    }
  }

  const fromTokenIndex = fromToken ? tokens.findIndex((t) => t.symbol === fromToken) : -1
  const toTokenIndex = toToken ? tokens.findIndex((t) => t.symbol === toToken) : -1

  // Connection path along the ellipse from 'from' token to 'to' token
  let connectionPath = ''
  if (fromTokenIndex >= 0 && toTokenIndex >= 0) {
    const fromAngle = (fromTokenIndex / 6) * Math.PI * 2 - Math.PI / 2
    const toAngle = (toTokenIndex / 6) * Math.PI * 2 - Math.PI / 2

    // Calculate the shortest path direction
    let angleDiff = toAngle - fromAngle

    // Normalize the angle difference to [-π, π] to find shortest path
    if (angleDiff > Math.PI) {
      angleDiff = angleDiff - 2 * Math.PI
    } else if (angleDiff < -Math.PI) {
      angleDiff = angleDiff + 2 * Math.PI
    }

    // Create smooth arc along ellipse from 'from' to 'to' using shortest path
    const numSegments = 20
    const pathPoints = []

    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments
      const currentAngle = fromAngle + angleDiff * t
      const x = centerX + Math.cos(currentAngle) * ellipseRadiusX
      const y = centerY + Math.sin(currentAngle) * ellipseRadiusY
      pathPoints.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    }

    connectionPath = pathPoints.join(' ')
  }

  useEffect(() => {
    if (fromToken) {
      setAnimateFromToken(true)
      const timer = setTimeout(() => setAnimateFromToken(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setAnimateFromToken(false)
    }
  }, [fromToken])

  useEffect(() => {
    if (toToken) {
      setAnimateToToken(true)
      const timer = setTimeout(() => setAnimateToToken(false), 1000)

      return () => clearTimeout(timer)
    } else {
      setAnimateToToken(false)
    }
  }, [toToken])

  // Separate effect for beam control
  useEffect(() => {
    if (fromToken && toToken) {
      setShowBeam(true)
    } else {
      setShowBeam(false)
    }
  }, [fromToken, toToken])

  useEffect(() => {
    // After initial load, we can disable the initial load state
    const timer = setTimeout(() => setIsInitialLoad(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='select-none relative w-full mt-8 flex items-center justify-center overflow-hidden'>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className='w-full h-full mx-auto'
        style={{ display: 'block' }}
      >
        <defs>
          <filter id='mobileGlow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='8' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>

          {/* Animated gradient for the beam - same logic as desktop */}
          <motion.linearGradient
            id='mobileBeamGradient'
            gradientUnits='userSpaceOnUse'
            initial={{
              x1: '0%',
              x2: '0%',
              y1: '0%',
              y2: '0%',
            }}
            animate={{
              // Always flow from 'from' token to 'to' token (semantic direction)
              x1: ['10%', '110%'],
              x2: ['0%', '100%'],
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
            <stop stopColor='#ffaa40' stopOpacity='0' />
            <stop stopColor='#ffaa40' />
            <stop offset='32.5%' stopColor='#9c40ff' />
            <stop offset='100%' stopColor='#9c40ff' stopOpacity='0' />
          </motion.linearGradient>
        </defs>

        <ellipse
          cx={centerX}
          cy={centerY}
          rx={ellipseRadiusX}
          ry={ellipseRadiusY}
          stroke='#fff'
          strokeOpacity='0.05'
          strokeWidth='2'
          fill='none'
          filter='url(#mobileGlow)'
        />

        {showBeam && fromTokenIndex >= 0 && toTokenIndex >= 0 && fromToken && toToken && (
          <>
            <path
              d={connectionPath}
              stroke='gray'
              strokeWidth='2'
              strokeOpacity='0.2'
              strokeLinecap='round'
              fill='none'
            />
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

        {tokens
          .map((token, i) => ({ token, index: i }))
          .map(({ token, index: i }) => {
            const isFromToken = i === fromTokenIndex
            const isToToken = i === toTokenIndex
            const isSelected = isFromToken || isToToken
            const targetPos = getOrbitPosition(i, isSelected)
            const targetOpacity = isSelected ? 1 : Math.min(0.3, targetPos.opacity * 0.5)

            return (
              <motion.g
                key={i}
                animate={{
                  x: 0,
                  y: 0,
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                  delay: isSelected ? 0 : i * 0.03,
                }}
              >
                <motion.circle
                  cx={targetPos.x}
                  cy={targetPos.y}
                  r={circleRadius}
                  fill='#fff'
                  fillOpacity='0.05'
                  stroke='none'
                  animate={{
                    stroke:
                      (isFromToken && animateFromToken) || (isToToken && animateToToken)
                        ? isFromToken
                          ? '#ffaa40'
                          : '#9c40ff'
                        : 'none',
                    strokeWidth:
                      (isFromToken && animateFromToken) || (isToToken && animateToToken) ? 3 : 0,
                    strokeOpacity:
                      (isFromToken && animateFromToken) || (isToToken && animateToToken) ? 1 : 0,
                    scale: targetPos.scale,
                    opacity: targetOpacity,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  initial={{ scale: 0, opacity: 0 }}
                />

                {/* Animated ring for selection */}
                {(isFromToken && animateFromToken) || (isToToken && animateToToken) ? (
                  <motion.circle
                    cx={targetPos.x}
                    cy={targetPos.y}
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
                  x={targetPos.x - circleRadius}
                  y={targetPos.y - circleRadius}
                  width={circleRadius * 2}
                  height={circleRadius * 2}
                >
                  <motion.div
                    className='w-full h-full flex items-center justify-center'
                    style={{ width: circleRadius * 2, height: circleRadius * 2 }}
                    animate={{
                      filter: isSelected ? 'none' : 'grayscale(100%)',
                      scale: targetPos.scale,
                      opacity: targetOpacity,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    initial={{ scale: 0, opacity: 0 }}
                  >
                    <Image src={token.icon} alt={token.symbol} width={24} height={24} />
                  </motion.div>
                </foreignObject>
              </motion.g>
            )
          })}
      </svg>
    </div>
  )
}
