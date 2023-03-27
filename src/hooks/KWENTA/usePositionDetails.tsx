/* eslint-disable no-debugger */
import { JsonRpcProvider } from '@ethersproject/providers'
import Wei from '@synthetixio/wei'
import { BigNumber, ethers } from 'ethers'
import useSWR from 'swr'

import { getNetworkConfig } from '@/src/config/web3'
import PerpsV2MarketInternal from '@/src/contracts/PerpsV2MarketInternalV2'
import { FuturesMarketKey, PotentialTradeStatus } from '@/src/utils/KWENTA/constants'
import { ChainsValues } from '@/types/chains'

type TradePreviewResponse = {
  liqPrice: BigNumber
  fee: BigNumber
  price: BigNumber
  status: PotentialTradeStatus
  id: string
  lastPrice: BigNumber
  size: BigNumber
  margin: BigNumber
  lastFundingIndex: BigNumber
}

export function useGetTradePreview(
  sizeDelta: Wei,
  marginDelta: Wei,
  marketKey: FuturesMarketKey,
  marketAddress: string,
  chainId: ChainsValues,
): TradePreviewResponse {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)
  const { data } = useSWR(marginDelta.gt(0) ? ['getTradePreview'] : null, async () => {
    try {
      const market = new PerpsV2MarketInternal(chainId, provider, marketKey, marketAddress)
      return await market.getTradePreview(
        ethers.constants.AddressZero,
        sizeDelta.toBN(), // sizeDelta => orderSize (SUSD) / assetRate (ETH USD MARKET VALUE)
        marginDelta.toBN(), // marginDelta => sizeDelta * assetRate / leverageInput
      )
    } catch (e) {
      console.log({ error: e })
      throw `There was not possible to fetch trade preview`
    }
  })

  const zeroStatePreview = {
    id: '0',
    liqPrice: BigNumber.from(0),
    fee: BigNumber.from(0),
    price: BigNumber.from(0),
    lastPrice: BigNumber.from(0),
    status: PotentialTradeStatus.NIL_ORDER,
    size: BigNumber.from(0),
    margin: BigNumber.from(0),
    lastFundingIndex: BigNumber.from(0),
  }
  return !data ? zeroStatePreview : data
}
