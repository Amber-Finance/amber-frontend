'use client'

import React, { useState } from 'react'

import { formatAddress } from '@/utils/blockchain/address'
import { copyToClipboard } from '@/utils/ui/clipboard'

interface CopyableAddressProps {
  address: string
  /**
   * Display format of the address
   * - full: shows the entire address
   * - truncated: shows beginning and end with ellipsis
   * - custom: uses the displayAddress prop
   */
  displayFormat?: 'full' | 'truncated' | 'custom'
  /** Custom address display (used with displayFormat="custom") */
  displayAddress?: string
  /** CSS class name */
  className?: string
}

const CopyableAddress: React.FC<CopyableAddressProps> = ({
  address,
  displayFormat = 'truncated',
  displayAddress,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleCopyClick = async () => {
    const success = await copyToClipboard(address)
    if (success) {
      setShowTooltip(true)
      setTimeout(() => {
        setShowTooltip(false)
      }, 2000)
    }
  }

  return (
    <div className='relative inline-block'>
      <button
        onClick={handleCopyClick}
        className={`font-sans text-orange-500 hover:text-orange-600 transition-colors cursor-pointer ${className}`}
      >
        {formatAddress(address, displayFormat, displayAddress)}
      </button>
      {showTooltip && (
        <div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black text-white text-sm px-2 py-1 rounded whitespace-nowrap z-10'>
          Copied to clipboard
        </div>
      )}
    </div>
  )
}

export default CopyableAddress
