'use client'

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

// Combine all wallets
const wallets = [
  ...keplrWallets,
  ...leapWallets,
  ...cosmostationWallets,
  ...xdefiWallets,
  ...okxWallets,
  ...vectisWallets,
]

export const CosmosKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the theme configuration
  const modalTheme = getCosmosKitTheme()

  return (
    <ChainProvider
      chains={chainNames}
      assetLists={chainAssets as any}
      wallets={wallets}
      throwErrors={true}
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
