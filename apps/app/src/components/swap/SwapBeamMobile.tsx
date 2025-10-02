'use client'

import React, { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import { motion } from 'framer-motion'

const tokens = [
  { symbol: 'WBTC', icon: '/images/WBTC.svg' },
  { symbol: 'LBTC', icon: '/images/LBTC.svg' },
  { symbol: 'uniBTC', icon: '/images/uniBTC.svg' },
  { symbol: 'maxBTC', icon: '/images/maxBTC.png' },
  { symbol: 'eBTC', icon: '/images/eBTC.svg' },
  { symbol: 'solvBTC', icon: '/images/solvBTC.svg' },
  { symbol: 'USDC', icon: '/images/USDC.svg' },
]

interface SwapBeamMobileProps {
  fromToken?: string | null
  toToken?: string | null
}

export default function SwapBeamMobile({ fromToken, toToken }: SwapBeamMobileProps) {
  const [animateFromToken, setAnimateFromToken] = useState(false)
  const [animateToToken, setAnimateToToken] = useState(false)
  const [showBeam, setShowBeam] = useState(false)

  // Ellipse config (tilted orbit look)
  const svgWidth = 360
  const svgHeight = 180
  const centerX = svgWidth / 2
  const centerY = svgHeight / 2
  const ellipseRadiusX = 175
  const ellipseRadiusY = 65
  const circleRadius = 18
  const animationDuration = 0.8
  const repeatDelay = 0.5

  const fromTokenIndex = fromToken ? tokens.findIndex((t) => t.symbol === fromToken) : -1
  const toTokenIndex = toToken ? tokens.findIndex((t) => t.symbol === toToken) : -1

  /** Angle used to place each token around the ellipse */
  const angleForIndex = (i: number) => (i / 7) * Math.PI * 2 - Math.PI / 2
  const getOrbitPosition = (index: number, isSelected = false) => {
    const angle = angleForIndex(index)
    const baseX = Math.cos(angle) * ellipseRadiusX
    const baseY = Math.sin(angle) * ellipseRadiusY

    const normalizedY = (baseY + ellipseRadiusY) / (ellipseRadiusY * 2)
    const zDepth = Math.sin(normalizedY * Math.PI) * 0.7
    const perspectiveOpacity = 1 - zDepth * 0.3

    const x = centerX + baseX
    const y = centerY + baseY

    return {
      x,
      y,
      scale: isSelected ? 1.4 : 0.8,
      opacity: isSelected ? 1 : perspectiveOpacity,
      zDepth: isSelected ? 0 : zDepth,
      angle,
    }
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
      if (fromToken) setShowBeam(true)
      return () => clearTimeout(timer)
    } else {
      setShowBeam(false)
    }
  }, [toToken, fromToken])

  const { arcPath, grad } = useMemo(() => {
    if (fromTokenIndex < 0 || toTokenIndex < 0) {
      return {
        arcPath: '',
        grad: null as null | { x1s: number[]; y1s: number[]; x2s: number[]; y2s: number[] },
      }
    }

    const fromPos = getOrbitPosition(fromTokenIndex, true)
    const toPos = getOrbitPosition(toTokenIndex, true)

    const normAngle = (a: number) => {
      const twoPi = Math.PI * 2
      return ((a % twoPi) + twoPi) % twoPi
    }
    const a0 = normAngle(fromPos.angle)
    const a1 = normAngle(toPos.angle)

    const cwDelta = normAngle(a1 - a0) // clockwise
    const ccwDelta = normAngle(a0 - a1) // counter-clockwise

    let sweepFlag = 1
    let largeArcFlag = 0

    if (cwDelta <= ccwDelta) {
      sweepFlag = 1
      largeArcFlag = cwDelta > Math.PI ? 1 : 0
    } else {
      sweepFlag = 0
      largeArcFlag = ccwDelta > Math.PI ? 1 : 0
    }

    // Proper SVG elliptical arc between points on the same ellipse
    const arcPath = `M ${fromPos.x} ${fromPos.y} A ${ellipseRadiusX} ${ellipseRadiusY} 0 ${largeArcFlag} ${sweepFlag} ${toPos.x} ${toPos.y}`

    const vx = toPos.x - fromPos.x
    const vy = toPos.y - fromPos.y
    const len = Math.hypot(vx, vy) || 1
    const ux = vx / len
    const uy = vy / len
    const before = 0.15 * len
    const after = 0.15 * len

    const startBehind = { x: fromPos.x - ux * before, y: fromPos.y - uy * before }
    const endBeyond = { x: toPos.x + ux * after, y: toPos.y + uy * after }

    const grad = {
      x1s: [startBehind.x, endBeyond.x],
      y1s: [startBehind.y, endBeyond.y],
      x2s: [fromPos.x, toPos.x],
      y2s: [fromPos.y, toPos.y],
    }

    return { arcPath, grad }
  }, [fromTokenIndex, toTokenIndex])

  return (
    <div className='select-none relative w-full mt-8 flex items-center justify-center overflow-hidden'>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className='w-full h-full mx-auto'>
        <defs>
          <filter id='mobileGlow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='8' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>

          <mask id='mobile-arc-mask'>
            <rect x='0' y='0' width={svgWidth} height={svgHeight} fill='white' />
            {tokens.map((_, i) => {
              const p = getOrbitPosition(i, false)
              return <circle key={i} cx={p.x} cy={p.y} r={circleRadius + 6} fill='black' />
            })}
          </mask>

          {grad && (
            <motion.linearGradient
              id='mobileBeamGradient'
              gradientUnits='userSpaceOnUse'
              initial={{ x1: grad.x1s[0], y1: grad.y1s[0], x2: grad.x2s[0], y2: grad.y2s[0] }}
              animate={{ x1: grad.x1s, y1: grad.y1s, x2: grad.x2s, y2: grad.y2s }}
              transition={{
                duration: animationDuration,
                ease: [0.4, 0, 0.6, 1],
                repeat: Infinity,
                repeatDelay,
              }}
            >
              {/* Orange at the FROM side, purple towards TO side */}
              <stop stopColor='#ffaa40' stopOpacity='0' />
              <stop stopColor='#ffaa40' />
              <stop offset='32.5%' stopColor='#9c40ff' />
              <stop offset='100%' stopColor='#9c40ff' stopOpacity='0' />
            </motion.linearGradient>
          )}
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

        {showBeam && arcPath && (
          <>
            <path
              d={arcPath}
              stroke='gray'
              strokeWidth='2'
              strokeOpacity='0.2'
              strokeLinecap='round'
              fill='none'
            />
            <path
              d={arcPath}
              strokeWidth='3'
              stroke='url(#mobileBeamGradient)'
              strokeOpacity='1'
              strokeLinecap='round'
              fill='none'
              mask='url(#mobile-arc-mask)'
            />
          </>
        )}

        {tokens.map((token, i) => {
          const isFromToken = i === fromTokenIndex
          const isToToken = i === toTokenIndex
          const isSelected = isFromToken || isToToken
          const pos = getOrbitPosition(i, isSelected)
          const targetOpacity = isSelected ? 1 : Math.min(0.3, pos.opacity * 0.5)

          return (
            <motion.g
              key={i}
              animate={{ x: 0, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: isSelected ? 0 : i * 0.03 }}
            >
              <motion.circle
                cx={pos.x}
                cy={pos.y}
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
                  scale: pos.scale,
                  opacity: targetOpacity,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                initial={{ scale: 0, opacity: 0 }}
              />

              {(isFromToken && animateFromToken) || (isToToken && animateToToken) ? (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={circleRadius + 6}
                  fill='none'
                  stroke={isFromToken ? '#ffaa40' : '#9c40ff'}
                  strokeWidth='2'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0, 1, 0] }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              ) : null}

              <foreignObject
                x={pos.x - circleRadius}
                y={pos.y - circleRadius}
                width={circleRadius * 2}
                height={circleRadius * 2}
              >
                <motion.div
                  className='w-full h-full flex items-center justify-center'
                  style={{ width: circleRadius * 2, height: circleRadius * 2 }}
                  animate={{
                    filter: isSelected ? 'none' : 'grayscale(100%)',
                    scale: pos.scale,
                    opacity: targetOpacity,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  initial={{ scale: 0, opacity: 0 }}
                >
                  <Image
                    src={tokens[i % tokens.length].icon}
                    alt={tokens[i % tokens.length].symbol}
                    width={24}
                    height={24}
                  />
                </motion.div>
              </foreignObject>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
