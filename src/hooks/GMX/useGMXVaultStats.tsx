import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { ChainsValues } from '@/types/chains'
import { GMXVault, GMXVault__factory } from '@/types/generated/typechain'

function useGMXVaultStats(chainId: ChainsValues) {
  const reader = useReadContractInstance(chainId, GMXVault__factory, 'GMX_Vault')

  const calls = [reader.totalTokenWeights] as const

  const res = useContractCall<GMXVault, typeof calls>(calls, [[]], `GMX_Token_Balances_${chainId}`)

  return res ?? []
}

export default useGMXVaultStats
