import { BigNumber } from 'ethers'

import { useContractCall } from '../useContractCall'
import { useReadContractInstance } from '../useContractInstance'
import { Chains } from '@/src/config/web3'
import { SynthUtil, SynthUtil__factory } from '@/types/generated/typechain'

export type SynthsRates = [string[], BigNumber[]]

export function useSynthsRates(): SynthsRates {
  const reader = useReadContractInstance(Chains.optimism, SynthUtil__factory, 'KWENTA_SynthUtil')
  const calls = [reader.synthsRates] as const

  const res = useContractCall<SynthUtil, typeof calls>(
    calls,
    [[]],
    `KWENTA_SynthsRates_${Chains.optimism}`,
  )

  return !res[0].data ? [[], []] : res[0].data[0]
}
