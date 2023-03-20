/* eslint-disable no-debugger */
import { Dispatch, memo } from 'react'

import { FuturesMarketKey, kwentaFixedFee } from '../utils/KWENTA/constants'
import { useMarketPrices, useSkewAdjustedPrice } from '@/src/hooks/KWENTA/useMarketPrice'
import { usePostTradeDetails } from '@/src/hooks/KWENTA/usePositionDetails'
import useProtocols from '@/src/hooks/useProtocols'
import {
  PostTradeDetailsResponse,
  formatOrderSizes,
  formatPosition,
} from '@/src/utils/KWENTA/format'
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
  // @todo: fetch marketKey with tokenSymbol
  const marketKey = FuturesMarketKey.sETHPERP

  const marketPrices = useMarketPrices()
  const perpMarketPrice = marketPrices[toTokenInfo?.symbol as string]
  const skewAdjustedPrice = useSkewAdjustedPrice(perpMarketPrice, marketKey)
  debugger

  const { nativeSize, nativeSizeDelta, sizeDelta, susdSize, susdSizeDelta } = formatOrderSizes(
    amount,
    leverage,
    perpMarketPrice,
    position,
  )

  const details = usePostTradeDetails({
    sizeDelta,
    price: perpMarketPrice,
    orderType: 1,
    wallet: '0x8e83aa0427d5b9d40d3132e7277c5999e2645e47',
  })
  const values = formatPosition(
    details ?? ({} as PostTradeDetailsResponse),
    skewAdjustedPrice,
    nativeSizeDelta,
    position,
  )
  debugger

  // @wouldbenice: show maxUsdInputAmount and add amount input value verification
  //  const maxUsdInputAmount = useAppSelector(selectMaxUsdInputAmount);
  //  const maxNativeValue = useMemo(
  // 	  () => (!isZero(tradePrice) ? maxUsdInputAmount.div(tradePrice) : zeroBN),
  // 	  [tradePrice, maxUsdInputAmount]
  //  );
  setValues({
    investmentTokenSymbol: 'sUSD',
    fillPrice: values.price.toBN(), // 18
    priceImpact: values.priceImpact.toBN(),
    protocolFee: values.fee.add(kwentaFixedFee).toBN(), // sum tradeFee & keeperFee
    tradeFee: values.fee.toBN(),
    keeperFee: kwentaFixedFee.toBN(),
    liquidationPrice: values.liqPrice.toBN(),
    oneHourFunding: undefined,
  })

  return null
})

export default KWENTAStatsComponent
