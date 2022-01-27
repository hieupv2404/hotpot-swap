import Dots from '../../components/Dots'
import FarmListItem from './FarmListItem'
import React from 'react'
import styled from 'styled-components'
import DoubleLogo from '../../components/DoubleLogo'
import { ChainId } from '@hotpot-swap/sdk'
import { useCurrencyDisconnect } from '../../hooks/TokensDisconnect'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import FarmTypeList from './FarmTypeList'
import { FarmTypeEnum } from '../../constants/farm-type'

export const BLOCK_TIME: { [chainId in ChainId]?: number } = {
  [ChainId.MAINNET]: 15,
  [ChainId.RINKEBY]: 15,
  [ChainId.BSC_TESTNET]: 3,
  [ChainId.BSC]: 3,
}

export const ETH_BLOCK_TIME = 15
export const BSC_BLOCK_TIME = 3

export const TOKEN_HOTPOT_PER_BLOCK: { [chainId in ChainId]?: number } = {
  [ChainId.MAINNET]: 100,
  [ChainId.RINKEBY]: 100,
  [ChainId.BSC_TESTNET]: 20,
  [ChainId.BSC]: 40,
}

const FarmList = ({ farms, currentFarmType, changeFarmType }) => {
  const { chainId } = useWeb3React()

  const handleOpenLink = () => {
    const farmAddress = farms[0].farmAddress[`${chainId}`]
    switch (chainId) {
      case ChainId.MAINNET: {
        window.open(
          `https://etherscan.io/address/${farmAddress}`,
          '_blank' // <- This is what makes it open in a new window.
        )
        return
      }
      case ChainId.RINKEBY: {
        window.open(
          `https://rinkeby.etherscan.io/address/${farmAddress}`,
          '_blank' // <- This is what makes it open in a new window.
        )
        return
      }
      case ChainId.BSC: {
        window.open(`https://bscscan.com/address/${farmAddress}`, '_blank')
        return
      }
      case ChainId.BSC_TESTNET: {
        window.open(`https://testnet.bscscan.com/address/${farmAddress}`, '_blank')
        return
      }
      case ChainId.KOVAN: {
        window.open(`https://kovan.bscscan.com/address/${farmAddress}`, '_blank')
        return
      }
      case ChainId.ARBITRUM: {
        window.open(`https://arbiscan.io//address/${farmAddress}`, '_blank')
        return
      }

      default: {
        window.open(
          `https://etherscan.io/address/${farmAddress}`,
          '_blank' // <- This is what makes it open in a new window.
        )
        return
      }
    }
  }

  const handleChangeFarmType = (farmType: FarmTypeEnum) => {
    changeFarmType(farmType)
  }

  return (
    farms && (
      <>
        <Flex>
          <TextSub>{i18n._(t`Join out Farming programs`)}</TextSub>
          <div className="farming-programs-list">
            {farms.map((item, index) => {
              return (
                <div
                  onClick={handleOpenLink}
                  className={`fp-item ${item.type !== currentFarmType ? 'd-none' : ''}`}
                  key={index}
                >
                  <div className="coin-logo-box">
                    <div className="coin-logo">
                      {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                      <DoubleLogo
                        farmType={currentFarmType}
                        currency0={useCurrencyDisconnect(item.pair.token.id)}
                        currency1={useCurrencyDisconnect(item.pair.quoteToken.id)}
                        size={28}
                        marginRight={-12}
                      />
                    </div>
                  </div>
                  <div className={`coin-name ${item.type === FarmTypeEnum.TOKEN ? 'ml-7' : ''}`}>
                    {item.type === FarmTypeEnum.TOKEN
                      ? item.pair.token.symbol
                      : `${item.pair.token.symbol}-${item.pair.quoteToken.symbol}`}
                  </div>
                </div>
              )
            })}
          </div>
        </Flex>

        <FarmTypeList currentFarmType={currentFarmType} changeFarmType={handleChangeFarmType} />

        <GroupItemFarm>
          {farms.map((farm) => {
            // console.log('farm: ', farm)
            if (farm.endDate === 0 && farm.type === currentFarmType) {
              // console.log('farm1: ', farm)
              return <FarmListItem key={farm.pid} farm={farm} farmLength={farms.length} />
            } else {
              return ''
            }
          })}
        </GroupItemFarm>
        <GroupItemFarm>
          {farms.map((farm) => {
            if (farm.endDate !== 0 && farm.type === currentFarmType) {
              // console.log('farm2: ', farm)
              return <FarmListItem key={farm.pid} farm={farm} farmLength={farms.length} />
            } else {
              return ''
            }
          })}
        </GroupItemFarm>
      </>
    )
  )
}

export default FarmList

const TextSub = styled.p`
  font-weight: 500;
  font-size: 18px;
  text-transform: capitalize;
  color: ${({ theme }) => theme.textJoin};
  margin-bottom: 0px;
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
`
const Flex = styled.div`
  border-radius: 12px;
  padding: 18px 21px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bgrFlex};
  border: 1px solid ${({ theme }) => theme.borderFlex};
  margin-bottom: 33px;
  @media (max-width: 768px) {
    display: grid;
    grid-row-gap: 8px;
    margin-bottom: 17px;
  }

  .d-none {
    display: none !important;
  }

  .ml-7 {
    margin-left: 7px;
  }

  .farming-programs-list {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: -4px;
    grid-gap: 4px;

    .fp-item {
      background: ${({ theme }) => theme.bg1};
      box-shadow: 0px 4px 30px rgb(0 28 78 / 5%);
      border: 1px solid ${({ theme }) => theme.borderFlex};
      border-radius: 20px;
      padding: 6px 10px 6px 6px;
      display: flex;
      align-items: center;
      // margin: 0 8px 4px 0;
      height: 40px;
      cursor: pointer;

      .coin-logo-box {
        display: flex;
        align-items: center;
        .coin-logo {
          > div > svg {
            height: 24px;
            width: 24px;
            @media (max-width: 767px) {
              height: 22.5px;
              width: 22.5px;
            }
          }
          > div > svg > svg {
            left: -10px;
          }
          > div > div {
            border-radius: 100%;
            height: 24px !important;
            width: 24px !important;
            @media (max-width: 640px) {
              height: 22.5px !important;
              width: 22.5px !important;
            }
          }
        }
        .coin-name {
          font-family: SF UI Display;
          font-style: normal;
          font-weight: 500;
          font-size: 17px;
          line-height: 20px;
          /* identical to box height */

          display: flex;
          align-items: center;
          letter-spacing: 0.015em;

          color: ${({ theme }) => theme.textJoin};
          @media screen and (max-width: 768px) {
            font-size: 12px;
          }
        }
      }
    }
  }
`

export const GroupItemFarm = styled.div`
  @media (max-width: 768px) {
    display: grid;
    grid-template-rows: repeat(1, minmax(0, 1fr));
    grid-template-columns: repeat(1, minmax(0, 1fr));
    row-gap: 39px;
  }
  @media (min-width: 769px) {
    display: grid;
    grid-template-rows: repeat(1, minmax(0, 1fr));
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-gap: 40px 50px;
  }
`
