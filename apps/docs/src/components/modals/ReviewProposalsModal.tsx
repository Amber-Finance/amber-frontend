'use client'

import { useState } from 'react'
import { useChain } from '@cosmos-kit/react'

import { useCollaborativeEditing, EditProposal } from '@/contexts/CollaborativeEditingContext'
import chainConfig from '@/config/chain'

interface ReviewProposalsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReviewProposalsModal({ isOpen, onClose }: ReviewProposalsModalProps) {
  const [selectedProposal, setSelectedProposal] = useState<EditProposal | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signArbitrary } = useChain(chainConfig.name)
  const { pendingProposals, approveProposal, rejectProposal, userAddress } = useCollaborativeEditing()

  if (!isOpen) return null

  const handleApprove = async (proposal: EditProposal) => {
    if (!userAddress || !signArbitrary) {
      setError('Wallet not connected or signing not available')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create approval message
      const message = JSON.stringify({
        action: 'approve_proposal',
        proposalId: proposal.id,
        authorAddress: proposal.authorAddress,
        filePath: proposal.filePath,
        timestamp: new Date().toISOString(),
      })

      // Sign the approval
      await signArbitrary(userAddress, message)

      // Approve the proposal
      approveProposal(proposal.id)

      // TODO: Here you would typically send the approval to your backend
      // to actually apply the changes to the file system
      console.log('Proposal approved:', proposal.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve proposal')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (proposal: EditProposal) => {
    if (!userAddress || !signArbitrary) {
      setError('Wallet not connected or signing not available')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create rejection message
      const message = JSON.stringify({
        action: 'reject_proposal',
        proposalId: proposal.id,
        authorAddress: proposal.authorAddress,
        filePath: proposal.filePath,
        timestamp: new Date().toISOString(),
      })

      // Sign the rejection
      await signArbitrary(userAddress, message)

      // Reject the proposal
      rejectProposal(proposal.id)

      console.log('Proposal rejected:', proposal.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject proposal')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Review Edit Proposals ({pendingProposals.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {pendingProposals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No pending proposals to review
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {proposal.filePath}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Proposed by {proposal.author} on {formatTimestamp(proposal.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(proposal)}
                      disabled={isProcessing}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(proposal)}
                      disabled={isProcessing}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Content
                    </label>
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm max-h-32 overflow-y-auto">
                      {proposal.originalContent}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Proposed Changes
                    </label>
                    <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm max-h-32 overflow-y-auto">
                      {proposal.proposedContent}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Signature: {proposal.signature.substring(0, 20)}...
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
