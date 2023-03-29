import { BigNumber, ethers } from 'ethers'

import { useContractCall } from '../useContractCall'
import { useReadContractInstance } from '../useContractInstance'
import { Chains } from '@/src/config/web3'
import { PerpsV2Market, PerpsV2Market__factory } from '@/types/generated/typechain'

type Position = {
  id: string
  lastPrice: BigNumber
  size: BigNumber
  margin: BigNumber
  lastFundingIndex: BigNumber
}

export type MarketData<T = BigNumber> = {
  assetPrice: T
  marketSkew: T
  marketSize: T
  accruedFunding: T
  fundingSequenceLength: T
  fundingLastRecomputed: number
  fundingRateLastRecomputed: T
  position: Position
  currentFundingRate: T
  lastFundingVal: T
}

export function useMarketInternalV2Data(): MarketData {
  const dataReader = useReadContractInstance(
    Chains.optimism,
    PerpsV2Market__factory,
    'KWENTA_PerpsV2Market', // key value for marketAddress depends on the asset!
  )
  const dataCalls = [
    dataReader.assetPrice,
    dataReader.marketSkew,
    dataReader.marketSize,
    dataReader.accruedFunding,
    dataReader.fundingSequenceLength,
    dataReader.fundingLastRecomputed,
    dataReader.positions,
    dataReader.currentFundingRate,
  ] as const
  const addressZero = ethers.constants.AddressZero
  const dataRes = useContractCall<PerpsV2Market, typeof dataCalls>(
    dataCalls,
    [[], [], [], [addressZero], [], [], [addressZero], []],
    `KWENTA_PerpV2Market_marketData_${Chains.optimism}`,
  )
  if (!dataRes[0].data) throw `There was not possible to fetch Market context data`
  const responseData = dataRes[0].data
  const secondDataReader = useReadContractInstance(
    Chains.optimism,
    PerpsV2Market__factory,
    'KWENTA_PerpsV2Market', // key value for marketAddress depends on the asset!
  )

  const secondDataCalls = [secondDataReader.fundingSequence] as const

  const lastestFundingIndex = responseData[4].sub(1)
  const secondDataRes = useContractCall<PerpsV2Market, typeof secondDataCalls>(
    secondDataCalls,
    [[lastestFundingIndex]],
    `KWENTA_PerpV2Market_fundingIndex_${Chains.optimism}`,
  )
  if (!secondDataRes[0].data) throw `There was not possible to fetch Market internal data`
  const responseSecondData = secondDataRes[0].data

  const stateReader = useReadContractInstance(
    Chains.optimism,
    PerpsV2Market__factory,
    'KWENTA_PerpsV2MarketState', // key value for marketAddress depends on the asset!
  )
  const stateCalls = [stateReader.fundingRateLastRecomputed] as const
  const stateRes = useContractCall<PerpsV2Market, typeof stateCalls>(
    stateCalls,
    [[]],
    `KWENTA_PerpV2Market_marketState_${Chains.optimism}`,
  )
  if (!stateRes[0].data) throw `There was not possible to fetch Market internal data`
  const responseState = stateRes[0].data

  return {
    assetPrice: responseData[0].price,
    marketSkew: responseData[1],
    marketSize: responseData[2],
    accruedFunding: responseData[3].funding,
    fundingSequenceLength: responseData[4],
    fundingLastRecomputed: responseData[5],
    fundingRateLastRecomputed: responseState[0],
    position: responseData[6] as unknown as Position,
    currentFundingRate: responseData[7],
    lastFundingVal: responseSecondData[0],
  }
}
