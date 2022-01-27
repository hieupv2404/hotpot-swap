import React, { useCallback, useContext, useEffect, useState } from 'react'
import { fortmatic, injected, portis, torus, walletconnect, walletlink } from '../../connectors'
import styled, { ThemeContext } from 'styled-components'
import Image from 'next/image'
import { ExternalLink as LinkIcon } from 'react-feather'
import ModalHeader from '../../components/ModalHeader'

import Modal from '../../components/Modal'

import { Currency } from '@sushiswap/sdk'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { isMobile } from 'react-device-detect'
import BigNumber from 'bignumber.js'
import { hotpotardData } from './deposit'
import { useCurrency } from '../../hooks/Tokens'
import NewTooltip from '../../components/NewTooltip'
import { FarmTypeEnum } from '../../constants/farm-type'

const WalletName = styled.div`
  width: initial;
  // font-size: 0.825rem;
  // font-weight: 500;
  // color: ${({ theme }) => theme.text3};
`

const TitleStyle = styled.div`
  white-space: nowrap;
  color: ${({ theme }) => theme.primaryText2};
  font-weight: 600;
  font-size: 16px;
  font-family: SF UI Display;
  @media (max-width: 767px) {
    font-size: 14px;
  }
  input {
    font-weight: 600;
  }
`

const StyleLable = styled.div`
  color: ${({ theme }) => theme.subText};
  @media (max-width: 600px) {
    font-size: 10px;
  }
  input {
    color: ${({ theme }) => theme.text6};
    font-family: SF UI Display;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 126.5%;
    letter-spacing: 0.015em;
    text-transform: capitalize;
    @media screen and (max-width: 768px) {
      font-size: 12px;
    }
    @media (max-width: 600px) {
      font-size: 10px;
      width: 70%;
    }
  }
`
const StyleInput = styled.div`
  input {
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.primaryText2};

    ::placeholder {
      color: ${({ theme }) => theme.smText};
    }
    @media (max-width: 767px) {
      width: 70%;
      font-size: 14px;
    }
  }
`
const TitleInfo = styled.div`
  color: ${({ theme }) => theme.text6};
  font-size: 16px;
  font-weight: 500;
  line-height: 126.5%;
  font-family: SF UI Display;
  @media (max-width: 600px) {
    font-size: 10px;
  }
`
const TitleBalance = styled.div`
  color: ${({ theme }) => theme.text6};
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  line-height: 126.5%;
  font-family: SF UI Display;
  @media (max-width: 600px) {
    font-size: 10px;
  }
`
const BlockPoolToken = styled.div`
  background-color: ${({ theme }) => theme.bgNoti};
  border-radius: 10px;
  height: 101px;
  width: 100%;
  @media (max-width: 600px) {
    height: 4rem;
    width: 295px;
  }
  .logo {
    > div > div {
      height: 35px !important;
      width: 35px !important;
    }
  }

  .value-input {
    @media (max-width: 640px) {
      margin-right: 10px !important;
      width: 35%;
    }
  }
`
const ButtonWithDraw = styled.div`
  width: 100%;
  @media (max-width: 600px) {
    width: 294px;
    border-radius: 10px;
  }

  & .disable-btn {
    background-color: rgba(31, 55, 100, 0.5) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    cursor: not-allowed;
  }

  .btn-primary1 {
    margin-top: 42px;
    margin-left: auto;
    background: ${({ theme }) => theme.greenButton};
    border-radius: 15px;
    color: ${({ theme }) => theme.white};
    height: 63px;
    width: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;
    @media (max-width: 767px) {
      border-radius: 10px;
      height: 40px;
    }

    .label {
      font-size: 18px;
      line-height: 21.48px;
      font-weight: 700;
      @media (max-width: 767px) {
        border-radius: 10px;
        font-size: 14px;
      }
    }

    .desc {
      font-size: 12px;
      line-height: 14.32px;
      font-weight: 600;
    }

    @media (max-width: 600px) {
      margin-top: 24px;
    }
  }
`

const WithDrawBlock = styled.div`
  background: ${({ theme }) => theme.bg2};
  // border: 1px solid ${({ theme }) => theme.border3};
  // box-shadow: ${({ theme }) => theme.shadowExchange};
  box-sizing: border-box;
  border-radius: 20px;
  display: block;
  width: 100%;
  height: fit-content;
  @media (max-width: 600px) {
    min-width: 295px;
  }
  .title-withdraw {
    h2 {
      font-size: 20px;
      @media (max-width: 767px) {
        font-size: 18px !important;
      }
    }
  }
`
const StyledNewTooltip = styled.div`
  display: inline-block;
`

// interface WithDrawModalProps {
//     toggleWithDrawModal: () => void;
//     pendingTransactions: string[];
//     confirmedTransactions: string[];
//     ENSName?: string;
//     openOptions: () => void;
// }

export default function WithDrawModal({
  isOpenWithDraw,
  onDismissWithDraw,
  onWithdraw,
  farm,
  size,
  depositSymbol,
  lpPrice,
  userStake,
  tokenPriceUSD,
  farmType,
}: {
  isOpenWithDraw: boolean
  onDismissWithDraw: () => void
  onWithdraw: (val: number) => void
  size: number
  depositSymbol: String
  lpPrice: number
  userStake: number
  farm: any
  tokenPriceUSD?: any
  farmType?: FarmTypeEnum
}) {
  const [firstValue, setFirstValue] = useState(null)

  function handleFirstChange(e: React.FormEvent<HTMLInputElement>) {
    let value = e.currentTarget.value
    let input = value
      .toString()
      .replace(/[^0-9.]/g, '')
      .replace(/(\..?)\../g, '$1')
    setFirstValue(input)
  }

  const currency0 = useCurrency(farm.pair.token.id)
  const currency1 = useCurrency(farm.pair.quoteToken.id)

  const handleWithdraw = () => {
    onWithdraw(firstValue)
  }

  useEffect(() => {
    setFirstValue(null)
  }, [isOpenWithDraw])
  const handleUserStakeValue = (value) => {
    let valueStr = value !== undefined ? String(value) : '0'
    let valueNum = value !== undefined ? Number(value) : 0
    if (valueNum % 1 == 0) {
      return valueStr.length > 10 ? valueStr.substring(0, 10) + '... ' : valueStr
    } else {
      if (String(parseInt(valueStr)).length > 10) {
        valueStr = valueStr.substring(0, 10) + '... '
        return valueStr
      } else {
        let newSplitValue = valueStr.split('.')
        let stringDecimals = newSplitValue[1].substring(0, 2)
        let lastValue = newSplitValue[0] + '.' + stringDecimals
        return lastValue + '... '
      }
    }
  }
  return (
    <Modal isOpen={isOpenWithDraw} onDismiss={onDismissWithDraw} className="w-full">
      <WithDrawBlock>
        <ModalHeader title="Withdraw" onClose={onDismissWithDraw} className="title-withdraw" />
        <div className="flex justify-between mb-3 w-full">
          <TitleInfo>Amount</TitleInfo>
          <TitleBalance onClick={() => setFirstValue(hotpotardData(userStake))}>
            {`${
              farmType === FarmTypeEnum.TOKEN
                ? farm.pair.token.symbol
                : `LP-${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
            } Available: `}
            <StyledNewTooltip>
              <NewTooltip
                dataTip={hotpotardData(userStake)}
                dataValue={handleUserStakeValue(hotpotardData(userStake))}
              />
            </StyledNewTooltip>
          </TitleBalance>
        </div>
        <BlockPoolToken className="flex justify-between space-between items-center mx-auto">
          <div className="coin-logo-box flex items-center">
            <div className="logo" style={{ marginLeft: '1rem', marginRight: '0.5rem' }}>
              {isMobile ? (
                <DoubleCurrencyLogo farmType={farmType} currency0={currency0} currency1={currency1} size={25} />
              ) : (
                <DoubleCurrencyLogo farmType={farmType} currency0={currency0} currency1={currency1} size={35} />
              )}
            </div>
            <div className="title space-y-2">
              <TitleInfo>{farmType === FarmTypeEnum.TOKEN ? 'Token' : 'Pool Token'}</TitleInfo>
              <TitleStyle>
                {farmType === FarmTypeEnum.TOKEN
                  ? farm.pair.token.symbol
                  : `${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`}
              </TitleStyle>
            </div>
          </div>
          <div
            className="value-input space-y-2"
            style={{ marginRight: isMobile ? '1rem' : '1.3rem', textAlign: 'right' }}
          >
            <StyleLable>
              <input
                style={{ backgroundColor: 'transparent', textAlign: 'right' }}
                value={`~$${hotpotardData(
                  farm.type === FarmTypeEnum.TOKEN
                    ? new BigNumber(firstValue).times(tokenPriceUSD).toNumber()
                    : new BigNumber(firstValue).times(lpPrice).toNumber()
                ).toFixed(2)}`}
                type="text"
                disabled={true}
              />
            </StyleLable>
            <StyleInput>
              <input
                placeholder={'0.0'}
                value={firstValue}
                style={{ backgroundColor: 'transparent', textAlign: 'right' }}
                onChange={(e) => {
                  const newValue = e.target.value
                  const patt = /^\d+\.{0,1}\d{0,18}$/
                  if (patt.test(newValue)) {
                    setFirstValue(newValue)
                  } else if (newValue == '') {
                    setFirstValue('')
                  }
                }}
                type="text"
              />
            </StyleInput>
          </div>
        </BlockPoolToken>
        <ButtonWithDraw className="mx-auto" style={{ marginBottom: isMobile ? '6px' : '25px' }}>
          <button
            disabled={
              firstValue === '' ||
              firstValue === null ||
              firstValue === undefined ||
              new BigNumber(firstValue).gt(new BigNumber(userStake))
            }
            className={`btn-primary1 ${
              firstValue === '' ||
              firstValue === null ||
              firstValue === undefined ||
              new BigNumber(firstValue).gt(new BigNumber(userStake))
                ? 'disable-btn'
                : ''
            }`}
            onClick={handleWithdraw}
          >
            <div className="label">
              {new BigNumber(firstValue).gt(new BigNumber(userStake))
                ? 'Insufficent balance'
                : firstValue === '' || firstValue === null
                ? 'Enter Amount'
                : 'Withdraw And Claim'}
            </div>
          </button>
        </ButtonWithDraw>
      </WithDrawBlock>
    </Modal>
  )
}
