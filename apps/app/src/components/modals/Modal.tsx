'use client'

import React, { Fragment, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  // Close the modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Handle backdrop click to close the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if the click was directly on the backdrop
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Don't render anything if modal is not open
  if (!isOpen) return null

  // Use portal to render the modal outside the component hierarchy
  return createPortal(
    <Fragment>
      {/* Backdrop - Only blur */}
      <div
        className='fixed inset-0 backdrop-blur-md z-40 transition-opacity cursor-pointer'
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className='fixed inset-0 flex items-center justify-center z-50 md:p-4 p-0 cursor-pointer'
        onClick={handleBackdropClick}
      >
        {/* Modal content */}
        <div
          className={`border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 backdrop-blur-lg shadow-xl transition-all cursor-default 
          md:max-w-md md:w-full md:rounded-xl md:overflow-auto md:max-h-[90vh] md:h-auto
          w-full h-full max-h-full mx-auto my-0 overflow-auto rounded-none ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex justify-between items-center p-4 md:p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10'>
            {title && (
              <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>{title}</h3>
            )}
            <button
              onClick={onClose}
              className='ml-auto p-1 bg-transparent border-none cursor-pointer outline-none group'
              aria-label='Close'
            >
              <svg
                className='w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className='p-4'>{children}</div>
        </div>
      </div>
    </Fragment>,
    document.body,
  )
}

export default Modal
