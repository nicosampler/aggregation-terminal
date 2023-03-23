/* eslint-disable no-debugger */
import { JsonRpcProvider } from '@ethersproject/providers'
import Wei, { wei } from '@synthetixio/wei'
import { BigNumber, ethers } from 'ethers'
import useSWR from 'swr'

import { getNetworkConfig } from '@/src/config/web3'
import PerpsV2MarketInternal from '@/src/contracts/PerpsV2MarketInternalV2'
import { FuturesMarketKey, PotentialTradeStatus } from '@/src/utils/KWENTA/constants'
import { TradePreviewResponse } from '@/src/utils/KWENTA/format'
import { ChainsValues } from '@/types/chains'

type TradePreviewProps = {
  marketKey: FuturesMarketKey
  sizeDelta: BigNumber
  marginDelta: BigNumber
}

type PositionDetails = {
  lastFundingIndex: BigNumber
  margin: BigNumber
  lastPrice: BigNumber
  size: BigNumber
}

type TradeParams = {
  sizeDelta: BigNumber
  price: BigNumber
  takerFee: BigNumber
  makerFee: BigNumber
  marketSkew: BigNumber
  fundingSequenceLength: BigNumber
  maxMarketValue: BigNumber
  trackingCode: string
}

export function useGetTradePreview(
  sizeDelta: Wei,
  marketKey: FuturesMarketKey,
  marketAddress: string,
  chainId: ChainsValues,
): TradePreviewResponse {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)
  const { data } = useSWR(sizeDelta.gt(0) ? ['getTradePreview'] : null, async () => {
    try {
      const market = new PerpsV2MarketInternal(chainId, provider, marketKey, marketAddress)
      return await market.getTradePreview(
        ethers.constants.AddressZero,
        sizeDelta.toBN(),
        ethers.constants.MaxUint256,
      )
    } catch (e) {
      debugger
      console.log({ error: e })
    }
  })

  debugger
  const noTradePreview = {
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
  debugger
  return !data ? noTradePreview : data
}
