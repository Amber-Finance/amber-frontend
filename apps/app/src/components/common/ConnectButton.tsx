'use client'

import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'
import { ChevronDown, Copy, LogOut } from 'lucide-react'

import WalletModal from '@/components/modals/WalletModal'
import { HoverBaseButton } from '@/components/ui/HoverBaseButton'
import chainConfig from '@/config/chain'
import { cn } from '@/lib/utils'

export default function ConnectButton() {
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { connect, isWalletConnecting, isWalletConnected, address, username, wallet, disconnect } =
    useChain(chainConfig.name)

  // Handle connection
  const handleClick = () => {
    if (isWalletConnected) {
      setShowDropdown(!showDropdown)
    } else {
      connect()
    }
  }

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect()
    setShowDropdown(false)
  }

  // Handle copy address
  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setShowDropdown(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Truncate the address for display
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : ''

  const actualUsername =
    username && username.length > 20 ? wallet?.prettyName || chainConfig.name : username

  // Mobile text vs Desktop text
  const connectText = isWalletConnected
    ? isWalletConnecting
      ? 'Connecting...'
      : null
    : isWalletConnecting
      ? 'Connecting...'
      : null

  return (
    <div className='relative' ref={dropdownRef}>
      <HoverBaseButton
        onClick={handleClick}
        disabled={isWalletConnecting}
        className={cn('text-md flex items-center gap-2', isWalletConnected && 'pr-3')}
      >
        {/* Wallet provider logo when connected */}
        {isWalletConnected && wallet?.logo && (
          <div className='w-4 h-4 rounded-full overflow-hidden flex-shrink-0'>
            <Image
              src={wallet.logo as string}
              alt={wallet.prettyName || 'Wallet'}
              width={16}
              height={16}
              className='w-full h-full object-cover'
            />
          </div>
        )}

        {/* Text content */}
        <span className='flex-1'>
          {connectText || (
            <>
              {isWalletConnected ? (
                <>
                  <span className='hidden md:inline'>
                    {actualUsername || truncatedAddress || 'Connected'}
                  </span>
                  <span className='md:hidden'>Wallet</span>
                </>
              ) : (
                <>
                  <span className='hidden md:inline'>Connect</span>
                  <span className='md:hidden'>Connect</span>
                </>
              )}
            </>
          )}
        </span>

        {/* Dropdown arrow when connected */}
        {isWalletConnected && (
          <ChevronDown
            className={cn(
              'w-3 h-3 transition-transform duration-200',
              showDropdown && 'rotate-180',
            )}
          />
        )}
      </HoverBaseButton>

      {/* Dropdown Menu */}
      {isWalletConnected && showDropdown && (
        <div className='absolute top-full right-0 mt-3 w-48 bg-card border border-border rounded-md shadow-lg z-50'>
          <div className='py-1'>
            <button
              onClick={handleCopyAddress}
              className='flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors'
            >
              <Copy className='w-4 h-4' />
              Copy Address
            </button>
            <button
              onClick={handleDisconnect}
              className='flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors'
            >
              <LogOut className='w-4 h-4' />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Wallet Modal - keeping for fallback */}
      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </div>
  )
}
