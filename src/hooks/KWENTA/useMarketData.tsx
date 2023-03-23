import { Chains } from '@/src/config/web3'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { PerpsV2MarketData, PerpsV2MarketData__factory } from '@/types/generated/typechain'

export function useFetchProxiedMarketSummaries() {
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2MarketData__factory,
    'KWENTA_PerpsV2MarketData',
  )
  const calls = [reader.allProxiedMarketSummaries] as const

  const res = useContractCall<PerpsV2MarketData, typeof calls>(
    calls,
    [[]],
    `KWENTA_PerpV2MarketData_markets_${Chains.optimism}`,
  )

  return !res[0].data ? [] : res[0].data[0]
}

export function useFetchGlobals() {
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2MarketData__factory,
    'KWENTA_PerpsV2MarketData',
  )
  const calls = [reader.globals] as const

  const res = useContractCall<PerpsV2MarketData, typeof calls>(
    calls,
    [[]],
    `KWENTA_PerpV2MarketData_globals_${Chains.optimism}`,
  )

  return !res[0].data ? {} : res[0].data[0]
}
