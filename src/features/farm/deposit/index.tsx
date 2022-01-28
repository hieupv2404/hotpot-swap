import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import BigNumber from 'bignumber.js'
import { formatEther } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import CloseIcon from '../../../components/CloseIcon'
import DoubleLogo from '../../../components/DoubleLogo'
import Modal from '../../../components/Modal'
import NewTooltip from '../../../components/NewTooltip'
import { MASTER_CHEF, MASTER_CHEF_V2, HOTPOT_TOKEN } from '../../../constants/addresses'
import { FarmTypeEnum } from '../../../constants/farm-type'
import { tryParseAmount } from '../../../functions'

import { ApprovalState, useApproveCallback, useLpTokenContract } from '../../../hooks'
import { useCurrency } from '../../../hooks/Tokens'
import { useActiveWeb3React } from '../../../hooks/useActiveWeb3React'
import { decimalAdjust, handleAdvancedDecimal, toFixed } from '../../../utils/decimalAdjust'

export const hotpotardData = (data: any) => {
  return isNaN(data) ? 0 : data
}

export default function Deposit({
  isOpenDeposit,
  onDismissDeposit,
  userStake,
  farm,
  apy,
  lpPrice,
  onDeposit,
  currencies,
  context,
  tokenPriceUSD,
  farmType,
}: {
  isOpenDeposit: boolean
  onDismissDeposit: () => void
  userStake: number
  farm: any
  apy: number
  lpPrice: number
  currencies: any
  onDeposit: (val: number) => void
  context: any
  tokenPriceUSD?: any
  farmType: FarmTypeEnum
}) {
  const { i18n } = useLingui()
  const { account, chainId } = context
  const { token0, token1, currencyLp } = currencies

  const exclamationMark = () => {
    return (
      <svg
        style={{ marginLeft: '-6px' }}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="fill-svg"
          d="M8 0.5C8.98491 0.5 9.96018 0.693993 10.8701 1.0709C11.7801 1.44781 12.6069 2.00026 13.3033 2.6967C13.9997 3.39314 14.5522 4.21993 14.9291 5.12987C15.306 6.03982 15.5 7.01509 15.5 8C15.5 8.98491 15.306 9.96018 14.9291 10.8701C14.5522 11.7801 13.9997 12.6069 13.3033 13.3033C12.6069 13.9997 11.7801 14.5522 10.8701 14.9291C9.96018 15.306 8.98491 15.5 8 15.5C6.01088 15.5 4.10322 14.7098 2.6967 13.3033C1.29018 11.8968 0.5 9.98912 0.5 8C0.5 6.01088 1.29018 4.10322 2.6967 2.6967C4.10322 1.29018 6.01088 0.5 8 0.5ZM8 1.75C6.3424 1.75 4.75269 2.40848 3.58058 3.58058C2.40848 4.75269 1.75 6.3424 1.75 8C1.75 9.6576 2.40848 11.2473 3.58058 12.4194C4.75269 13.5915 6.3424 14.25 8 14.25C9.6576 14.25 11.2473 13.5915 12.4194 12.4194C13.5915 11.2473 14.25 9.6576 14.25 8C14.25 6.3424 13.5915 4.75269 12.4194 3.58058C11.2473 2.40848 9.6576 1.75 8 1.75ZM8 10.5C8.24864 10.5 8.4871 10.5988 8.66291 10.7746C8.83873 10.9504 8.9375 11.1889 8.9375 11.4375C8.9375 11.6861 8.83873 11.9246 8.66291 12.1004C8.4871 12.2762 8.24864 12.375 8 12.375C7.75136 12.375 7.5129 12.2762 7.33709 12.1004C7.16127 11.9246 7.0625 11.6861 7.0625 11.4375C7.0625 11.1889 7.16127 10.9504 7.33709 10.7746C7.5129 10.5988 7.75136 10.5 8 10.5ZM8 3.625C8.14628 3.62495 8.28795 3.67621 8.40032 3.76986C8.5127 3.86351 8.58867 3.99361 8.615 4.1375L8.625 4.25V8.625C8.62529 8.78118 8.56709 8.93181 8.46186 9.04723C8.35664 9.16264 8.21202 9.23448 8.05647 9.24859C7.90093 9.26271 7.74574 9.21807 7.62146 9.12348C7.49718 9.02888 7.41283 8.89118 7.385 8.7375L7.375 8.625V4.25C7.375 4.08424 7.44085 3.92527 7.55806 3.80806C7.67527 3.69085 7.83424 3.625 8 3.625Z"
          fill="#667795"
        />
      </svg>
    )
  }
  const [countValue, setCountValue] = useState(null)
  const [tokenHotpotPrice, setTokenHotpotPrice] = useState(0)
  const [userLpAmount, setUserLpAmount] = useState<any>(0)
  const lpTokenContract = useLpTokenContract(farm.lpTokenAddress)

  const handleSubmitDeposit = (e) => {
    e.preventDefault()
    onDeposit(countValue)
  }

  useEffect(() => {
    setCountValue(null)
    const getTokenHotpotPrice = async () => {
      const [hotpotPrice, tokenBalance] = await Promise.all([0, lpTokenContract.methods.balanceOf(account).call()])
      // const userLpAmount = parseInt(tokenBalance[0]._hex, 16) / Math.pow(10, farm.lpTokenAddress.decimals);
      const userLpAmount = formatEther(tokenBalance)
      setUserLpAmount(userLpAmount)
      setTokenHotpotPrice(hotpotPrice)
    }

    isOpenDeposit && getTokenHotpotPrice()
  }, [isOpenDeposit, account])

  const [approval, approveCallback] = useApproveCallback(
    currencyLp && tryParseAmount(toFixed(decimalAdjust('floor', countValue, -18)).toString(), currencyLp),
    farm.active ? MASTER_CHEF_V2[chainId] : MASTER_CHEF[chainId]
  )

  const roundToTwoDp = (number) => Math.round(number * 100) / 100
  const calculateSdcEarnedPerThousandDollars = ({ numberOfDays, farmApy, tokenPrice }) => {
    // Everything here is worked out relative to a year, with the asset compounding daily
    const timesCompounded = 365
    //   We use decimal values rather than % in the math for both APY and the number of days being calculates as a proportion of the year
    const apyAsDecimal = farmApy / 10000
    const daysAsDecimalOfYear = numberOfDays / timesCompounded
    //   Calculate the starting HOTPOT balance with a dollar balance of $1000.
    const principal = 1000 / tokenPrice

    if (farmType === FarmTypeEnum.TOKEN) {
      return principal * apyAsDecimal * daysAsDecimalOfYear
    }

    // This is a translation of the typical mathematical compounding APY formula. Details here: https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
    const finalAmount = principal * (1 + apyAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear)

    // To get the HOTPOT earned, deduct the amount after compounding (finalAmount) from the starting HOTPOT balance (principal)
    const interestEarned = finalAmount - principal
    return roundToTwoDp(interestEarned)
  }

  const apyModalRoi = ({ amountEarned, amountInvested }) => {
    const percentage = (amountEarned / amountInvested) * 100
    return percentage.toFixed(2)
  }

  const farmApy = new BigNumber(apy).times(100)

  const tokenHotpotEarnedPerThousand1D = calculateSdcEarnedPerThousandDollars({
    numberOfDays: 1,
    farmApy,
    tokenPrice: tokenHotpotPrice,
  })
  const tokenHotpotEarnedPerThousand30D = calculateSdcEarnedPerThousandDollars({
    numberOfDays: 30,
    farmApy,
    tokenPrice: tokenHotpotPrice,
  })
  const tokenHotpotEarnedPerThousand365D = calculateSdcEarnedPerThousandDollars({
    numberOfDays: 365,
    farmApy,
    tokenPrice: tokenHotpotPrice,
  })

  const handlePriceAmount = (tokenHotpotEarned, tokenHotpotPrice) => {
    return hotpotardData(new BigNumber(tokenHotpotEarned).times(tokenHotpotPrice).toNumber()) === 0 ||
      hotpotardData(new BigNumber(tokenHotpotEarned).times(tokenHotpotPrice).toNumber()) === '0'
      ? '0.00'
      : hotpotardData(new BigNumber(tokenHotpotEarned).times(tokenHotpotPrice).toNumber())
  }

  return (
    <Modal isOpen={isOpenDeposit} onDismiss={onDismissDeposit} maxWidth={568}>
      <HeadModal className="flex justify-between">
        <TitleStyle className="text-lg font-bold">Deposit</TitleStyle>
        <CloseIcon onClick={onDismissDeposit} />
      </HeadModal>
      <ContentModal>
        <div className="head-title">
          <div className="amount">{i18n._(t`Amount`)}</div>
          <div className="available" onClick={() => setCountValue(hotpotardData(userLpAmount))}>
            {`${
              farmType === FarmTypeEnum.TOKEN ? 'HOTPOT' : `LP-${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
            } ${i18n._(t`Balance:`)} `}
            <StyledNewTooltip>
              <NewTooltip
                dataTip={hotpotardData(userLpAmount)}
                dataValue={handleAdvancedDecimal(hotpotardData(userLpAmount), 6)}
              />
            </StyledNewTooltip>
          </div>
        </div>
        <PoolToken>
          <div className="coin-box">
            <div className="coin-logo">
              <DoubleLogo currency0={token0} currency1={token1} size={35} type={farm.type} />
            </div>
            <div className="pool-tk">
              <div className="pool-tt">{farmType === FarmTypeEnum.TOKEN ? 'Token' : i18n._(t`Pool Token`)}</div>
              <div className="pool-vlue">
                {farmType === FarmTypeEnum.TOKEN
                  ? farm.pair.token.symbol
                  : `${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`}
              </div>
            </div>
          </div>
          <div className="count-tk">
            <NewTooltip
              className="count-tt"
              dataTip={`~${hotpotardData(
                farm.type === FarmTypeEnum.TOKEN ? Number(countValue) * tokenPriceUSD : Number(countValue) * lpPrice
              ).toFixed(2)}`}
              dataValue={`~${hotpotardData(
                farm.type === FarmTypeEnum.TOKEN ? Number(countValue) * tokenPriceUSD : Number(countValue) * lpPrice
              ).toFixed(2)}`}
            />
            <div className="count-input">
              <input
                type="text"
                placeholder="0.00"
                value={countValue}
                onChange={(e) => {
                  const newValue = e.target.value
                  const patt = /^\d+\.{0,1}\d{0,18}$/
                  if (patt.test(newValue)) {
                    setCountValue(newValue)
                  } else if (newValue == '') {
                    setCountValue('')
                  }
                }}
              />
            </div>
          </div>
        </PoolToken>
        <ButtonDeposit style={{ marginBottom: isMobile ? '6px' : '25px' }}>
          <button
            disabled={
              Number(countValue) == null ||
              Number(countValue) == 0 ||
              new BigNumber(countValue).gt(new BigNumber(userLpAmount)) ||
              approval === ApprovalState.PENDING
            }
            className={`bg-gradient-to-r from-blue to-pink btn-primary1 ${
              (Number(countValue) == 0 ||
                Number(countValue) == null ||
                new BigNumber(countValue).gt(new BigNumber(userLpAmount)) ||
                approval === ApprovalState.PENDING ||
                approval === ApprovalState.UNKNOWN) &&
              'disable-btn'
            }
              `}
            onClick={(e) => {
              approval === ApprovalState.APPROVED ? handleSubmitDeposit(e) : approveCallback()
            }}
          >
            <div className="label">
              {Number(countValue) === 0
                ? i18n._(t`Enter amount`)
                : new BigNumber(countValue).gt(new BigNumber(userLpAmount))
                ? i18n._(t`Insufficent balance`)
                : approval === ApprovalState.NOT_APPROVED
                ? `${
                    farmType === FarmTypeEnum.TOKEN
                      ? 'Approve HOTPOT'
                      : `${i18n._(t`Approve LP`)} ${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
                  }`
                : approval === ApprovalState.PENDING
                ? `${
                    farmType === FarmTypeEnum.TOKEN
                      ? 'Approving HOTPOT'
                      : `${i18n._(t`Approving LP`)} ${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
                  }`
                : i18n._(t`Deposit`)}
            </div>
          </button>
        </ButtonDeposit>
      </ContentModal>
    </Modal>
  )
}

const StyledNewTooltip = styled.div`
  display: inline-block;
`
const TitleStyle = styled.div`
  color: ${({ theme }) => theme.primaryText2};
  font-weight: 600;
  font-size: 20px;
  @media screen and (max-width: 768px) {
    font-size: 18px;
  }
`
const HeadModal = styled.div`
  color: ${({ theme }) => theme.primaryText2};
  font-weight: 600;
`
const ButtonDeposit = styled.div`
  width: 100%;
  @media (max-width: 600px) {
    width: 294px;
    border-radius: 10px;
  }

  & .disable-btn {
    background-color: rgba(31, 55, 100, 0.5) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    cursor: not-allowed;
    @media (max-width: 767x) {
      border-radius: 10px;
      height: 40px;
    }
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
    @media (max-width: 600px) {
      border-radius: 10px;
      height: 40px;
    }

    .label {
      font-size: 18px;
      line-height: 21.48px;
      font-weight: 700;
      @media (max-width: 767px) {
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

const ContentModal = styled.div`
  .head-title {
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: space-between;
    font-family: SF UI Display;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    @media screen and (max-width: 768px) {
      font-size: 10px;
    }
    line-height: 126.5%;
    letter-spacing: 0.015em;
    text-transform: capitalize;
    color: ${({ theme }) => theme.text6};
    margin: 10px 0;
  }
  .available {
    cursor: pointer;
  }
  .detail-depo {
    & > div {
      padding: 15px 0;
      border-bottom: 1px solid ${({ theme }) => theme.border1};
    }
  }
`
const TextStake = styled.p`
  font-family: SF UI Display;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 126.5%;
  /* or 20px */
  margin-bottom: 0;
  display: flex;
  align-items: center;
  letter-spacing: 0.015em;
  text-transform: capitalize;
  color: ${({ theme }) => theme.text1};
  /* width: 45%; */
  span {
    margin-right: 8px;
  }
  @media screen and (max-width: 768px) {
    font-size: 12px;
    /* width: 43%; */
  }
`
const TextEarning = styled.p`
  font-family: SF UI Display;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 126.5%;
  /* or 20px */
  margin-bottom: 0;
  display: flex;
  letter-spacing: 0.015em;
  text-transform: capitalize;
  color: ${({ theme }) => theme.text1};
  /* width: 45%; */
  span {
    margin-right: 8px;
  }
  @media screen and (max-width: 768px) {
    font-size: 12px;
    /* width: 43%; */
  }
  svg {
    width: 15px;
    @media screen and (max-width: 768px) {
      width: 12px;
      margin-top: -1px;
    }
  }
`
const CountStake = styled.p`
  font-family: SF UI Display;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 126.5%;
  margin-bottom: 0;
  /* or 20px */

  display: flex;
  align-items: center;
  letter-spacing: 0.015em;
  text-transform: capitalize;
  color: ${({ theme }) => theme.text1};
  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
`
const PoolToken = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.bgBtn};
  border-radius: 10px;
  padding: 10px;
  img {
    width: 32px;
  }
  @media screen and (max-width: 768px) {
    padding: 13px 11px;
    width: 100%;
  }
  .coin-box {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 640px) {
      width: 40%;
    }

    .pool-tk {
      @media (min-width: 640px) {
        margin-left: 10px;
      }
      .pool-tt {
        color: ${({ theme }) => theme.text6};
        font-family: SF UI Display;
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 126.5%;
        /* or 20px */
        margin-bottom: 10px;
        letter-spacing: 0.015em;
        text-transform: capitalize;

        @media screen and (max-width: 768px) {
          font-size: 10px;
        }
      }
      .pool-vlue {
        white-space: nowrap;
        color: ${({ theme }) => theme.text1};
        font-family: SF UI Display;
        font-style: normal;
        font-weight: 600;
        font-size: 18px;
        line-height: 126.5%;
        /* identical to box height, or 23px */

        letter-spacing: 0.015em;
        text-transform: capitalize;
        @media screen and (max-width: 768px) {
          font-size: 14px;
        }
      }
    }
  }
  .count-tk {
    text-align: right;
    @media (max-width: 600px) {
      width: 35%;
    }
    .count-tt {
      color: ${({ theme }) => theme.text6};
      font-family: SF UI Display;
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 126.5%;
      margin-bottom: 10px;
      letter-spacing: 0.015em;
      text-transform: capitalize;
      margin-bottom: 10px;
      text-overflow: ellipsis;
      white-space: normal;
      overflow: hidden;
      @media screen and (max-width: 768px) {
        font-size: 10px;
      }
    }

    .count-input {
      input {
        width: 100%;
        color: ${({ theme }) => theme.text1};
        font-family: SF UI Display;
        font-style: normal;
        font-weight: 600;
        font-size: 18px;
        line-height: 126.5%;
        text-align: right;
        background-color: transparent;
        letter-spacing: 0.015em;
        text-transform: capitalize;
        @media screen and (max-width: 768px) {
          font-size: 14px;
        }
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type='number'] {
        -moz-appearance: textfield;
      }
    }
  }
  .coin-logo {
    > div > div {
      width: 35px !important;
      height: 35px !important;
    }
  }
`

const Table = styled.table`
  width: 100%;

  tr {
    border-bottom: 1px solid rgba(72, 110, 177, 0.15);

    td {
      padding: 15px 0;

      &:nth-child(n + 2) div {
        flex-grow: 1;
      }

      &:nth-child(3) div {
        text-align: right;
      }
    }
  }
`
