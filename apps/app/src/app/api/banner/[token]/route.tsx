import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Token to base image mapping
const TOKEN_BASE_IMAGES = {
  LBTC: '/twitter-banner/deposit/LBTC.png',
  solvBTC: '/twitter-banner/deposit/solvBTC.png',
  eBTC: '/twitter-banner/deposit/eBTC.png',
  WBTC: '/twitter-banner/deposit/wBTC.png',
  pumpBTC: '/twitter-banner/deposit/pumpBTC.png',
  uniBTC: '/twitter-banner/deposit/uniBTC.png',
} as const

// Hardcoded APY for testing
const MOCK_APY_DATA = {
  LBTC: { total: 8.45, protocol: 3.2, staking: 5.25 },
  solvBTC: { total: 7.8, protocol: 2.95, staking: 4.85 },
  eBTC: { total: 6.5, protocol: 3.3, staking: 3.2 },
  WBTC: { total: 5.7, protocol: 3.2, staking: 2.5 },
  pumpBTC: { total: 7.3, protocol: 3.2, staking: 4.1 },
  uniBTC: { total: 7.0, protocol: 3.2, staking: 3.8 },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token: tokenSymbol } = await params

    // Get base image path
    const baseImagePath = TOKEN_BASE_IMAGES[tokenSymbol as keyof typeof TOKEN_BASE_IMAGES]

    if (!baseImagePath) {
      return new NextResponse('Banner image not found', { status: 404 })
    }

    // Get mock APY data
    const apyData = MOCK_APY_DATA[tokenSymbol as keyof typeof MOCK_APY_DATA]

    if (!apyData) {
      return new NextResponse('Token not supported', { status: 404 })
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '720px',
            width: '1280px',
            display: 'flex',
            position: 'relative',
            backgroundImage: `url(${request.nextUrl.origin}${baseImagePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Text Layout */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '160px',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              fontFamily: 'Funnel, system-ui, sans-serif',
            }}
          >
            {/* GET */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '5px',
                display: 'flex',
                letterSpacing: '0.2em',
              }}
            >
              GET
            </div>

            {/* Large APY Number */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginBottom: '5px',
              }}
            >
              <span
                style={
                  {
                    fontSize: '120px',
                    fontWeight: '900',
                    color: '#FF6B35',
                    lineHeight: '1',
                    letterSpacing: '0.1em',
                    WebkitTextStroke: '8px #FF6B35',
                  } as React.CSSProperties
                }
              >
                {apyData.total.toFixed(2)}
              </span>
              <span
                style={
                  {
                    fontSize: '80px',
                    fontWeight: '900',
                    color: '#FF6B35',
                    lineHeight: '1',
                    WebkitTextStroke: '5px #FF6B35',
                  } as React.CSSProperties
                }
              >
                %
              </span>
            </div>

            {/* YIELD ON YOUR */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                letterSpacing: '0.2em',
              }}
            >
              YIELD ON YOUR
            </div>

            {/* Token Symbol */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                letterSpacing: '0.2em',
              }}
            >
              {tokenSymbol}
            </div>
          </div>
        </div>
      ),
      {
        width: 1280,
        height: 720,
        headers: {
          'Cache-Control': 'public, max-age=60',
        },
      },
    )
  } catch (error) {
    console.error('Error generating banner:', error)
    return new NextResponse('Error generating banner', { status: 500 })
  }
}
