import Wei from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import { formatBytes32String, parseBytes32String } from 'ethers/lib/utils'

import { useFetchCurrentRoundId } from './useExchangeRates'
import { useFetchProxiedMarketSummaries } from './useMarketData'
import { useFetchParameters } from './useMarketSettings'
import { FuturesMarketAsset, FuturesMarketKey } from '@/src/utils/KWENTA/constants'
import { ParametersStructOutput, formatFuturesMarket } from '@/src/utils/KWENTA/format'
import { MAINNET_MARKETS } from '@/src/utils/KWENTA/markets'
import { PerpsV2MarketData } from '@/types/generated/typechain'

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
  minInitialMargin: T
  keeperDeposit: T
  isSuspended: boolean
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

export type FuturesGlobalsStructOutput = [BigNumber, BigNumber, BigNumber, BigNumber] & {
  minInitialMargin: BigNumber
  liquidationFeeRatio: BigNumber
  liquidationBufferRatio: BigNumber
  minKeeperFee: BigNumber
}

export function useFetchMarket(marketKey: string) {
  const markets =
    useFetchProxiedMarketSummaries() as unknown as PerpsV2MarketData.MarketSummaryStructOutput[]
  const formattedMarketKey = formatBytes32String(marketKey)
  const fetchedMarket = markets.find((market) => {
    return formattedMarketKey === market.key
  })

  const currentRoundId = useFetchCurrentRoundId(formattedMarketKey)
  const marketParameters = useFetchParameters(formattedMarketKey)

  return formatFuturesMarket(
    fetchedMarket ?? ({} as PerpsV2MarketData.MarketSummaryStructOutput),
    currentRoundId,
    marketParameters,
  )
}
