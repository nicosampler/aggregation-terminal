import { JsonRpcProvider } from '@ethersproject/providers'
import Wei from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import useSWR from 'swr'

import { MarketData } from './useMarketInternal'
import { MarketParams } from './useMarketSettings'
import { getNetworkConfig } from '@/src/config/web3'
import PerpsV2MarketInternalV2 from '@/src/contracts/PerpsV2MarketInternalV2'
import { PotentialTradeStatus } from '@/src/utils/KWENTA/constants'
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

export function useTradePreview(
  chainId: ChainsValues,
  sizeDelta: Wei,
  marginDelta: Wei,
  positionSide: string,
  leverage: number,
  marketData: MarketData,
  marketParams: MarketParams,
): TradePreviewResponse {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)
  const { data } = useSWR(
    marginDelta && marginDelta.gt(0)
      ? ['getTradePreview', marginDelta.toString(), sizeDelta.toString(), positionSide, chainId]
      : null,
    async () => {
      try {
        const blockNum = await provider.getBlockNumber()
        const block = await provider.getBlock(blockNum)
        const blockTimestamp = block.timestamp
        const marketInternal = new PerpsV2MarketInternalV2(provider, marketData, marketParams)
        return await marketInternal.getTradePreview(
          sizeDelta.toBN(), // sizeDelta => orderSize (SUSD) / assetRate (ETH USD MARKET VALUE)
          marginDelta.toBN(), // marginDelta => sizeDelta * assetRate / leverageInput
          blockTimestamp,
        )
      } catch (e) {
        console.log({ error: e })
        throw `There was not possible to fetch trade preview`
      }
    },
  )

  return !data ? zeroStatePreview : data
}
