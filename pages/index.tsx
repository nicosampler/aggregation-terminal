import type { NextPage } from 'next'
import { useReducer } from 'react'
import styled from 'styled-components'

import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { parse } from 'graphql'
import ReactSlider from 'react-slider'

import { BaseCard } from '@/src/components/common/BaseCard'
import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { BaseParagraph } from '@/src/components/text/BaseParagraph'
import { BaseTitle } from '@/src/components/text/BaseTitle'
import { TokenInput } from '@/src/components/token/TokenInput'
import { Chains, chainsConfig } from '@/src/config/web3'
import useProtocols from '@/src/hooks/useProtocols'
import GMXStats from '@/src/pagePartials/GMXStats'
import { useTokensInfo } from '@/src/providers/tokenIconsProvider'
import { ChainsValues } from '@/types/chains'
import { Position } from '@/types/utils'

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

interface Form {
  token: string
  amount: string
  leverage: number
  position: Position
  protocolA: string
  chainA: string
  protocolB: string
  chainB: string
}

const Home: NextPage = () => {
  const tokensInfo = useTokensInfo()
  const uniqueTokenSymbols = [...new Set(tokensInfo.tokens.map((t) => t.symbol))]
  const { exitsTokenInProtocol, getProtocolChains, protocolsNames } = useProtocols()

  const [form, setForm] = useReducer(
    (data: Form, partial: Partial<Form>): Form => ({ ...data, ...partial }),
    {
      token: 'ETH',
      leverage: 2,
      position: 'long',
      protocolA: 'Kwenta',
      chainA: Chains.optimism.toString(),
      protocolB: 'GMX',
      chainB: Chains.arbitrum.toString(),
      amount: '',
    },
  )

  const existsTokenInProtocolA = exitsTokenInProtocol(form.protocolA, form.chainA, form.token)

  const selectedTokenInfo = tokensInfo.tokensBySymbol[form.token.toLowerCase()]

  return (
    <>
      <BaseTitle>Perpetuals dashboard</BaseTitle>
      <Card>
        <BaseParagraph>Get started by editing</BaseParagraph>

        <div>
          Amount in USD:{' '}
          <input
            onChange={(event) => setForm({ amount: event.target.value })}
            type="number"
            value={form.amount}
          />
        </div>

        <div>
          Token:
          <select onChange={(e) => setForm({ token: e.target.value })} value={form.token}>
            {uniqueTokenSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div>
            <input
              checked={form.position == 'long'}
              onChange={(e) => setForm({ position: e.target.value as Position })}
              type="radio"
              value="long"
            />
            LONG
          </div>

          <div>
            <input
              checked={form.position == 'short'}
              onChange={(e) => setForm({ position: e.target.value as Position })}
              type="radio"
              value="short"
            />
            SHORT
          </div>
        </div>

        <div>
          Leverage:
          <ReactSlider
            defaultValue={form.leverage}
            max={50}
            min={1}
            onChange={(value) => setForm({ leverage: value })}
            renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
          />
        </div>

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

            {form.protocolB == 'GMX' && form.amount && form.amount != '0' && (
              <GMXStats
                amount={form.amount} /* Hardcoded for USDC */
                chainId={Number(form.chainB) as ChainsValues}
                fromTokenSymbol="USDC"
                leverage={form.leverage}
                position={form.position}
                toTokenSymbol="ETH"
              />
            )}
          </ProtocolWrapper>
        </TwoColumns>
      </Card>
    </>
  )
}

export default withGenericSuspense(Home)
