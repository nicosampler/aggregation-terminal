import styled from 'styled-components'

import { InnerContainer as BaseInnerContainer } from '@/src/components/helpers/InnerContainer'

const Wrapper = styled.footer`
  color: ${({ theme }) => theme.colors.textColor};
  margin-top: auto;
  padding-bottom: 20px;
  padding-top: 40px;
`

const InnerContainer = styled(BaseInnerContainer)`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 100%;
  justify-content: space-between;
  width: 100%;
`

const Copyright = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 1.2rem;
  margin: 0;
`

const Contact = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
`

export const Footer: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      <InnerContainer>
        <Copyright>Powered by</Copyright>

        <Contact>Discord / twitter</Contact>
      </InnerContainer>
    </Wrapper>
  )
}
