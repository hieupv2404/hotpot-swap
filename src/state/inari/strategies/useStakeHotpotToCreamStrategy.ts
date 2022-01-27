import { CRXHOTPOT, HOTPOT, XHOTPOT } from '../../../config/tokens'
import { ChainId, CurrencyAmount, HOTPOT_ADDRESS, Token } from '@hotpot-swap/core-sdk'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import { useApproveCallback } from '../../../hooks/useApproveCallback'
import { useInariContract, useZenkoContract } from '../../../hooks/useContract'
import { useActiveWeb3React } from '../../../services/web3'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { tryParseAmount } from '../../../functions'
import useBaseStrategy from './useBaseStrategy'
import { useDerivedInariState } from '../hooks'
import { useLingui } from '@lingui/react'
import { useTokenBalances } from '../../wallet/hooks'

export const GENERAL = (i18n: I18n): StrategyGeneralInfo => ({
  name: i18n._(t`HOTPOT → Cream`),
  steps: [i18n._(t`HOTPOT`), i18n._(t`xHOTPOT`), i18n._(t`Cream`)],
  zapMethod: 'stakeHotpotToCream',
  unzapMethod: 'unstakeHotpotFromCream',
  description: i18n._(
    t`Stake HOTPOT for xHOTPOT and deposit into Cream in one click. xHOTPOT in Cream (crXHOTPOT) can be lent or used as collateral for borrowing.`
  ),
  inputSymbol: i18n._(t`HOTPOT`),
  outputSymbol: i18n._(t`xHOTPOT in Cream`),
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

const useStakeHotpotToCreamStrategy = (): StrategyHook => {
  const { i18n } = useLingui()
  const { account } = useActiveWeb3React()
  const { zapIn, inputValue } = useDerivedInariState()
  const zenkoContract = useZenkoContract()
  const inariContract = useInariContract()
  const balances = useTokenBalances(account, [HOTPOT[ChainId.ETHEREUM], CRXHOTPOT])
  const cTokenAmountRef = useRef<CurrencyAmount<Token>>(null)
  const approveAmount = useMemo(() => (zapIn ? inputValue : cTokenAmountRef.current), [inputValue, zapIn])

  // Override approveCallback for this strategy as we need to approve CRXHOTPOT on zapOut
  const approveCallback = useApproveCallback(approveAmount, inariContract?.address)
  const general = useMemo(() => GENERAL(i18n), [i18n])
  const { execute, setBalances, ...baseStrategy } = useBaseStrategy({
    id: 'stakeHotpotToCreamStrategy',
    general,
    tokenDefinitions,
  })

  const toCTokenAmount = useCallback(
    async (val: CurrencyAmount<Token>) => {
      if (!zenkoContract || !val) return null

      const bal = await zenkoContract.toCtoken(CRXHOTPOT.address, val.quotient.toString())
      return CurrencyAmount.fromRawAmount(CRXHOTPOT, bal.toString())
    },
    [zenkoContract]
  )

  // Run before executing transaction creation by transforming from xHOTPOT value to crXHOTPOT value
  // As you will be spending crXHOTPOT when unzapping from this strategy
  const preExecute = useCallback(
    async (val: CurrencyAmount<Token>) => {
      if (zapIn) return execute(val)
      return execute(await toCTokenAmount(val))
    },
    [execute, toCTokenAmount, zapIn]
  )

  useEffect(() => {
    toCTokenAmount(inputValue).then((val) => (cTokenAmountRef.current = val))
  }, [inputValue, toCTokenAmount])

  useEffect(() => {
    if (!zenkoContract || !balances) return

    const main = async () => {
      if (!balances[CRXHOTPOT.address]) return tryParseAmount('0', XHOTPOT)
      const bal = await zenkoContract.fromCtoken(
        CRXHOTPOT.address,
        balances[CRXHOTPOT.address].toFixed().toBigNumber(CRXHOTPOT.decimals).toString()
      )
      setBalances({
        inputTokenBalance: balances[HOTPOT[ChainId.ETHEREUM].address],
        outputTokenBalance: CurrencyAmount.fromRawAmount(XHOTPOT, bal.toString()),
      })
    }

    main()
  }, [balances, setBalances, zenkoContract])

  return useMemo(
    () => ({
      ...baseStrategy,
      approveCallback: [...approveCallback, approveAmount],
      setBalances,
      execute: preExecute,
    }),
    [approveAmount, approveCallback, baseStrategy, preExecute, setBalances]
  )
}

export default useStakeHotpotToCreamStrategy
