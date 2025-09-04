import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Token to base image mapping for strategies
const TOKEN_BASE_IMAGES = {
  LBTC: '/x-banner/strategies/LBTC.png',
  solvBTC: '/x-banner/strategies/solvBTC.png',
  eBTC: '/x-banner/strategies/eBTC.png',
  WBTC: '/x-banner/strategies/WBTC.png',
  uniBTC: '/x-banner/strategies/uniBTC.png',
} as const

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
      (key) => key.toLowerCase() === targetToken.toLowerCase(),
    ) as keyof typeof TOKEN_BASE_IMAGES

    const baseImagePath = validToken ? TOKEN_BASE_IMAGES[validToken] : undefined

    if (!baseImagePath) {
      return new NextResponse('Banner image not found', { status: 404 })
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
            {/* UP TO */}
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
                14.37
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
