import { useContractCall } from '../useContractCall'
import { useReadContractInstance } from '../useContractInstance'
import { Chains } from '@/src/config/web3'
import { ParametersStructOutput } from '@/src/utils/KWENTA/format'
import { PerpsV2MarketSettings, PerpsV2MarketSettings__factory } from '@/types/generated/typechain'

export function useFetchParameters(marketKey: string) {
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2MarketSettings__factory,
    'KWENTA_PerpsV2MarketSettings',
  )
  const calls = [reader.parameters] as const

  const res = useContractCall<PerpsV2MarketSettings, typeof calls>(
    calls,
    [[marketKey]],
    `KWENTA_PerpV2MarketSettings_${Chains.optimism}`,
  )

  // eslint-disable-next-line no-debugger
  debugger
  return !res[0].data ? ({} as ParametersStructOutput) : res[0].data[0]
}
