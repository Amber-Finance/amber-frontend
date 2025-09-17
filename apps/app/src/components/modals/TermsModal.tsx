'use client'

import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { SubtleGradientBg } from '@/components/ui/SubtleGradientBg'

const TERMS_ACCEPTANCE_KEY = 'amberfi-terms-accepted'

interface TermsModalProps {
  isOpen: boolean
  onAccept: () => void
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onAccept }) => {
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)

  const handleAccept = () => {
    if (!termsChecked || !privacyChecked) return

    // Save acceptance to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(TERMS_ACCEPTANCE_KEY, 'true')
    }
    onAccept()
  }

  if (!isOpen) {
    return null
  }

  const isConfirmEnabled = termsChecked && privacyChecked

  return (
    <div className='fixed inset-0 z-[9998]'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-card/20 backdrop-blur-md' />

      {/* Modal */}
      <div
        className='absolute w-[calc(100%-2rem)] max-w-md bg-card/70 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-[9999]'
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
        }}
      >
        {/* Gradient background */}
        <SubtleGradientBg variant='primary' className='opacity-20' />

        <div className='relative p-6 space-y-6'>
          {/* Title */}
          <div className='text-center'>
            <h2 className='text-xl font-bold text-foreground mb-2'>Disclaimer</h2>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Please check the boxes below to confirm your agreement to the{' '}
              <a
                href='https://docs.amberfi.io/legal/terms_of_service'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='https://docs.amberfi.io/legal/privacy_policy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Checkboxes */}
          <div className='space-y-4'>
            {/* Terms of Service Checkbox */}
            <label className='flex items-start space-x-3 cursor-pointer group'>
              <div className='relative flex items-center justify-center mt-1'>
                <input
                  type='checkbox'
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  className='w-4 h-4 text-primary bg-background border-border/50 rounded focus:ring-primary focus:ring-2'
                />
              </div>
              <div className='flex-1 text-sm text-foreground/90 leading-relaxed'>
                I have read and understood, and do hereby agree to be legally bound as a 'User'
                under the{' '}
                <a
                  href='https://docs.amberfi.io/legal/terms_of_service'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  Terms of Service
                </a>
                , including all future amendments thereto. Such agreement is irrevocable and will
                apply to all of my uses of the Site without me providing confirmation in each
                specific instance.
              </div>
            </label>

            {/* Privacy Policy Checkbox */}
            <label className='flex items-start space-x-3 cursor-pointer group'>
              <div className='relative flex items-center justify-center mt-1'>
                <input
                  type='checkbox'
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className='w-4 h-4 text-primary bg-background border-border/50 rounded focus:ring-primary focus:ring-2'
                />
              </div>
              <div className='flex-1 text-sm text-foreground/90 leading-relaxed'>
                I have read and agree to the{' '}
                <a
                  href='https://docs.amberfi.io/legal/privacy_policy'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  Privacy Policy
                </a>
                . I acknowledge that Amber Finance provides no form of compensation, reimbursement,
                or indemnification for losses from market volatility, smart contract
                vulnerabilities, system errors, hacks, or any other cause. All transactions are
                executed at my own risk and I bear full responsibility for any resulting losses.
              </div>
            </label>
          </div>

          {/* Confirm Button */}
          <div className='pt-2'>
            <Button
              onClick={handleAccept}
              disabled={!isConfirmEnabled}
              className={`w-full ${!isConfirmEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              size='lg'
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to check if terms have been accepted
export const useTermsAcceptance = () => {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null)

  useEffect(() => {
    // Only check localStorage on client side
    if (typeof window !== 'undefined' && window.localStorage) {
      const accepted = localStorage.getItem(TERMS_ACCEPTANCE_KEY) === 'true'
      setHasAccepted(accepted)
    } else {
      setHasAccepted(false)
    }
  }, [])

  const acceptTerms = () => {
    setHasAccepted(true)
  }

  return {
    hasAccepted,
    acceptTerms,
  }
}
