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

export type MarketParams<T = BigNumber> = {
  takerFee: T
  makerFee: T
  minInitialMargin: T
  maxLeverage: T
  maxMarketValue: T
  skewScale: T
  liquidationPremiumMultiplier: T
  maxFundingVelocity: T
  liquidationBufferRatio: T
  liquidationFeeRatio: T
  maxKeeperFee: T
  minKeeperFee: T
}

export function useMarketSettingsV2Parameters(marketKey: string): MarketParams {
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2MarketSettings__factory,
    'KWENTA_PerpsV2MarketSettings',
  )
  const calls = [
    reader.takerFeeOffchainDelayedOrder,
    reader.makerFeeOffchainDelayedOrder,
    reader.minInitialMargin,
    reader.maxLeverage,
    reader.maxMarketValue,
    reader.skewScale,
    reader.liquidationPremiumMultiplier,
    reader.maxFundingVelocity,
    reader.liquidationBufferRatio,
    reader.liquidationFeeRatio,
    reader.maxKeeperFee,
    reader.minKeeperFee,
  ] as const

  const res = useContractCall<PerpsV2MarketSettings, typeof calls>(
    calls,
    [
      [marketKey],
      [marketKey],
      [],
      [marketKey],
      [marketKey],
      [marketKey],
      [marketKey],
      [marketKey],
      [],
      [],
      [],
      [],
    ],
    `KWENTA_PerpV2MarketSettings_${Chains.optimism}`,
  )

  if (!res[0].data) throw `There was not possible to fetch Market settings`

  const responseSettings = res[0].data
  return {
    takerFee: responseSettings[0],
    makerFee: responseSettings[1],
    minInitialMargin: responseSettings[2],
    maxLeverage: responseSettings[3],
    maxMarketValue: responseSettings[4],
    skewScale: responseSettings[5],
    liquidationPremiumMultiplier: responseSettings[6],
    maxFundingVelocity: responseSettings[7],
    liquidationBufferRatio: responseSettings[8],
    liquidationFeeRatio: responseSettings[9],
    maxKeeperFee: responseSettings[10],
    minKeeperFee: responseSettings[11],
  }
}
