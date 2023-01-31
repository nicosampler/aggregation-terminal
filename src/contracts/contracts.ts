import { Chains } from '@/src/config/web3'
import ReaderV2 from '@/src/contracts/abis/GMX/ReaderV2.json'

export const contracts = {
  GMX_ReaderV2: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x2b43c90D1B727cEe1Df34925bcd5Ace52Ec37694',
    },
    abi: ReaderV2,
  },
} as const

export type ContractsKeys = keyof typeof contracts

export const isKnownContract = (
  contractName: ContractsKeys | string,
): contractName is ContractsKeys => {
  return contracts[contractName as ContractsKeys] !== undefined
}
