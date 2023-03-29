import { BigNumber } from 'ethers'
import { motion } from 'framer-motion'

import { Tooltip } from '@/src/components/common/Tooltip'
import { List, Stats } from '@/src/components/text/List'
import { formatAmount } from '@/src/utils/GMX/format'
import { Outputs, Position } from '@/types/utils'

function setStyle(value?: BigNumber, comparison?: BigNumber) {
  if (!comparison || !value || value.eq(comparison)) {
    return 'equal'
  }
  return comparison.gt(value) ? 'better' : 'worse'
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

type Props = {
  tokenSymbol: string
  margin: BigNumber
  local: Outputs
  comparison?: Outputs
  positionSide: Position
}
export function OutputDetails({ comparison, local, margin, positionSide, tokenSymbol }: Props) {
  const getTradeFeeText = (protocol: string) => {
    const text =
      protocol === 'kwenta'
        ? 'Fees are displayed as maker / taker. Maker fees apply to orders that reduce the market skew. Taker fees apply to orders that increase the market skew.'
        : 'The cost of swapping tokens to execute the trade.'
    return text
  }
  const getKeeperFeeText = (protocol: string) => {
    const text =
      protocol === 'kwenta'
        ? 'Fixed fee to cover automated order execution'
        : 'The cost of opening a position.'
    return text
  }
  return (
    <Stats animate="show" as={motion.ul} initial="hidden" variants={container}>
      <List as={motion.li} variants={itemVariants}>
        <span>Investment</span>
        <strong>
          {formatAmount(margin, 1, 2)} {local.investmentTokenSymbol}
        </strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(comparison?.fillPrice, local.fillPrice)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The estimated price at which the order will be executed.">
            Fill Price
          </Tooltip>
        </span>
        <strong>{formatAmount(local.fillPrice, 18, 2)}</strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(comparison?.position, local.position)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The estimated price at which the order will be executed.">
            Position
          </Tooltip>
        </span>
        <strong>{formatAmount(local.position, 18, 2)}</strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(comparison?.orderSize, local.orderSize)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The notional value of the position, expressed in the spot price of the token selected.">
            Size
          </Tooltip>
        </span>
        <strong>
          {formatAmount(local.orderSize)} {tokenSymbol}
        </strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(local.priceImpact, comparison?.priceImpact)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="Correlation between the incoming trade, and the price of the asset.">
            Price Impact
          </Tooltip>
        </span>
        <strong>{formatAmount(local.priceImpact)}</strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(local.protocolFee, comparison?.protocolFee)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="Overall fees the protocol charges for a trade.">Protocol Fee</Tooltip>
        </span>
        <strong>{formatAmount(local.protocolFee, 18, 2)} </strong>
      </List>
      <List as={motion.li} variants={itemVariants}>
        <span>
          <Tooltip text={getTradeFeeText(local.protocol)}>Trade Fee </Tooltip>
        </span>
        <strong>{formatAmount(local.tradeFee, 18, 2)}</strong>
      </List>
      <List as={motion.li} variants={itemVariants}>
        <span>
          <Tooltip text={getKeeperFeeText(local.protocol)}>Position Fee</Tooltip>
        </span>
        <strong>{formatAmount(local.keeperFee, 18, 2)}</strong>
      </List>

      <List
        as={motion.li}
        status={
          positionSide == 'long'
            ? setStyle(local.liquidationPrice, comparison?.liquidationPrice)
            : setStyle(comparison?.liquidationPrice, local.liquidationPrice)
        }
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The price at which the position is liquidated.">Liquidation Price</Tooltip>
        </span>
        <strong>{formatAmount(local.liquidationPrice, 18, 2)}</strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(local.oneHourFunding, comparison?.oneHourFunding)}
        variants={itemVariants}
      >
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
