import { Chain } from '@web3-onboard/common'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

import tokens from '@/public/tokens.json'
import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Chains } from '@/src/config/web3'
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
import { expandDecimals } from '@/src/utils/GMX/numbers'
import { ChainsValues } from '@/types/chains'
import { Position } from '@/types/utils'

type Props = {
  amount: string
  chainId: ChainsValues
  leverage: number
  position: Position
  token: string
}

const SHORT_COLLATERAL_SYMBOL: Record<ChainsValues, string> = {
  10: '',
  42161: 'USDC',
}

function GMXStats({ amount, chainId, leverage, position, token }: Props) {
  const { exitsTokenInProtocol, getTokenBySymbolAndChain } = useProtocols()
  const existsTokenInProtocol = exitsTokenInProtocol('GMX', chainId.toString(), token)
  const gmxTokensInfo = useGMXTokensInfo(chainId)
  const usdgStats = useUSDGStats(chainId)
  const usdgTotalSupply = usdgStats[0].data ? usdgStats[0].data[0] : null
  const gmxVaultStats = useGMXVaultStats(chainId)
  const totalTokenWeights = gmxVaultStats[0].data ? gmxVaultStats[0].data[0] : null
  const collateralToken = tokens.tokens.find((t) => t.chainId == chainId && t.symbol == 'USDC')

  if (!usdgTotalSupply) {
    throw `There was not possible to get USDG total supply`
  }

  if (!totalTokenWeights) {
    throw `There was not possible to get GMX total token weights`
  }

  if (!collateralToken) {
    throw `There was not possible to get token USDC for chain ${chainId}.`
  }

  const tokenInfo = getTokenBySymbolAndChain(token, chainId.toString())
  if (!tokenInfo) {
    throw `There was not possible to get token ${token} for chain ${chainId}.`
  }

  const fromTokenInfo = gmxTokensInfo.infoTokens[tokenInfo.address]
  if (!fromTokenInfo || !fromTokenInfo.minPrice || !fromTokenInfo.maxPrice) {
    throw `There was not possible to get GMX token stats for ${token}. (token.minPrice and token.minPrice are required)`
  }

  const collateralTokenInfo = gmxTokensInfo.infoTokens[collateralToken.address]

  // All this calculations were taken following the fronted code of GMX.
  // file: SwapBox.js
  // the logic starts in a useEffect containing a function called: updateLeverageAmounts
  const amountBN = BigNumber.from(amount)
  // const fromUsdMax = amountBN
  //   .mul(fromTokenInfo.maxPrice)
  //   .div(expandDecimals(1, fromTokenInfo.decimals))
  const fromUsdMin = amountBN
    .mul(fromTokenInfo.minPrice)
    .div(expandDecimals(1, fromTokenInfo.decimals))

  const leverageMultiplier = leverage * BASIS_POINTS_DIVISOR
  const toTokenPriceUsd = fromTokenInfo.maxPrice // Fixed for market order

  const { feeBasisPoints } = getNextToAmount(
    chainId,
    BigNumber.from(amount),
    fromTokenInfo,
    collateralTokenInfo,
    usdgTotalSupply,
    totalTokenWeights,
  )

  let fromUsdMinAfterFee = fromUsdMin
  if (feeBasisPoints) {
    fromUsdMinAfterFee = fromUsdMin
      .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
      .div(BASIS_POINTS_DIVISOR)
  }

  const toNumerator = fromUsdMinAfterFee.mul(leverageMultiplier).mul(BASIS_POINTS_DIVISOR)
  const toDenominator = BigNumber.from(MARGIN_FEE_BASIS_POINTS)
    .mul(leverageMultiplier)
    .add(BigNumber.from(BASIS_POINTS_DIVISOR).mul(BASIS_POINTS_DIVISOR))
  const nextToUsd = toNumerator.div(toDenominator)
  const nextToAmount = nextToUsd.mul(expandDecimals(1, tokenInfo.decimals)).div(toTokenPriceUsd)

  const nextToValue = formatUnits(nextToAmount, tokenInfo.decimals)

  const entryMarkPrice = position === 'long' ? fromTokenInfo.maxPrice : fromTokenInfo.minPrice
  const exitMarkPrice = position === 'long' ? fromTokenInfo.minPrice : fromTokenInfo.maxPrice

  const sizeDelta = nextToAmount
    .mul(fromTokenInfo.maxPrice)
    .div(expandDecimals(1, fromTokenInfo.decimals))

  const liquidationPrice = getLiquidationPrice(
    position === 'long',
    entryMarkPrice, //averagePrice
    sizeDelta, // sizeDelta
    fromUsdMin, // collateralDelta
  )

  if (!existsTokenInProtocol) {
    return <div>Token not supported for the given protocol and chain</div>
  }

  return (
    <div>
      <div>Order Size: {nextToValue}</div>
      <div>Collateral in: {collateralToken.symbol}</div>
      <div>Entry price: {formatAmount(entryMarkPrice, USD_DECIMALS)}</div>
      <div>Exit price: {formatAmount(exitMarkPrice, USD_DECIMALS)}</div>
      <div>Liq price: {formatAmount(liquidationPrice, USD_DECIMALS)}</div>

      <div>Fees: ??</div>
      <div>Borrow fee: ??</div>
      <div>Available Liq: ??</div>
    </div>
  )
}

export default withGenericSuspense(GMXStats)
