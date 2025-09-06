import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/Button'

interface AssetActionsProps {
  tokenSymbol: string
  tokenDenom?: string
}

export const AssetActions = ({ tokenSymbol, tokenDenom }: AssetActionsProps) => {
  const router = useRouter()

  return (
    <div className='mt-6 pt-6 border-t border-border/40'>
      <div className='text-center mb-4'>
        <h4 className='text-sm font-semibold text-foreground mb-1'>Need more {tokenSymbol}?</h4>
        <p className='text-xs text-muted-foreground'>
          Bridge from other chains or swap for {tokenSymbol}
        </p>
      </div>

      <div className='flex gap-3'>
        <Button
          variant='outline'
          onClick={() => window.open('https://bridge.amberfi.io/', '_blank')}
          className='flex-1 h-10 text-xs font-medium hover:bg-muted/30 transition-colors'
        >
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500' />
            Bridge Assets
          </div>
        </Button>

        <Button
          variant='outline'
          onClick={() => router.push(`/swap?to=${tokenDenom}`)}
          className='flex-1 h-10 text-xs font-medium hover:bg-muted/30 transition-colors'
        >
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500' />
            Swap Assets
          </div>
        </Button>
      </div>
    </div>
  )
}
