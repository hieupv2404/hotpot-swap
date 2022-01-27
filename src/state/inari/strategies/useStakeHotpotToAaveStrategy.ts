import { AXHOTPOT, HOTPOT } from '../../../config/tokens'
import { ChainId, HOTPOT_ADDRESS } from '@hotpot-swap/core-sdk'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import { useEffect, useMemo } from 'react'
import { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../../services/web3'
import useBaseStrategy from './useBaseStrategy'
import { useLingui } from '@lingui/react'
import { useTokenBalances } from '../../wallet/hooks'

export const GENERAL = (i18n: I18n): StrategyGeneralInfo => ({
  name: i18n._(t`HOTPOT → Aave`),
  steps: [i18n._(t`HOTPOT`), i18n._(t`xHOTPOT`), i18n._(t`Aave`)],
  zapMethod: 'stakeHotpotToAave',
  unzapMethod: 'unstakeHotpotFromAave',
  description: i18n._(
    t`Stake HOTPOT for xHOTPOT and deposit into Aave in one click. xHOTPOT in Aave (aXHOTPOT) can be lent or used as collateral for borrowing.`
  ),
  inputSymbol: i18n._(t`HOTPOT`),
  outputSymbol: i18n._(t`xHOTPOT in Aave`),
})

export const tokenDefinitions: StrategyTokenDefinitions = {
  inputToken: {
    chainId: ChainId.ETHEREUM,
    address: HOTPOT_ADDRESS[ChainId.ETHEREUM],
    decimals: 18,
    symbol: 'HOTPOT',
  },
  outputToken: {
    chainId: ChainId.ETHEREUM,
    address: '0xF256CC7847E919FAc9B808cC216cAc87CCF2f47a',
    decimals: 18,
    symbol: 'aXHOTPOT',
  },
}

const useStakeHotpotToAaveStrategy = (): StrategyHook => {
  const { i18n } = useLingui()
  const { account } = useActiveWeb3React()
  const balances = useTokenBalances(account, [HOTPOT[ChainId.ETHEREUM], AXHOTPOT])
  const general = useMemo(() => GENERAL(i18n), [i18n])
  const { setBalances, ...strategy } = useBaseStrategy({
    id: 'stakeHotpotToAaveStrategy',
    general,
    tokenDefinitions,
  })

  useEffect(() => {
    if (!balances) return

    setBalances({
      inputTokenBalance: balances[HOTPOT[ChainId.ETHEREUM].address],
      outputTokenBalance: balances[AXHOTPOT.address],
    })
  }, [balances, setBalances])

  return useMemo(
    () => ({
      ...strategy,
      setBalances,
    }),
    [strategy, setBalances]
  )
}

export default useStakeHotpotToAaveStrategy
