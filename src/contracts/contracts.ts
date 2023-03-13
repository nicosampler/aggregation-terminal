import { Chains } from '@/src/config/web3'
import ERC20 from '@/src/contracts/abis/ERC20.json'
import GMXVault from '@/src/contracts/abis/GMX/GMXVault.json'
import PositionRouter from '@/src/contracts/abis/GMX/PositionRouter.json'
import ReaderV2 from '@/src/contracts/abis/GMX/ReaderV2.json'
import VaultReader from '@/src/contracts/abis/GMX/VaultReader.json'
import PerpsV2Market from '@/src/contracts/abis/KWENTA/PerpsV2Market.json'
import SynthUtil from '@/src/contracts/abis/KWENTA/PerpsV2Market.json'

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
    abi: GMXVault, // ref. vaultV2 in GMX repo
  },
  GMX_VaultReader: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0xfebB9f4CAC4cD523598fE1C5771181440143F24A',
    },
    abi: VaultReader, // ref. vaultV2 in GMX repo
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
  USDG: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x45096e7aA921f27590f8F19e457794EB09678141',
    },
    abi: ERC20,
  },
  KWENTA_PerpsV2Market: {
    address: {
      [Chains.optimism]: '0x2B3bb4c683BFc5239B029131EEf3B1d214478d93',
      [Chains.arbitrum]: '',
    },
    abi: PerpsV2Market,
  },
  KWENTA_SynthUtil: {
    address: {
      [Chains.optimism]: '0x87b1481c82913301Fc6c884Ac266a7c430F92cFA',
      [Chains.arbitrum]: '',
    },
    abi: SynthUtil,
  },
} as const

export type ContractsKeys = keyof typeof contracts

export const isKnownContract = (
  contractName: ContractsKeys | string,
): contractName is ContractsKeys => {
  return contracts[contractName as ContractsKeys] !== undefined
}
