import { useContractCall } from '../useContractCall'
import { useReadContractInstance } from '../useContractInstance'
import { Chains } from '@/src/config/web3'
import { ExchangeRates, ExchangeRates__factory } from '@/types/generated/typechain'

export type CurrencyKey = string

function useRatesForCurrencies(currencyKeys: CurrencyKey[]) {
  const reader = useReadContractInstance(
    Chains.optimism,
    ExchangeRates__factory,
    'KWENTA_ExchangeRates',
  )
  const calls = [reader.ratesForCurrencies] as const

  const res = useContractCall<ExchangeRates, typeof calls>(
    calls,
    [[currencyKeys]],
    `KWENTA_RatesForCurrencies_${Chains.optimism}`,
  )

  console.log('RatesForCurrencies ', res)

  return !res[0].data ? [] : res[0].data[0]
}

export default useRatesForCurrencies
