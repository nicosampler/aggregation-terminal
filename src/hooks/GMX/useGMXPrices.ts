import axios from 'axios'
import { BigNumber } from 'ethers'
import useSWR from 'swr'

import { GMX_URL } from '@/src/utils/GMX/backend'
import { ChainsValues } from '@/types/chains'

export function useGMXPrices(chainId: ChainsValues, shouldFetch: boolean) {
  const url = `${GMX_URL[chainId]}/prices`
  const { data: indexPrices } = useSWR<{ data: { [address: string]: BigNumber } }>(
    shouldFetch ? url : null,
    () => axios.get(url),
    { refreshInterval: 30_000 },
  )

  return indexPrices?.data || {}
}
