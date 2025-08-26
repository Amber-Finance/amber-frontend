'use client'

import { useState } from 'react'
import { useChain } from '@cosmos-kit/react'

import { useCollaborativeEditing, EditProposal } from '@/contexts/CollaborativeEditingContext'
import chainConfig from '@/config/chain'

interface EditProposalModalProps {
  isOpen: boolean
  onClose: () => void
  filePath: string
  originalContent: string
}

export default function EditProposalModal({ 
  isOpen, 
  onClose, 
  filePath, 
  originalContent 
}: EditProposalModalProps) {
  const [proposedContent, setProposedContent] = useState(originalContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signArbitrary } = useChain(chainConfig.name)
  const { addEditProposal, userAddress } = useCollaborativeEditing()

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!userAddress || !signArbitrary) {
      setError('Wallet not connected or signing not available')
      return
    }

    if (proposedContent === originalContent) {
      setError('No changes detected')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create a message to sign
      const message = JSON.stringify({
        action: 'edit_proposal',
        filePath,
        originalContent: originalContent.substring(0, 100) + '...',
        proposedContent: proposedContent.substring(0, 100) + '...',
        timestamp: new Date().toISOString(),
      })

      // Sign the message
      const signature = await signArbitrary(userAddress, message)

      // Create the edit proposal
      const proposal: EditProposal = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        author: userAddress.substring(0, 6) + '...' + userAddress.substring(userAddress.length - 4),
        authorAddress: userAddress,
        filePath,
        originalContent,
        proposedContent,
        timestamp: new Date(),
        status: 'pending',
        signature,
      }

      // Add the proposal
      addEditProposal(proposal)

      // Close the modal
      onClose()
      setProposedContent(originalContent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setProposedContent(originalContent)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Suggest Edit
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            File: {filePath}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your changes will be reviewed by an admin before being applied.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Original Content
            </label>
            <textarea
              value={originalContent}
              readOnly
              className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proposed Changes
            </label>
            <textarea
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              placeholder="Make your changes here..."
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || proposedContent === originalContent}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </div>
    </div>
  )
}
