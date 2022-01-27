import { ChainId } from '@hotpot-swap/sdk'
import { MASTER_CHEF, MASTER_CHEF_V2 } from '../addresses'
import { FarmTypeEnum } from '../farm-type'
import { useWeb3React } from '@web3-react/core'

const farmsRinkeby = [
  {
    pid: 0,
    network: 4,
    startDate: 0,
    endDate: 0,
    isActive: true,
    singleFarm: true,
    hotpotEarning: true,
    lpTokenAddress: {
      decimals: 18,
      4: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
    },

    farmAddress: {
      4: MASTER_CHEF_V2[4],
    },
    pair: {
      id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
      token: {
        symbol: 'HOTPOT',
        id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
        decimals: 18,
        earning: false,
        // amountPerMonth: 20: unlimited token
      },

      quoteToken: {
        symbol: 'HOTPOT',
        id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
        decimals: 18,
        earning: false,
      },
    },
    type: FarmTypeEnum.TOKEN,
  },
  // {
  //   pid: 0,
  //   network: 4,
  //   startDate: 0,
  //   endDate: 0,
  //   isActive: true,
  //   singleFarm: false,
  //   hotpotEarning: true,
  //   lpTokenAddress: {
  //     decimals: 18,
  //     4: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
  //   },

  //   farmAddress: {
  //     4: MASTER_CHEF_V2[4],
  //   },
  //   pair: {
  //     id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
  //     token: {
  //       symbol: 'HOTPOT',
  //       id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
  //       decimals: 18,
  //       earning: false,
  //       // amountPerMonth: 20: unlimited token
  //     },

  //     quoteToken: {
  //       symbol: 'HOTPOT',
  //       id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
  //       decimals: 18,
  //       earning: false,
  //     },
  //   },
  //   type: FarmTypeEnum.TOKEN,
  // },
  // {
  //   pid: 5,
  //   network: 4,
  //   startDate: 0,
  //   endDate: 0,
  //   isActive: true,
  //   singleFarm: false,
  //   hotpotEarning: true,
  //   lpTokenAddress: {
  //     decimals: 18,
  //     4: '0xce58d81acc1f0ab34da92351d625c325b4947f4b',
  //   },

  //   lpAddressStandVsQuote: {
  //     4: '0xce58d81acc1f0ab34da92351d625c325b4947f4b',
  //     decimals: 18,
  //   },
  //   farmAddress: {
  //     4: MASTER_CHEF_V2[4],
  //   },
  //   pair: {
  //     id: '0xce58d81acc1f0ab34da92351d625c325b4947f4b',
  //     token: {
  //       symbol: 'STAND',
  //       id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
  //       decimals: 18,
  //       earning: false,
  //       // amountPerMonth: 20: unlimited token
  //     },

  //     quoteToken: {
  //       symbol: 'DAI',
  //       id: '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735',
  //       decimals: 18,
  //       earning: true,
  //     },
  //   },
  //   type: FarmTypeEnum.LP,
  // },
  // {
  //   pid: 6,
  //   network: 4,
  //   startDate: 0,
  //   endDate: 0,
  //   isActive: true,
  //   singleFarm: false,
  //   hotpotEarning: true,
  //   lpTokenAddress: {
  //     decimals: 18,
  //     4: '0x408235Af9Ac0dcbf07812AA7F7Aad40A5CDc3845',
  //   },

  //   lpAddressStandVsQuote: {
  //     4: '0x408235Af9Ac0dcbf07812AA7F7Aad40A5CDc3845',
  //     decimals: 18,
  //   },
  //   farmAddress: {
  //     4: MASTER_CHEF_V2[4],
  //   },
  //   pair: {
  //     id: '0x408235Af9Ac0dcbf07812AA7F7Aad40A5CDc3845',
  //     token: {
  //       symbol: 'STAND',
  //       id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
  //       decimals: 18,
  //       earning: false,
  //       // amountPerMonth: 20: unlimited token
  //     },

  //     quoteToken: {
  //       symbol: 'LINK',
  //       id: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
  //       decimals: 18,
  //       earning: true,
  //     },
  //   },
  //   type: FarmTypeEnum.LP,
  // },
]

let farms

const FarmsList = () => {
  const { chainId } = useWeb3React()

  switch (chainId) {
    case ChainId.MAINNET:
      farms = []
      break
    case ChainId.RINKEBY:
      farms = farmsRinkeby
      break
    case ChainId.BSC:
      farms = []
      break
    case ChainId.BSC_TESTNET:
      farms = []
      break
    default:
      farms = []
  }
  return farms
}

export default FarmsList
