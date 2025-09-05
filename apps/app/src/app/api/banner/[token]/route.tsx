import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

import tokens from '@/config/tokens'

export const runtime = 'edge'

// Token to base image mapping
const TOKEN_BASE_IMAGES = {
  LBTC: '/x-banner/deposit/LBTC.png',
  solvBTC: '/x-banner/deposit/solvBTC.png',
  eBTC: '/x-banner/deposit/eBTC.png',
  WBTC: '/x-banner/deposit/WBTC.png',
  uniBTC: '/x-banner/deposit/uniBTC.png',
} as const

// API endpoint for APY data
const APY_API_URL = 'https://api.amberfi.io/api/btc'

function getTokenBrandColor(tokenSymbol: string): string {
  const token = tokens.find((t) => t.symbol === tokenSymbol)
  return token?.brandColor || '#FF6B35'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token: tokenSymbol } = await params

    // Case-insensitive
    const validToken = Object.keys(TOKEN_BASE_IMAGES).find(
      (key) => key.toLowerCase() === tokenSymbol.toLowerCase(),
    ) as keyof typeof TOKEN_BASE_IMAGES

    // Get base image path
    const baseImagePath = validToken ? TOKEN_BASE_IMAGES[validToken] : undefined

    if (!baseImagePath) {
      return new NextResponse('Banner image not found', { status: 404 })
    }

    const brandColor = getTokenBrandColor(tokenSymbol)

    let apyData = null

    try {
      const response = await fetch(APY_API_URL, {
        next: { revalidate: 60 }, // Cache for 1 minute
      })

      if (response.ok) {
        const apiData = await response.json()
        const tokenKey = validToken?.toLowerCase() as keyof typeof apiData.apys

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
                      color: 'white',
                      lineHeight: '1',
                      letterSpacing: '0.1em',
                      WebkitTextStroke: '8px white',
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
                      color: brandColor,
                      lineHeight: '1',
                      WebkitTextStroke: `5px ${brandColor}`,
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
