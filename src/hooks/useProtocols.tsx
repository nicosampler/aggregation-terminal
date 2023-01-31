import protocols from '../../public/protocols.json'
import tokens from '../../public/tokens.json'
import { Token } from '@/types/token'

type Protocols = Record<string, Record<string, string[]>>

type Tokens = Record<'tokens', Token[]>

export default function useProtocols() {
  const protocolsInfo: Protocols = protocols

  const protocolsNames = Object.keys(protocolsInfo)

  const getProtocolByName = (name: string) => {
    const protocolInfo = protocolsInfo[name]
    if (!protocolInfo) {
      throw `Protocol of name ${name} not found`
    }
    return protocolInfo
  }

  const getProtocolChains = (name: string) => {
    const protocolInfo = getProtocolByName(name)
    return Object.keys(protocolInfo).map(Number)
  }

  const getProtocolTokens = (name: string, chainId: string) => {
    const tokensInfo: Tokens = tokens
    const protocolInfo = getProtocolByName(name)
    const protocolTokens = protocolInfo[chainId]
    if (!protocolTokens) {
      throw `There are not tokens configured for protocol ${name} and chain ${chainId}`
    }

    protocolTokens.forEach((tokenName) => {
      const tokenInfo = tokensInfo.tokens.find(
        (t) => t.symbol === tokenName && t.chainId.toString() === chainId,
      )
      if (!tokenInfo) {
        throw `protocol ${name} for chain ${chainId} has a token that is not configured on "tokens.json" file.`
      }
    })

    return protocolTokens
  }

  const exitsTokenInProtocol = (name: string, chainId: string, tokenSymbol: string) => {
    const protocolInfo = protocolsInfo[name]
    if (!protocolInfo) {
      return false
    }
    const protocolTokens = protocolInfo[chainId]

    return protocolTokens.includes(tokenSymbol)
  }

  return {
    protocolsNames,
    getProtocolByName,
    getProtocolChains,
    getProtocolTokens,
    exitsTokenInProtocol,
  }
}
