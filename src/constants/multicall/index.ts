import { ChainId } from '@hotpot-swap/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.RINKEBY]: '0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821',
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
