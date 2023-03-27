import { BigNumber } from 'ethers'

import { Tooltip } from '@/src/components/common/Tooltip'
import { List, Stats } from '@/src/components/text/List'
import { formatAmount } from '@/src/utils/GMX/format'
import { Outputs } from '@/types/utils'

type Props = {
  local: Outputs
  comparison?: Outputs
}

function setStyle(value?: BigNumber, comparison?: BigNumber) {
  if (!comparison || !value || value.eq(comparison)) {
    return 'equal'
  }
  return value.gt(comparison) ? 'better' : 'worse'
}

export function OutputDetails({ comparison, local }: Props) {
  const getTradeFeeText = () => {
    const text =
      local.protocol === 'kwenta'
        ? 'Fees are displayed as maker / taker. Maker fees apply to orders that reduce the market skew. Taker fees apply to orders that increase the market skew.'
        : 'The cost of swapping tokens to execute the trade.'
    return text
  }
  const getKeeperFeeText = () => {
    const text =
      local.protocol === 'kwenta'
        ? 'Fixed fee to cover automated order execution'
        : 'The cost of opening a position.'
    return text
  }
  return (
    <Stats>
      <List>
        <span>Investment Token</span>
        <strong>{local.investmentTokenSymbol}</strong>
      </List>
      <List>
        <span>
          <Tooltip text="The notional price of the position, expressed in the spot value of the token selected.">
            Fill Price
          </Tooltip>
        </span>
        <strong>{formatAmount(local.fillPrice)}</strong>
      </List>
      <List status={setStyle(local.priceImpact, comparison?.priceImpact)}>
        <span>
          <Tooltip text="Correlation between the incoming trade, and the price of the asset.">
            Price Impact
          </Tooltip>
        </span>
        <strong>{formatAmount(local.priceImpact)}</strong>
      </List>
      <List status={setStyle(local.protocolFee, comparison?.protocolFee)}>
        <span>
          <Tooltip text="Overall fees the protocol charges for a trade.">Protocol Fee</Tooltip>
        </span>
        <strong>{formatAmount(local.protocolFee)} </strong>
      </List>
      <List status={setStyle(local.tradeFee, comparison?.tradeFee)}>
        <span>
          <Tooltip text={getTradeFeeText()}>Trade Fee </Tooltip>
        </span>
        <strong>{formatAmount(local.tradeFee)}</strong>
      </List>
      <List>
        <span>
          <Tooltip text={getKeeperFeeText()}>Position Fee</Tooltip>
        </span>
        <strong>{formatAmount(local.keeperFee)}</strong>
      </List>

      <List>
        <span>
          <Tooltip text="The price at which the position is liquidated.">Liquidation Price</Tooltip>
        </span>
        <strong>{formatAmount(local.liquidationPrice)}</strong>
      </List>
      <List>
        <span>
          <Tooltip text="Hourly payments to or from traders depending on their trade direction.">
            1H Funding
          </Tooltip>
        </span>
        <strong>{formatAmount(local.oneHourFunding)}</strong>
      </List>
    </Stats>
  )
}
