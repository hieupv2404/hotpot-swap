import { parseBytes32String } from '@ethersproject/strings'
import { ChainId, Currency, NATIVE, Token, WNATIVE } from '@hotpot-swap/sdk'
import { arrayify } from 'ethers/lib/utils'
import { useMemo, useState } from 'react'
import { NATIVE_TOKEN_ADDRESS } from '../constants/addresses'
import { isAddress } from '../functions/validate'
import { TokenAddressMap, useCombinedActiveList } from '../state/lists/hooks'
import { useUserAddedTokens } from '../state/user/hooks'
import { NetworkChainId } from '../utils/chainId'
import { useTokenBytes32Contract, useTokenContractWeb3 } from './useContract'

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap, includeUserAdded: boolean): { [address: string]: Token } {
  const chainId = NetworkChainId()
  const userAddedTokens = useUserAddedTokens()

  return useMemo(() => {
    if (!chainId) return {}

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId]).reduce<{
      [address: string]: Token
    }>((newMap, address) => {
      // @ts-ignore
      newMap[address] = tokenMap[chainId][address].token
      return newMap
    }, {})

    if (includeUserAdded) {
      return (
        userAddedTokens
          // reduce into all ALL_TOKENS filtered by the current chain
          .reduce<{ [address: string]: Token }>(
            (tokenMap, token) => {
              // @ts-ignore
              tokenMap[token.address] = token
              return tokenMap
            },
            // must make a copy because reduce modifies the map, and we do not
            // want to make a copy in every iteration
            { ...mapWithoutUrls }
          )
      )
    }

    return mapWithoutUrls
  }, [chainId, userAddedTokens, tokenMap, includeUserAdded])
}

function useAllTokens(): { [address: string]: Token } {
  const allTokens = useCombinedActiveList()

  return useTokensFromMap(allTokens, true)
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useTokenDisconnected(tokenAddress?: string): Token | undefined | null {
  const chainId = 4
  const tokens = useAllTokens()

  const address = isAddress(tokenAddress)
  const tokenContract = useTokenContractWeb3(address)
  const tokenContractBytes32 = useTokenBytes32Contract(address)
  const token: Token | undefined = address ? tokens[address] : undefined
  const [state, setState] = useState({
    tokenName: undefined,
    tokenNameBytes32: undefined,
    symbol: undefined,
    symbolBytes32: undefined,
    decimals: undefined,
  })

  useMemo(async () => {
    const [tokenName, tokenNameBytes32, symbol, symbolBytes32, decimals] = await Promise.all([
      !token && address ? tokenContract.methods.name().call() : undefined,
      !token && address ? tokenContractBytes32.methods.name().call() : undefined,
      !token && address ? tokenContract.methods.symbol().call() : undefined,
      !token && address ? tokenContractBytes32.methods.symbol().call() : undefined,
      !token && address ? tokenContract.methods.decimals().call() : undefined,
    ])
    setState({
      tokenName,
      tokenNameBytes32,
      symbol,
      symbolBytes32,
      decimals,
    })
  }, [address])

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (!state.decimals || !state?.symbol || !state?.tokenName) return null
    if (state?.decimals) {
      return new Token(
        chainId,
        address,
        Number(state?.decimals),
        parseStringOrBytes32(state?.symbol, state?.symbolBytes32, 'UNKNOWN'),
        parseStringOrBytes32(state?.tokenName, state?.tokenNameBytes32, 'Unknown Token')
      )
    }
    return undefined
  }, [token, chainId, address, state])
}

export function useCurrencyDisconnect(currencyId: string | undefined): Currency | null | undefined {
  const chainId = 4

  const isETH = currencyId?.toUpperCase() === 'ETH' || currencyId === NATIVE_TOKEN_ADDRESS

  const isDual = [ChainId.CELO].includes(chainId)

  const useNative = isETH && !isDual

  if (isETH && isDual) {
    currencyId = WNATIVE[chainId].address
  }

  const token = useTokenDisconnected(useNative ? undefined : currencyId)

  // const extendedEther = useMemo(() => (chainId ? ExtendedEther.onChain(chainId) : undefined), [chainId])
  // const weth = chainId ? WETH9_EXTENDED[chainId] : undefined

  const native = useMemo(() => (chainId ? NATIVE[chainId] : undefined), [chainId])

  const wnative = chainId ? WNATIVE[chainId] : undefined

  if (wnative?.address?.toLowerCase() === currencyId?.toLowerCase()) return wnative

  return useNative ? native : token
}
