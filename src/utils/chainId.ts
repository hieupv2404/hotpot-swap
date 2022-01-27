import { useWeb3React } from '@web3-react/core'
import { networkSupport } from '../connectors'
import { DEFAULT_CHAIN_ID } from '../constants/chains'

export const NetworkChainId = () => {
  const { chainId } = useWeb3React()

  if (Number(localStorage.getItem('chainId'))) {
    return Number(localStorage.getItem('chainId'))
  } else if (networkSupport.supportedChainIds.includes(chainId)) {
    return chainId
  } else {
    return DEFAULT_CHAIN_ID
  }
}
