import { ChainId } from '@hotpot-swap/sdk'

export const FULL_NODE: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: process.env.NEXT_PUBLIC_FULLNODE_RINKENY,
  [ChainId.BSC_TESTNET]: process.env.NEXT_PUBLIC_FULLNODE_BSCTESTNET,
}

export const MASTER_CHEF: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: '0x36C55e146aF82DbD06E0bFccF0AdFbedE02EC7d7',
}

export const MASTER_CHEF_V2: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: '0x36C55e146aF82DbD06E0bFccF0AdFbedE02EC7d7',
}

export const HOTPOT_TOKEN = {
  [ChainId.RINKEBY]: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
}

export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const UNSUPPORTED_LIST_URLS: string[] = []
