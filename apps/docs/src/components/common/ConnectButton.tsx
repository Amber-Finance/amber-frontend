'use client'

import { useState, useEffect } from 'react'

import { useChain } from '@cosmos-kit/react'

import { useCollaborativeEditing } from '@/contexts/CollaborativeEditingContext'
import EditProposalModal from '@/components/modals/EditProposalModal'
import ReviewProposalsModal from '@/components/modals/ReviewProposalsModal'
import chainConfig from '@/config/chain'

// List of approved contributors (wallet addresses)
const APPROVED_CONTRIBUTORS = [
  // Add Gizhib's address and other approved contributors here
  // Example: 'neutron1...',
]

// List of admins who can approve changes
const ADMIN_ADDRESSES = [
  // Add Gizhib's address here
  // Example: 'neutron1...',
]

export default function ConnectButton() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const { connect, disconnect, isWalletConnecting, isWalletConnected, address, username, wallet } = useChain(
    chainConfig.name,
  )

  const { setUserAddress, setUserPermissions, pendingProposals } = useCollaborativeEditing()

  // Check if user is an approved contributor
  const isApprovedContributor = address && APPROVED_CONTRIBUTORS.includes(address)
  
  // Check if user is an admin
  const isAdmin = address && ADMIN_ADDRESSES.includes(address)

  // Update context when wallet connects/disconnects
  useEffect(() => {
    setUserAddress(address)
    setUserPermissions({
      canEdit: isApprovedContributor || isAdmin,
      canApprove: isAdmin,
      isAdmin: isAdmin,
    })
  }, [address, isApprovedContributor, isAdmin, setUserAddress, setUserPermissions])

  // Handle connection
  const handleClick = () => {
    if (isWalletConnected) {
      // Show user menu if connected
      setShowUserMenu(!showUserMenu)
    } else {
      connect()
    }
  }

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect()
    setShowUserMenu(false)
  }

  // Truncate the address for display
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : ''

  const actualUsername =
    username && username.length > 20 ? wallet?.prettyName || chainConfig.name : username

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isWalletConnecting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isWalletConnecting ? (
          'Connecting...'
        ) : isWalletConnected ? (
          <>
            <div className={`w-2 h-2 rounded-full ${isApprovedContributor ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="hidden md:inline">
              {actualUsername || truncatedAddress || 'Connected'}
            </span>
            <span className="md:hidden">Wallet</span>
          </>
        ) : (
          <>
            <span className="hidden md:inline">Connect Wallet</span>
            <span className="md:hidden">Connect</span>
          </>
        )}
      </button>

      {/* User Menu */}
      {showUserMenu && isWalletConnected && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Connected as</p>
              <p className="font-medium text-gray-900 dark:text-white">{truncatedAddress}</p>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isApprovedContributor ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm">
                  {isAdmin ? 'Admin' : isApprovedContributor ? 'Approved Contributor' : 'Viewer'}
                </span>
              </div>
            </div>

            {isApprovedContributor && (
              <button 
                onClick={() => {
                  setShowEditModal(true)
                  setShowUserMenu(false)
                }}
                className="w-full mb-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Suggest Edit
              </button>
            )}

            {isAdmin && (
              <button 
                onClick={() => {
                  setShowReviewModal(true)
                  setShowUserMenu(false)
                }}
                className="w-full mb-2 px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Review Changes {pendingProposals.length > 0 && `(${pendingProposals.length})`}
              </button>
            )}

            <button
              onClick={handleDisconnect}
              className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Edit Proposal Modal */}
      <EditProposalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        filePath="/docs/example-page"
        originalContent="# Example Page\n\nThis is example content that can be edited."
      />

      {/* Review Proposals Modal */}
      <ReviewProposalsModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </div>
  )
}
