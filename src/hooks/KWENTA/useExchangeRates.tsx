import { Chains } from '@/src/config/web3'
import { useContractCall } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { ExchangeRates, ExchangeRates__factory } from '@/types/generated/typechain'

export type CurrencyKey = string

export function useRatesForCurrencies(currencyKeys: CurrencyKey[]) {
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

  return !res[0].data ? [] : res[0].data[0]
}

export function useFetchCurrentRoundId(currencyKey: CurrencyKey) {
  const reader = useReadContractInstance(
    Chains.optimism,
    ExchangeRates__factory,
    'KWENTA_ExchangeRates',
  )
  const calls = [reader.getCurrentRoundId] as const

  const res = useContractCall<ExchangeRates, typeof calls>(
    calls,
    [[currencyKey]],
    `KWENTA_CurrentRoundId_${Chains.optimism}`,
  )

  return !res[0].data ? [] : res[0].data[0]
}
