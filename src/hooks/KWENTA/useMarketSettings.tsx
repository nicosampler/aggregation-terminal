/* eslint-disable no-debugger */
import { BigNumber } from 'ethers'

import { useContractCall } from '../useContractCall'
import { useReadContractInstance } from '../useContractInstance'
import { Chains } from '@/src/config/web3'
import { PerpsV2MarketSettings, PerpsV2MarketSettings__factory } from '@/types/generated/typechain'

export type ParametersStructOutput = {
  takerFee: BigNumber
  makerFee: BigNumber
  overrideCommitFee: BigNumber
  takerFeeDelayedOrder: BigNumber
  makerFeeDelayedOrder: BigNumber
  takerFeeOffchainDelayedOrder: BigNumber
  makerFeeOffchainDelayedOrder: BigNumber
  maxLeverage: BigNumber
  maxMarketValue: BigNumber
  maxFundingVelocity: BigNumber
  skewScale: BigNumber
  nextPriceConfirmWindow: BigNumber
  delayedOrderConfirmWindow: BigNumber
  minDelayTimeDelta: BigNumber
  maxDelayTimeDelta: BigNumber
  offchainDelayedOrderMinAge: BigNumber
  offchainDelayedOrderMaxAge: BigNumber
  offchainMarketKey: string
  offchainPriceDivergence: BigNumber
}

export function useFetchParameters(marketKey: string): ParametersStructOutput | undefined {
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2MarketSettings__factory,
    'KWENTA_PerpsV2MarketSettings',
  )
  const calls = [reader.parameters] as const

  const res = useContractCall<PerpsV2MarketSettings, typeof calls>(
    calls,
    [[marketKey]],
    `KWENTA_PerpV2MarketSettings_${Chains.optimism}`,
  )

  return !res[0].data ? undefined : res[0].data[0]
}
