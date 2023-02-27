import axios from 'axios'
import { BigNumber } from 'ethers'
import useSWR from 'swr'

import { GMX_URL } from '@/src/utils/GMX/backend'
import { ChainsValues } from '@/types/chains'

export function usePrices(chainId: ChainsValues) {
  const url = `${GMX_URL[chainId]}/prices`
  const { data: indexPrices } = useSWR<{ [address: string]: BigNumber }>(
    url,
    () => axios.get(url),
    { refreshInterval: 30_000 },
  )
  return indexPrices || {}
}
