'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Types for collaborative editing
export interface EditProposal {
  id: string
  author: string
  authorAddress: string
  filePath: string
  originalContent: string
  proposedContent: string
  timestamp: Date
  status: 'pending' | 'approved' | 'rejected'
  signature: string
}

export interface UserPermissions {
  canEdit: boolean
  canApprove: boolean
  isAdmin: boolean
}

interface CollaborativeEditingContextType {
  // User state
  userAddress: string | null
  userPermissions: UserPermissions
  
  // Edit proposals
  editProposals: EditProposal[]
  pendingProposals: EditProposal[]
  
  // Actions
  setUserAddress: (address: string | null) => void
  setUserPermissions: (permissions: UserPermissions) => void
  addEditProposal: (proposal: EditProposal) => void
  approveProposal: (proposalId: string) => void
  rejectProposal: (proposalId: string) => void
  clearProposals: () => void
}

const CollaborativeEditingContext = createContext<CollaborativeEditingContextType | undefined>(undefined)

export function CollaborativeEditingProvider({ children }: { children: ReactNode }) {
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    canEdit: false,
    canApprove: false,
    isAdmin: false,
  })
  const [editProposals, setEditProposals] = useState<EditProposal[]>([])

  // Get pending proposals
  const pendingProposals = editProposals.filter(proposal => proposal.status === 'pending')

  // Add new edit proposal
  const addEditProposal = (proposal: EditProposal) => {
    setEditProposals(prev => [...prev, proposal])
  }

  // Approve a proposal
  const approveProposal = (proposalId: string) => {
    setEditProposals(prev => 
      prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, status: 'approved' as const }
          : proposal
      )
    )
  }

  // Reject a proposal
  const rejectProposal = (proposalId: string) => {
    setEditProposals(prev => 
      prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, status: 'rejected' as const }
          : proposal
      )
    )
  }

  // Clear all proposals
  const clearProposals = () => {
    setEditProposals([])
  }

  const value: CollaborativeEditingContextType = {
    userAddress,
    userPermissions,
    editProposals,
    pendingProposals,
    setUserAddress,
    setUserPermissions,
    addEditProposal,
    approveProposal,
    rejectProposal,
    clearProposals,
  }

  return (
    <CollaborativeEditingContext.Provider value={value}>
      {children}
    </CollaborativeEditingContext.Provider>
  )
}

export function useCollaborativeEditing() {
  const context = useContext(CollaborativeEditingContext)
  if (context === undefined) {
    throw new Error('useCollaborativeEditing must be used within a CollaborativeEditingProvider')
  }
  return context
}
