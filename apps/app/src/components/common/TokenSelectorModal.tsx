import React from 'react'

import Image from 'next/image'

import FormattedValue from '@/components/common/FormattedValue'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface TokenSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: SwapToken[]
  onSelect: (token: SwapToken) => void
  selectedToken?: SwapToken | null
  isWalletConnected?: boolean
}

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
  open,
  onOpenChange,
  tokens,
  onSelect,
  selectedToken,
  isWalletConnected = true,
}) => {
  // Group tokens based on actual rawBalance values, but only if wallet is connected
  const yourTokens = isWalletConnected
    ? tokens.filter((t) => (t.rawBalance ?? parseFloat(t.balance)) > 0)
    : []
  const allTokens = isWalletConnected
    ? tokens.filter((t) => (t.rawBalance ?? parseFloat(t.balance)) === 0)
    : tokens

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-0 shadow-lg focus:outline-none'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-border'>
          <DialogTitle className='text-lg font-bold'>Select a token</DialogTitle>
        </div>
        <div className='max-h-[420px] overflow-y-auto px-2 py-2 token-selector-scrollbar'>
          {yourTokens.length > 0 && (
            <div className='mb-2'>
              <div className='px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                Your tokens
              </div>
              <div className='flex flex-col gap-1'>
                {yourTokens.map((token) => (
                  <button
                    key={token.symbol}
                    className={cn(
                      'flex items-center w-full px-4 py-3 rounded-xl transition-colors hover:bg-muted/30',
                      selectedToken?.symbol === token.symbol ? 'bg-muted/40' : '',
                    )}
                    onClick={() => {
                      onSelect(token)
                      onOpenChange(false)
                    }}
                  >
                    <Image
                      src={token.icon}
                      alt={token.symbol}
                      width={32}
                      height={32}
                      className='rounded-full'
                    />
                    <div className='ml-3 flex flex-col items-start min-w-0 flex-1'>
                      <div className='font-medium text-sm'>{token.symbol}</div>
                      <div className='text-xs text-muted-foreground truncate'>{token.name}</div>
                    </div>
                    <div className='ml-auto flex flex-col items-end min-w-0'>
                      <div className='font-semibold text-base'>
                        <FormattedValue
                          value={parseFloat(token.usdValue)}
                          isCurrency={true}
                          maxDecimals={2}
                        />
                      </div>
                      <div className='text-xs text-muted-foreground truncate'>
                        {token.balance} {token.symbol}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className='px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
            All tokens
          </div>
          <div className='flex flex-col gap-1'>
            {allTokens.map((token) => (
              <button
                key={token.symbol}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-colors hover:bg-muted/30 ${selectedToken?.symbol === token.symbol ? 'bg-muted/40' : ''}`}
                onClick={() => {
                  onSelect(token)
                  onOpenChange(false)
                }}
              >
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  width={32}
                  height={32}
                  className='rounded-full'
                />
                <div className='ml-3 flex flex-col items-start min-w-0 flex-1'>
                  <div className='font-medium text-sm'>{token.symbol}</div>
                  <div className='text-xs text-muted-foreground truncate'>{token.name}</div>
                </div>
                <div className='ml-auto flex flex-col items-end min-w-0'>
                  <div className='font-semibold text-base'>
                    <FormattedValue
                      value={parseFloat(token.usdValue)}
                      isCurrency={true}
                      maxDecimals={2}
                    />
                  </div>
                  <div className='text-xs text-muted-foreground truncate'>
                    {token.balance} {token.symbol}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
