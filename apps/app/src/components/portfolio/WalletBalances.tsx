'use client'

import { useMemo } from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import TokenBalance from '@/components/common/TokenBalance'
import { Card, CardContent } from '@/components/ui/card'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'

// Bitcoin tokens to display in wallet balances
const BITCOIN_TOKENS = ['maxBTC', 'WBTC', 'solvBTC', 'eBTC', 'uniBTC', 'LBTC']

export function WalletBalances() {
  const { address } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading } = useWalletBalances()
  const { markets } = useStore()

  // Filter and process Bitcoin tokens with balances
  const bitcoinTokenBalances = useMemo(() => {
    if (!walletBalances || !address) return []

    return BITCOIN_TOKENS.map((symbol) => {
      const tokenInfo = tokens.find((token) => token.symbol === symbol)
      if (!tokenInfo) return null

      // Skip coming soon tokens
      if (tokenInfo.comingSoon) return null

      const walletBalance = walletBalances.find((b) => b.denom === tokenInfo.denom)
      const market = markets?.find((m) => m.asset.denom === tokenInfo.denom)

      const rawBalance = walletBalance?.amount ? Number(walletBalance.amount) : 0
      const decimals = market?.asset?.decimals ?? tokenInfo.decimals ?? 8

      // Convert to display balance
      const displayBalance =
        rawBalance > 0 ? new BigNumber(walletBalance!.amount).shiftedBy(-decimals).toNumber() : 0

      // Calculate USD value if market price is available
      const usdValue =
        rawBalance > 0 && market?.price?.price
          ? new BigNumber(walletBalance!.amount)
              .shiftedBy(-decimals)
              .times(market.price.price)
              .toNumber()
          : 0

      return {
        token: tokenInfo,
        balance: displayBalance,
        usdValue,
        coin: {
          denom: tokenInfo.denom,
          amount: walletBalance?.amount || '0',
        },
        hasBalance: rawBalance > 0,
      }
    }).filter(Boolean) // Remove null entries
  }, [walletBalances, address, markets])

  // Don't show if wallet not connected
  if (!address) return null

  // Don't show if loading
  if (isLoading) return null

  // Don't show if no balances
  if (!bitcoinTokenBalances.some((balance) => balance?.hasBalance)) return null

  return (
    <div className='w-full pb-6 px-4 sm:px-6 lg:px-8'>
      <div className='w-full mx-auto'>
        <Card className='bg-card border border-border/20 backdrop-blur-xl'>
          <CardContent className=''>
            {/* Header */}
            <div className='mb-4'>
              <h3 className='text-lg font-semibold text-foreground mb-1'>Wallet Balances</h3>
              <p className='text-sm text-muted-foreground'>Your Bitcoin token holdings</p>
            </div>

            {/* Token Balances List */}
            <div className='flex flex-wrap items-center gap-6'>
              {bitcoinTokenBalances.map((tokenBalance) => {
                if (!tokenBalance || !tokenBalance.hasBalance) return null

                return (
                  <div
                    key={tokenBalance.token.symbol}
                    className='flex items-center gap-3 min-w-0 bg-secondary/20 rounded-lg p-3 border border-border/40'
                  >
                    {/* Token Icon */}
                    <div className='relative w-8 h-8 flex-shrink-0'>
                      <Image
                        src={tokenBalance.token.icon}
                        alt={tokenBalance.token.symbol}
                        fill
                        sizes='32px'
                        className='w-full h-full object-contain'
                        unoptimized={tokenBalance.token.symbol === 'eBTC'}
                      />
                    </div>

                    {/* Token Info */}
                    <div className='flex flex-col min-w-0'>
                      <span className='text-sm font-semibold text-foreground mb-1'>
                        {tokenBalance.token.symbol}
                      </span>
                      <TokenBalance
                        coin={tokenBalance.coin}
                        size='sm'
                        align='left'
                        className='text-muted-foreground'
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Show message if no Bitcoin balances */}
            {!bitcoinTokenBalances.some((balance) => balance?.hasBalance) && (
              <div className='text-center py-4'>
                <p className='text-sm text-muted-foreground'>No Bitcoin token balances found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
