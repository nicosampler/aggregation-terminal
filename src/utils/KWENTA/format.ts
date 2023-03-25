/* eslint-disable no-debugger */
import Wei, { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import { parseBytes32String } from 'ethers/lib/utils'

import { FuturesMarketAsset, FuturesMarketKey } from './constants'
import { ParametersStructOutput } from '@/src/hooks/KWENTA/useMarketSettings'
import { PerpsV2MarketData } from '@/types/generated/typechain'
import { Position } from '@/types/utils'

export type PostTradeDetailsResponse = {
  margin: BigNumber
  size: BigNumber
  price: BigNumber
  liqPrice: BigNumber
  fee: BigNumber
  status: number
}

export type IsolatedMarginTradeInputs = {
  nativeSize: Wei
  susdSize: Wei
}

export const formatPosition = (
  preview: PostTradeDetailsResponse,
  basePrice: Wei,
  nativeSizeDelta: Wei,
  leverageSide: Position,
) => {
  const { fee, liqPrice, margin, price, size, status } = preview

  const tradeValueWithoutSlippage = wei(nativeSizeDelta).abs().mul(wei(basePrice))
  const notionalValue = wei(size).mul(wei(basePrice))
  const leverage = notionalValue.div(wei(margin))

  const priceImpact = wei(price).sub(basePrice).div(basePrice)
  const slippageDirection = nativeSizeDelta.gt(0)
    ? priceImpact.gt(0)
      ? -1
      : nativeSizeDelta.lt(0)
      ? priceImpact.lt(0)
      : -1
    : 1
  debugger
  return {
    positionStats: {
      fee: wei(fee),
      liqPrice: wei(liqPrice),
      margin: wei(margin),
      price: wei(price),
      size: wei(size),
      sizeDelta: nativeSizeDelta,
      side: leverageSide,
      leverage: leverage,
      notionalValue: notionalValue,
      status,
      showStatus: status > 0, // 0 is success
      priceImpact: priceImpact,
      slippageAmount: priceImpact.mul(slippageDirection).mul(tradeValueWithoutSlippage),
    },
  }
}

export const formatOrderSizes = (
  size: string,
  leverage: number,
  assetRate: Wei,
  position: string,
) => {
  const susdSize = wei(size)
  const nativeSize = wei(size).div(assetRate)
  const susdSizeDelta = position == 'long' ? susdSize : susdSize.neg()
  const nativeSizeDelta = position == 'long' ? nativeSize : nativeSize.neg()
  const sizeDelta = wei(leverage).mul(size).div(assetRate)
  const marginDelta = sizeDelta.mul(assetRate).div(leverage)
  // debugger
  return {
    susdSize,
    nativeSize,
    susdSizeDelta,
    nativeSizeDelta,
    sizeDelta,
    marginDelta,
  }
}

export const formatFuturesMarket = (
  futuresMarket: PerpsV2MarketData.MarketSummaryStructOutput,
  currentRoundId: any,
  marketParameters: ParametersStructOutput,
) => {
  const getDisplayAsset = (asset: string | null) => {
    return asset ? (asset[0] === 's' ? asset.slice(1) : asset) : null
  }
  const getMarketName = (asset: FuturesMarketAsset | null) => {
    return `${getDisplayAsset(asset)}-PERP`
  }
  const {
    asset,
    currentFundingRate,
    feeRates,
    key,
    market,
    marketDebt,
    marketSize,
    marketSkew,
    maxLeverage,
    price,
  } = futuresMarket
  // const readableMarketFeeRates = {
  //   makerFee: wei(futuresMarket.feeRates.makerFee),
  //   takerFee: wei(futuresMarket.feeRates.takerFee),
  //   makerFeeOffchainDelayedOrder: wei(futuresMarket.feeRates.makerFeeOffchainDelayedOrder),
  //   takerFeeOffchainDelayedOrder: wei(futuresMarket.feeRates.takerFeeOffchainDelayedOrder),
  // }
  // debugger
  return {
    market,
    marketKey: parseBytes32String(key) as FuturesMarketKey,
    marketName: getMarketName(parseBytes32String(asset) as FuturesMarketAsset),
    asset: parseBytes32String(asset) as FuturesMarketAsset,
    assetHex: asset,
    currentFundingRate: wei(currentFundingRate).div(24),
    currentRoundId: wei(currentRoundId, 0),
    feeRates: {
      makerFee: wei(feeRates.makerFee),
      takerFee: wei(feeRates.takerFee),
      makerFeeDelayedOrder: wei(feeRates.makerFeeDelayedOrder),
      takerFeeDelayedOrder: wei(feeRates.takerFeeDelayedOrder),
      makerFeeOffchainDelayedOrder: wei(feeRates.makerFeeOffchainDelayedOrder),
      takerFeeOffchainDelayedOrder: wei(feeRates.takerFeeOffchainDelayedOrder),
    },
    openInterest: {
      shortPct: wei(marketSize).eq(0)
        ? 0
        : wei(marketSize).sub(marketSkew).div('2').div(marketSize).toNumber(),
      longPct: wei(marketSize).eq(0)
        ? 0
        : wei(marketSize).add(marketSkew).div('2').div(marketSize).toNumber(),
      shortUSD: wei(marketSize).eq(0)
        ? wei(0)
        : wei(marketSize).sub(marketSkew).div('2').mul(price),
      longUSD: wei(marketSize).eq(0) ? wei(0) : wei(marketSize).add(marketSkew).div('2').mul(price),
    },
    marketDebt: wei(marketDebt),
    marketSkew: wei(marketSkew),
    maxLeverage: wei(maxLeverage),
    marketSize: wei(marketSize),
    marketLimit: wei(marketParameters.maxMarketValue).mul(wei(price)),
    settings: {
      maxMarketValue: wei(marketParameters.maxMarketValue),
      skewScale: wei(marketParameters.skewScale),
      delayedOrderConfirmWindow: wei(marketParameters.delayedOrderConfirmWindow, 0).toNumber(),
      offchainDelayedOrderMinAge: wei(marketParameters.offchainDelayedOrderMinAge, 0).toNumber(),
      offchainDelayedOrderMaxAge: wei(marketParameters.offchainDelayedOrderMaxAge, 0).toNumber(),
      minDelayTimeDelta: wei(marketParameters.minDelayTimeDelta, 0).toNumber(),
      maxDelayTimeDelta: wei(marketParameters.maxDelayTimeDelta, 0).toNumber(),
    },
  }
}
