import type { NextPage } from 'next'
import styled from 'styled-components'

import { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Configuration as PositionParams } from '@/src/components/position/PositionParams'
import { ProtocolA } from '@/src/pagePartials/index/ProtocolA'
import { ProtocolB } from '@/src/pagePartials/index/ProtocolB'

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
  return (
    <Layout>
      <PositionParams />
      <ProtocolA />
      <ProtocolB />
    </Layout>
  )
}
export default withGenericSuspense(Home)
