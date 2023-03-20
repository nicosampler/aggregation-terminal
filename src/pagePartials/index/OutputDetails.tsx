import { BigNumber } from 'ethers'

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
  return (
    <Stats>
      <List>
        <span>Investment token</span>
        <strong>{local.investmentTokenSymbol}</strong>
      </List>

      <List status={setStyle(local.priceImpact, comparison?.priceImpact)}>
        <span>Price impact</span>
        <strong>{formatAmount(local.priceImpact)}</strong>
      </List>
      <List status={setStyle(local.protocolFee, comparison?.protocolFee)}>
        <span>Protocol fee</span>
        <strong>{formatAmount(local.protocolFee)} </strong>
      </List>
      <List status={setStyle(local.tradeFee, comparison?.tradeFee)}>
        <span>Trade fee</span>
        <strong>{formatAmount(local.tradeFee)}</strong>
      </List>
      <List>
        <span>Position fee</span>
        <strong>{formatAmount(local.keeperFee)}</strong>
      </List>
      <List>
        <span>Fill price</span>
        <strong>{formatAmount(local.fillPrice)}</strong>
      </List>
      <List>
        <span>Liq price</span>
        <strong>{formatAmount(local.liquidationPrice)}</strong>
      </List>
      <List>
        <span>1 hour funding</span>
        <strong>{formatAmount(local.oneHourFunding, 18, 4)}</strong>
      </List>
    </Stats>
  )
}
