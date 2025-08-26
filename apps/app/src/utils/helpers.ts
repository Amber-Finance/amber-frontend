import BigNumber from 'bignumber.js'

export function BN(n: BigNumber.Value) {
  return new BigNumber(n)
}

export function toIntegerString(n: BigNumber) {
  return n.integerValue(BigNumber.ROUND_CEIL).toString()
}

export function byDenom(denom: string) {
  return (asset: { denom: string }) => asset.denom === denom
}
