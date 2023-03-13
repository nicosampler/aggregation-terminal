import styled from 'styled-components'

import { ButtonPrimary } from '@/src/components/buttons/Button'
import { BaseCard } from '@/src/components/common/BaseCard'
import { Textfield } from '@/src/components/form/Textfield'
import { TokenDropdown as BaseDropdown } from '@/src/components/token/TokenDropdown'
import { Position } from '@/types/utils'

const Wrapper = styled.section`
  grid-area: unset;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-area: 1 / 1 / 2 / 3;
  }
`
const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 50%;
  position: relative;
  padding-top: 100px;
`
const Positions = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  width: 100%;
  left: 0;
`
const Position = styled.button`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-weight: 600;
  font-size: 1.4rem;
  height: 60px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  min-width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme: { colors } }) => colors.gray};
  color: ${({ theme: { colors } }) => colors.secondary};
  cursor: pointer;
  border: 1px solid #26292c;
  transition: all 0.3s ease-in-out;
  &:first-child {
    border-top-left-radius: ${({ theme: { card } }) => card.borderRadius};
  }
  &:last-child {
    border-top-right-radius: ${({ theme: { card } }) => card.borderRadius};
  }
  &.long {
    color: ${({ theme: { colors } }) => colors.success};
  }
  &.short {
    color: ${({ theme: { colors } }) => colors.error};
  }
  &.active {
    background-color: transparent !important;
    border: 1px solid ${({ theme: { colors } }) => colors.darkestGray} !important;
    color: ${({ theme: { colors } }) => colors.textColor};
    &.long {
      box-shadow: inset 0px 4px 0px ${({ theme: { colors } }) => colors.success};
    }
    &.short {
      box-shadow: inset 0px 4px 0px ${({ theme: { colors } }) => colors.error};
    }
  }
  &:hover,
  &:focus {
    border: 1px solid ${({ theme: { colors } }) => colors.darkestGray};
    color: ${({ theme: { colors } }) => colors.textColor};
    background: ${({ theme: { colors } }) => colors.darkGray};
  }
`

const TabContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 3fr;
  grid-column-gap: 40px;
  grid-row-gap: 20px;
  align-items: end;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
`

const Label = styled.label`
  color: ${({ theme: { colors } }) => colors.lightGray};
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: block;
  span {
    display: block;
    margin-bottom: 10px;
  }
  button {
    width: 100%;
  }
`
const InputWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  span {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.6rem;
    color: ${({ theme: { colors } }) => colors.lightGray};
    pointer-events: none;
    text-transform: lowercase;
  }
  input {
    margin-top: 0px;
    padding-left: 32px;
  }
`
const LeverageOptions = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    gap: 6px;
  }
  button {
    flex: 1;
    padding: 0;
    column-gap: 0px;
    &::before {
      content: 'x';
      color: ${({ theme: { colors } }) => colors.lightGray};
      margin-right: 2px;
      display: inline-block;
    }
    @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
      font-size: 1.4rem;
    }
  }
`
const TokenDropdown = styled(BaseDropdown)`
  margin-left: auto;
`

interface Props {
  changeAmount: (newAmount: string) => void
  changeLeverage: (newLeverage: number) => void
  changePosition: (newPosition: Position) => void
  changeToken: (newToken: string) => void
  defaultToken: string
  disableTokenDropdown?: boolean
  leverage: number
  onTokenChange?: (token: string) => void
  position: string
}

export const Configuration: React.FC<Props> = ({
  changeAmount,
  changeLeverage,
  changePosition,
  changeToken,
  defaultToken,
  leverage,
  position,
}) => {
  return (
    <Wrapper>
      <Card>
        <Positions>
          <Position
            className={`long ${position == 'long' && 'active'}`}
            onClick={() => changePosition('long')}
          >
            Long
          </Position>
          <Position
            className={`short ${position == 'short' && 'active'}`}
            onClick={() => changePosition('short')}
          >
            Short
          </Position>
        </Positions>
        <TabContent>
          <Label>
            <span>Amount in usd </span>
            <InputWrapper>
              <span>$</span>
              <Textfield
                onChange={(event) => changeAmount(event.target.value)}
                placeholder="0.00"
                type="number"
              />
            </InputWrapper>
          </Label>
          <Label>
            <span>Token</span>
            <TokenDropdown changeToken={changeToken} />
          </Label>
          <Label>
            <span>Leverage</span>
            <InputWrapper>
              <span>x</span>
              <Textfield
                max="25"
                min="1"
                onChange={(event) => changeLeverage(parseFloat(event.target.value))}
                placeholder="10"
                type="number"
                value={leverage}
              />
            </InputWrapper>
          </Label>
          <LeverageOptions>
            <ButtonPrimary
              className={leverage == 1 ? 'active' : ''}
              onClick={() => changeLeverage(1)}
            >
              1
            </ButtonPrimary>
            <ButtonPrimary
              className={leverage == 5 ? 'active' : ''}
              onClick={() => changeLeverage(5)}
            >
              5
            </ButtonPrimary>
            <ButtonPrimary
              className={leverage == 10 ? 'active' : ''}
              onClick={() => changeLeverage(10)}
            >
              10
            </ButtonPrimary>
            <ButtonPrimary
              className={leverage == 15 ? 'active' : ''}
              onClick={() => changeLeverage(15)}
            >
              15
            </ButtonPrimary>
            <ButtonPrimary
              className={leverage == 20 ? 'active' : ''}
              onClick={() => changeLeverage(20)}
            >
              20
            </ButtonPrimary>
            <ButtonPrimary
              className={leverage == 25 ? 'active' : ''}
              onClick={() => changeLeverage(25)}
            >
              25
            </ButtonPrimary>
          </LeverageOptions>
        </TabContent>
      </Card>
    </Wrapper>
  )
}
