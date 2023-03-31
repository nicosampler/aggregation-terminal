import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { ChainsValues } from '@/types/chains'
import { PerpsV2MarketSettings__factory } from '@/types/generated/typechain'

export type MarketParams<T = BigNumber> = {
  takerFee: T
  makerFee: T
  minInitialMargin: T
  maxLeverage: T
  maxMarketValue: T
  skewScale: T
  liquidationPremiumMultiplier: T
  maxFundingVelocity: T
  liquidationBufferRatio: T
  liquidationFeeRatio: T
  maxKeeperFee: T
  minKeeperFee: T
}

export async function getMarketParameters(
  chainId: ChainsValues,
  marketKey: string,
): Promise<MarketParams> {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const marketSettingsReader = PerpsV2MarketSettings__factory.connect(
    contracts['KWENTA_PerpsV2MarketSettings'].address[chainId],
    provider,
  )

  const takerFee = await marketSettingsReader.takerFeeOffchainDelayedOrder(marketKey)
  const makerFee = await marketSettingsReader.makerFeeOffchainDelayedOrder(marketKey)
  const minInitialMargin = await marketSettingsReader.minInitialMargin()
  const maxLeverage = await marketSettingsReader.maxLeverage(marketKey)
  const maxMarketValue = await marketSettingsReader.maxMarketValue(marketKey)
  const skewScale = await marketSettingsReader.skewScale(marketKey)
  const maxFundingVelocity = await marketSettingsReader.maxFundingVelocity(marketKey)
  const liquidationBufferRatio = await marketSettingsReader.liquidationBufferRatio()
  const liquidationFeeRatio = await marketSettingsReader.liquidationFeeRatio()
  const maxKeeperFee = await marketSettingsReader.maxKeeperFee()
  const minKeeperFee = await marketSettingsReader.minKeeperFee()
  const liquidationPremiumMultiplier = await marketSettingsReader.liquidationPremiumMultiplier(
    marketKey,
  )

  return {
    takerFee,
    makerFee,
    minInitialMargin,
    maxLeverage,
    maxMarketValue,
    skewScale,
    liquidationPremiumMultiplier,
    maxFundingVelocity,
    liquidationBufferRatio,
    liquidationFeeRatio,
    maxKeeperFee,
    minKeeperFee,
  }
}
