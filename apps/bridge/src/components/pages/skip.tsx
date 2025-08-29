import { useState } from 'react'

import { track } from '@amplitude/analytics-browser'
import { Widget } from '@skip-go/widget'

// import { useFeatureEnabled } from '@/hooks/useFeatureEnabled'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useURLQueryParams } from '@/hooks/useURLQueryParams'
import { apiURL, endpointOptions } from '@/lib/skip-go-widget'
import { cn } from '@/utils/ui'

import { Banner } from '../Banner'
import { AuroraText } from '../ui/AuroraText'

export function SkipPage() {
  const defaultRoute = useURLQueryParams()
  const { resolvedTheme } = useTheme()
  const [queryParamsString, setQueryParamsString] = useState<string>()

  const showLedgerMainnet = process.env.NEXT_PUBLIC_SHOW_LEDGER_MAINNET === 'true'

  const onClickedShareButton = () => {
    if (queryParamsString) {
      navigator.clipboard.writeText(`${window.location.origin}?${queryParamsString}`)
      window.history.replaceState({}, '', `${window.location.pathname}?${queryParamsString}`)
    }
    track('go app share this route button - clicked', {
      queryParamsString,
    })
  }

  const onRouteUpdated = (props: {
    srcChainId?: string
    srcAssetDenom?: string
    destChainId?: string
    destAssetDenom?: string
    amountIn?: string
    amountOut?: string
  }) => {
    const params = new URLSearchParams({
      src_asset: props?.srcAssetDenom ?? '',
      src_chain: props?.srcChainId ?? '',
      dest_asset: props?.destAssetDenom ?? '',
      dest_chain: props?.destChainId ?? '',
      amount_in: props?.amountIn ?? '',
      amount_out: props?.amountOut ?? '',
    })

    const queryString = params.toString()

    setQueryParamsString(queryString)
  }

  if (!resolvedTheme) return null
  return (
    <div
      className={cn(
        'overflow-x-hidden overflow-y-hidden relative font-sans subpixel-antialiased bg-transparent',
      )}
    >
      <main className='relative flex min-h-[calc(100vh-400px)] flex-col'>
        {/* Intro Section (mirror @app Hero) */}
        <section className='overflow-hidden relative px-4 py-10 w-full sm:px-8 sm:py-20'>
          <div className='flex flex-col gap-8 items-start lg:flex-row lg:items-end lg:gap-12'>
            <div className='flex flex-col flex-1 gap-6 justify-between'>
              <div className='space-y-3'>
                <h1 className='text-3xl leading-tight lg:text-5xl font-funnel'>
                  <>Liquid Staking.</>
                  <span className='block'>
                    <AuroraText>Solid Yields.</AuroraText>
                  </span>
                </h1>
                <p className='max-w-lg text-sm leading-relaxed sm:text-base text-muted-foreground'>
                  Bridge your liquid staking tokens and earn maximum yield. Deposit supported assets
                  to earn real yield.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className='flex flex-col flex-grow justify-center items-center'>
          <div className='widget-container'>
            <Widget
              theme={resolvedTheme}
              endpointOptions={endpointOptions}
              apiUrl={apiURL}
              defaultRoute={defaultRoute}
              onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET}
              enableAmplitudeAnalytics
              disableShadowDom
              onRouteUpdated={onRouteUpdated}
              routeConfig={{
                experimentalFeatures: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
              }}
              settings={{
                useUnlimitedApproval: true,
              }}
              filterOut={{
                source: {
                  1: ['0xFEC6a341F9B7e30E30Ef5B990158FA539B6bb057'],
                  'evmos_9001-2': undefined,
                  ...(showLedgerMainnet ? {} : { 'ledger-mainnet-1': undefined }),
                },
                destination: {
                  1: [
                    '0xFEC6a341F9B7e30E30Ef5B990158FA539B6bb057',
                    '0xbf45a5029d081333407cc52a84be5ed40e181c46',
                  ],
                  'pacific-1': [
                    'ibc/6C00E4AA0CC7618370F81F7378638AE6C48EFF8C9203CE1C2357012B440EBDB7',
                    'ibc/CA6FBFAF399474A06263E10D0CE5AEBBE15189D6D4B2DD9ADE61007E68EB9DB0',
                  ],
                  '1329': [
                    '0xB75D0B03c06A926e488e2659DF1A861F860bD3d1',
                    '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1',
                  ],
                  'evmos_9001-2': undefined,
                  ...(showLedgerMainnet ? {} : { 'ledger-mainnet-1': undefined }),
                },
              }}
              filterOutUnlessUserHasBalance={{
                source: {
                  '1': ['0xbf45a5029d081333407cc52a84be5ed40e181c46'],
                  '1329': ['0xB75D0B03c06A926e488e2659DF1A861F860bD3d1'],
                },
              }}
              hideAssetsUnlessWalletTypeConnected={true}
            />
            {process.env.NEXT_PUBLIC_SHOW_BANNER === 'true' &&
            process.env.NEXT_PUBLIC_BANNER_MESSAGE &&
            process.env.NEXT_PUBLIC_BANNER_TITLE ? (
              <Banner theme={resolvedTheme} />
            ) : null}
          </div>
        </div>

        <div className='hidden flex-row justify-end items-center px-8 py-6 w-full md:flex'>
          <p
            className={`text-center text-[13px] opacity-50 ${resolvedTheme === 'dark' ? 'text-white' : 'text-black'}`}
          >
            <u>bridge.amberfi.io</u> {' is powered by Cosmos Hub, IBC Eureka & Skip:Go'}
          </p>
        </div>
      </main>
    </div>
  )
}
