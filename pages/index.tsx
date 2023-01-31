import type { NextPage } from 'next'
import { useEffect, useReducer } from 'react'
import styled from 'styled-components'

import { chain } from 'lodash'

import { BaseCard } from '@/src/components/common/BaseCard'
import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { BaseParagraph } from '@/src/components/text/BaseParagraph'
import { BaseTitle } from '@/src/components/text/BaseTitle'
import { Code } from '@/src/components/text/Code'
import { TokenInput } from '@/src/components/token/TokenInput'
import { Chains, chainsConfig } from '@/src/config/web3'
import useProtocols from '@/src/hooks/useProtocols'
import { useTokensInfo } from '@/src/providers/tokenIconsProvider'
import { useWeb3ConnectedApp, useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsValues } from '@/types/chains'

const Card = styled(BaseCard)`
  min-height: 300px;

  display: flex;
  flex-direction: column;
  justify-content: center;
`

const TwoColumns = styled.div`
  display: flex;
  width: 100%;

  justify-content: center;
`

const ProtocolWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

type Protocols = 'Kwenta' | 'GMX'

interface Form {
  token: string
  protocolA: string
  chainA: string
  protocolB: string
  chainB: string
  amount: string
}

const Home: NextPage = () => {
  const tokensInfo = useTokensInfo()
  const uniqueTokenSymbols = [...new Set(tokensInfo.tokens.map((t) => t.symbol))]
  const { exitsTokenInProtocol, getProtocolChains, protocolsNames } = useProtocols()

  const [form, setForm] = useReducer(
    (data: Form, partial: Partial<Form>): Form => ({ ...data, ...partial }),
    {
      token: 'ETH',
      protocolA: 'Kwenta',
      chainA: Chains.optimism.toString(),
      protocolB: 'GMX',
      chainB: Chains.arbitrum.toString(),
      amount: '',
    },
  )

  const existsTokenInProtocolA = exitsTokenInProtocol(form.protocolA, form.chainA, form.token)
  const existsTokenInProtocolB = exitsTokenInProtocol(form.protocolB, form.chainB, form.token)

  return (
    <>
      <BaseTitle>Perpetuals dashboard</BaseTitle>
      <Card>
        <BaseParagraph>Get started by editing</BaseParagraph>

        <select onChange={(e) => setForm({ token: e.target.value })} value={form.token}>
          {uniqueTokenSymbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>

        <br />

        <TwoColumns>
          <ProtocolWrapper>
            <select onChange={(e) => setForm({ protocolA: e.target.value })} value={form.protocolA}>
              {protocolsNames
                .filter((pn) => pn !== form.protocolB)
                .map((protocolName) => (
                  <option key={protocolName} value={protocolName}>
                    {protocolName}
                  </option>
                ))}
            </select>

            <select onChange={(e) => setForm({ chainA: e.target.value })} value={form.chainA}>
              {getProtocolChains(form.protocolA).map((chainId) => (
                <option key={chainId} value={chainId}>
                  {chainsConfig[Number(chainId) as ChainsValues]?.shortName || chainId}
                </option>
              ))}
            </select>

            {existsTokenInProtocolA ? (
              <div>Show perpetual conditions for {form.protocolA}</div>
            ) : (
              <div>Token not supported for the given protocol and chain</div>
            )}
          </ProtocolWrapper>
          <ProtocolWrapper>
            <select onChange={(e) => setForm({ protocolB: e.target.value })} value={form.protocolB}>
              {protocolsNames
                .filter((pn) => pn !== form.protocolA)
                .map((protocolName) => (
                  <option key={protocolName} value={protocolName}>
                    {protocolName}
                  </option>
                ))}
            </select>

            <select onChange={(e) => setForm({ chainB: e.target.value })} value={form.chainB}>
              {getProtocolChains(form.protocolB).map((chainId) => (
                <option key={chainId} value={chainId}>
                  {chainsConfig[Number(chainId) as ChainsValues]?.shortName || chainId}
                </option>
              ))}
            </select>

            {existsTokenInProtocolB ? (
              <div>Show perpetual conditions for {form.protocolB}</div>
            ) : (
              <div>Token not supported for the given protocol and chain</div>
            )}
          </ProtocolWrapper>
        </TwoColumns>
      </Card>
    </>
  )
}

export default withGenericSuspense(Home)
