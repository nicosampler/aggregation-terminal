import { Chains } from '@/src/config/web3'
import ERC20 from '@/src/contracts/abis/ERC20.json'
import PositionRouter from '@/src/contracts/abis/GMX/PositionRouter.json'
import ReaderV2 from '@/src/contracts/abis/GMX/ReaderV2.json'
import Vault from '@/src/contracts/abis/GMX/Vault.json'
import VaultReader from '@/src/contracts/abis/GMX/VaultReader.json'

export const contracts = {
  GMX_ReaderV2: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x2b43c90D1B727cEe1Df34925bcd5Ace52Ec37694',
    },
    abi: ReaderV2,
  },
  GMX_Vault: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
    },
    abi: Vault,
  },
  GMX_VaultReader: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0xfebB9f4CAC4cD523598fE1C5771181440143F24A',
    },
    abi: VaultReader,
  },
  GMX_PositionRouter: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
    },
    abi: PositionRouter,
  },
  WETH: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
    abi: ERC20,
  },
} as const

export type ContractsKeys = keyof typeof contracts

export const isKnownContract = (
  contractName: ContractsKeys | string,
): contractName is ContractsKeys => {
  return contracts[contractName as ContractsKeys] !== undefined
}
