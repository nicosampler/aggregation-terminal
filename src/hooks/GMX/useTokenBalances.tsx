import { constants } from 'ethers'

import { Chains } from '@/src/config/web3'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { ReaderV2, ReaderV2__factory } from '@/types/generated/typechain'

function useTokenBalances() {
  const reader = useReadContractInstance(Chains.arbitrum, ReaderV2__factory, 'GMX_ReaderV2')

  const calls = [reader.getTokenBalances] as const
  // TODO: add more tokens as they are needed
  const tokens = ['0x0000000000000000000000000000000000000000']

  const res = useContractCall<ReaderV2, typeof calls>(
    calls,
    [[constants.AddressZero, tokens]],
    `GMX_Token_Balances_${Chains.arbitrum}`,
  )

  return !res[0].data ? [] : res[0].data
}

export default useTokenBalances
