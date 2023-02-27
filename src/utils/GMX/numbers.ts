import { BigNumber, BigNumberish } from 'ethers'

export function expandDecimals(n: BigNumberish, decimals: number) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}
