import { Chains } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import useProtocols from '@/src/hooks/useProtocols'
import { ChainsValues } from '@/types/chains'
import { ReaderV2, ReaderV2__factory } from '@/types/generated/typechain'

function useFundingRates(chainId: ChainsValues) {
  const protocols = useProtocols()
  const reader = useReadContractInstance(Chains.arbitrum, ReaderV2__factory, 'GMX_ReaderV2')

  const calls = [reader.getFundingRates] as const

  const res = useContractCall<ReaderV2, typeof calls>(
    calls,
    [
      [
        contracts['GMX_Vault'].address[chainId],
        contracts['WETH'].address[chainId],
        protocols.getProtocolTokens('GMX', chainId.toString()).map((t) => t.address),
      ],
    ],
    `GMX_Token_Balances_${Chains.arbitrum}`,
  )

  return !res[0].data ? undefined : res[0].data[0]
}

export default useFundingRates
