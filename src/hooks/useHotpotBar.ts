import { Currency, CurrencyAmount, Token } from '@hotpot-swap/core-sdk'

import { useCallback } from 'react'
import { useHotpotBarContract } from './useContract'
import { useTransactionAdder } from '../state/transactions/hooks'

const useHotpotBar = () => {
  const addTransaction = useTransactionAdder()
  const barContract = useHotpotBarContract()

  const enter = useCallback(
    async (amount: CurrencyAmount<Token> | undefined) => {
      if (amount?.quotient) {
        try {
          const tx = await barContract?.enter(amount?.quotient.toString())
          return addTransaction(tx, { summary: 'Enter HotpotBar' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  const leave = useCallback(
    async (amount: CurrencyAmount<Token> | undefined) => {
      if (amount?.quotient) {
        try {
          const tx = await barContract?.leave(amount?.quotient.toString())
          return addTransaction(tx, { summary: 'Leave HotpotBar' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  return { enter, leave }
}

export default useHotpotBar
