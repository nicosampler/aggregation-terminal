import type { NextPage } from 'next'
import { useReducer, useState } from 'react'
import styled from 'styled-components'

import { BigNumber } from 'ethers'

import { BaseCard } from '@/src/components/common/BaseCard'
import { DropdownDirection } from '@/src/components/common/Dropdown'
import { Label } from '@/src/components/form/Label'
import Select from '@/src/components/form/Select'
import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Configuration as PositionParams } from '@/src/components/position/PositionParams'
import { Chains, chainsConfig } from '@/src/config/web3'
import useProtocols from '@/src/hooks/useProtocols'
import GMXStats from '@/src/pagePartials/GMXStats'
import KWENTAStats from '@/src/pagePartials/KWENTAStats'
import { OutputDetails } from '@/src/pagePartials/index/OutputDetails'
import { ChainsValues } from '@/types/chains'
import { ComparisonForm, Outputs } from '@/types/utils'

const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
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

const Home: NextPage = () => {
  const { getProtocolChains, protocolsNames } = useProtocols()
  const [form, setForm] = useReducer(
    (data: ComparisonForm, partial: Partial<ComparisonForm>): ComparisonForm => ({
      ...data,
      ...partial,
    }),
    {
      token: 'ETH',
      leverage: '2',
      position: 'long',
      protocolA: 'Kwenta',
      chainA: Chains.optimism.toString(),
      protocolB: 'GMX',
      chainB: Chains.arbitrum.toString(),
      amount: '',
    },
  )
  const [protocolAValues, setProtocolAValues] = useState<Outputs>()
  const [protocolBValues, setProtocolBValues] = useState<Outputs>()

  const allParamsEntered =
    form.amount && form.amount != '0' && Number(form.leverage) > 0 && Number(form.leverage) < 26

  const chainsStoreNamed = (chainsStore: Array<number>) =>
    chainsStore.reduce((namedArray: string[], chainId) => {
      namedArray.push(
        chainsConfig[Number(chainId) as ChainsValues]?.shortName || chainId.toString(),
      )
      return namedArray
    }, [])

  return (
    <Layout>
      <PositionParams form={form} setForm={setForm} />
      <Card>
        <Label>
          <span>Exchange</span>
          <Select
            defaultItem={protocolsNames[0]}
            disabled
            onChange={(protocol) => setForm({ protocolA: protocol })}
            options={protocolsNames}
          />
        </Label>
        <Label>
          <span>Chain</span>
          <Select
            disabled={chainsStoreNamed(getProtocolChains(form.protocolA)).length < 2}
            dropdownDirection={
              !form.amount ? DropdownDirection.upwards : DropdownDirection.downwards
            }
            onChange={(chain) => setForm({ chainA: chain })}
            options={chainsStoreNamed(getProtocolChains(form.protocolA))}
          />
        </Label>

        {form.protocolA == 'Kwenta' && form.amount && form.amount != '0' && (
          <>
            <SafeSuspense>
              <KWENTAStats
                amount={form.amount}
                chainId={Number(form.chainA) as ChainsValues}
                fromTokenSymbol="sUSD"
                leverage={Number(form.leverage)}
                position={form.position}
                setValues={setProtocolAValues}
                toTokenSymbol={form.token}
              />
            </SafeSuspense>
            {protocolAValues && protocolBValues ? (
              <OutputDetails
                comparison={{
                  protocol: 'kwenta',
                  investmentTokenSymbol: 'USDC',
                  protocolFee: protocolBValues?.protocolFee,
                  tradeFee: protocolBValues?.tradeFee,
                  keeperFee: protocolBValues?.keeperFee,
                }}
                local={protocolAValues}
              />
            ) : null}
          </>
        )}
      </Card>
      <Card>
        <Label>
          <span>Exchange</span>
          <Select
            defaultItem={protocolsNames[1]}
            disabled
            onChange={(protocol) => setForm({ protocolB: protocol })}
            options={protocolsNames}
          />
        </Label>
        <Label>
          <span>Chain</span>
          <Select
            disabled={chainsStoreNamed(getProtocolChains(form.protocolB)).length < 2}
            dropdownDirection={
              !form.amount ? DropdownDirection.upwards : DropdownDirection.downwards
            }
            onChange={(chain) => setForm({ chainB: chain })}
            options={chainsStoreNamed(getProtocolChains(form.protocolB))}
          />
        </Label>

        {form.protocolB == 'GMX' && allParamsEntered && (
          <>
            <SafeSuspense>
              <GMXStats
                amount={form.amount}
                chainId={Number(form.chainB) as ChainsValues}
                fromTokenSymbol="USDC"
                leverage={Number(form.leverage)}
                position={form.position}
                setValues={setProtocolBValues}
                toTokenSymbol={form.token}
              />
            </SafeSuspense>
            {protocolBValues && protocolAValues ? (
              <OutputDetails
                comparison={{
                  protocol: 'gmx',
                  investmentTokenSymbol: 'sUSD',
                  protocolFee: protocolAValues?.protocolFee,
                  tradeFee: protocolAValues?.tradeFee,
                  keeperFee: protocolAValues?.keeperFee,
                }}
                local={protocolBValues}
              />
            ) : null}
          </>
        )}
      </Card>
    </Layout>
  )
}
export default withGenericSuspense(Home)
