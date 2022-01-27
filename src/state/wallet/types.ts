import { CurrencyAmount, Token } from '@hotpot-swap/core-sdk'

type TokenAddress = string

export type TokenBalancesMap = Record<TokenAddress, CurrencyAmount<Token>>
