import { useAppSelector } from '../hooks'
import { Token } from '@hotpot-swap/core-sdk'
import { tryParseAmount } from '../../functions'
import useStakeHotpotToBentoStrategy from './strategies/useStakeHotpotToBentoStrategy'
import { DerivedInariState, InariState } from './types'
import useStakeHotpotToCreamStrategy from './strategies/useStakeHotpotToCreamStrategy'
import useStakeHotpotToCreamToBentoStrategy from './strategies/useStakeHotpotToCreamToBentoStrategy'
import useStakeHotpotToAaveStrategy from './strategies/useStakeHotpotToAaveStrategy'
import { useMemo } from 'react'

export function useInariState(): InariState {
  return useAppSelector((state) => state.inari)
}

// Redux doesn't allow for non-serializable classes so use a derived state hook for complex values
// Derived state may not use any of the strategy hooks to avoid an infinite loop
export function useDerivedInariState(): DerivedInariState {
  const { inputValue, outputValue, tokens, general, ...rest } = useInariState()

  // BalancePanel input token
  const inputToken = useMemo(
    () =>
      new Token(
        tokens.inputToken.chainId,
        tokens.inputToken.address,
        tokens.inputToken.decimals,
        tokens.inputToken.symbol
      ),
    [tokens.inputToken.address, tokens.inputToken.chainId, tokens.inputToken.decimals, tokens.inputToken.symbol]
  )

  // BalancePanel output token
  const outputToken = useMemo(
    () =>
      new Token(
        tokens.outputToken.chainId,
        tokens.outputToken.address,
        tokens.outputToken.decimals,
        tokens.outputToken.symbol
      ),
    [tokens.outputToken.address, tokens.outputToken.chainId, tokens.outputToken.decimals, tokens.outputToken.symbol]
  )

  return useMemo(
    () => ({
      ...rest,
      inputValue: tryParseAmount(inputValue, inputToken),
      outputValue: tryParseAmount(outputValue, outputToken),
      general,
      tokens: {
        inputToken,
        outputToken,
      },
    }),
    [general, inputToken, inputValue, outputToken, outputValue, rest]
  )
}

export function useSelectedInariStrategy() {
  const { id: selectedStrategy } = useInariState()
  const strategies = useInariStrategies()
  return useMemo(() => strategies[selectedStrategy], [selectedStrategy, strategies])
}

// Use this hook to register all strategies
export function useInariStrategies() {
  const stakeHotpotToBentoStrategy = useStakeHotpotToBentoStrategy()
  // const stakeHotpotToCreamStrategy = useStakeHotpotToCreamStrategy()
  // const stakeHotpotToCreamToBentoStrategy = useStakeHotpotToCreamToBentoStrategy()
  const stakeHotpotToAaveStrategy = useStakeHotpotToAaveStrategy()

  return useMemo(
    () => ({
      [stakeHotpotToBentoStrategy.id]: stakeHotpotToBentoStrategy,
      // [stakeHotpotToCreamStrategy.id]: stakeHotpotToCreamStrategy,
      // [stakeHotpotToCreamToBentoStrategy.id]: stakeHotpotToCreamToBentoStrategy,
      [stakeHotpotToAaveStrategy.id]: stakeHotpotToAaveStrategy,
    }),
    [stakeHotpotToAaveStrategy, stakeHotpotToBentoStrategy]
  )
}
