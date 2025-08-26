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

import chainConfig from '@/config/chain'

// Define Neutron chain configuration manually
const neutronChain = {
  chain_name: 'neutron',
  network_type: 'mainnet',
  pretty_name: 'Neutron',
  chain_id: 'neutron-1',
  bech32_prefix: 'neutron',
  daemon_name: 'neutrond',
  node_home: '$HOME/.neutrond',
  key_algos: ['secp256k1'],
  slip44: 118,
  fees: {
    fee_tokens: [
      {
        denom: 'untrn',
        fixed_min_gas_price: 0.01,
        low_gas_price: 0.01,
        average_gas_price: 0.025,
        high_gas_price: 0.04,
      },
    ],
  },
  staking: {
    staking_tokens: [
      {
        denom: 'untrn',
      },
    ],
  },
  codebase: {
    git_repo: 'https://github.com/neutron-org/neutron',
    recommended_version: 'v1.0.0',
    compatible_versions: ['v1.0.0'],
  },
  apis: {
    rpc: [
      {
        address: 'https://rpc.neutron-1.neutron.org',
        provider: 'Neutron',
      },
    ],
    rest: [
      {
        address: 'https://api.neutron-1.neutron.org',
        provider: 'Neutron',
      },
    ],
  },
  explorers: [
    {
      kind: 'mintscan',
      url: 'https://www.mintscan.io/neutron',
      tx_page: 'https://www.mintscan.io/neutron/tx/${txHash}',
    },
  ],
}

// Define Neutron assets manually
const neutronAssets = [
  {
    chain_name: 'neutron',
    assets: [
      {
        description: 'Neutron token',
        denom_units: [
          {
            denom: 'untrn',
            exponent: 0,
          },
          {
            denom: 'ntrn',
            exponent: 6,
          },
        ],
        base: 'untrn',
        name: 'Neutron',
        display: 'ntrn',
        symbol: 'NTRN',
        logo_URIs: {
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png',
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.svg',
        },
        coingecko_id: 'neutron',
      },
    ],
  },
]

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
  return (
    <ChainProvider
      chains={[neutronChain]}
      assetLists={neutronAssets}
      wallets={wallets}
      throwErrors={false}
      walletConnectOptions={{
        signClient: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
          relayUrl: 'wss://relay.walletconnect.org',
          metadata: {
            name: 'Amber Finance Docs',
            description: 'Amber Finance Documentation - Collaborative Editing',
            url: 'https://docs.amberfi.io',
            icons: ['https://docs.amberfi.io/favicon-96x96.png'],
          },
        },
      }}
      signerOptions={{
        signingCosmwasm: () => {
          return {
            gasPrice: GasPrice.fromString('0.025untrn'),
          }
        },
        signingStargate: () => {
          return {
            gasPrice: GasPrice.fromString('0.025untrn'),
          }
        },
      }}
    >
      {children}
    </ChainProvider>
  )
}
