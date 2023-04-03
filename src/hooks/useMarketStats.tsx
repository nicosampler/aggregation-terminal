import { JsonRpcProvider } from '@ethersproject/providers'
import { wei } from '@synthetixio/wei'
import { BigNumber, constants } from 'ethers'
import { formatBytes32String, parseUnits } from 'ethers/lib/utils'
import useSWR from 'swr'

import { getNetworkConfig } from '@/src/config/web3'
import {
  BASIS_POINTS_DIVISOR,
  MARGIN_FEE_BASIS_POINTS,
  USD_DECIMALS,
} from '@/src/utils/GMX/constants'
import { getGMXTokensInfo } from '@/src/utils/GMX/getGMXTokensInfo'
import { getGMXVaultStats } from '@/src/utils/GMX/getGMXVaultStats'
import { getLiquidationPrice } from '@/src/utils/GMX/getLiquidationPrice'
import { getNextToAmount } from '@/src/utils/GMX/getNextToAmount'
import { getUSDGStats } from '@/src/utils/GMX/getUSDGStats'
import { expandDecimals } from '@/src/utils/GMX/numbers'
import { FuturesMarketKey, KWENTA_FIXED_FEE, ZERO_BIG_NUM } from '@/src/utils/KWENTA/constants'
import { formatOrderSizes, formatPosition } from '@/src/utils/KWENTA/format'
import { extractMarketInfo } from '@/src/utils/KWENTA/getMarketInternalData'
import { getMarketInternalData } from '@/src/utils/KWENTA/getMarketInternalData'
import { getMarketParameters } from '@/src/utils/KWENTA/getMarketParameters'
import { getTradePreview } from '@/src/utils/KWENTA/getPositionDetails'
import { getSUSDRate } from '@/src/utils/KWENTA/getSynthsRates'
import getProtocols from '@/src/utils/getProtocols'
import { ChainsValues } from '@/types/chains'
import { ProtocolForm, ProtocolStats, TradeForm } from '@/types/utils'

async function getGMXStatsFetcher(
  chainId: ChainsValues,
  tradeForm: TradeForm,
): Promise<ProtocolStats> {
  const protocols = getProtocols()

  const fromTokenSymbol = 'USDC'
  const toTokenSymbol = tradeForm.token
  const amount = tradeForm.amount
  const position = tradeForm.position
  const leverage = Number(tradeForm.leverage)

  const gmxTokensInfo = await getGMXTokensInfo(protocols, chainId)
  const gmxVaultStats = await getGMXVaultStats(chainId)
  const usdgStats = await getUSDGStats(chainId)

  const totalTokenWeights = gmxVaultStats
  const usdgTotalSupply = usdgStats
  const fromTokenInfo = protocols.getTokenBySymbolAndChain(fromTokenSymbol, chainId.toString())
  const toTokenInfo = protocols.getTokenBySymbolAndChain(toTokenSymbol, chainId.toString())
  const gmxFromTokenInfo = gmxTokensInfo.infoTokens[fromTokenInfo?.address as string]
  const gmxToTokenInfo = gmxTokensInfo.infoTokens[toTokenInfo?.address as string]

  const fromAmountBN = parseUnits(amount, 6) // USDC fixed
  // const toAmountBN = parseUnits(amount, toTokenInfo?.decimals)

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
  //  const nextToValue = formatUnits(nextToAmount, toTokenInfo.decimals)

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

  return {
    protocol: 'GMX',
    position: nextToUsd.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    investmentTokenSymbol: 'USDC',
    fillPrice: toTokenPriceUsd.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    orderSize: nextToAmount, // 18
    priceImpact: undefined,
    protocolFee: feesUsd.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    tradeFee: swapFees.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    keeperFee: positionFee.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    liquidationPrice: liquidationPrice.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    oneHourFunding: borrowFeeAmount.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
  }
}

async function getKwentaStatsFetcher(
  chainId: ChainsValues,
  tradeForm: TradeForm,
): Promise<ProtocolStats> {
  // locked to sUSD
  // // @todo: fetch marketKey by tokenSymbol
  const marketKey = FuturesMarketKey.sETHPERP
  const marketKeyBytes = formatBytes32String(marketKey)
  // const { marketKey, marketKeyBytes } = getFuturesMarketKey(tradeForm.token)
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const marketInformation = await Promise.all([
    getMarketInternalData(chainId),
    getMarketParameters(chainId, marketKeyBytes),
    getSUSDRate(chainId),
    provider.getBlockNumber(),
  ])
  if (marketInformation.length !== 4) {
    throw `There was not possible to fetch market information`
  }
  const marketData = marketInformation[0]
  if (!marketData) {
    throw `There was not possible to fetch data for market`
  }
  const marketParams = marketInformation[1]
  if (!marketParams) {
    throw `There was not possible to fetch parameters for market`
  }
  const sUSDRate = marketInformation[2]
  const blockNum = marketInformation[3]
  const { oneHourlyFundingRate, skewAdjustedPrice } = extractMarketInfo(marketData, marketParams)
  if (!skewAdjustedPrice) {
    throw `There was not possible to fetch skew adjusted price`
  }
  if (!oneHourlyFundingRate) {
    throw `There was not possible to fetch 1hr funding rate`
  }

  const leverage = Number(tradeForm.leverage)
  const margin = tradeForm.amount
  const positionSide = tradeForm.position
  const { marginDelta, nativeSizeDelta, sizeDelta } = formatOrderSizes(
    margin,
    leverage,
    wei(marketData.assetPrice),
    positionSide,
  )

  const block = await provider.getBlock(blockNum)
  const blockTimestamp = block.timestamp
  const tradePreview = getTradePreview(
    sizeDelta,
    marginDelta,
    marketData,
    marketParams,
    blockTimestamp,
  )
  if (tradePreview.status !== 0) {
    throw `There was not possible to fetch Position Stats. ErrorCode: ${tradePreview.status}`
  }

  const { positionStats } = formatPosition(
    tradePreview,
    skewAdjustedPrice,
    nativeSizeDelta,
    tradeForm.position,
  )

  const fillPrice = wei(marketData.assetPrice).mul(sUSDRate).toBN()
  const positionValue = wei(margin).mul(leverage).div(sUSDRate).toBN()
  const oneHourFunding = oneHourlyFundingRate.gt(ZERO_BIG_NUM)
    ? positionSide === 'long'
      ? wei(marketData.assetPrice).mul(oneHourlyFundingRate).toBN()
      : wei(marketData.assetPrice).mul(oneHourlyFundingRate).neg().toBN() // positive && short position
    : positionSide === 'short'
    ? wei(marketData.assetPrice).mul(oneHourlyFundingRate).toBN()
    : wei(marketData.assetPrice).mul(oneHourlyFundingRate).abs().toBN() // negative && long position

  return {
    protocol: 'Kwenta',
    investmentTokenSymbol: 'sUSD',
    position: positionValue,
    fillPrice: fillPrice,
    orderSize: wei(margin).mul(leverage).div(marketData.assetPrice).toBN(),
    priceImpact: positionStats.priceImpact.toBN(),
    protocolFee: positionStats.fee.add(KWENTA_FIXED_FEE).toBN(),
    tradeFee: positionStats.fee.toBN(),
    keeperFee: KWENTA_FIXED_FEE.toBN(),
    liquidationPrice: positionStats.liqPrice.toBN(),
    oneHourFunding: oneHourFunding,
  }
}

export function useMarketStats(
  tradeForm: TradeForm,
  protocolForm: ProtocolForm,
  protocolStats: ProtocolStats | null,
) {
  const validKwentaAmount = Number(tradeForm.amount) >= 3
  const shouldTrigger =
    protocolStats == null &&
    validKwentaAmount &&
    Number(tradeForm.leverage) > 0 &&
    Number(tradeForm.leverage) < 26

  return useSWR(
    shouldTrigger ? [protocolForm, tradeForm] : null,
    ([_protocolForm, _tradeForm]) => {
      switch (_protocolForm.name) {
        case 'GMX': {
          return getGMXStatsFetcher(_protocolForm.chain, _tradeForm)
        }
        case 'Kwenta':
          return getKwentaStatsFetcher(_protocolForm.chain, _tradeForm)
        default:
          throw 'Protocol not supported'
      }
    },
    { refreshInterval: 5_000 },
  )
}
