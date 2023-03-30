import styled from 'styled-components'

import { parseUnits } from 'ethers/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

import { BaseCard } from '@/src/components/common/BaseCard'
import { DropdownDirection } from '@/src/components/common/Dropdown'
import { Label } from '@/src/components/form/Label'
import Select from '@/src/components/form/Select'
import { chainsConfig } from '@/src/config/web3'
import { useMarketStats } from '@/src/hooks/useMarketStats'
import useProtocols from '@/src/hooks/useProtocols'
import { OutputDetails } from '@/src/pagePartials/index/OutputDetails'
import { ChainsValues } from '@/types/chains'
import { ProtocolForm, ProtocolNames, ProtocolStats, TradeForm } from '@/types/utils'

const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`

const OutputWrapper = styled.div`
  overflow: hidden;
`

type Props = {
  tradeForm: TradeForm
  protocolForm: ProtocolForm
  protocolStats: ProtocolStats | null
  protocolStatsForeign: ProtocolStats | null
  setProtocolForm: (newValues: ProtocolForm) => void
  setProtocolStats: (newValues: ProtocolStats) => void
}

const chainsStoreNamed = (chainsStore: Array<number>) =>
  chainsStore.reduce((namedArray: string[], chainId) => {
    namedArray.push(chainsConfig[Number(chainId) as ChainsValues]?.shortName || chainId.toString())
    return namedArray
  }, [])

export const Protocol: React.FC<Props> = ({
  protocolForm,
  protocolStats,
  protocolStatsForeign,
  setProtocolForm,
  setProtocolStats,
  tradeForm,
}) => {
  const { getProtocolChains, protocolsNames } = useProtocols()

  useMarketStats(
    tradeForm,
    protocolStats !== null,
    protocolForm.name,
    protocolForm.chain,
    setProtocolStats,
  )

  return (
    <Card
      animate={{ opacity: 1, y: 0 }}
      as={motion.div}
      initial={{ opacity: 0, y: -20 }}
      transition={{ ease: 'backInOut', duration: 0.3 }}
    >
      <Label>
        <span>Exchange</span>
        <Select
          defaultItem={protocolForm.name}
          disabled
          onChange={(protocol) =>
            setProtocolForm({ ...protocolForm, name: protocol as ProtocolNames })
          }
          options={protocolsNames}
        />
      </Label>
      <Label>
        <span>Chain</span>
        <Select
          disabled={chainsStoreNamed(getProtocolChains(protocolForm.name)).length < 2}
          dropdownDirection={
            !tradeForm.amount ? DropdownDirection.upwards : DropdownDirection.downwards
          }
          onChange={(chain) =>
            setProtocolForm({ ...protocolForm, chain: chain as unknown as ChainsValues })
          }
          options={chainsStoreNamed(getProtocolChains(protocolForm.name))}
        />
      </Label>
      <AnimatePresence mode="wait">
        {protocolStats && (
          <OutputWrapper
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            as={motion.div}
            exit={{
              opacity: 0,
              height: 0,
              transition: { ease: 'easeOut', duration: 0.5 },
            }}
            initial={{ opacity: 0, height: 0, y: -30 }}
            key={protocolForm.name}
            transition={{ ease: 'easeIn', duration: 0.1 }}
          >
            <OutputDetails
              comparison={{
                protocol: protocolForm.name,
                investmentTokenSymbol: protocolForm.name == 'GMX' ? 'USDC' : 'sUSD',
                ...protocolStatsForeign,
              }}
              local={protocolStats}
              margin={parseUnits(tradeForm.amount)}
              positionSide={tradeForm.position}
              tokenSymbol={tradeForm.token}
            />
          </OutputWrapper>
        )}
      </AnimatePresence>
    </Card>
  )
}
