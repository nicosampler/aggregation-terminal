import { Dispatch, memo } from 'react'

import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import { formatBytes32String } from 'ethers/lib/utils'

import { extractMarketInfo } from '../hooks/KWENTA/useMarketData'
import { useMarketInternalV2Data } from '../hooks/KWENTA/useMarketInternal'
import { useMarketSettingsV2Parameters } from '../hooks/KWENTA/useMarketSettings'
import { useTradePreview } from '../hooks/KWENTA/usePositionDetails'
import { useSynthsRates } from '../hooks/KWENTA/useSynthsRates'
import { FuturesMarketKey, KWENTA_FIXED_FEE, ZERO_BIG_NUM } from '@/src/utils/KWENTA/constants'
import { formatOrderSizes, formatPosition } from '@/src/utils/KWENTA/format'
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
  const synthRates = useSynthsRates()
  const sUSDAssetPrice = synthRates[1][0]
  // @todo: fetch marketKey by tokenSymbol
  const marketKey = FuturesMarketKey.sETHPERP
  const marketKeyBytes = formatBytes32String(marketKey)
  const marketData = useMarketInternalV2Data()
  if (!marketData) {
    throw `There was not possible to fetch data for market`
  }
  const marketParams = useMarketSettingsV2Parameters(marketKeyBytes)
  if (!marketParams) {
    throw `There was not possible to fetch parameters for market`
  }

  const { oneHourlyFundingRate, skewAdjustedPrice } = extractMarketInfo(marketData, marketParams)
  if (!skewAdjustedPrice) {
    throw `There was not possible to fetch skew adjusted price`
  }
  if (!oneHourlyFundingRate) {
    throw `There was not possible to fetch 1hr funding rate`
  }

  const { marginDelta, nativeSizeDelta, sizeDelta } = formatOrderSizes(
    amount,
    leverage,
    wei(marketData.assetPrice),
    position,
  )

  const tradePreview = useTradePreview(
    chainId,
    sizeDelta,
    marginDelta,
    position,
    leverage,
    marketData,
    marketParams,
  )
  if (tradePreview.status !== 0) {
    throw `There was not possible to fetch Position Stats`
  }

  const { positionStats } = formatPosition(
    tradePreview,
    skewAdjustedPrice,
    nativeSizeDelta,
    position,
  )

  const positionValue = wei(amount).mul(leverage).div(sUSDAssetPrice).toBN()
  const oneHourFunding = oneHourlyFundingRate.gt(ZERO_BIG_NUM)
    ? position === 'long'
      ? wei(marketData.assetPrice).mul(oneHourlyFundingRate).neg().toBN()
      : wei(marketData.assetPrice).mul(oneHourlyFundingRate).toBN() // positive && short position
    : position === 'short'
    ? wei(marketData.assetPrice).mul(oneHourlyFundingRate).toBN()
    : wei(marketData.assetPrice).mul(oneHourlyFundingRate.abs()).toBN() // negative && long position

  setValues({
    protocol: 'kwenta',
    position: positionValue,
    investmentTokenSymbol: 'sUSD',
    fillPrice: BigNumber.from(0),
    orderSize: wei(amount).mul(leverage).div(marketData.assetPrice).toBN(),
    priceImpact: positionStats.priceImpact.toBN(),
    protocolFee: positionStats.fee.add(KWENTA_FIXED_FEE).toBN(),
    tradeFee: positionStats.fee.toBN(),
    keeperFee: KWENTA_FIXED_FEE.toBN(),
    liquidationPrice: positionStats.liqPrice.toBN(),
    oneHourFunding: oneHourFunding,
  })

  return null
})

export default KWENTAStatsComponent
