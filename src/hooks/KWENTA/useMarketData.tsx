/* eslint-disable no-debugger */
import Wei, { wei } from '@synthetixio/wei'

import { useContractCall } from '../useContractCall'
import { useReadContractInstance } from '../useContractInstance'
import { zeroBN } from './useMarketPrice'
import { Chains } from '@/src/config/web3'
import { FuturesMarketAsset, FuturesMarketKey } from '@/src/utils/KWENTA/constants'
import { PerpsV2MarketData, PerpsV2MarketData__factory } from '@/types/generated/typechain'

export type FuturesMarket<T = Wei> = {
  market: string
  marketKey: FuturesMarketKey
  marketName: string
  asset: FuturesMarketAsset
  assetHex: string
  currentFundingRate: T
  currentRoundId: T
  feeRates: {
    makerFee: T
    takerFee: T
    makerFeeDelayedOrder: T
    takerFeeDelayedOrder: T
    makerFeeOffchainDelayedOrder: T
    takerFeeOffchainDelayedOrder: T
  }
  openInterest: {
    shortPct: number
    longPct: number
    shortUSD: T
    longUSD: T
  }
  marketDebt: T
  marketSkew: T
  marketSize: T
  maxLeverage: T
  marketLimit: T
  settings: {
    maxMarketValue: T
    skewScale: T
    delayedOrderConfirmWindow: number
    offchainDelayedOrderMinAge: number
    offchainDelayedOrderMaxAge: number
    minDelayTimeDelta: number
    maxDelayTimeDelta: number
  }
}

export function useFetchMarket(marketKeyBytes: string) {
  const reader = useReadContractInstance(
    Chains.optimism,
    PerpsV2MarketData__factory,
    'KWENTA_PerpsV2MarketData',
  )
  const calls = [reader.allProxiedMarketSummaries] as const

  const res = useContractCall<PerpsV2MarketData, typeof calls>(
    calls,
    [[]],
    `KWENTA_PerpV2MarketData_markets_${Chains.optimism}`,
  )

  if (!res[0].data) throw `There was not possible to fetch Markets`

  const fetchedMarkets = res[0].data[0]
  const market = fetchedMarkets.find((market) => {
    return marketKeyBytes === market.key
  })
  return market
}

export function extractMarketInfo(market: FuturesMarket, assetRate: Wei) {
  // focused on oneHourlyFundingRate, skewAdjustedPrice

  // oneHourlyFundingRate
  const oneHourlyFundingRate = market.currentFundingRate // wei(futuresMarket.currentFundingRate).div(24)

  // double check if this calculation is really necessary
  const skewAdjustedPrice = assetRate
    ? wei(assetRate).mul(wei(market.marketSkew).div(market.settings.skewScale).add(1))
    : zeroBN

  return { oneHourlyFundingRate, skewAdjustedPrice }
}

// export function useFetchGlobals() {
//   const reader = useReadContractInstance(
//     Chains.optimism,
//     PerpsV2MarketData__factory,
//     'KWENTA_PerpsV2MarketData',
//   )
//   const calls = [reader.globals] as const

//   const res = useContractCall<PerpsV2MarketData, typeof calls>(
//     calls,
//     [[]],
//     `KWENTA_PerpV2MarketData_globals_${Chains.optimism}`,
//   )

//   return !res[0].data ? {} : res[0].data[0]
// }
