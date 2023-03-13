import { BigNumber } from 'ethers'

import { formatAmount } from '@/src/utils/GMX/format'
import { Outputs } from '@/types/utils'

type Props = {
  local: Outputs
  comparison?: Outputs
}

function setColor(value?: BigNumber, comparison?: BigNumber) {
  if (!comparison || !value || value.eq(comparison)) {
    return 'black'
  }
  return value.gt(comparison) ? 'green' : 'red'
}

export function OutputDetails({ comparison, local }: Props) {
  return (
    <div>
      <div>Investment token: {local.investmentTokenSymbol}</div>
      <div style={{ color: setColor(local.priceImpact, comparison?.priceImpact) }}>
        Price impact: {formatAmount(local.priceImpact)}
      </div>
      <div style={{ color: setColor(local.protocolFee, comparison?.protocolFee) }}>
        Protocol fee {formatAmount(local.protocolFee)}{' '}
      </div>
      <div style={{ color: setColor(local.tradeFee, comparison?.tradeFee) }}>
        - Trade fee: {formatAmount(local.tradeFee)}
      </div>
      <div> - position fee: {formatAmount(local.keeperFee)}</div>
      <div>fill price: {formatAmount(local.fillPrice)}</div>
      <div>Liq price: {formatAmount(local.liquidationPrice)}</div>
      <div>1 hour funding: {formatAmount(local.oneHourFunding)}</div>
    </div>
  )
}
