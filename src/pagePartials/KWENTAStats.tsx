/* eslint-disable no-debugger */
import { Dispatch, memo } from 'react'

import { wei } from '@synthetixio/wei'
import { formatBytes32String } from 'ethers/lib/utils'

import { useFetchCurrentRoundId, useRatesForCurrencies } from '../hooks/KWENTA/useExchangeRates'
import { extractMarketInfo, useFetchMarket } from '../hooks/KWENTA/useMarketData'
import { useFetchParameters } from '../hooks/KWENTA/useMarketSettings'
import { useSynthsRates } from '../hooks/KWENTA/useSynthsRates'
import { contracts } from '@/src/contracts/contracts'
import { getMarketPrices } from '@/src/hooks/KWENTA/useMarketPrice'
import { useGetTradePreview } from '@/src/hooks/KWENTA/usePositionDetails'
import useProtocols from '@/src/hooks/useProtocols'
import { FuturesMarketKey, KWENTA_FIXED_FEE } from '@/src/utils/KWENTA/constants'
import { formatFuturesMarket, formatOrderSizes, formatPosition } from '@/src/utils/KWENTA/format'
import { ChainsValues } from '@/types/chains'
import { Outputs, Position } from '@/types/utils'

type Props = {
  amount: string
  chainId: ChainsValues
  leverage: number
  position: Position
  fromTokenSymbol: string
  toTokenSymbol: string
  setValues: Dispatch<Outputs>
}

const KWENTAStatsComponent = memo(function KWENTAStats({
  amount,
  chainId,
  fromTokenSymbol,
  leverage,
  position,
  setValues,
  toTokenSymbol,
}: Props) {
  const { getTokenBySymbolAndChain } = useProtocols()
  const fromTokenInfo = getTokenBySymbolAndChain(fromTokenSymbol, chainId.toString())
  const toTokenInfo = getTokenBySymbolAndChain(toTokenSymbol, chainId.toString())
  // @todo: fetch marketKey by tokenSymbol
  const marketKey = FuturesMarketKey.sETHPERP
  const marketAddress = contracts['KWENTA_PerpsV2Market'].address[chainId]

  // fetches rates for all markets
  const synthRates = useSynthsRates()
  const ratesForCurrencies = useRatesForCurrencies()
  const marketPrices = getMarketPrices(synthRates, ratesForCurrencies)
  if (!marketPrices) {
    throw `There was not possible to fetch Market Prices`
  }

  // fetches marketInfo and marketParameters for a marketKey
  const marketKeyBytes = formatBytes32String(marketKey)
  const market = useFetchMarket(marketKeyBytes)
  const currentRoundId = useFetchCurrentRoundId(marketKeyBytes)
  const marketParameters = useFetchParameters(marketKeyBytes)
  if (!currentRoundId) {
    throw `There was not possible to fetch currentRoundId for market`
  }
  if (!marketParameters) {
    throw `There was not possible to fetch parameters for market`
  }
  if (!market) {
    throw `Market was not fetched`
  }
  const formattedMarket = formatFuturesMarket(market, currentRoundId, marketParameters)

  const assetRate = marketPrices[toTokenInfo?.symbol as string]
  const { oneHourlyFundingRate, skewAdjustedPrice } = extractMarketInfo(formattedMarket, assetRate)
  if (!skewAdjustedPrice) {
    throw `There was not possible to fetch skew adjusted price`
  }
  if (!oneHourlyFundingRate) {
    throw `There was not possible to fetch 1hr funding rate`
  }

  const { marginDelta, nativeSizeDelta, sizeDelta } = formatOrderSizes(
    amount,
    leverage,
    assetRate,
    position,
  )

  const tradePreview = useGetTradePreview(sizeDelta, marginDelta, marketKey, marketAddress, chainId)
  if (tradePreview.status !== 0) {
    throw `There was not possible to fetch Position Stats`
  }

  // destruct returned object from formatPosition
  const { positionStats } = formatPosition(
    tradePreview,
    skewAdjustedPrice,
    nativeSizeDelta,
    position,
  )

  debugger
  setValues({
    investmentTokenSymbol: 'sUSD',
    fillPrice: wei(amount).mul(leverage).div(assetRate).toBN(),
    priceImpact: positionStats.priceImpact.toBN(),
    protocolFee: positionStats.fee.add(KWENTA_FIXED_FEE).toBN(), // sum tradeFee & keeperFee
    tradeFee: positionStats.fee.toBN(),
    keeperFee: KWENTA_FIXED_FEE.toBN(),
    liquidationPrice: positionStats.liqPrice.toBN(),
    oneHourFunding: oneHourlyFundingRate.toBN(),
  })

  return null
})

export default KWENTAStatsComponent
