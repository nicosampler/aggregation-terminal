import Wei, { wei } from '@synthetixio/wei'
import { BigNumberish } from 'ethers'
import { formatEther, parseBytes32String } from 'ethers/lib/utils'

import { RatesForCurrencies } from './useExchangeRates'
import { SynthsRates } from './useSynthsRates'
import { ADDITIONAL_SYNTHS, FuturesMarketKey, MarketAssetByKey } from '@/src/utils/KWENTA/constants'

export type CurrencySymbol = string
export type CurrencyPrice = BigNumberish
export const zeroBN = wei(0)

export function getMarketPrices(synthsRates: SynthsRates, ratesForCurrencies: RatesForCurrencies) {
  const synths = [...synthsRates[0], ...ADDITIONAL_SYNTHS] as CurrencySymbol[]
  const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyPrice[]

  const synthPrices: Record<string, Wei> = {}

  // merges currencies and prices
  synths.forEach((currencyKeyBytes32: CurrencySymbol, idx: number) => {
    const currencyKey = parseBytes32String(currencyKeyBytes32) as CurrencySymbol // tokenSymbols are hashed @todo: doublecheck!
    const marketAsset = MarketAssetByKey[currencyKey as FuturesMarketKey]

    const rate = Number(formatEther(rates[idx]))
    const price = wei(rate)

    synthPrices[currencyKey] = price
    if (marketAsset) synthPrices[marketAsset] = price
  })
  return synthPrices
}

// export function useSkewAdjustedPrice(marketPrice: Wei, marketKey: FuturesMarketKey) {
//   const fetchedMarket = useFetchMarket(marketKey)

//   const skewAdjustedPrice = marketPrice
//     ? wei(marketPrice).mul(
//         wei(fetchedMarket.marketSkew).div(fetchedMarket.settings.skewScale).add(1),
//       )
//     : zeroBN

//   const oneHourlyFundingRate = fetchedMarket.currentFundingRate
//   return { skewAdjustedPrice, oneHourlyFundingRate }
// }
