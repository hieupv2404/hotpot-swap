import React, { useEffect, useState } from 'react'
import { Wrapper, TabListFarmType, TabsFarmType } from './styles'
import { Tab, TabPanel } from 'react-tabs'
import { FarmTypeEnum } from '../../../constants/farm-type'

const FarmTypeList = ({ currentFarmType, changeFarmType }) => {
  const [farmTypeIndex, setFarmTypeIndex] = useState(0)

  useEffect(() => {
    switch (currentFarmType) {
      case FarmTypeEnum.LP:
        setFarmTypeIndex(0)
        break
      case FarmTypeEnum.TOKEN:
        setFarmTypeIndex(1)
        break
      case FarmTypeEnum.NFT:
        setFarmTypeIndex(2)
        break
      default:
        break
    }
  }, [currentFarmType])

  const handleFarmTypeChange = (index: number) => {
    setFarmTypeIndex(index)

    let farmType
    switch (index) {
      case 0:
        farmType = FarmTypeEnum.LP
        break
      case 1:
        farmType = FarmTypeEnum.TOKEN
        break
      case 2:
        farmType = FarmTypeEnum.NFT
        break
      default:
        break
    }
    changeFarmType(farmType)
  }

  return (
    <Wrapper>
      <TabsFarmType
        forceRenderTabPanel
        selectedIndex={farmTypeIndex}
        onSelect={(index: number) => handleFarmTypeChange(index)}
        className="flex flex-col flex-grow"
      >
        <TabListFarmType className="flex flex-shrink-0 rounded">
          <Tab
            className="cursor-pointer select-none focus:outline-none"
            selectedClassName="text-high-emphesis selected"
          >
            LP Farm
          </Tab>
          <Tab
            className="cursor-pointer select-none focus:outline-none"
            selectedClassName="text-high-emphesis selected"
          >
            Token Farm
          </Tab>
          {/* <Tab
            className="cursor-pointer select-none focus:outline-none"
            selectedClassName="text-high-emphesis selected"
          >
            NFT Farm
          </Tab> */}
        </TabListFarmType>
        <TabPanel></TabPanel>
        <TabPanel></TabPanel>
        <TabPanel></TabPanel>
      </TabsFarmType>
    </Wrapper>
  )
}

export default FarmTypeList
