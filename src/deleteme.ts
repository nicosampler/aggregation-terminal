import { BigNumber, BigNumberish } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export function expandDecimals(n: BigNumberish, decimals: number) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}

const value = BigNumber.from('0x42e5393f1ca89eecf320000000')
console.log(value.toString())
console.log(value.toString().length)

const xx = value.div(BigNumber.from(10).pow(30 - 18))

console.log(xx.toString())
console.log(xx.toString().length)
