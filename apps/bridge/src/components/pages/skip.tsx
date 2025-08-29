import { useMemo, useRef, useState } from 'react'

import { track } from '@amplitude/analytics-browser'
import { Widget, setAsset } from '@skip-go/widget'

// import { useFeatureEnabled } from '@/hooks/useFeatureEnabled'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useURLQueryParams } from '@/hooks/useURLQueryParams'
import { apiURL, endpointOptions } from '@/lib/skip-go-widget'
import { cn } from '@/utils/ui'

import { Banner } from '../Banner'
import { AuroraText } from '../ui/AuroraText'

export function SkipPage() {
  const defaultRoute = useURLQueryParams()
  const defaultRouteConfig = useMemo(() => {
    // If no route provided via URL, preselect Ethereum WBTC -> Neutron WBTC
    const preselectedIfEmpty = defaultRoute ?? {
      srcChainId: '1',
      srcAssetDenom: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      destChainId: 'neutron-1',
      destAssetDenom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
    }

    // Only lock destination if explicitly provided by URL params
    const shouldLockDest = Boolean(defaultRoute?.destChainId && defaultRoute?.destAssetDenom)
    return shouldLockDest ? { ...preselectedIfEmpty, destLocked: true } : { ...preselectedIfEmpty }
  }, [defaultRoute])
  const { resolvedTheme } = useTheme()
  const [queryParamsString, setQueryParamsString] = useState<string>()
  const [pairFilter, setPairFilter] = useState<any>()

  const lastAutoSelectionRef = useRef<{
    type: 'source' | 'destination'
    chainId: string
    denom: string
  } | null>(null)
  const isAutoSelectingRef = useRef(false)
  const currentSelectionRef = useRef<{
    srcChainId?: string
    srcAssetDenom?: string
    destChainId?: string
    destAssetDenom?: string
  }>({})

  const showLedgerMainnet = process.env.NEXT_PUBLIC_SHOW_LEDGER_MAINNET === 'true'

  // No useEffect for auto-selection - moved back to onRouteUpdated to prevent infinite loops

  // Define allowed asset pairs. Populate this with your desired pairs.
  // Each entry restricts bridging from a specific source asset to a specific destination asset.
  // Example:
  // {
  //   source: { chainId: 'neutron-1', denom: 'ibc/...' },
  //   destination: { chainId: 'cosmoshub-4', denom: 'uatom' }
  // }
  const allowedPairs: Array<{
    source: { chainId: string; denom: string }
    destination: { chainId: string; denom: string }
  }> = [
    // FBTC
    {
      source: {
        chainId: 'neutron-1',
        denom: 'ibc/2EB30350120BBAFC168F55D0E65551A27A724175E8FBCC7B37F9A71618FE136B',
      },
      destination: { chainId: '1', denom: '0xc96de26018a54d51c097160568752c4e3bd6c364' },
    },
    {
      source: { chainId: '1', denom: '0xc96de26018a54d51c097160568752c4e3bd6c364' },
      destination: {
        chainId: 'neutron-1',
        denom: 'ibc/2EB30350120BBAFC168F55D0E65551A27A724175E8FBCC7B37F9A71618FE136B',
      },
    },
    // LBTC
    {
      source: {
        chainId: 'neutron-1',
        denom: 'ibc/B7BF60BB54433071B49D586F54BD4DED5E20BEFBBA91958E87488A761115106B',
      },
      destination: { chainId: '1', denom: '0x8236a87084f8b84306f72007f36f2618a5634494' },
    },
    {
      source: { chainId: '1', denom: '0x8236a87084f8b84306f72007f36f2618a5634494' },
      destination: {
        chainId: 'neutron-1',
        denom: 'ibc/B7BF60BB54433071B49D586F54BD4DED5E20BEFBBA91958E87488A761115106B',
      },
    },
    // solvBTC
    {
      source: {
        chainId: 'neutron-1',
        denom: 'ibc/C0F284F165E6152F6DDDA900537C1BC8DA1EA00F03B9C9EC1841FA7E004EF7A3',
      },
      destination: { chainId: '1', denom: '0x7a56e1c57c7475ccf742a1832b028f0456652f97' },
    },
    {
      source: { chainId: '1', denom: '0x7a56e1c57c7475ccf742a1832b028f0456652f97' },
      destination: {
        chainId: 'neutron-1',
        denom: 'ibc/C0F284F165E6152F6DDDA900537C1BC8DA1EA00F03B9C9EC1841FA7E004EF7A3',
      },
    },
    // eBTC
    {
      source: {
        chainId: 'neutron-1',
        denom: 'ibc/E2A000FD3EDD91C9429B473995CE2C7C555BCC8CFC1D0A3D02F514392B7A80E8',
      },
      destination: { chainId: '1', denom: '0x657e8c867d8b37dcc18fa4caead9c45eb088c642' },
    },
    {
      source: { chainId: '1', denom: '0x657e8c867d8b37dcc18fa4caead9c45eb088c642' },
      destination: {
        chainId: 'neutron-1',
        denom: 'ibc/E2A000FD3EDD91C9429B473995CE2C7C555BCC8CFC1D0A3D02F514392B7A80E8',
      },
    },
    // pumpBTC (neutron-1 <-> 56)
    {
      source: {
        chainId: 'neutron-1',
        denom: 'ibc/1075520501498E008B02FD414CD8079C0A2BAF9657278F8FB8F7D37A857ED668',
      },
      destination: { chainId: '56', denom: '0xf9c4ff105803a77ecb5dae300871ad76c2794fa4' },
    },
    {
      source: { chainId: '56', denom: '0xf9c4ff105803a77ecb5dae300871ad76c2794fa4' },
      destination: {
        chainId: 'neutron-1',
        denom: 'ibc/1075520501498E008B02FD414CD8079C0A2BAF9657278F8FB8F7D37A857ED668',
      },
    },
    // uniBTC
    {
      source: {
        chainId: 'neutron-1',
        denom: 'ibc/3F1D988D9EEA19EB0F3950B4C19664218031D8BCE68CE7DE30F187D5ACEA0463',
      },
      destination: { chainId: '1', denom: '0x004e9c3ef86bc1ca1f0bb5c7662861ee93350568' },
    },
    {
      source: { chainId: '1', denom: '0x004e9c3ef86bc1ca1f0bb5c7662861ee93350568' },
      destination: {
        chainId: 'neutron-1',
        denom: 'ibc/3F1D988D9EEA19EB0F3950B4C19664218031D8BCE68CE7DE30F187D5ACEA0463',
      },
    },
    // WBTC
    {
      source: {
        chainId: 'neutron-1',
        denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
      },
      destination: { chainId: '1', denom: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
    },
    {
      source: { chainId: '1', denom: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
      destination: {
        chainId: 'neutron-1',
        denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
      },
    },
  ]

  function isEvmChainId(chainId?: string) {
    return typeof chainId === 'string' && /^[0-9]+$/.test(chainId)
  }

  function normalizeDenomForCompare(denom?: string, chainId?: string) {
    if (!denom) return ''
    if (isEvmChainId(chainId) && denom.startsWith('0x')) return denom.toLowerCase()
    return denom
  }

  function denomsEqual(aDenom?: string, aChainId?: string, bDenom?: string, bChainId?: string) {
    return normalizeDenomForCompare(aDenom, aChainId) === normalizeDenomForCompare(bDenom, bChainId)
  }

  const baseAllowedFilter = useMemo(() => {
    const sourceMap: Record<string, Set<string>> = {}
    const destMap: Record<string, Set<string>> = {}
    for (const p of allowedPairs) {
      if (!sourceMap[p.source.chainId]) sourceMap[p.source.chainId] = new Set<string>()
      sourceMap[p.source.chainId].add(p.source.denom)
      if (!destMap[p.destination.chainId]) destMap[p.destination.chainId] = new Set<string>()
      destMap[p.destination.chainId].add(p.destination.denom)
    }
    const toArray = (m: Record<string, Set<string>>) =>
      Object.fromEntries(Object.entries(m).map(([k, v]) => [k, Array.from(v)]))
    return {
      source: toArray(sourceMap),
      destination: toArray(destMap),
    }
  }, [])

  function mergeFilters(a?: any, b?: any) {
    if (!a && !b) return undefined
    if (!a) return b
    if (!b) return a
    const merged: any = { source: {}, destination: {} }
    for (const side of ['source', 'destination'] as const) {
      const aSide = a?.[side] || {}
      const bSide = b?.[side] || {}
      const chainIds = new Set<string>([...Object.keys(aSide), ...Object.keys(bSide)])
      for (const chainId of chainIds) {
        const aDenoms: string[] = aSide?.[chainId] || []
        const bDenoms: string[] = bSide?.[chainId] || []
        const set = new Set(aDenoms)
        const intersection = bDenoms.filter((d) => set.has(d))
        // If either side omits the chain or is empty, treat as allowing only the other
        merged[side][chainId] = intersection.length
          ? intersection
          : aDenoms.length
            ? aDenoms
            : bDenoms
      }
    }
    return merged
  }

  function normalizeFilter(f?: any) {
    if (!f) return undefined
    const out: any = { source: {}, destination: {} }
    for (const side of ['source', 'destination'] as const) {
      const sideObj = f?.[side] || {}
      for (const chainId of Object.keys(sideObj).sort()) {
        const denoms: string[] = sideObj[chainId] || []
        out[side][chainId] = [...denoms].sort()
      }
    }
    return out
  }

  function filtersEqual(a?: any, b?: any) {
    const na = normalizeFilter(a)
    const nb = normalizeFilter(b)
    return JSON.stringify(na) === JSON.stringify(nb)
  }

  function computePairFilter({
    srcChainId,
    srcAssetDenom,
    destChainId,
    destAssetDenom,
  }: {
    srcChainId?: string
    srcAssetDenom?: string
    destChainId?: string
    destAssetDenom?: string
  }) {
    let filter: any = { source: {}, destination: {} }
    const hasSrc = srcChainId && srcAssetDenom
    const hasDest = destChainId && destAssetDenom

    if (hasSrc) {
      // Find the exact matching destination pair and lock destination to it
      const matchingPair = allowedPairs.find(
        (p) =>
          p.source.chainId === srcChainId &&
          denomsEqual(p.source.denom, p.source.chainId, srcAssetDenom, srcChainId),
      )
      if (matchingPair) {
        // Lock destination to ONLY this exact pair
        filter.destination[matchingPair.destination.chainId] = [matchingPair.destination.denom]
      }
    }

    if (hasDest) {
      // Lock destination to the selected asset
      filter.destination[destChainId as string] = [destAssetDenom as string]
      // Do NOT restrict source list; it should remain constant
    }

    // If nothing matched, return undefined to avoid over-restricting
    const hasAny =
      Object.keys(filter.source).length > 0 || Object.keys(filter.destination).length > 0
    return hasAny ? filter : undefined
  }

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
    console.log('onRouteUpdated called with:', props)

    // Track latest selection state for other callbacks
    currentSelectionRef.current = {
      srcChainId: props?.srcChainId,
      srcAssetDenom: props?.srcAssetDenom,
      destChainId: props?.destChainId,
      destAssetDenom: props?.destAssetDenom,
    }

    // Skip processing if we're currently auto-selecting to prevent infinite loops
    if (isAutoSelectingRef.current) {
      console.log('Skipping onRouteUpdated because auto-selection is in progress')
      return
    }

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

    // Update pair-based filter whenever selection changes
    const pf = computePairFilter(props)
    if (!filtersEqual(pf, pairFilter)) {
      setPairFilter(pf)
    }

    // If both are set, ensure they form an allowed pair. If not, correct destination to match source
    if (props.srcChainId && props.srcAssetDenom && props.destChainId && props.destAssetDenom) {
      const exactPair = allowedPairs.find(
        (p) =>
          p.source.chainId === props.srcChainId &&
          denomsEqual(p.source.denom, p.source.chainId, props.srcAssetDenom, props.srcChainId) &&
          p.destination.chainId === props.destChainId &&
          denomsEqual(
            p.destination.denom,
            p.destination.chainId,
            props.destAssetDenom,
            props.destChainId,
          ),
      )
      if (exactPair) {
        lastAutoSelectionRef.current = null
      } else {
        const matchFromSource = allowedPairs.find(
          (p) =>
            p.source.chainId === props.srcChainId &&
            denomsEqual(p.source.denom, p.source.chainId, props.srcAssetDenom, props.srcChainId),
        )
        if (matchFromSource) {
          const needsUpdate =
            props.destChainId !== matchFromSource.destination.chainId ||
            !denomsEqual(
              props.destAssetDenom,
              props.destChainId,
              matchFromSource.destination.denom,
              matchFromSource.destination.chainId,
            )
          if (needsUpdate) {
            isAutoSelectingRef.current = true
            setTimeout(() => {
              try {
                setAsset({
                  type: 'destination',
                  chainId: matchFromSource.destination.chainId,
                  denom: matchFromSource.destination.denom,
                })
                lastAutoSelectionRef.current = {
                  type: 'destination',
                  chainId: matchFromSource.destination.chainId,
                  denom: matchFromSource.destination.denom,
                }
              } finally {
                setTimeout(() => {
                  isAutoSelectingRef.current = false
                }, 300)
              }
            }, 150)
          }
        }
      }
    }

    // Auto-select destination when source is chosen and destination not set yet
    if (props.srcChainId && props.srcAssetDenom && (!props.destChainId || !props.destAssetDenom)) {
      const match = allowedPairs.find(
        (p) =>
          p.source.chainId === props.srcChainId &&
          denomsEqual(p.source.denom, p.source.chainId, props.srcAssetDenom, props.srcChainId),
      )
      if (match) {
        const lastSelection = lastAutoSelectionRef.current
        const isSameAsLastSelection =
          lastSelection?.type === 'destination' &&
          lastSelection?.chainId === match.destination.chainId &&
          lastSelection?.denom === match.destination.denom

        if (!isSameAsLastSelection) {
          console.log('Auto-selecting destination:', match.destination)
          console.log('Source was:', { chainId: props.srcChainId, denom: props.srcAssetDenom })
          isAutoSelectingRef.current = true

          // Set destination immediately since the filter will lock it anyway
          setTimeout(() => {
            try {
              console.log('Setting destination asset:', match.destination)
              setAsset({
                type: 'destination',
                chainId: match.destination.chainId,
                denom: match.destination.denom,
              })
              console.log('Successfully set destination asset')
              lastAutoSelectionRef.current = {
                type: 'destination',
                chainId: match.destination.chainId,
                denom: match.destination.denom,
              }
              // Clear the flag after success
              setTimeout(() => {
                isAutoSelectingRef.current = false
                console.log('Auto-selection completed')
              }, 300)
            } catch (error) {
              console.log('Failed to set destination asset:', error)
              isAutoSelectingRef.current = false
            }
          }, 150) // Quick delay
        }
      }
    }

    // Auto-select source when destination is chosen and source not set yet (reverse direction)
    if (props.destChainId && props.destAssetDenom && (!props.srcChainId || !props.srcAssetDenom)) {
      const match = allowedPairs.find(
        (p) =>
          p.destination.chainId === props.destChainId &&
          denomsEqual(
            p.destination.denom,
            p.destination.chainId,
            props.destAssetDenom,
            props.destChainId,
          ),
      )
      if (match) {
        const lastSelection = lastAutoSelectionRef.current
        const isSameAsLastSelection =
          lastSelection?.type === 'source' &&
          lastSelection?.chainId === match.source.chainId &&
          lastSelection?.denom === match.source.denom

        if (!isSameAsLastSelection) {
          console.log('Auto-selecting source:', match.source)
          console.log('Destination was:', {
            chainId: props.destChainId,
            denom: props.destAssetDenom,
          })
          isAutoSelectingRef.current = true

          // Set source immediately since the filter will lock it anyway
          setTimeout(() => {
            try {
              console.log('Setting source asset:', match.source)
              setAsset({
                type: 'source',
                chainId: match.source.chainId,
                denom: match.source.denom,
              })
              console.log('Successfully set source asset')
              lastAutoSelectionRef.current = {
                type: 'source',
                chainId: match.source.chainId,
                denom: match.source.denom,
              }
              // Clear the flag after success
              setTimeout(() => {
                isAutoSelectingRef.current = false
                console.log('Auto-selection completed')
              }, 300)
            } catch (error) {
              console.log('Failed to set source asset:', error)
              isAutoSelectingRef.current = false
            }
          }, 150) // Quick delay
        }
      }
    }
  }

  const onSourceAssetUpdated = ({ chainId, denom }: { chainId?: string; denom?: string }) => {
    if (!chainId || !denom) return
    // Only auto-select destination if it's not already set
    const { destChainId, destAssetDenom } = currentSelectionRef.current || {}
    if (destChainId && destAssetDenom) return

    const match = allowedPairs.find(
      (p) =>
        p.source.chainId === chainId &&
        denomsEqual(p.source.denom, p.source.chainId, denom, chainId),
    )
    if (!match) return

    const lastSelection = lastAutoSelectionRef.current
    const isSameAsLastSelection =
      lastSelection?.type === 'destination' &&
      lastSelection?.chainId === match.destination.chainId &&
      lastSelection?.denom === match.destination.denom

    if (isSameAsLastSelection) return

    isAutoSelectingRef.current = true
    setTimeout(() => {
      try {
        setAsset({
          type: 'destination',
          chainId: match.destination.chainId,
          denom: match.destination.denom,
        })
        lastAutoSelectionRef.current = {
          type: 'destination',
          chainId: match.destination.chainId,
          denom: match.destination.denom,
        }
      } finally {
        setTimeout(() => {
          isAutoSelectingRef.current = false
        }, 300)
      }
    }, 200)
  }

  const onDestinationAssetUpdated = ({ chainId, denom }: { chainId?: string; denom?: string }) => {
    if (!chainId || !denom) return
    // Only auto-select source if it's not already set
    const { srcChainId, srcAssetDenom } = currentSelectionRef.current || {}
    if (srcChainId && srcAssetDenom) return

    const match = allowedPairs.find(
      (p) =>
        p.destination.chainId === chainId &&
        denomsEqual(p.destination.denom, p.destination.chainId, denom, chainId),
    )
    if (!match) return

    const lastSelection = lastAutoSelectionRef.current
    const isSameAsLastSelection =
      lastSelection?.type === 'source' &&
      lastSelection?.chainId === match.source.chainId &&
      lastSelection?.denom === match.source.denom

    if (isSameAsLastSelection) return

    isAutoSelectingRef.current = true
    setTimeout(() => {
      try {
        setAsset({ type: 'source', chainId: match.source.chainId, denom: match.source.denom })
        lastAutoSelectionRef.current = {
          type: 'source',
          chainId: match.source.chainId,
          denom: match.source.denom,
        }
      } finally {
        setTimeout(() => {
          isAutoSelectingRef.current = false
        }, 300)
      }
    }, 200)
  }

  if (!resolvedTheme) return null
  return (
    <div
      className={cn(
        'overflow-x-hidden overflow-y-hidden relative font-sans subpixel-antialiased bg-transparent',
      )}
    >
      <main className='relative flex min-h-[calc(100vh-500px)] flex-col'>
        {/* Intro Section (mirror @app Hero) */}
        <section className='overflow-hidden relative px-4 py-10 w-full sm:px-8 sm:py-20'>
          <div className='flex flex-col gap-8 items-start lg:flex-row lg:items-end lg:gap-12'>
            <div className='flex flex-col flex-1 gap-6 justify-between'>
              <div className='space-y-3'>
                <h1 className='text-3xl leading-tight lg:text-5xl font-funnel'>
                  Bridge BRTs.
                  <span className='block'>
                    <AuroraText>Via Skip:Go</AuroraText>
                  </span>
                </h1>
                <p className='max-w-lg text-sm leading-relaxed sm:text-base text-muted-foreground'>
                  Bridge your Bitcoin Related Tokens (BRTs) via our partner Skip:Go.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className='flex flex-col flex-grow justify-center items-center'>
          <div className='widget-container'>
            <Widget
              rootId='amber-bridge'
              theme={resolvedTheme}
              endpointOptions={endpointOptions}
              apiUrl={apiURL}
              defaultRoute={defaultRouteConfig}
              onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET}
              enableAmplitudeAnalytics
              disableShadowDom
              onRouteUpdated={onRouteUpdated}
              onSourceAssetUpdated={onSourceAssetUpdated}
              onDestinationAssetUpdated={onDestinationAssetUpdated}
              routeConfig={{
                experimentalFeatures: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
              }}
              settings={{
                useUnlimitedApproval: true,
              }}
              filter={useMemo(
                () => mergeFilters(baseAllowedFilter, pairFilter),
                [baseAllowedFilter, pairFilter],
              )}
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

        <div className='hidden flex-row justify-end items-center px-8 pt-24 w-full md:flex'>
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
