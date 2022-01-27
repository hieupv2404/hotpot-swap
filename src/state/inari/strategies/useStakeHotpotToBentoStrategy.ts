import { ChainId, HOTPOT_ADDRESS } from '@hotpot-swap/core-sdk'
import { HOTPOT, XHOTPOT } from '../../../config/tokens'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import { useEffect, useMemo } from 'react'

import { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { tryParseAmount } from '../../../functions'
import { useActiveWeb3React } from '../../../services/web3'
import useBaseStrategy from './useBaseStrategy'
import { useBentoBalance } from '../../bentobox/hooks'
import useBentoBoxTrait from '../traits/useBentoBoxTrait'
import { useLingui } from '@lingui/react'
import { useTokenBalances } from '../../wallet/hooks'

export const GENERAL = (i18n: I18n): StrategyGeneralInfo => ({
  name: i18n._(t`HOTPOT → Bento`),
  steps: [i18n._(t`HOTPOT`), i18n._(t`xHOTPOT`), i18n._(t`BentoBox`)],
  zapMethod: 'stakeHotpotToBento',
  unzapMethod: 'unstakeHotpotFromBento',
  description:
    i18n._(t`Stake HOTPOT for xHOTPOT and deposit into BentoBox in one click. xHOTPOT in BentoBox is automatically
                invested into a passive yield strategy, and can be lent or used as collateral for borrowing in Kashi.`),
  inputSymbol: i18n._(t`HOTPOT`),
  outputSymbol: i18n._(t`xHOTPOT in BentoBox`),
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
    address: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
    decimals: 18,
    symbol: 'XHOTPOT',
  },
}

const useStakeHotpotToBentoStrategy = (): StrategyHook => {
  const { i18n } = useLingui()
  const { account } = useActiveWeb3React()
  const balances = useTokenBalances(account, [HOTPOT[ChainId.ETHEREUM], XHOTPOT])
  const xHotpotBentoBalance = useBentoBalance(XHOTPOT.address)

  // Strategy ends in BentoBox so use BaseBentoBox strategy
  const general = useMemo(() => GENERAL(i18n), [i18n])
  const baseStrategy = useBaseStrategy({
    id: 'stakeHotpotToBentoStrategy',
    general,
    tokenDefinitions,
  })

  // Add in BentoBox trait as output is in BentoBox
  const { setBalances, ...strategy } = useBentoBoxTrait(baseStrategy)

  useEffect(() => {
    if (!balances) return

    setBalances({
      inputTokenBalance: balances[HOTPOT_ADDRESS[ChainId.ETHEREUM]],
      outputTokenBalance: tryParseAmount(xHotpotBentoBalance?.value?.toFixed(18) || '0', XHOTPOT),
    })
  }, [balances, setBalances, xHotpotBentoBalance?.value])

  return useMemo(
    () => ({
      setBalances,
      ...strategy,
    }),
    [strategy, setBalances]
  )
}

export default useStakeHotpotToBentoStrategy
