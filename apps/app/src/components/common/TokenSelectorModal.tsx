import React from 'react'

import { TokenItem } from '@/components/common/TokenItem'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { pipe } from '@/utils/common/functional'
import { groupTokensByBalance, sortTokensByUsdValue } from '@/utils/data/tokenUtils'

interface TokenSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: TokenData[]
  onSelect: (token: TokenData) => void
  selectedToken?: TokenData | null
  isWalletConnected?: boolean
  disabledTokens?: string[]
}

// Pure function to process and group tokens
const processTokens = (tokens: TokenData[], isWalletConnected: boolean) => {
  if (!isWalletConnected) {
    return {
      yourTokens: [],
      allTokens: pipe(sortTokensByUsdValue)(tokens),
    }
  }

  const { withBalance, withoutBalance } = groupTokensByBalance(tokens)

  return {
    yourTokens: pipe(sortTokensByUsdValue)(withBalance),
    allTokens: pipe(sortTokensByUsdValue)(withoutBalance),
  }
}

// Pure function to create token selection handler
const createTokenSelectHandler =
  (onSelect: (token: TokenData) => void, onOpenChange: (open: boolean) => void) =>
  (token: TokenData) => {
    onSelect(token)
    onOpenChange(false)
  }

// Pure function to check if token is disabled
const isTokenDisabled =
  (disabledTokens: string[]) =>
  (token: TokenData): boolean =>
    disabledTokens.includes(token.denom)

// Pure component for token section
const TokenSection: React.FC<{
  title: string
  tokens: TokenData[]
  selectedToken?: TokenData | null
  disabledTokens: string[]
  onTokenSelect: (token: TokenData) => void
}> = ({ title, tokens, selectedToken, disabledTokens, onTokenSelect }) => {
  if (tokens.length === 0) return null

  const checkDisabled = isTokenDisabled(disabledTokens)

  return (
    <div className='mb-2'>
      <div className='px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
        {title}
      </div>
      <div className='flex flex-col gap-1'>
        {tokens.map((token) => (
          <TokenItem
            key={token.symbol}
            token={token}
            isSelected={selectedToken?.symbol === token.symbol}
            isDisabled={checkDisabled(token)}
            onClick={onTokenSelect}
          />
        ))}
      </div>
    </div>
  )
}

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
  open,
  onOpenChange,
  tokens,
  onSelect,
  selectedToken,
  isWalletConnected = true,
  disabledTokens = [],
}) => {
  const { yourTokens, allTokens } = processTokens(tokens, isWalletConnected)
  const handleTokenSelect = createTokenSelectHandler(onSelect, onOpenChange)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-0 shadow-lg focus:outline-none'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-border'>
          <DialogTitle className='text-lg font-bold'>Select a token</DialogTitle>
        </div>
        <div className='max-h-[420px] overflow-y-auto px-2 py-2 token-selector-scrollbar'>
          <TokenSection
            title='Your tokens'
            tokens={yourTokens}
            selectedToken={selectedToken}
            disabledTokens={disabledTokens}
            onTokenSelect={handleTokenSelect}
          />
          <TokenSection
            title='All tokens'
            tokens={allTokens}
            selectedToken={selectedToken}
            disabledTokens={disabledTokens}
            onTokenSelect={handleTokenSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
