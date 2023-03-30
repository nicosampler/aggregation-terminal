import {
  Dispatch,
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react'

import isEmpty from 'lodash/isEmpty'

import { Chains } from '@/src/config/web3'
import { ComparisonForm, Outputs } from '@/types/utils'

type DashboardValues = {
  form: ComparisonForm
  protocolAStats: Outputs | null
  protocolBStats: Outputs | null
}

type DashboardContext = DashboardValues & { setValues: Dispatch<Partial<DashboardValues>> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dashboardContext = createContext<DashboardContext>({} as any)

export const DashboardProvider: FC<PropsWithChildren> = ({ children }) => {
  const [contextValues, setContextValues] = useReducer(
    (data: DashboardValues, partial: Partial<DashboardValues>): DashboardValues => ({
      ...data,
      ...partial,
    }),
    {
      form: {
        token: 'ETH',
        leverage: '2',
        position: 'long',
        protocolA: 'Kwenta',
        chainA: Chains.optimism.toString(),
        protocolB: 'GMX',
        chainB: Chains.arbitrum.toString(),
        amount: '',
      },
      protocolAStats: null,
      protocolBStats: null,
    },
  )

  useEffect(() => {
    setContextValues({ protocolAStats: null, protocolBStats: null })
  }, [contextValues.form])

  return (
    <dashboardContext.Provider value={{ ...contextValues, setValues: setContextValues }}>
      {children}
    </dashboardContext.Provider>
  )
}

export default DashboardProvider

export function useDashboardInfo(): DashboardContext {
  const context = useContext(dashboardContext)
  if (context === undefined || isEmpty(context)) {
    throw new Error('useWeb3Connection must be used within a Web3ConnectionProvider')
  }
  return useContext(dashboardContext)
}
