'use client'

import { useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'

import { DeployStrategy, ModifyStrategy } from '@/components/strategy/pages'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/usePortfolioData'

interface StrategyDeployClientProps {
  strategy: Strategy
}

export default function StrategyDeployClient({ strategy }: StrategyDeployClientProps) {
  const searchParams = useSearchParams()
  const { address } = useChain(chainConfig.name)
  const activeStrategies = useActiveStrategies()

  // Check for explicit URL parameters first (backwards compatibility)
  const forceModifying = searchParams.get('modify') === 'true'
  const explicitAccountId = searchParams.get('accountId')

  // Find existing active strategy for this collateral/debt pair
  const existingStrategy = activeStrategies?.find(
    (active: ActiveStrategy) =>
      active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
      active.debtAsset.symbol === strategy.debtAsset.symbol,
  )

  // Determine mode: explicit URL params or auto-detect existing strategy
  const shouldShowModify =
    (forceModifying && explicitAccountId) || Boolean(address && existingStrategy)

  // Render appropriate component
  if (shouldShowModify) {
    return <ModifyStrategy strategy={strategy} />
  }

  return <DeployStrategy strategy={strategy} />
}
