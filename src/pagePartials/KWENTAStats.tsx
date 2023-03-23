/* eslint-disable no-debugger */
import { Dispatch, memo, useState } from 'react'

import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'

import { contracts } from '@/src/contracts/contracts'
import { useGetTradePreview } from '@/src/hooks/KWENTA/useGetTradePreview'
import { useMarketPrices, useSkewAdjustedPrice } from '@/src/hooks/KWENTA/useMarketPrice'
import useProtocols from '@/src/hooks/useProtocols'
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
  const { getTokenBySymbolAndChain } = useProtocols()
  const fromTokenInfo = getTokenBySymbolAndChain(fromTokenSymbol, chainId.toString())
  const toTokenInfo = getTokenBySymbolAndChain(toTokenSymbol, chainId.toString())
  // @todo: fetch marketKey by tokenSymbol
  const marketKey = FuturesMarketKey.sETHPERP
  const marketAddress = contracts['KWENTA_PerpsV2Market'].address[chainId]

  const marketPrices = useMarketPrices()
  if (!marketPrices) {
    throw `There was not possible to fetch Market Prices`
  }
  const perpMarketPrice = marketPrices[toTokenInfo?.symbol as string]
  const { oneHourlyFundingRate, skewAdjustedPrice } = useSkewAdjustedPrice(
    perpMarketPrice,
    marketKey,
  )
  if (!skewAdjustedPrice) {
    throw `There was not possible to fetch skew adjusted price`
  }
  if (!skewAdjustedPrice) {
    throw `There was not possible to fetch 1hr funding rate`
  }

  const { nativeSize, nativeSizeDelta, susdSize, susdSizeDelta } = formatOrderSizes(
    amount,
    leverage,
    perpMarketPrice,
    position,
  )
  debugger
  const preview = useGetTradePreview(nativeSizeDelta, marketKey, marketAddress, chainId)
  if (preview.status !== 0) {
    throw `There was not possible to fetch Position Stats`
  }

  const { positionStats } = formatPosition(preview, skewAdjustedPrice, nativeSizeDelta, position)

  // @wouldbenice: show maxUsdInputAmount and add amount input value verification
  //  const maxUsdInputAmount = useAppSelector(selectMaxUsdInputAmount);
  //  const maxNativeValue = useMemo(
  // 	  () => (!isZero(tradePrice) ? maxUsdInputAmount.div(tradePrice) : zeroBN),
  // 	  [tradePrice, maxUsdInputAmount]
  //  );
  debugger
  setValues({
    investmentTokenSymbol: 'sUSD',
    fillPrice: wei(amount).mul(leverage).div(perpMarketPrice).toBN(),
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
