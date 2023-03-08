import React from 'react'
import styled from 'styled-components'

import { BaseParagraph } from '@/src/components/text/BaseParagraph'
import { BaseTitle } from '@/src/components/text/BaseTitle'

const Wrapper = styled.header`
  color: ${({ theme }) => theme.header.color};
  padding: 125px 0 80px;
  height: auto;
  text-align: center;
`

export const Header: React.FC = () => {
  return (
    <Wrapper>
      <BaseTitle>Perpetuals dashboard</BaseTitle>
      <BaseParagraph>Compare trading data between popular exchanges on any chain.</BaseParagraph>
    </Wrapper>
  )
}
