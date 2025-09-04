import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Token to base image mapping
const TOKEN_BASE_IMAGES = {
  LBTC: '/twitter-banner/deposit/LBTC.png',
  solvBTC: '/twitter-banner/deposit/solvBTC.png',
  eBTC: '/twitter-banner/deposit/eBTC.png',
  WBTC: '/twitter-banner/deposit/WBTC.png',
  uniBTC: '/twitter-banner/deposit/uniBTC.png',
} as const

// API endpoint for APY data
const APY_API_URL = 'https://api.amberfi.io/api/btc'

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

    let apyData = null

    try {
      const response = await fetch(APY_API_URL, {
        next: { revalidate: 60 }, // Cache for 1 minute
      })

      if (response.ok) {
        const apiData = await response.json()
        const tokenKey = tokenSymbol.toLowerCase() as keyof typeof apiData.apys

        if (apiData.apys && apiData.apys[tokenKey]) {
          const apyValue = parseFloat(apiData.apys[tokenKey])
          apyData = { apy: apyValue }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch APY data for ${tokenSymbol}.`)
    }

    // Use fallback if API fails or returns 0
    if (!apyData || apyData.apy === 0) {
      apyData = { apy: 0 }
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

            {/* Large APY Number - Only show when APY > 0 */}
            {apyData.apy > 0 && (
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
                  {apyData.apy.toFixed(2)}
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
            )}

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
