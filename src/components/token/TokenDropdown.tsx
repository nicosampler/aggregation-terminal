import styled from 'styled-components'

import { DebounceInput } from 'react-debounce-input'

import protocolsConfig from '@/public/protocols.json'
import { ButtonDropdown } from '@/src/components/buttons/Button'
import { Dropdown, DropdownDirection, DropdownItem } from '@/src/components/common/Dropdown'
import { TextfieldCSS } from '@/src/components/form/Textfield'
import { TokenIcon } from '@/src/components/token/TokenIcon'
import { useTokensLists } from '@/src/components/token/useTokensLists'
import { TokensLists } from '@/src/config/web3'
import { ChainsKeys } from '@/types/chains'
import { Token } from '@/types/token'

const Wrapper = styled(Dropdown)`
  --inner-padding: 8px;
  &[disabled] {
    opacity: 1;
    button {
      background-color: unset;
      &:after {
        display: none;
      }
      &:hover {
        background-color: unset;
      }
    }
  }
  .dropdownItems {
    max-height: 340px;
    overflow: auto;
  }
`

const Button = styled(ButtonDropdown)`
  justify-content: start;
  > span {
    flex-shrink: 0;
  }
  &:after {
    margin-left: auto;
  }
`

const TextfieldContainer = styled.div<{ closeOnClick?: boolean }>`
  background-color: ${({ theme }) => theme.dropdown.background};
  padding: var(--inner-padding);
  position: sticky;
  top: 0;
  z-index: 1;
  &:before {
    content: '';
    width: 16px;
    height: 16px;
    display: inline-block;
    background-image: url('data:image/svg+xml;base64, PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcuMzMzMzMgMTIuNjY2N0MxMC4yNzg5IDEyLjY2NjcgMTIuNjY2NyAxMC4yNzg5IDEyLjY2NjcgNy4zMzMzM0MxMi42NjY3IDQuMzg3ODEgMTAuMjc4OSAyIDcuMzMzMzMgMkM0LjM4NzgxIDIgMiA0LjM4NzgxIDIgNy4zMzMzM0MyIDEwLjI3ODkgNC4zODc4MSAxMi42NjY3IDcuMzMzMzMgMTIuNjY2N1oiIHN0cm9rZT0iIzczN0Q4RCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTQgMTQuMDAwMUwxMS4xIDExLjEwMDEiIHN0cm9rZT0iIzczN0Q4RCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K');
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Textfield: any = styled(DebounceInput)`
  ${TextfieldCSS};
  flex-shrink: 0;
  width: 100%;
  height: 48px;
  padding-left: 44px;
`
const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  line-height: 1.2;
  small {
    font-size: 1rem;
    text-transform: none;
    color: ${({ theme: { colors } }) => colors.lightGray};
  }
`

const NoResults = styled.div<{ closeOnClick?: boolean }>`
  align-items: center;
  color: ${({ theme: { colors } }) => colors.textColor};
  display: flex;
  font-size: 1.3rem;
  font-weight: 500;
  height: 80px;
  justify-content: center;
  line-height: 1.2;
  padding: var(--inner-padding);
`

export const TokenDropdown: React.FC<{
  disabled?: boolean
  onChange?: (token: Token | null) => void
  changeToken: (newToken: string) => void
  defaultToken: string
}> = ({ changeToken, defaultToken, disabled, onChange, ...restProps }) => {
  const {
    onSelectToken,
    searchString,
    setSearchString,
    token,
    tokensList: tokenListOriginal,
  } = useTokensLists(onChange)

  // Filter protocol tokens.
  // First, we gather all the tokens symbols of all the protocols supported.
  // Then, we get the info of each token using the list of symbols.
  // If the tokens is not found, we throw.
  // note: we return the first token found, it might be of any chain
  // TODO: we should change how we define Tokens in "tokens.json" by using the "extensions" key supported
  // and setting the different addresses of each token in the same object. https://github.com/Uniswap/token-list-bridge-utils.
  let protocolTokens: string[] = []
  Object.keys(protocolsConfig).forEach((protocolKey) =>
    Object.keys((protocolsConfig as any)[protocolKey]).forEach((chainId) => {
      protocolTokens = [...protocolTokens, ...(protocolsConfig as any)[protocolKey][chainId]]
    }),
  )
  const tokensList = [...new Set(protocolTokens)].map((symbol: string) => {
    const t = tokenListOriginal.find((t) => t.symbol == symbol)
    if (!t) throw `Token config not found for symbol ${symbol}`
    return t
  })

  const selectedToken = tokensList.filter((obj) => {
    return obj.symbol === defaultToken
  })

  return (
    <Wrapper
      disabled={disabled}
      dropdownButton={
        <Button>
          <TokenIcon symbol={token ? token.symbol : selectedToken[0].symbol} />
          <TokenDetails>
            {token ? token.symbol : selectedToken[0].symbol}
            <small>{token ? token.name : selectedToken[0].name}</small>
          </TokenDetails>
        </Button>
      }
      items={[
        tokensList.length > 2 ? (
          <TextfieldContainer closeOnClick={false} key="tokenSearchInput">
            <Textfield
              debounceTimeout={300}
              onChange={(e: { target: { value: string } }) => setSearchString(e.target.value)}
              placeholder="Search by name or ticker"
              type="search"
              value={searchString}
            />
          </TextfieldContainer>
        ) : (
          <></>
        ),

        ...tokensList.map((item, index) => (
          <DropdownItem
            key={index}
            onClick={() => {
              onSelectToken(item)
              changeToken(item.symbol)
            }}
          >
            <TokenIcon symbol={item.symbol} />
            <TokenDetails>
              {item.symbol}
              <small>{item.name}</small>
            </TokenDetails>
          </DropdownItem>
        )),
        tokensList.length === 0 ? <NoResults closeOnClick={false}>Not found.</NoResults> : <></>,
      ]}
      {...restProps}
    />
  )
}

export default TokenDropdown
