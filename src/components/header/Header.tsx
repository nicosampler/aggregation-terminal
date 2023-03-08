import React from 'react'
import styled from 'styled-components'

import { BaseTitle } from '@/src/components/text/BaseTitle'

const Wrapper = styled.header`
  color: ${({ theme }) => theme.header.color};
  padding: 90px 20px 60px;
  height: auto;
  text-align: center;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: 125px 0 80px;
  }
`
const H2 = styled.h2`
  color: ${({ theme: { colors } }) => colors.lightGray};
  font-size: ${({ theme: { fonts } }) => fonts.defaultSize};
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  padding: 0;
`

export const Header: React.FC = () => {
  return (
    <Wrapper>
      <BaseTitle>Aggregation Terminal</BaseTitle>
      <H2>Compare trading data between popular exchanges on any chain.</H2>
    </Wrapper>
  )
}
