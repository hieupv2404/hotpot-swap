import { useEffect, useState } from 'react'

import { BigNumber } from '@ethersproject/bignumber'
import { XHOTPOT } from '../config/tokens'
import { useBentoBoxContract } from './useContract'

export default function useMeowshiPerXHotpot() {
  const bentoboxContract = useBentoBoxContract()
  const [state, setState] = useState<[BigNumber, BigNumber]>([BigNumber.from('0'), BigNumber.from('0')])

  useEffect(() => {
    if (!bentoboxContract) return
    ;(async () => {
      const toShare = await bentoboxContract.toShare(XHOTPOT.address, '1'.toBigNumber(XHOTPOT.decimals), false)
      const toAmount = await bentoboxContract.toAmount(XHOTPOT.address, '1'.toBigNumber(XHOTPOT.decimals), false)
      setState([toShare, toAmount])
    })()
  }, [bentoboxContract])

  return state
}
