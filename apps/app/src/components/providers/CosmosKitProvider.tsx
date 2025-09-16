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

// Extend the Window interface to include wallet properties
declare global {
  interface Window {
    keplr?: any
    leap?: any
    cosmostation?: any
    xfi?: any
    okxwallet?: any
    vectis?: any
  }
}

const chainNames = [chainConfig.name]
const chainAssets = assetLists.filter((asset) => asset.chainName === chainConfig.name)

// Regex for wallet name extraction
const WALLET_NAME_REGEX = /(Leap|Cosmostation|XDEFI|OKX|Vectis|Keplr)/i

// Combine all wallets (like before)
const wallets = [
  ...keplrWallets,
  ...leapWallets,
  ...cosmostationWallets,
  ...xdefiWallets,
  ...okxWallets,
  ...vectisWallets,
]

export const CosmosKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false)

  // Get the theme configuration
  const modalTheme = getCosmosKitTheme()

  // Ensure we're on the client side before checking for wallets
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use all wallets like before
  const availableWallets = wallets

  // Enhanced error handling for wallet initialization
  useEffect(() => {
    if (!isClient) return

    // Override console.error to handle wallet initialization errors gracefully
    const originalError = console.error

    console.error = (...args) => {
      const message = args.join(' ')

      // Handle specific wallet client initialization errors
      if (
        message.includes('initClientError: Client Not Exist!') ||
        message.includes('Client Not Exist')
      ) {
        // Extract wallet name from the error message
        const walletMatch = WALLET_NAME_REGEX.exec(message)
        const walletName = walletMatch ? walletMatch[1] : 'Unknown wallet'
        console.warn(
          `${walletName} wallet extension not installed - this is normal if you don't have it installed`,
        )
        return
      }

      // Handle other wallet-related errors more gracefully
      if (
        message.toLowerCase().includes('wallet') &&
        (message.includes('not found') || message.includes('undefined'))
      ) {
        console.warn('Wallet initialization warning:', message)
        return
      }

      // Log other errors normally
      originalError(...args)
    }

    // Cleanup function to restore original console methods
    return () => {
      console.error = originalError
    }
  }, [isClient])

  return (
    <ChainProvider
      chains={chainNames}
      assetLists={chainAssets as any}
      wallets={availableWallets as any}
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
    >
      {children}
    </ChainProvider>
  )
}
