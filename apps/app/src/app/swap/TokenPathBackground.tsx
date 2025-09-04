import Image from 'next/image'

const tokens = [
  { symbol: 'BTC', icon: '/images/BTC.svg' },
  { symbol: 'WBTC', icon: '/images/WBTC.svg' },
  { symbol: 'LBTC', icon: '/images/LBTC.svg' },
  { symbol: 'uniBTC', icon: '/images/uniBTC.svg' },
  { symbol: 'solvBTC', icon: '/images/solvBTC.svg' },
  { symbol: 'bedrock', icon: '/images/bedrock.svg' },
  { symbol: 'WBTC.axl', icon: '/images/WBTC.axl.svg' },
  { symbol: 'solvBTC', icon: '/images/solvBTC.svg' },
  { symbol: 'uniBTC', icon: '/images/uniBTC.svg' },
]

export default function TokenPathBackground() {
  const svgWidth = 2000
  const svgHeight = 500
  const positions = Array.from({ length: 11 }, (_, i) => i / 10)
  const path = `M -200 ${svgHeight - 40} Q ${svgWidth / 2} -300 ${svgWidth + 200} ${svgHeight - 40}`
  const circleRadius = 38

  const getPointAt = (t: number) => {
    const P0 = { x: -200, y: svgHeight - 40 }
    const P1 = { x: svgWidth / 2, y: -300 }
    const P2 = { x: svgWidth + 200, y: svgHeight - 40 }
    const x = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x
    const y = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y
    return { x, y }
  }

  return (
    <div
      className='select-none absolute left-1/2 z-0 w-full'
      style={{ top: '50%', transform: 'translateX(-50%)', zIndex: -10 }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
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
        {/* Draw circles and icons on top */}
        {positions.map((t, i) => {
          const { x, y } = getPointAt(t)
          return (
            <g key={i} className='group'>
              <circle cx={x} cy={y} r={circleRadius} fill='#fff' fillOpacity='0.08' />
              <foreignObject
                x={x - circleRadius}
                y={y - circleRadius}
                width={circleRadius * 2}
                height={circleRadius * 2}
              >
                <div
                  className='w-full h-full flex items-center justify-center filter grayscale opacity-50'
                  style={{ width: circleRadius * 2, height: circleRadius * 2 }}
                >
                  <Image
                    src={tokens[i % tokens.length].icon}
                    alt={tokens[i % tokens.length].symbol}
                    width={38}
                    height={38}
                  />
                </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
