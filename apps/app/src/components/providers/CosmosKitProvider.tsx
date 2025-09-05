'use client'

import { useEffect, useState } from 'react'

import { GasPrice } from '@cosmjs/stargate'
import { wallets as cosmostationWallets } from '@cosmos-kit/cosmostation'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { wallets as leapWallets } from '@cosmos-kit/leap'
import { wallets as okxWallets } from '@cosmos-kit/okxwallet'
import { ChainProvider } from '@cosmos-kit/react'
import { wallets as vectisWallets } from '@cosmos-kit/vectis'
import { wallets as xdefiWallets } from '@cosmos-kit/xdefi'
import '@interchain-ui/react/styles'
import { assetLists } from 'chain-registry'

import chainConfig from '@/config/chain'
import { getCosmosKitTheme } from '@/theme/cosmosKitTheme'

const chainNames = [chainConfig.name]
const chainAssets = assetLists.filter((asset) => asset.chainName === chainConfig.name)

// Utility to check wallet availability
const isWalletAvailable = (walletName: string): boolean => {
  if (typeof window === 'undefined') return false

  const windowAny = window as any

  switch (walletName) {
    case 'keplr':
      return !!windowAny.keplr
    case 'leap':
      return !!windowAny.leap
    case 'cosmostation':
      return !!windowAny.cosmostation
    case 'xdefi':
      return !!windowAny.xfi?.cosmos
    case 'okx':
      return !!windowAny.okxwallet
    case 'vectis':
      return !!windowAny.vectis
    default:
      return false
  }
}

// Filter wallets based on availability
const getAvailableWallets = () => {
  const allWallets = [
    { wallets: keplrWallets, name: 'keplr' },
    { wallets: leapWallets, name: 'leap' },
    { wallets: cosmostationWallets, name: 'cosmostation' },
    { wallets: xdefiWallets, name: 'xdefi' },
    { wallets: okxWallets, name: 'okx' },
    { wallets: vectisWallets, name: 'vectis' },
  ]

  const availableWallets = allWallets
    .filter(({ name }) => isWalletAvailable(name))
    .flatMap(({ wallets }) => wallets)

  // Always include Keplr as fallback since it's the most common
  if (availableWallets.length === 0) {
    return keplrWallets
  }

  return availableWallets
}

export const CosmosKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the theme configuration
  const modalTheme = getCosmosKitTheme()

  // State to track available wallets
  const [availableWallets, setAvailableWallets] = useState(() => {
    // Initial state with Keplr as fallback for SSR
    return keplrWallets
  })

  // Update available wallets after component mounts
  useEffect(() => {
    // Small delay to ensure wallet extensions are loaded
    const timer = setTimeout(() => {
      const wallets = getAvailableWallets()
      setAvailableWallets(wallets)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ChainProvider
      chains={chainNames}
      assetLists={chainAssets as any}
      wallets={availableWallets}
      throwErrors={'connect_only'}
      walletConnectOptions={{
        signClient: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
          relayUrl: 'wss://relay.walletconnect.org',
          metadata: {
            name: 'Amber Finance',
            description: 'Amber Finance - powered by Mars Protocol',
            url: 'https://app.amberfi.io',
            icons: ['https://app.amberfi.io/favicon-96x96.png'],
          },
        },
      }}
      signerOptions={{
        signingCosmwasm: () => {
          return {
            gasPrice: GasPrice.fromString('0.025untrn') as unknown as any,
          }
        },
        signingStargate: () => {
          return {
            gasPrice: GasPrice.fromString('0.025untrn') as unknown as any,
          }
        },
      }}
      modalTheme={modalTheme}
      logLevel={'ERROR'}
    >
      {children}
    </ChainProvider>
  )
}
