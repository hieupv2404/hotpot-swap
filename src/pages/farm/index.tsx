import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import styled from 'styled-components'
import Container from '../../components/Container'
import PopupNotice from '../../components/PopupNotice/PopupNotice'
import { networkSupport } from '../../connectors'
import FarmsList from '../../constants/config/farms'
import { FarmTypeEnum } from '../../constants/farm-type'
import FarmList from '../../features/farm/FarmList'
import { useHotpotFarmingContract, useFarmingContractWeb3, useChainId } from '../../hooks/useContract'
import { useActiveWeb3React } from '../../services/web3'

const WrapFarm = styled.div`
  > .container {
    margin: 0 auto;
  }
`
export const TabListFarm = styled(TabList)`
  display: flex;
  align-items: center;
  li {
    margin-right: 50px;
  }
  @media screen and (max-width: 768px) {
    li {
      margin-right: 20px;
    }
  }
`
export const TabsFarm = styled(Tabs)`
  color: ${({ theme }) => theme.farmText};
  font-weight: 600;
  font-size: 18px;
  line-height: 126, 5%;
  letter-spacing: 0.015rem;
  // text-transform: capitalize;
  padding-top: 42px;
  @media screen and (max-width: 768px) {
    padding-top: 0;
    font-size: 16px;
  }
  .selected {
    color: ${({ theme }) => theme.tabActive};
    position: relative;
    :before {
      content: '';
      display: inline-block;
      height: 2px;
      width: 100%;
      position: absolute;
      left: 0;
      bottom: -5px;
      background: ${({ theme }) => theme.primary1};
    }
  }

  .nft-block {
    margin-top: ${isMobile ? '40px' : '60px'};
  }
`
const TabPanelFarm = styled(TabPanel)`
  padding-top: 15px;
`
const TextFarm = styled.p`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.015em;
  text-transform: capitalize;
  color: ${({ theme }) => theme.textSubFarm};
  padding-top: 16px;
  padding-bottom: 18px;

  .subText {
    color: ${({ theme }) => theme.spanFarm};
  }
  @media screen and (max-width: 767px) {
    padding: 10px 0;
    font-size: 11px;
  }
`

export default function Farm(): JSX.Element {
  // const { i18n } = useLingui();
  const { account } = useActiveWeb3React()
  const { chainId } = useChainId()
  // const router = useRouter();
  const listFarms = FarmsList()
  const [tabIndex, setTabIndex] = useState(0)
  const [listFarm, setListFarm] = useState([])
  const [currentFarmType, setCurrentFarmType] = useState(FarmTypeEnum.LP)
  // const useChainIdDisconnected = useChainIdDisconnect(); //rerender when switch network (disconnect)
  const checkTimeActive = (startDate: number, endDate: number) => {
    const now = new Date().getTime()
    return (now >= startDate && now <= endDate) || endDate === 0
  }

  const farmingContractWeb3 = useFarmingContractWeb3()
  const farmingContract = useHotpotFarmingContract()

  const [isNotice, setIsNotice] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setIsNotice(true)
    }, 1000)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const promiseCalls = listFarms.map((item) => {
        return farmingContractWeb3.methods.farmInfo(item.pid).call()
      })
      const data = await Promise.all(promiseCalls)
      const listData = listFarms.map((item, index) => {
        const info: any = data[index]
        const endDate = info.periodFinish * 1000
        const startDate = endDate - info.duration * 1000
        if (item.pair?.token?.limitedAmount) {
          item.pair.token.tokenPerYear =
            (Number(item.pair.token.limitedAmount) * 365 * 24 * 3600) / Number(info.duration)
        }

        if (item?.pair?.quoteToken?.limitedAmount) {
          item.pair.quoteToken.tokenPerYear =
            (Number(item.pair.quoteToken.limitedAmount) * 365 * 24 * 3600) / Number(info.duration)
        }

        return {
          ...item,
          startDate,
          endDate,
          duration: info.duration * 1000,
          endDateInMilis: endDate,
        }
      })
      // let x = [
      //   {
      //     pid: 0,
      //     network: 4,
      //     startDate: 0,
      //     endDate: 0,
      //     isActive: true,
      //     singleFarm: true,
      //     standEarning: true,
      //     lpTokenAddress: { '4': '0xAab270C629D885713602BC62B1c15D6e0e51F5A9', decimals: 18 },
      //     farmAddress: { '4': '0x36C55e146aF82DbD06E0bFccF0AdFbedE02EC7d7' },
      //     pair: {
      //       id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
      //       token: { symbol: 'HOTPOT', id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9', decimals: 18, earning: false },
      //       quoteToken: {
      //         symbol: 'HOTPOT',
      //         id: '0xAab270C629D885713602BC62B1c15D6e0e51F5A9',
      //         decimals: 18,
      //         earning: false,
      //       },
      //     },
      //     type: '1',
      //     duration: 0,
      //     endDateInMilis: 0,
      //   },
      // ]
      setListFarm(listData)
    }

    if (networkSupport.supportedChainIds.includes(chainId)) {
      //fetchData()
    } else {
      setListFarm(listFarms)
    }
  }, [chainId, account])

  const getFarmsActive = () => {
    return listFarms
      ?.filter((item) => {
        return item.isActive && item.network == chainId
      })
      .map((item) => {
        return {
          ...item,
          active: true,
        }
      })
  }

  const getFarmsInactive = () => {
    return listFarm
      ?.filter((item) => {
        return !item.isActive && item.network == chainId
      })
      .map((item) => {
        return {
          ...item,
          active: false,
        }
      })
  }

  const handleChangeFarmType = (farmType: FarmTypeEnum) => {
    setCurrentFarmType(farmType)
  }

  const handleTabFarmChange = (index: number) => {
    setTabIndex(index)
  }

  return (
    <Container id="farm-page" className="grid h-full mx-auto gap-9 max-w-full w-full" maxWidth="7xl">
      <Head>
        <title>Farm | Hotpot</title>
        <meta name="description" content="Farm HOTPOTSWAP" />
      </Head>

      <div className="space-y-6">
        <WrapFarm>
          <TabsFarm
            forceRenderTabPanel
            selectedIndex={tabIndex}
            onSelect={(index: number) => handleTabFarmChange(index)}
            className="flex flex-col flex-grow"
          >
            <TabPanel>
              {tabIndex == 0 && (
                <>
                  <FarmList
                    farms={getFarmsActive()}
                    currentFarmType={currentFarmType}
                    changeFarmType={handleChangeFarmType}
                  />
                </>
              )}
            </TabPanel>
            <TabPanel>
              {tabIndex == 1 && (
                <FarmList
                  farms={getFarmsInactive()}
                  currentFarmType={currentFarmType}
                  changeFarmType={handleChangeFarmType}
                />
              )}
            </TabPanel>
          </TabsFarm>
        </WrapFarm>
      </div>
      {/* {account && <PopupNotice isOpen={isNotice} onDismiss={() => setIsNotice(false)} />} */}
    </Container>
  )
}
