import Wei from '@synthetixio/wei'
import { BigNumber } from 'ethers'

import { Chains } from '@/src/config/web3'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { PostTradeDetailsResponse } from '@/src/utils/KWENTA/format'
import { PerpsV2Market, PerpsV2Market__factory } from '@/types/generated/typechain'

export enum ContractOrderType {
  MARKET = 0,
  DELAYED = 1,
  DELAYED_OFFCHAIN = 2,
}

type PostTradeDetailsProps = {
  sizeDelta: Wei
  price: Wei
  orderType: ContractOrderType
  wallet: string // ??
}

export function usePostTradeDetails({
  orderType = 0,
  price,
  sizeDelta,
  wallet,
}: PostTradeDetailsProps) {
  // recreates 'futures/fetchIsolatedMarginTradePreview' action
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2Market__factory,
    'KWENTA_PerpsV2Market',
  )

  const calls = [reader.postTradeDetails] as const

  // STARTING POINT DATA
  // NOT REQUIRED !! const marketInfo = selectMarketInfo(getState()); || ITS FETCHED WITH CONSTANTS CONTRACT ADDRESSES WITHIN READER INSTANCE
  // REQUIRED ?? const account = selectFuturesAccount(getState()); || CONNECTED WALLET
  // REQUIRED const price = selectMarketPrice(getState()); || useMarketPrice
  // const skewAdjustedPrice = selectSkewAdjustedPrice(getState());
  // SOLVED const orderType = selectOrderType(getState()); || options "market" | "stop_market" | "limit" | "delayed" | "delayed_offchain" WE WILL WORK WITH "market"

  const res = useContractCall<PerpsV2Market, typeof calls>(
    calls,
    [
      [
        sizeDelta.toBN(), // inputs.sizeDelta.toBN(), '0x4d63094f228d5e8400'
        price.toBN(), // inputs.price.toBN(), '0x7c6f6974684586'
        orderType, // orderType, 1
        wallet, // this.sdk.context.walletAddress, '0x8e83aa0427d5b9d40d3132e7277c5999e2645e47'
      ],
    ],
    `KWENTA_PostTradeDetails_${Chains.optimism}`,
  )

  console.log('Position Details ', res)

  return !res[0].data ? undefined : (res[0].data[0] as PostTradeDetailsResponse)
}
