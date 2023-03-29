import { Dispatch, memo } from 'react'

import { wei } from '@synthetixio/wei'
import { formatBytes32String } from 'ethers/lib/utils'

import { extractMarketInfo } from '../hooks/KWENTA/useMarketData'
import { useMarketInternalV2Data } from '../hooks/KWENTA/useMarketInternal'
import { useMarketSettingsV2Parameters } from '../hooks/KWENTA/useMarketSettings'
import { useTradePreview } from '../hooks/KWENTA/usePositionDetails'
import { FuturesMarketKey, KWENTA_FIXED_FEE } from '@/src/utils/KWENTA/constants'
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
    console.log(tradePreview.status)
    throw `There was not possible to fetch Position Stats`
  }

  // destruct object from formatPosition
  const { positionStats } = formatPosition(
    tradePreview,
    skewAdjustedPrice,
    nativeSizeDelta,
    position,
  )

  setValues({
    protocol: 'kwenta',
    investmentTokenSymbol: 'sUSD',
    fillPrice: wei(amount).mul(leverage).div(marketData.assetPrice).toBN(),
    priceImpact: positionStats.priceImpact.toBN(),
    protocolFee: positionStats.fee.add(KWENTA_FIXED_FEE).toBN(),
    tradeFee: positionStats.fee.toBN(),
    keeperFee: KWENTA_FIXED_FEE.toBN(),
    liquidationPrice: positionStats.liqPrice.toBN(),
    oneHourFunding: wei(marketData.assetPrice).mul(oneHourlyFundingRate).toBN(),
  })

  return null
})

export default KWENTAStatsComponent
