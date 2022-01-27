import { CRXHOTPOT, HOTPOT } from '../../../config/tokens'
import { ChainId, HOTPOT_ADDRESS, Token } from '@hotpot-swap/core-sdk'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import { e10, tryParseAmount } from '../../../functions'
import { useActiveWeb3React } from '../../../services/web3'
import { useZenkoContract } from '../../../hooks/useContract'
import { useCallback, useEffect, useMemo } from 'react'

import { BigNumber } from '@ethersproject/bignumber'
import { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import useBaseStrategy from './useBaseStrategy'
import { useBentoBalance } from '../../bentobox/hooks'
import useBentoBoxTrait from '../traits/useBentoBoxTrait'
import { useLingui } from '@lingui/react'
import useHotpotPerXHotpot from '../../../hooks/useXHotpotPerHotpot'
import { useTokenBalances } from '../../wallet/hooks'

export const GENERAL = (i18n: I18n): StrategyGeneralInfo => ({
  name: i18n._(t`Cream → Bento`),
  steps: [i18n._(t`HOTPOT`), i18n._(t`crXHOTPOT`), i18n._(t`BentoBox`)],
  zapMethod: 'stakeHotpotToCreamToBento',
  unzapMethod: 'unstakeHotpotFromCreamFromBento',
  description: i18n._(t`Stake HOTPOT for xHOTPOT into Cream and deposit crXHOTPOT into BentoBox in one click.`),
  inputSymbol: i18n._(t`HOTPOT`),
  outputSymbol: i18n._(t`crXHOTPOT in BentoBox`),
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
    address: '0x228619CCa194Fbe3Ebeb2f835eC1eA5080DaFbb2',
    decimals: 8,
    symbol: 'crXHOTPOT',
  },
}

const useStakeHotpotToCreamToBentoStrategy = (): StrategyHook => {
  const { i18n } = useLingui()
  const { account } = useActiveWeb3React()
  const zenkoContract = useZenkoContract()
  const balances = useTokenBalances(account, [HOTPOT[ChainId.ETHEREUM]])
  const sushiPerXHotpot = useHotpotPerXHotpot(true)
  const crxHotpotBentoBalance = useBentoBalance(CRXHOTPOT.address)

  // Strategy ends in BentoBox so use BaseBentoBox strategy
  const general = useMemo(() => GENERAL(i18n), [i18n])
  const baseStrategy = useBaseStrategy({
    id: 'stakeHotpotToCreamToBentoStrategy',
    general,
    tokenDefinitions,
  })

  // Add in BentoBox trait as output is in BentoBox
  const { setBalances, calculateOutputFromInput: _, ...strategy } = useBentoBoxTrait(baseStrategy)

  useEffect(() => {
    if (!balances) return

    setBalances({
      inputTokenBalance: balances[HOTPOT[ChainId.ETHEREUM].address],
      outputTokenBalance: tryParseAmount(crxHotpotBentoBalance?.value?.toFixed(8) || '0', CRXHOTPOT),
    })
  }, [balances, setBalances, crxHotpotBentoBalance?.value])

  const calculateOutputFromInput = useCallback(
    async (zapIn: boolean, inputValue: string, inputToken: Token, outputToken: Token) => {
      if (!sushiPerXHotpot || !inputValue || !zenkoContract) return null

      if (zapIn) {
        const value = inputValue.toBigNumber(18).mulDiv(e10(18), sushiPerXHotpot.toString().toBigNumber(18)).toString()
        const cValue = await zenkoContract.toCtoken(CRXHOTPOT.address, value)
        return cValue.toFixed(outputToken.decimals)
      } else {
        const cValue = await zenkoContract.fromCtoken(CRXHOTPOT.address, inputValue.toBigNumber(inputToken.decimals))
        const value = BigNumber.from(cValue).mulDiv(sushiPerXHotpot.toString().toBigNumber(18), e10(18))
        return value.toFixed(outputToken.decimals)
      }
    },
    [sushiPerXHotpot, zenkoContract]
  )

  return useMemo(
    () => ({
      ...strategy,
      setBalances,
      calculateOutputFromInput,
    }),
    [strategy, calculateOutputFromInput, setBalances]
  )
}

export default useStakeHotpotToCreamToBentoStrategy
