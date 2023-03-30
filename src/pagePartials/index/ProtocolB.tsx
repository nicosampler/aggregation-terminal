import styled from 'styled-components'

import { parseUnits } from 'ethers/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

import { BaseCard } from '@/src/components/common/BaseCard'
import { DropdownDirection } from '@/src/components/common/Dropdown'
import { Label } from '@/src/components/form/Label'
import Select from '@/src/components/form/Select'
import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import { chainsConfig } from '@/src/config/web3'
import useProtocols from '@/src/hooks/useProtocols'
import GMXStats from '@/src/pagePartials/GMXStats'
import { OutputDetails } from '@/src/pagePartials/index/OutputDetails'
import { useDashboardInfo } from '@/src/providers/dashboardProvider'
import { ChainsValues } from '@/types/chains'
import { ComparisonForm } from '@/types/utils'

const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`

const OutputWrapper = styled.div`
  overflow: hidden;
`

export const ProtocolB: React.FC = () => {
  const { getProtocolChains, protocolsNames } = useProtocols()
  const { form, protocolAStats, protocolBStats, setValues } = useDashboardInfo()

  const allParamsEntered =
    form.amount && form.amount != '0' && Number(form.leverage) > 0 && Number(form.leverage) < 26

  const setForm = (data: Partial<ComparisonForm>) => setValues({ form: { ...form, ...data } })

  const chainsStoreNamed = (chainsStore: Array<number>) =>
    chainsStore.reduce((namedArray: string[], chainId) => {
      namedArray.push(
        chainsConfig[Number(chainId) as ChainsValues]?.shortName || chainId.toString(),
      )
      return namedArray
    }, [])

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
          defaultItem={protocolsNames[1]}
          disabled
          onChange={(protocol) => setForm({ protocolB: protocol })}
          options={protocolsNames}
        />
      </Label>
      <Label>
        <span>Chain</span>
        <Select
          disabled={chainsStoreNamed(getProtocolChains(form.protocolB)).length < 2}
          dropdownDirection={!form.amount ? DropdownDirection.upwards : DropdownDirection.downwards}
          onChange={(chain) => setForm({ chainB: chain })}
          options={chainsStoreNamed(getProtocolChains(form.protocolB))}
        />
      </Label>
      <AnimatePresence mode="wait">
        {form.protocolB == 'GMX' && allParamsEntered && (
          <>
            {!protocolBStats && (
              <SafeSuspense>
                <GMXStats
                  amount={form.amount}
                  chainId={Number(form.chainB) as ChainsValues}
                  fromTokenSymbol="USDC"
                  leverage={Number(form.leverage)}
                  position={form.position}
                  setValues={(stats) => setValues({ protocolBStats: stats })}
                  toTokenSymbol={form.token}
                />
              </SafeSuspense>
            )}

            {protocolBStats ? (
              <OutputWrapper
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                as={motion.div}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: { ease: 'easeOut', duration: 0.5 },
                }}
                initial={{ opacity: 0, height: 0, y: -30 }}
                key="GMX"
                transition={{ ease: 'easeIn', duration: 0.1 }}
              >
                <OutputDetails
                  comparison={{
                    protocol: 'gmx',
                    investmentTokenSymbol: 'sUSD',
                    ...protocolAStats,
                  }}
                  local={protocolBStats}
                  margin={parseUnits(form.amount)}
                  positionSide={form.position}
                  tokenSymbol={form.token}
                />
              </OutputWrapper>
            ) : null}
          </>
        )}
      </AnimatePresence>
    </Card>
  )
}
