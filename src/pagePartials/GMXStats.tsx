import { Chain } from '@web3-onboard/common'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { useGMXTokensInfo } from '@/src/hooks/GMX/useGMXTokensInfo'
import useProtocols from '@/src/hooks/useProtocols'
import { BASIS_POINTS_DIVISOR, MARGIN_FEE_BASIS_POINTS } from '@/src/utils/GMX/constants'
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

  const tokenInfo = getTokenBySymbolAndChain(token, chainId.toString())
  if (!tokenInfo) {
    throw `There was not possible to get token ${token} for chain ${chainId}.`
  }

  const gmxTokenInfo = gmxTokensInfo.infoTokens[tokenInfo.address]
  if (!gmxTokenInfo) {
    throw `There was not possible to get GMX token stats for ${token}.`
  }

  if (!gmxTokenInfo.minPrice || !gmxTokenInfo.maxPrice) {
    throw `There was not possible to get GMX token.minPrice or token.minPrice ${token}.`
  }

  // All this calculations were taken following the fronted code of GMX.
  // file: SwapBox.js
  // useEffect containing a function called: updateLeverageAmounts
  const amountBN = BigNumber.from(amount)
  const fromUsdMin = amountBN.mul(gmxTokenInfo.minPrice).div(expandDecimals(1, tokenInfo.decimals))
  const leverageMultiplier = leverage * BASIS_POINTS_DIVISOR
  const toTokenPriceUsd = gmxTokenInfo.maxPrice // Fixed for market order
  const feeBasisPoints = 0 // TODO: hardcoded for ETH.
  const fromUsdMinAfterFee = fromUsdMin // TODO: when feeBasisPoints, it needs calculation
  const toNumerator = fromUsdMinAfterFee.mul(leverageMultiplier).mul(BASIS_POINTS_DIVISOR)
  const toDenominator = BigNumber.from(MARGIN_FEE_BASIS_POINTS)
    .mul(leverageMultiplier)
    .add(BigNumber.from(BASIS_POINTS_DIVISOR).mul(BASIS_POINTS_DIVISOR))
  const nextToUsd = toNumerator.div(toDenominator)
  const nextToAmount = nextToUsd.mul(expandDecimals(1, tokenInfo.decimals)).div(toTokenPriceUsd)

  const nextToValue = formatUnits(nextToAmount, tokenInfo.decimals)

  if (!existsTokenInProtocol) {
    return <div>Token not supported for the given protocol and chain</div>
  }

  return (
    <div>
      <div>Order Size: {nextToValue}</div>
    </div>
  )
}

export default withGenericSuspense(GMXStats)
