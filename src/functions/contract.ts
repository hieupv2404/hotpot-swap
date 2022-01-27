// NOTE: Try not to add anything to thie file, it's almost entirely refactored out.

import { ChainId, ROUTER_ADDRESS } from '@hotpot-swap/core-sdk'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'

import { AddressZero } from '@ethersproject/constants'
import Web3 from 'web3'
import { FULL_NODE } from '../constants/addresses'
import ArcherSwapRouterABI from '../constants/abis/archer-router.json'
import { Contract } from '@ethersproject/contracts'
import IUniswapV2Router02ABI from '../constants/abis/uniswap-v2-router-02.json'
import IUniswapV2Router02NoETHABI from '../constants/abis/uniswap-v2-router-02-no-eth.json'
import { isAddress } from '../functions/validate'
import { networkSupport } from '../connectors'
import { useWeb3React } from '@web3-react/core'

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function getRouterAddress(chainId?: ChainId) {
  if (!chainId) {
    throw Error(`Undefined 'chainId' parameter '${chainId}'.`)
  }
  return ROUTER_ADDRESS[chainId]
}

// account is optional
export function getRouterContract(chainId: number, library: Web3Provider, account?: string): Contract {
  return getContract(
    getRouterAddress(chainId),
    chainId !== ChainId.CELO ? IUniswapV2Router02ABI : IUniswapV2Router02NoETHABI,
    library,
    account
  )
}

export const getWeb3Contract = (abiContract, addressContract) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  let fullnode = 'https://rinkeby.infura.io/v3/bee5f5bb9ff54d63a1ca8c7ea45a4fe2'
  const web3Instance = new Web3(fullnode)
  return new web3Instance.eth.Contract(abiContract, addressContract)
}
