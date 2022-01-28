import { ChainId, HOTPOT_ADDRESS, Token } from '@hotpot-swap/sdk'
type ChainTokenMap = {
  readonly [chainId in ChainId]?: Token
}

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

export const MINICHEF_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: '0x36C55e146aF82DbD06E0bFccF0AdFbedE02EC7d7',
}

export const HOTPOT_TOKEN = {
  [ChainId.RINKEBY]: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
}

export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const UNSUPPORTED_LIST_URLS: string[] = []
// HOTPOT

export const HOTPOT: ChainTokenMap = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, HOTPOT_ADDRESS[ChainId.MAINNET], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, HOTPOT_ADDRESS[ChainId.ROPSTEN], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, HOTPOT_ADDRESS[ChainId.RINKEBY], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, HOTPOT_ADDRESS[ChainId.GÖRLI], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, HOTPOT_ADDRESS[ChainId.KOVAN], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.MATIC]: new Token(ChainId.MATIC, HOTPOT_ADDRESS[ChainId.MATIC], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, HOTPOT_ADDRESS[ChainId.FANTOM], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.XDAI]: new Token(ChainId.XDAI, HOTPOT_ADDRESS[ChainId.XDAI], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.BSC]: new Token(ChainId.BSC, HOTPOT_ADDRESS[ChainId.BSC], 18, 'HOTPOT', 'HotpotToken'),
  // [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, HOTPOT_ADDRESS[ChainId.ARBITRUM], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, HOTPOT_ADDRESS[ChainId.AVALANCHE], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.OKEX]: new Token(ChainId.OKEX, HOTPOT_ADDRESS[ChainId.OKEX], 18, 'HOTPOT', 'HotpotToken'),
  [ChainId.HARMONY]: new Token(ChainId.HARMONY, HOTPOT_ADDRESS[ChainId.HARMONY], 18, 'HOTPOT', 'HotpotToken'),
  // [ChainId.HECO]: new Token(ChainId.HECO, HOTPOT_ADDRESS[ChainId.HECO], 18, 'HOTPOT', 'HotpotToken'),
}
