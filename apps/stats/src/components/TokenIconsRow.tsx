import React from 'react'

import Image from 'next/image'

import tokens from '@/config/tokens'
import { cn } from '@/utils/ui'

interface Props {
  selectedToken: (typeof tokens)[0]
  onTokenSelect: (tokenSymbol: string) => void
}

export default function TokenIconsRow({ selectedToken, onTokenSelect }: Props) {
  return (
    <div className='flex justify-center items-center gap-6 p-2 sm:p-8 mx-auto'>
      <div className='flex items-center gap-4 flex-wrap justify-center sm:justify-between w-full'>
        {tokens.map((token) => {
          const isActive = selectedToken.symbol === token.symbol

          return (
            <button
              key={token.denom}
              onClick={(e) => {
                onTokenSelect(token.symbol)
                e.currentTarget.blur()
              }}
              className='flex flex-col items-center gap-2 group transition-all duration-200 hover:scale-105 focus:outline-none rounded-lg p-2 cursor-pointer'
            >
              <div
                className={cn(
                  'relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'border-0 shadow-lg scale-110'
                    : 'border-border/20 hover:border-border/40 focus:border-0',
                )}
                style={{
                  boxShadow: isActive ? `0 0 0 1px ${token.brandColor}20` : undefined,
                }}
              >
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  width={40}
                  height={40}
                  className={cn(
                    'object-contain transition-all duration-200',
                    isActive ? 'brightness-100' : 'brightness-50 grayscale',
                  )}
                  unoptimized={true}
                  onError={(e) => {
                    console.error('Image failed to load:', token.icon, e)
                  }}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground group-hover:text-foreground/70',
                )}
                style={{
                  color: isActive ? token.brandColor : undefined,
                }}
              >
                {token.symbol}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
