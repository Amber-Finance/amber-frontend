'use client'

import React from 'react'

import { TermsModal, useTermsAcceptance } from '@/components/modals/TermsModal'

interface TermsModalProviderProps {
  children: React.ReactNode
}

export const TermsModalProvider: React.FC<TermsModalProviderProps> = ({ children }) => {
  const { hasAccepted, acceptTerms } = useTermsAcceptance()

  // Don't render children until we know the acceptance status
  // This prevents hydration mismatch between server and client
  if (hasAccepted === null) {
    return null
  }

  return (
    <>
      <TermsModal isOpen={!hasAccepted} onAccept={acceptTerms} />
      {children}
    </>
  )
}
