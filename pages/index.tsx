import type { NextPage } from 'next'
import { useReducer, useState } from 'react'
import styled from 'styled-components'

import { BigNumber } from 'ethers'

import { BaseCard } from '@/src/components/common/BaseCard'
import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Configuration } from '@/src/components/position/Configuration'
import { Chains, chainsConfig } from '@/src/config/web3'
import useProtocols from '@/src/hooks/useProtocols'
import GMXStats from '@/src/pagePartials/GMXStats'
import { OutputDetails } from '@/src/pagePartials/index/OutputDetails'
import { useTokensInfo } from '@/src/providers/tokenIconsProvider'
import { ChainsValues } from '@/types/chains'
import { Outputs, Position } from '@/types/utils'

const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 50%;
`

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 3fr;
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Filter = styled.section`
  grid-area: unset;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-area: 1 / 1 / 2 / 3;
  }
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

  const [protocolAValues, setProtocolAValues] = useState<Outputs>()
  const [protocolBValues, setProtocolBValues] = useState<Outputs>()

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

  const min = 1
  const max = 25

  const changePosition = (newPosition: Position) => {
    setForm({ position: newPosition as Position })
  }
  const changeAmount = (newAmount: string) => {
    setForm({ amount: newAmount })
  }
  const changeLeverage = (newLeverage: number) => {
    const limitLeverage = Math.max(min, Math.min(max, Number(newLeverage)))
    setForm({ leverage: limitLeverage })
  }
  const changeToken = (newToken: string) => {
    setForm({ token: newToken })
  }

  return (
    <Layout>
      <Filter>
        <Configuration
          {...form}
          changeAmount={changeAmount}
          changeLeverage={changeLeverage}
          changePosition={changePosition}
          changeToken={changeToken}
          defaultToken={form.token}
        />
      </Filter>
      {/* Protocol A */}
      <Card>
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
      </Card>
      {/* Protocol B */}
      <Card>
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
            <>
              <SafeSuspense>
                <GMXStats
                  amount={form.amount}
                  chainId={Number(form.chainB) as ChainsValues}
                  fromTokenSymbol="USDC"
                  leverage={form.leverage}
                  position={form.position}
                  setValues={setProtocolBValues}
                  toTokenSymbol={form.token}
                />
              </SafeSuspense>
              {protocolBValues ? (
                <OutputDetails
                  comparison={{
                    investmentTokenSymbol: 'sUSD',
                    protocolFee: BigNumber.from('666000000000000000000'),
                    tradeFee: BigNumber.from('10'),
                  }}
                  local={protocolBValues}
                />
              ) : null}
            </>
          )}
        </ProtocolWrapper>
      </Card>
    </Layout>
  )
}

export default withGenericSuspense(Home)
