import styled from 'styled-components'

import { BigNumber } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'

import { BaseCard } from '@/src/components/common/BaseCard'
import { DropdownDirection } from '@/src/components/common/Dropdown'
import { Label } from '@/src/components/form/Label'
import Select from '@/src/components/form/Select'
import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import { chainsConfig } from '@/src/config/web3'
import useProtocols from '@/src/hooks/useProtocols'
import KWENTAStats from '@/src/pagePartials/KWENTAStats'
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

export const ProtocolA: React.FC = () => {
  const { getProtocolChains, protocolsNames } = useProtocols()
  const { form, protocolAStats, protocolBStats, setValues } = useDashboardInfo()
  // TODO
  //  useProtocolStats(
  //   form.protocolA,
  //   form.chainA,
  //   (stats) => setValues({ protocolAStats: stats }))
  //  )

  // useProtocolStats
  // Este hook va a tener un useSWR q recibe una key y un fetcher como siempre
  // la key, deberia ser compuesta por los valores del form y si amount o leverage es null, la key es null, asi no se invoca.
  // el fetcher es una funcion q tiene q replicar la logica de KWENTAStats, el tema es q al ser una funcion tradicional,
  // no podemos usar los hooks q ya tenemos definidos, tenemos q migrar todos sus Hooks a llamadas tradicionales.
  // por ej no podemos usar el useContractCall, hay q invocar a los contratos instanciando el factory q nos da Typechain, pasandole el provider.
  // el provider hay q crearlo a mano en la funcion, pq no podemos usar el useWeb3Connection.

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
          defaultItem={protocolsNames[0]}
          disabled
          onChange={(protocol) => setForm({ protocolA: protocol })}
          options={protocolsNames}
        />
      </Label>
      <Label>
        <span>Chain</span>
        <Select
          disabled={chainsStoreNamed(getProtocolChains(form.protocolA)).length < 2}
          dropdownDirection={!form.amount ? DropdownDirection.upwards : DropdownDirection.downwards}
          onChange={(chain) => setForm({ chainA: chain })}
          options={chainsStoreNamed(getProtocolChains(form.protocolA))}
        />
      </Label>
      <AnimatePresence mode="wait">
        {form.protocolA == 'Kwenta' && allParamsEntered && (
          <>
            {/* <SafeSuspense>
              <KWENTAStats
                amount={form.amount}
                chainId={Number(form.chainA) as ChainsValues}
                fromTokenSymbol="sUSD"
                leverage={Number(form.leverage)}
                position={form.position}
                setValues={(stats) => setValues({ protocolAStats: stats })}
                toTokenSymbol={form.token}
              />
            </SafeSuspense> */}
            {protocolAStats ? (
              <OutputWrapper
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                as={motion.div}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: { ease: 'easeOut', duration: 0.2 },
                }}
                initial={{ opacity: 0, height: 0, y: -30 }}
                key="Kwenta"
                transition={{ ease: 'easeIn', duration: 0.1 }}
              >
                <OutputDetails
                  comparison={{
                    protocol: 'kwenta',
                    investmentTokenSymbol: 'sUSD',
                    ...protocolBStats,
                  }}
                  local={protocolAStats}
                  margin={BigNumber.from(form.amount)}
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
