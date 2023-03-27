import { Dispatch, memo } from 'react'

import { BigNumber, constants } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { useGMXTokensInfo } from '@/src/hooks/GMX/useGMXTokensInfo'
import useGMXVaultStats from '@/src/hooks/GMX/useGMXVaultStats'
import useUSDGStats from '@/src/hooks/GMX/useUSDGStats'
import useProtocols from '@/src/hooks/useProtocols'
import {
  BASIS_POINTS_DIVISOR,
  MARGIN_FEE_BASIS_POINTS,
  USD_DECIMALS,
} from '@/src/utils/GMX/constants'
import { formatAmount } from '@/src/utils/GMX/format'
import { getLiquidationPrice } from '@/src/utils/GMX/getLiquidationPrice'
import { getNextToAmount } from '@/src/utils/GMX/getNextToAmount'
import { contractDecimals, expandDecimals } from '@/src/utils/GMX/numbers'
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

const GMXStatsComponent = memo(function GMXStats({
  amount,
  chainId,
  fromTokenSymbol,
  leverage,
  position,
  setValues,
  toTokenSymbol,
}: Props) {
  const { exitsTokenInProtocol, getTokenBySymbolAndChain } = useProtocols()
  const existsTokenInProtocol = exitsTokenInProtocol('GMX', chainId.toString(), toTokenSymbol)
  const gmxTokensInfo = useGMXTokensInfo(chainId)

  const gmxVaultStats = useGMXVaultStats(chainId)
  const totalTokenWeights = gmxVaultStats[0].data ? gmxVaultStats[0].data[0] : null

  const usdgStats = useUSDGStats(chainId)
  const usdgTotalSupply = usdgStats[0].data ? usdgStats[0].data[0] : null
  const fromTokenInfo = getTokenBySymbolAndChain(fromTokenSymbol, chainId.toString())
  const toTokenInfo = getTokenBySymbolAndChain(toTokenSymbol, chainId.toString())
  const gmxFromTokenInfo = gmxTokensInfo.infoTokens[fromTokenInfo?.address as string]
  const gmxToTokenInfo = gmxTokensInfo.infoTokens[toTokenInfo?.address as string]

  const fromAmountBN = parseUnits(amount, 6) // USDC fixed
  const toAmountBN = parseUnits(amount, toTokenInfo?.decimals)

  if (!usdgTotalSupply) {
    throw `There was not possible to get USDG total supply`
  }

  if (!totalTokenWeights) {
    throw `There was not possible to get GMX total token weights`
  }

  if (!fromTokenInfo) {
    throw `There was not possible to get token USDC for chain ${chainId}.`
  }

  if (!toTokenInfo) {
    throw `There was not possible to get token ${toTokenSymbol} for chain ${chainId}.`
  }

  if (!gmxFromTokenInfo || !gmxFromTokenInfo.minPrice || !gmxFromTokenInfo.maxPrice) {
    throw `There was not possible to get GMX token stats for ${fromTokenSymbol}. (token.minPrice and token.minPrice are required)`
  }

  if (!gmxToTokenInfo || !gmxToTokenInfo.minPrice || !gmxToTokenInfo.maxPrice) {
    throw `There was not possible to get GMX token stats for ${toTokenSymbol}. (token.minPrice and token.minPrice are required)`
  }

  // ----------------------
  // Generic calculations
  // ----------------------

  const fromUsdMin = fromAmountBN
    .mul(gmxFromTokenInfo.minPrice)
    .div(expandDecimals(1, fromTokenInfo.decimals))

  const toTokenPriceUsd = gmxToTokenInfo.maxPrice

  const { feeBasisPoints } = getNextToAmount(
    chainId,
    fromAmountBN,
    fromTokenInfo,
    position == 'long' ? toTokenInfo : fromTokenInfo,
    usdgTotalSupply,
    totalTokenWeights,
  )

  // Following calculations were taken following the fronted code of GMX.
  // file: SwapBox.js
  // the logic starts in a useEffect containing a function called: updateLeverageAmounts

  // ----------------------
  // Order size
  // ----------------------

  let fromUsdMinAfterFee = fromUsdMin
  if (feeBasisPoints) {
    fromUsdMinAfterFee = fromUsdMin
      .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
      .div(BASIS_POINTS_DIVISOR)
  }

  const leverageMultiplier = leverage * BASIS_POINTS_DIVISOR
  const toNumerator = fromUsdMinAfterFee.mul(leverageMultiplier).mul(BASIS_POINTS_DIVISOR)
  const toDenominator = BigNumber.from(MARGIN_FEE_BASIS_POINTS)
    .mul(leverageMultiplier)
    .add(BigNumber.from(BASIS_POINTS_DIVISOR).mul(BASIS_POINTS_DIVISOR))

  const nextToUsd = toNumerator.div(toDenominator)
  const nextToAmount = nextToUsd.mul(expandDecimals(1, toTokenInfo.decimals)).div(toTokenPriceUsd)
  const nextToValue = formatUnits(nextToAmount, toTokenInfo.decimals)

  // ----------------------
  // entry/exit price
  // ----------------------
  const entryMarkPrice = position === 'long' ? gmxToTokenInfo.maxPrice : gmxToTokenInfo.minPrice
  // const exitMarkPrice = position === 'long' ? gmxToTokenInfo.minPrice : gmxToTokenInfo.maxPrice

  // ----------------------
  // liquidation price
  // ----------------------
  const sizeDelta = nextToAmount
    .mul(gmxToTokenInfo.maxPrice)
    .div(expandDecimals(1, toTokenInfo.decimals))

  const liquidationPrice = getLiquidationPrice(
    position === 'long',
    entryMarkPrice, //averagePrice
    sizeDelta, // sizeDelta
    fromUsdMin, // collateralDelta
  )

  // ----------------------
  // Fees
  // ----------------------

  const positionFee = sizeDelta.mul(MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
  let feesUsd = positionFee
  let swapFees = constants.Zero

  if (feeBasisPoints) {
    swapFees = fromUsdMin.mul(feeBasisPoints).div(BASIS_POINTS_DIVISOR)
    feesUsd = feesUsd.add(swapFees)
  }

  // ----------------------
  // 1h funding
  // ----------------------

  const borrowFee =
    (position == 'long' ? gmxToTokenInfo.fundingRate : gmxFromTokenInfo.fundingRate) ||
    BigNumber.from(0)

  const borrowFeeAmount = nextToUsd.mul(borrowFee).div(BASIS_POINTS_DIVISOR).div(100)

  // ----------------------
  // Set values
  // ----------------------

  setValues({
    protocol: 'gmx',
    investmentTokenSymbol: 'USDC',
    fillPrice: nextToAmount, // 18
    priceImpact: undefined,
    protocolFee: feesUsd.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    tradeFee: swapFees.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    keeperFee: positionFee.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    liquidationPrice: liquidationPrice.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    oneHourFunding: borrowFeeAmount.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
  })

  // ----------------------
  // Render
  // ----------------------
  // This component is only used to call setValues
  return null
})

export default GMXStatsComponent
