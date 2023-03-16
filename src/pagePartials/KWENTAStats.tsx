import { Dispatch, memo } from 'react'

import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'

import { useMarketPrices } from '@/src/hooks/KWENTA/useMarketPrice'
import { usePostTradeDetails } from '@/src/hooks/KWENTA/usePositionDetails'
import useProtocols from '@/src/hooks/useProtocols'
import { PostTradeDetailsResponse, formatPotentialIsolatedTrade } from '@/src/utils/KWENTA/format'
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

  const marketPrices = useMarketPrices()
  const skewAdjustedPrice = wei(0)
  const perpetualMarketPrice = marketPrices[toTokenInfo?.symbol as string]

  const details = usePostTradeDetails({
    sizeDelta: wei(Number(amount)),
    price: wei(Number(perpetualMarketPrice)),
    orderType: 0,
    wallet: '0x8e83aa0427d5b9d40d3132e7277c5999e2645e47',
  })

  // format positionDetails Response
  const values = formatPotentialIsolatedTrade(
    {} as PostTradeDetailsResponse, // preview: PostTradeDetailsResponse
    skewAdjustedPrice, // basePrice: Wei
    wei(Number(amount)), // nativeSizeDelta: Wei,
    position, // leverageSide: Position,
  )

  // ----------------------
  // Set values
  // ----------------------
  setValues({
    investmentTokenSymbol: 'sUSD',
    fillPrice: values.price.toBN(), // 18
    priceImpact: values.priceImpact.toBN(),
    protocolFee: undefined, // sum tradeFee & keeperFee
    tradeFee: values.fee.toBN(),
    keeperFee: undefined,
    liquidationPrice: values.liqPrice.toBN(),
    oneHourFunding: undefined,
  })

  return null
})

export default KWENTAStatsComponent
