import { Currency } from '@hotpot-swap/sdk'
import CurrencyLogo from '../CurrencyLogo'
import React from 'react'
import Image from 'next/image'
import styled from 'styled-components'
import { FarmTypeEnum } from '../../constants/farm-type'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number; space: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ marginRight }) => (marginRight ? `${marginRight}px` : '0')};
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
  & >div{
    border-radius:100%;
  }
  &>div:nth-child(2){
    left:-8px;
    left: ${({ space }) => space?.toString() + 'px'}
  }
  &>div:nth-child(3){
    left:-16px;
    left: ${({ space }) => space?.toString() + 'px'}
  }
  &>div:nth-child(4){
    left:-24px;
    left: ${({ space }) => space?.toString() + 'px'}
  }
  > svg {
    height: ${({ sizeraw }) => sizeraw + 'px'};
    width: ${({ sizeraw }) => sizeraw + 'px'};
    // @media (max-width: 640px){
    //   height: 35px;
    //  width: 35px;
    // }
  }
  img {
    max-width: ${({ sizeraw }) => `${sizeraw}px`};
    max-height: ${({ sizeraw }) => `${sizeraw}px`};
  }
}
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
  squared?: boolean
  space?: number
  type?: '0' | '1' | '2'
  farmType?: FarmTypeEnum
  marginRight?: number
}

const HigherLogo = styled(CurrencyLogo)`
  stroke: ${({ theme }) => theme.primaryText2};
  z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  stroke: ${({ theme }) => theme.primaryText2};
  position: relative;
  margin-left: -8px;

  // left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false,
  squared = true,
  space,
  type,
  farmType,
  marginRight = 0,
}: DoubleCurrencyLogoProps) {
  // return (
  //   <div className="flex space-x-2">
  //     <div className="flex items-center ">
  //       <CurrencyLogo
  //         currency={currency0}
  //         size={size.toString() + "px"}
  //         squared={squared}
  //       />
  //     </div>
  //     <div className="flex items-center">
  //       <CurrencyLogo
  //         currency={currency1}
  //         size={size.toString() + "px"}
  //         squared={squared}
  //       />
  //     </div>
  //   </div>
  // );

  if (farmType === FarmTypeEnum.TOKEN) {
    return (
      <Wrapper sizeraw={size} margin={margin} space={space}>
        {currency0 && (
          <Image
            className="rounded-full z-10"
            src={'/icons/icon-72x72.png'}
            alt={currency0.symbol}
            width="40px"
            height="40px"
          />
        )}
      </Wrapper>
    )
  }

  return (
    <Wrapper sizeraw={size} margin={margin} space={space}>
      {currency0 &&
        (currency0.symbol === 'HOTPOT' ? (
          <Image
            className="rounded-full z-10"
            src={'/icons/icon-72x72.png'}
            alt={currency0.symbol}
            width="40px"
            height="40px"
          />
        ) : (
          <HigherLogo currency={currency0} size={size.toString() + 'px'} squared={squared} />
        ))}
      {/* @ts-ignore */}
      {currency1 && type !== FarmTypeEnum.TOKEN && (
        <CoveredLogo currency={currency1} size={size.toString() + 'px'} sizeraw={size} squared={squared} />
      )}
    </Wrapper>
  )
}
