import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

import tokens from '@/config/tokens'

export const runtime = 'edge'

// Token to base image mapping for strategies
const TOKEN_BASE_IMAGES = {
  lbtc: '/x-banner/strategies/lbtc.jpg',
  solvbtc: '/x-banner/strategies/solvbtc.jpg',
  ebtc: '/x-banner/strategies/ebtc.jpg',
  wbtc: '/x-banner/strategies/wbtc.jpg',
  unibtc: '/x-banner/strategies/unibtc.jpg',
} as const

const STRATEGIES_API_URL = 'https://api.amberfi.io/api/strategies'

function getTokenBrandColor(tokenSymbol: string): string {
  const token = tokens.find((t) => t.symbol.toLowerCase() === tokenSymbol.toLowerCase())
  return token?.brandColor || '#FF6B35'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token: tokenSymbol } = await params
    const { searchParams } = new URL(request.url)
    const strategy = searchParams.get('strategy')

    // Extract the last token from strategy parameter (e.g., "WBTC-uniBTC" -> "uniBTC")
    let targetToken = tokenSymbol
    if (strategy) {
      const lastToken = strategy.split('-').pop()
      targetToken = lastToken || tokenSymbol
    }

    // Case-insensitive
    const validToken = Object.keys(TOKEN_BASE_IMAGES).find(
      (key) => key.toLowerCase() === tokenSymbol.toLowerCase(),
    ) as keyof typeof TOKEN_BASE_IMAGES

    const baseImagePath = validToken ? TOKEN_BASE_IMAGES[validToken] : undefined

    if (!baseImagePath) {
      return new NextResponse('Banner image not found', { status: 404 })
    }

    // Get the brand color for the token
    const brandColor = getTokenBrandColor(validToken)

    let maxYield = 0
    try {
      const response = await fetch(STRATEGIES_API_URL, {
        next: { revalidate: 60 }, // Cache for 1 minute
      })

      if (response.ok) {
        const apiData = await response.json()
        const tokenKey = validToken?.toLowerCase() as keyof typeof apiData.yields

        if (apiData.yields && apiData.yields[tokenKey]) {
          maxYield = parseFloat(apiData.yields[tokenKey].max)
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch strategies yields data for ${tokenSymbol}.`)
    }

    const showApy = maxYield > 0

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
            fontFamily: 'Funnel, system-ui, sans-serif',
          }}
        >
          {/* Text Layout */}
          <div
            style={{
              position: 'absolute',
              top: '42%',
              right: '200px',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              fontFamily: 'Funnel, system-ui, sans-serif',
            }}
          >
            {!showApy && (
              <div
                style={{
                  fontSize: '58px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '5px',
                  display: 'flex',
                  letterSpacing: '0.2em',
                }}
              >
                GET
              </div>
            )}

            {showApy && (
              <div
                style={{
                  fontSize: '38px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '5px',
                  display: 'flex',
                  letterSpacing: '0.2em',
                }}
              >
                UP TO
              </div>
            )}

            {showApy && (
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
                      fontSize: '125px',
                      fontWeight: '900',
                      color: 'white',
                      lineHeight: '1',
                      letterSpacing: '0.1em',
                      WebkitTextStroke: '8px white',
                    } as React.CSSProperties
                  }
                >
                  {maxYield.toFixed(2)}
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
                fontSize: '38px',
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                letterSpacing: '0.2em',
              }}
            >
              YIELD ON maxBTC
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
    console.error('Error generating strategies banner:', error)
    return new NextResponse('Error generating strategies banner', { status: 500 })
  }
}
