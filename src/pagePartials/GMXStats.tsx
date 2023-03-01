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
import { BASIS_POINTS_DIVISOR, MARGIN_FEE_BASIS_POINTS } from '@/src/utils/GMX/constants'
import { getNextToAmount } from '@/src/utils/GMX/getNextToAmount'
import { expandDecimals } from '@/src/utils/GMX/numbers'
import { InfoTokens } from '@/types/GMX/types'
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
  const USDCToken = tokens.tokens.find((t) => t.chainId == Chains.arbitrum && t.symbol == 'USDC')

  if (!usdgTotalSupply) {
    throw `There was not possible to get USDG total supply`
  }

  if (!totalTokenWeights) {
    throw `There was not possible to get GMX total token weights`
  }

  if (!USDCToken) {
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

  const toTokenInfo = gmxTokensInfo.infoTokens[USDCToken.address]

  // All this calculations were taken following the fronted code of GMX.
  // file: SwapBox.js
  // the logic starts in a useEffect containing a function called: updateLeverageAmounts
  const amountBN = BigNumber.from(amount)
  const fromUsdMin = amountBN.mul(fromTokenInfo.minPrice).div(expandDecimals(1, tokenInfo.decimals))
  const leverageMultiplier = leverage * BASIS_POINTS_DIVISOR
  const toTokenPriceUsd = fromTokenInfo.maxPrice // Fixed for market order

  const feeBasisPoints = getNextToAmount(
    chainId,
    BigNumber.from(amount),
    fromTokenInfo, // fromToken: InfoTokens,
    toTokenInfo, // toTokenAddress: InfoTokens,
    usdgTotalSupply,
    totalTokenWeights,
  ) // TODO: hardcoded for ETH.
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
