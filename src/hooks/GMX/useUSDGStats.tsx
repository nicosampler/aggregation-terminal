import { Chains } from '@/src/config/web3'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { ChainsValues } from '@/types/chains'
import { ERC20 } from '@/types/generated/typechain'
import { ERC20__factory } from '@/types/generated/typechain/factories/ERC20__factory'

function useUSDGStats(chainId: ChainsValues) {
  const reader = useReadContractInstance(chainId, ERC20__factory, 'USDG')

  const calls = [reader.totalSupply] as const

  const res = useContractCall<ERC20, typeof calls>(
    calls,
    [[]],
    `GMX_USDToken_Balances_${Chains.arbitrum}`,
  )

  return !res ? [] : res
}

export default useUSDGStats
