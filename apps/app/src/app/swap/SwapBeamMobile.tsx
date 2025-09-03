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
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // 3D Tilted Elliptical Orbit Configuration
  const svgWidth = 360
  const svgHeight = 180
  const centerX = svgWidth / 2
  const centerY = svgHeight / 2
  const ellipseRadiusX = 180
  const ellipseRadiusY = 65
  const circleRadius = 18

  // Calculate 3D elliptical orbital positions
  const getOrbitPosition = (index: number, depth: number = 0) => {
    const angle = (index / 6) * Math.PI * 2 - Math.PI / 2 // Start from top

    // Calculate base elliptical position - tokens should be ON the ellipse line
    const baseX = Math.cos(angle) * ellipseRadiusX
    const baseY = Math.sin(angle) * ellipseRadiusY

    // Calculate Z-depth based on Y position (back tokens are "further away")
    // Tokens at the top of the ellipse are furthest back, bottom ones are closest
    const normalizedY = (baseY + ellipseRadiusY) / (ellipseRadiusY * 2) // 0 to 1
    const zDepth = Math.sin(normalizedY * Math.PI) * 0.7 // 0 to 0.7, peaked at middle

    // Apply perspective opacity based on Z-depth (but keep size uniform)
    const perspectiveOpacity = 1 - zDepth * 0.3 // Tokens further back are slightly more transparent

    // Position tokens exactly on the ellipse line
    const x = centerX + baseX
    const y = centerY + baseY + zDepth * 8 // Slight vertical shift for back tokens

    return {
      x,
      y,
      scale: 0.8, // All orbital tokens same small size
      opacity: perspectiveOpacity,
      zDepth,
      angle,
    }
  }

  // Get the front-most positions on the ellipse (bottom part)
  const getFrontEllipsePosition = (tokenIndex: number) => {
    const orbitPos = getOrbitPosition(tokenIndex, 0)
    return {
      x: orbitPos.x,
      y: orbitPos.y,
      scale: 1.4, // Much bigger when selected to show they're active
      zDepth: 0, // Always in front
    }
  }

  const fromTokenIndex = fromToken ? tokens.findIndex((t) => t.symbol === fromToken) : -1
  const toTokenIndex = toToken ? tokens.findIndex((t) => t.symbol === toToken) : -1

  // Calculate animation timing based on token distance (same as desktop)
  const tokenDistance =
    fromTokenIndex >= 0 && toTokenIndex >= 0 ? Math.abs(toTokenIndex - fromTokenIndex) : 0
  const animationDuration = Math.max(1.2, 3.5 - tokenDistance * 0.4)
  const repeatDelay = Math.max(0.1, 3.0 - animationDuration)

  // Connection path along the ellipse from 'from' token to 'to' token
  let connectionPath = ''
  if (fromTokenIndex >= 0 && toTokenIndex >= 0) {
    // Always start from the 'from' token and go to the 'to' token
    const startAngle = (fromTokenIndex / 6) * Math.PI * 2 - Math.PI / 2
    const endAngle = (toTokenIndex / 6) * Math.PI * 2 - Math.PI / 2

    // Go the shorter way, but ensure we always start from FROM token
    let angleDiff = endAngle - startAngle
    if (Math.abs(angleDiff) > Math.PI) {
      angleDiff = angleDiff > 0 ? angleDiff - 2 * Math.PI : angleDiff + 2 * Math.PI
    }

    // Create smooth arc along ellipse from 'from' to 'to'
    const numSegments = 20
    const pathPoints = []

    // ALWAYS draw from from-token to to-token (shorter path)
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments
      const currentAngle = startAngle + angleDiff * t
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

            let targetPos
            let targetScale
            let targetOpacity

            if (isSelected) {
              // Selected tokens are larger and brighter
              const ellipsePos = getFrontEllipsePosition(i)
              targetPos = ellipsePos
              targetScale = ellipsePos.scale // 1.2x scale
              targetOpacity = 1
            } else {
              // Non-selected tokens are small with low opacity
              const orbitPos = getOrbitPosition(i, 0)
              targetPos = orbitPos
              targetScale = 0.8 // All non-selected tokens same small size
              targetOpacity = Math.min(0.3, orbitPos.opacity * 0.5) // Much lower opacity
            }

            return (
              <motion.g
                key={i}
                animate={{
                  x: 0, // No group translation needed
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
                    scale: targetScale,
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
                      scale: targetScale,
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
