import Wei, { wei } from '@synthetixio/wei'
import { BigNumberish } from 'ethers'
import { formatEther, parseBytes32String } from 'ethers/lib/utils'

import useRatesForCurrencies from '@/src/hooks/KWENTA/useExchangeRates'
import useSynthsRates from '@/src/hooks/KWENTA/useSynthsRates'
import { ADDITIONAL_SYNTHS, FuturesMarketKey, MarketAssetByKey } from '@/src/utils/KWENTA/constants'

export type CurrencySymbol = string
export type CurrencyPrice = BigNumberish

export function useMarketPrices() {
  const synthsRates = useSynthsRates()
  const ratesForCurrencies = useRatesForCurrencies(ADDITIONAL_SYNTHS)

  const synths = [...synthsRates[0], ...ADDITIONAL_SYNTHS] as CurrencySymbol[]
  const rates = [...synthsRates[1], ...ratesForCurrencies] as CurrencyPrice[]

  const synthPrices: Record<string, Wei> = {}

  // merges currencies and prices
  synths.forEach((currencyKeyBytes32: CurrencySymbol, idx: number) => {
    const currencyKey = parseBytes32String(currencyKeyBytes32) as CurrencySymbol
    const marketAsset = MarketAssetByKey[currencyKey as FuturesMarketKey]

    const rate = Number(formatEther(rates[idx]))
    const price = wei(rate)

    synthPrices[currencyKey] = price
    if (marketAsset) synthPrices[marketAsset] = price
  })

  console.log('SynthPrices ', { synthPrices })

  // return !res[0].data ? undefined : res[0].data[0]
  return synthPrices
}
