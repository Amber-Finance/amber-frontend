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

// Utility to check wallet availability safely
const isWalletAvailable = (walletName: string): boolean => {
  if (typeof window === 'undefined') return false

  try {
    const windowAny = window as any

    switch (walletName) {
      case 'keplr':
        return !!(windowAny.keplr || windowAny.getKeplr)
      case 'leap':
        return !!windowAny?.leap?.getCosmosSigner
      case 'cosmostation':
        return !!windowAny?.cosmostation?.providers
      case 'xdefi':
        return !!windowAny?.xfi?.cosmos?.getCosmosSigner
      case 'okx':
        return !!windowAny?.okxwallet?.cosmos
      case 'vectis':
        return !!windowAny?.vectis?.getCosmosSigner
      default:
        return false
    }
  } catch (error) {
    console.warn(`Error checking wallet ${walletName}:`, error)
    return false
  }
}

// Get only available wallets to prevent initialization errors
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

  // Always include Keplr as fallback
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
    // Start with Keplr as fallback for SSR
    return keplrWallets
  })

  // Update available wallets after component mounts
  useEffect(() => {
    const checkWallets = () => {
      try {
        const wallets = getAvailableWallets()
        setAvailableWallets(wallets)
        console.log('Available wallets loaded:', wallets.length)
      } catch (error) {
        console.error('Error loading wallets:', error)
        // Fallback to Keplr on error
        setAvailableWallets(keplrWallets)
      }
    }

    // Check immediately
    checkWallets()

    // Also check after a delay to catch wallets that load later
    const timer = setTimeout(checkWallets, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ChainProvider
      chains={chainNames}
      assetLists={chainAssets as any}
      wallets={availableWallets}
      throwErrors={false}
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
