'use client'

import React from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'

import CopyableAddress from '@/components/common/CopyableAddress'
import TokenBalance from '@/components/common/TokenBalance'
import Modal from '@/components/modals/Modal'
import { Button } from '@/components/ui/Button'
import chainConfig from '@/config/chain'
import { useWalletBalances } from '@/hooks/wallet'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/formatting/format'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

// Custom LogoutIcon component
function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
      <polyline points='16 17 21 12 16 7' />
      <line x1='21' y1='12' x2='9' y2='12' />
    </svg>
  )
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { disconnect, address, wallet, username } = useChain(chainConfig.name)

  // Get the store data
  const { markets, resetPositions, resetPortfolioPositions } = useStore()

  // Get wallet balances - the hook automatically uses the connected wallet address
  const { data: walletBalances, isLoading: walletBalancesLoading } = useWalletBalances()

  // Handle disconnect
  const handleDisconnect = () => {
    // Reset positions and portfolio data before disconnecting to clear all cached data
    resetPositions()
    resetPortfolioPositions()
    disconnect()
    onClose()
  }

  const actualUsername =
    username && username.length > 20 ? wallet?.prettyName || chainConfig.name : username

  // Display username if available, otherwise fallback to wallet name or chain name
  const displayName = actualUsername || wallet?.prettyName || chainConfig.name

  // Calculate sorted balances with USD values
  const sortedBalances = React.useMemo(() => {
    if (!walletBalances || !markets) return []

    // Process only balances that have a corresponding market
    const processedBalances = []

    for (const balance of walletBalances) {
      const market = markets.find((m) => m.asset.denom === balance.denom)
      if (!market?.price?.price) continue

      const usdValue = calculateUsdValueLegacy(
        balance.amount,
        market.price.price,
        market.asset.decimals || 6,
      )

      processedBalances.push({
        denom: balance.denom,
        amount: balance.amount,
        asset: market.asset,
        usdValue,
      })
    }

    // Sort by USD value
    return processedBalances.sort((a, b) => b.usdValue - a.usdValue)
  }, [walletBalances, markets])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Your Wallet'>
      <div className='flex flex-col space-y-6'>
        {/* Wallet Info Section */}
        <div className='flex flex-col items-center p-4 bg-white dark:bg-zinc-950 rounded-lg'>
          <h3 className='text-lg font-medium mb-2 text-gray-900 dark:text-white'>{displayName}</h3>

          {address && (
            <CopyableAddress address={address} displayFormat='truncated' className='text-base' />
          )}
        </div>

        {/* Balances Section */}
        <div>
          <h4 className='text-md font-medium mb-3 border-b border-gray-200 dark:border-black-700 pb-2 text-gray-900 dark:text-white'>
            Your Balances
          </h4>

          {(() => {
            if (walletBalancesLoading) {
              return (
                <p className='text-gray-500 dark:text-gray-400 text-center py-4'>
                  Loading balances...
                </p>
              )
            }

            if (sortedBalances.length > 0) {
              return (
                <div className='space-y-2'>
                  {sortedBalances.map((balance) => (
                    <div
                      key={balance.denom}
                      className='flex justify-between items-center border-b border-gray-200 dark:border-zinc-800 py-1.5'
                    >
                      <div className='flex items-center'>
                        <Image
                          src={balance.asset.icon}
                          alt={balance.asset.symbol}
                          width={24}
                          height={24}
                          className='mr-2 rounded-full'
                        />
                        <span className='text-gray-900 dark:text-white'>
                          {balance.asset.symbol}
                        </span>
                      </div>
                      <TokenBalance
                        coin={{
                          denom: balance.denom,
                          amount: balance.amount,
                        }}
                        align='right'
                        size='sm'
                      />
                    </div>
                  ))}
                </div>
              )
            }

            return (
              <p className='text-gray-500 dark:text-gray-400 text-center py-4'>
                No balances to display
              </p>
            )
          })()}
        </div>

        {/* Disconnect Button */}
        <div className='flex justify-center pt-2 w-full'>
          <Button
            onClick={handleDisconnect}
            className='w-full flex items-center justify-center gap-2'
          >
            <LogoutIcon className='h-5 w-5' />
            Disconnect
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default WalletModal
