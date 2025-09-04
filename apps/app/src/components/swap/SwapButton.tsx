import { Button } from '@/components/ui/Button'

interface SwapButtonProps {
  label: string
  disabled: boolean
  onClick: () => void
}

export const SwapButton = ({ label, disabled, onClick }: SwapButtonProps) => (
  <Button disabled={disabled} className='w-full h-12' onClick={onClick}>
    {label}
  </Button>
)
