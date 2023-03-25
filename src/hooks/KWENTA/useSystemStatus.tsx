import { useContractCall } from '../useContractCall'
import { useReadContractInstance } from '../useContractInstance'
import { Chains } from '@/src/config/web3'
import { SystemStatus, SystemStatus__factory } from '@/types/generated/typechain'

export function useFetchFuturesMarketSuspensions(marketKeys: string[]) {
  const reader = useReadContractInstance(
    Chains.optimism,
    SystemStatus__factory,
    'KWENTA_SystemStatus',
  )
  const calls = [reader.getFuturesMarketSuspensions] as const
  // const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions(marketKeys);

  const res = useContractCall<SystemStatus, typeof calls>(
    calls,
    [[marketKeys]],
    `KWENTA_SystemStatus_${Chains.optimism}`,
  )

  return !res[0].data ? [[], []] : res[0].data[0]
}
