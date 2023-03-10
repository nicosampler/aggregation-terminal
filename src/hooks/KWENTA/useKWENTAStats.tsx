import { Chains } from '@/src/config/web3'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { PerpsV2Market, PerpsV2Market__factory } from '@/types/generated/typechain'

function useKWENTAStats() {
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2Market__factory,
    'KWENTA_PerpsV2Market',
  )

  const calls = [reader.postTradeDetails] as const

  const res = useContractCall<PerpsV2Market, typeof calls>(
    calls,
    // TODO: define source for contract call arguments
    [
      [
        '0x4d63094f228d5e8400',
        '-0x7c6f6974684586',
        2,
        '0x8e83aa0427d5b9d40d3132e7277c5999e2645e47',
      ],
    ],
    `KWENTA_Stats_${Chains.optimism}`,
  )

  console.log(res)

  return !res[0].data ? undefined : res[0].data[0]
}

export default useKWENTAStats
