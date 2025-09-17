'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Widget } from '@skip-go/widget'

import { useTheme } from '@/components/providers/ThemeProvider'
import { AuroraText } from '@/components/ui/AuroraText'
import { useURLQueryParams } from '@/hooks/useURLQueryParams'
import { apiURL, endpointOptions } from '@/lib/skip-go-widget'
import { cn } from '@/utils/ui'

interface AssetPair {
  source: { chainId: string; denom: string }
  destination: { chainId: string; denom: string }
}

const preselectedIfEmpty = {
  srcChainId: '1',
  srcAssetDenom: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  destChainId: 'neutron-1',
  destAssetDenom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
}

export function SkipPage() {
  const defaultRoute = useURLQueryParams()
  const { resolvedTheme } = useTheme()

  // Track the current source asset to detect changes
  const [currentSourceAsset, setCurrentSourceAsset] = useState<{
    chainId?: string
    denom?: string
  }>({})

  // Force reset amounts when source changes
  const [shouldResetAmounts, setShouldResetAmounts] = useState(false)

  // Add a ref to prevent rapid updates
  const lastUpdateRef = useRef<number>(0)
  const updateThrottleMs = 100

  // State for auto-selected route
  const [autoSelectedRoute, setAutoSelectedRoute] = useState<{
    srcChainId?: string
    srcAssetDenom?: string
    destChainId?: string
    destAssetDenom?: string
  } | null>(null)

  const defaultRouteConfig = useMemo(() => {
    // Force reset amounts to 0 when source changes
    const resetAmounts = shouldResetAmounts ? { amountIn: 0, amountOut: 0 } : {}

    // If we have an auto-selected route, use that
    if (autoSelectedRoute) {
      return {
        srcChainId: autoSelectedRoute.srcChainId,
        srcAssetDenom: autoSelectedRoute.srcAssetDenom,
        destChainId: autoSelectedRoute.destChainId,
        destAssetDenom: autoSelectedRoute.destAssetDenom,
        destLocked: true, // Lock destination when auto-selecting
        ...resetAmounts,
      }
    }

    // If we have URL params, use them (only for initial load)
    if (defaultRoute) {
      const shouldLockDest = Boolean(defaultRoute.destChainId && defaultRoute.destAssetDenom)
      return {
        srcChainId: defaultRoute.srcChainId || preselectedIfEmpty.srcChainId,
        srcAssetDenom: defaultRoute.srcAssetDenom || preselectedIfEmpty.srcAssetDenom,
        destChainId: defaultRoute.destChainId || preselectedIfEmpty.destChainId,
        destAssetDenom: defaultRoute.destAssetDenom || preselectedIfEmpty.destAssetDenom,
        destLocked: shouldLockDest,
        amountIn: shouldResetAmounts ? 0 : defaultRoute.amountIn,
        amountOut: shouldResetAmounts ? 0 : defaultRoute.amountOut,
      }
    }

    // Otherwise, use defaults
    return {
      ...preselectedIfEmpty,
      ...resetAmounts,
    }
  }, [defaultRoute, autoSelectedRoute, shouldResetAmounts])

  const isAutoSelectingRef = useRef(false)
  const currentSelectionRef = useRef<{
    srcChainId?: string
    srcAssetDenom?: string
    destChainId?: string
    destAssetDenom?: string
  }>({})

  // Helper function to hide Solana connect buttons
  const hideSolanaConnectButtons = () => {
    const ROOT_SELECTOR = '[data-root-id="amber-bridge"]'
    const roots = document.querySelectorAll(ROOT_SELECTOR)
    roots.forEach((root) => {
      const buttons = root.querySelectorAll('button')
      buttons.forEach((button) => {
        const text = (button.textContent || '').trim()
        if (/solana/i.test(text)) {
          ;(button as HTMLElement).style.display = 'none'
        }
      })
    })
  }

  // Hide Solana connect option inside the Skip widget wallet modal
  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new MutationObserver(hideSolanaConnectButtons)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    hideSolanaConnectButtons()

    return () => observer.disconnect()
  }, [])

  // Define allowed asset pairs. Populate this with your desired pairs.
  // Each entry restricts bridging from a specific source asset to a specific destination asset.
  const allowedPairs: AssetPair[] = [
    // FBTC
    // {
    //   source: {
    //     chainId: 'neutron-1',
    //     denom: 'ibc/2EB30350120BBAFC168F55D0E65551A27A724175E8FBCC7B37F9A71618FE136B',
    //   },
    //   destination: { chainId: '1', denom: '0xc96de26018a54d51c097160568752c4e3bd6c364' },
    // },
    // {
    //   source: { chainId: '1', denom: '0xc96de26018a54d51c097160568752c4e3bd6c364' },
    //   destination: {
    //     chainId: 'neutron-1',
    //     denom: 'ibc/2EB30350120BBAFC168F55D0E65551A27A724175E8FBCC7B37F9A71618FE136B',
    //   },
    // },
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
    // pumpBTC
    // {
    //   source: {
    //     chainId: 'neutron-1',
    //     denom: 'ibc/1075520501498E008B02FD414CD8079C0A2BAF9657278F8FB8F7D37A857ED668',
    //   },
    //   destination: { chainId: '1', denom: '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e' },
    // },
    // {
    //   source: { chainId: '1', denom: '0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e' },
    //   destination: {
    //     chainId: 'neutron-1',
    //     denom: 'ibc/1075520501498E008B02FD414CD8079C0A2BAF9657278F8FB8F7D37A857ED668',
    //   },
    // },
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
    return typeof chainId === 'string' && /^\d+$/.test(chainId)
  }

  function normalizeDenomForCompare(denom?: string, chainId?: string) {
    if (!denom) return ''
    if (isEvmChainId(chainId) && denom.startsWith('0x')) return denom.toLowerCase()
    // Treat IBC denoms case-insensitively to avoid mismatches from different casing
    if (denom.startsWith('ibc/')) return `ibc/${denom.slice(4).toUpperCase()}`
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
        let selectedDenoms = intersection
        if (!intersection.length) {
          selectedDenoms = aDenoms.length ? aDenoms : bDenoms
        }
        merged[side][chainId] = selectedDenoms
      }
    }
    return merged
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
    let filter: AssetPair | null = null
    const hasSrc = srcChainId && srcAssetDenom
    if (hasSrc) {
      // Find the exact matching destination pair and lock destination to it
      const matchingPair = allowedPairs.find(
        (p) =>
          p.source.chainId === srcChainId &&
          denomsEqual(p.source.denom, p.source.chainId, srcAssetDenom, srcChainId),
      )

      if (matchingPair)
        filter = {
          source: { chainId: srcChainId, denom: srcAssetDenom },
          destination: {
            chainId: matchingPair.destination.chainId,
            denom: matchingPair.destination.denom,
          },
        }
    }
    // If nothing matched, return undefined to avoid over-restricting
    return filter ?? undefined
  }

  const onRouteUpdated = (props: {
    srcChainId?: string
    srcAssetDenom?: string
    destChainId?: string
    destAssetDenom?: string
    amountIn?: string
    amountOut?: string
  }) => {
    // Throttle updates to prevent infinite loops
    const now = Date.now()
    if (now - lastUpdateRef.current < updateThrottleMs) {
      return
    }
    lastUpdateRef.current = now

    // Track latest selection state for other callbacks
    currentSelectionRef.current = {
      srcChainId: props?.srcChainId,
      srcAssetDenom: props?.srcAssetDenom,
      destChainId: props?.destChainId,
      destAssetDenom: props?.destAssetDenom,
    }

    // Check if source asset has changed
    const sourceAssetChanged =
      currentSourceAsset.chainId !== props?.srcChainId ||
      currentSourceAsset.denom !== props?.srcAssetDenom

    // Update current source asset tracking only if it actually changed
    if (sourceAssetChanged) {
      setCurrentSourceAsset({
        chainId: props?.srcChainId,
        denom: props?.srcAssetDenom,
      })

      // Clear auto-selected route when source changes
      if (autoSelectedRoute) {
        setAutoSelectedRoute(null)
      }

      // Force reset both amounts when source changes
      setShouldResetAmounts(true)

      // Reset the flag after a brief delay to allow widget to process the reset
      setTimeout(() => {
        setShouldResetAmounts(false)
      }, 50)
    }

    // Auto-select destination based on source selection
    const pf = computePairFilter(props)
    if (!pf) {
      isAutoSelectingRef.current = false
      return
    }

    // Skip if we're currently auto-selecting to prevent infinite loops
    if (isAutoSelectingRef.current) {
      return
    }

    // Only skip if both source and destination are already set to what we want
    if (
      denomsEqual(
        props.destAssetDenom,
        props.destChainId,
        pf.destination.denom,
        pf.destination.chainId,
      )
    )
      return

    if (pf.source && pf.destination) {
      isAutoSelectingRef.current = true

      // Set the auto-selected route to trigger widget update
      setAutoSelectedRoute({
        srcChainId: pf.source.chainId,
        srcAssetDenom: pf.source.denom,
        destChainId: pf.destination.chainId,
        destAssetDenom: pf.destination.denom,
      })

      setTimeout(() => {
        isAutoSelectingRef.current = false
        // Don't clear autoSelectedRoute - let it persist until user makes a different selection
      }, 300)
    }
  }

  const clearAutoSelection = () => {
    if (!isAutoSelectingRef.current && autoSelectedRoute) {
      setAutoSelectedRoute(null)
    }
  }

  const onSourceAssetUpdated = ({ chainId, denom }: { chainId?: string; denom?: string }) => {
    // Clear auto-selection when user manually changes source
    clearAutoSelection()
  }

  const onDestinationAssetUpdated = ({ chainId, denom }: { chainId?: string; denom?: string }) => {
    // Clear auto-selection when user manually changes destination
    clearAutoSelection()
  }

  return (
    <div
      className={cn(
        'overflow-x-hidden overflow-y-hidden relative font-sans subpixel-antialiased bg-transparent',
      )}
    >
      <main className='relative flex min-h-[calc(100vh-500px)] flex-col'>
        {/* Intro Section (mirror Swap hero copy/center) */}
        <section className='relative w-full py-8 sm:py-10 px-4'>
          <div className='flex flex-col items-center gap-4'>
            <h1 className='text-3xl lg:text-5xl font-funnel leading-tight text-center'>
              Bridge <AuroraText>Bitcoin LSTs</AuroraText>
            </h1>
            <p className='text-xs sm:text-base text-muted-foreground max-w-md text-center'>
              Bridge your Bitcoin Liquid Staking Tokens via our partner Skip:Go.
            </p>
          </div>
        </section>

        {/* Widget Card wrapper to mirror Swap card */}
        <div className='w-full max-w-lg mx-auto pb-16 px-4'>
          <div className='bg-card rounded-2xl shadow-xl border border-border/30 py-2 min-h-[295px]'>
            <div className='sm:py-2 px-2'>
              <div className='widget-container'>
                <Widget
                  rootId='amber-bridge'
                  theme={resolvedTheme}
                  endpointOptions={endpointOptions}
                  apiUrl={apiURL}
                  defaultRoute={defaultRouteConfig}
                  onlyTestnet={false}
                  enableAmplitudeAnalytics
                  disableShadowDom
                  onRouteUpdated={onRouteUpdated}
                  onSourceAssetUpdated={onSourceAssetUpdated}
                  onDestinationAssetUpdated={onDestinationAssetUpdated}
                  routeConfig={{
                    experimentalFeatures: ['eureka'],
                    goFast: false,
                  }}
                  settings={{
                    useUnlimitedApproval: true,
                  }}
                  filter={baseAllowedFilter}
                  hideAssetsUnlessWalletTypeConnected={false}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='w-full max-w-lg mx-auto py-4 px-4 sm:px-0 sm:pl-8'>
          <p className='sm:text-base max-w-md text-center text-xs text-muted-foreground'>
            If you hold your Bitcoin LSTs on any other chain than Ethereum or Neutron, you can
            bridge them via the official{' '}
            <a
              href='https://go.skip.build'
              className='text-amber-500 underline hover:no-underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              Skip:Go bridge UI
            </a>
            <span>.</span>
          </p>
        </div>
      </main>
    </div>
  )
}
