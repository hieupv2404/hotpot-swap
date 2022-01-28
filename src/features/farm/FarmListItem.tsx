import { Disclosure } from '@headlessui/react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import BigNumber from 'bignumber.js'
import { formatEther, parseEther } from 'ethers/lib/utils'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import DoubleLogo from '../../components/DoubleLogo'
import NewTooltip from '../../components/NewTooltip'
import { MouseoverTooltip } from '../../components/Tooltip'
import { networkSupport } from '../../connectors'
import { MASTER_CHEF, MASTER_CHEF_V2, NATIVE_TOKEN_ADDRESS, HOTPOT_TOKEN } from '../../constants/addresses'
import { calculateGasMargin } from '../../functions'

import {
  useChainId,
  useFarmingContract,
  useFarmingContractV2,
  useLpTokenContract,
  useTokenContractWeb3,
} from '../../hooks'
import { useCurrencyDisconnect } from '../../hooks/TokensDisconnect'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useETHBalances, useWETHBalances } from '../../state/wallet/hooks'
import { convertToNumber } from '../../utils/convertNumber'
import { handleAdvancedDecimal, toFixed } from '../../utils/decimalAdjust'
import Deposit, { hotpotardData } from './deposit'
import { BLOCK_TIME, TOKEN_HOTPOT_PER_BLOCK } from './FarmList'
import WithDrawModal from './withDrawModal'
import { FarmTypeEnum } from '../../constants/farm-type'
import FarmsList from '../../constants/config/farms'
import { ChainId } from '@hotpot-swap/sdk'
import TransactionFailedModal from '../../modals/TransactionFailedModal'
import { ZERO_ADDRESS } from '../../constants/addresses'

export const ALLOWANCE_AMOUNT = 1000000000000000
export const GAS_LIMIT = 9000000
export const LP_WETH_HOTPOT = '0x38739ff518614fd2cd36f5b3a6e561faf7791dd1'

export const optionGasLimit = {
  gasLimit: GAS_LIMIT,
}

export const convertHexToDec = (hexVal: string, decimals: number) => {
  return parseInt(hexVal, 16) / Math.pow(10, decimals)
}

const REWARD_ALL_BLOCK_ENUM = {
  [ChainId.MAINNET]: 100,
  [ChainId.RINKEBY]: 100,
  [ChainId.BSC]: 40,
  [ChainId.BSC_TESTNET]: 40,
}

// (DAYS_PER_YEAR * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE) / DURATION_EACH_BLOCK
const BLOCK_PER_YEAR_ENUM = {
  [ChainId.MAINNET]: 2102400,
  [ChainId.RINKEBY]: 2102400,
  [ChainId.BSC]: 10512000,
  [ChainId.BSC_TESTNET]: 10512000,
}

const FarmListItem = ({ key, farm, farmLength }) => {
  const { i18n } = useLingui()
  const { account } = useActiveWeb3React()
  const { chainId } = useChainId()
  const [showReject, setShowReject] = useState<boolean>(false)
  const toggleWalletModal = useWalletModalToggle()

  const addTransaction = useTransactionAdder()

  const token0 = useCurrencyDisconnect(farm.pair.token.id || undefined)
  const token1 = useCurrencyDisconnect(farm.pair.quoteToken.id || undefined)
  const currencyLp = useCurrencyDisconnect(farm.lpTokenAddress[`${chainId}`])

  const [isOpenWithDraw, setIsOpenWithDraw] = useState(false) // fix lai flase sau
  const handleOpenWithDraw = () => {
    setIsOpenWithDraw(true)
  }

  const onDismissWithDraw = () => {
    setIsOpenWithDraw(false)
  }

  const [isOpenDeposit, setIsOpenDeposit] = useState(false)
  const [data, setData] = useState<any>({
    apyTken0: 0,
    apyTken1: 0,
    userStake: 0,
    rawUserStake: 0,
    token0Reward: 0,
    token1Reward: 0,
    apy: 0,
    hotpotReward: 0,
    apyTokenHotpot: 0,
    totalAmountReward: 0,
    hotpotTokenReward: 0,
  })

  const farmingContract = useFarmingContract()
  const farmingContractV2 = useFarmingContractV2()

  const lpTokenContract = useLpTokenContract(farm.lpTokenAddress)
  const tokenContract = useTokenContractWeb3(farm.pair.token.id)
  const quoteTokenContract = useTokenContractWeb3(farm.pair.quoteToken.id)
  const hotpotTokenContract = useTokenContractWeb3(HOTPOT_TOKEN[`${chainId}`])
  const lpTokenAddress = farm.lpTokenAddress[`${chainId}`]
  // export const LP_WETH_HOTPOT = '0x38739ff518614fd2cd36f5b3a6e561faf7791dd1'
  // farm.lpTokenAddress[`${chainId}`] = '0x38739ff518614fd2cd36f5b3a6e561faf7791dd1'
  // cach 1
  // const balanceNative = useWETHBalances([farm.lpTokenAddress[`${chainId}`]])[
  //   farm.lpTokenAddress[`${chainId}`]
  // ]?.toExact()
  // cach 2
  // console.log('LP_WETH_HOTPOT: ', LP_WETH_HOTPOT)
  // const balanceNative = useWETHBalances([LP_WETH_HOTPOT])[LP_WETH_HOTPOT]?.toExact()
  // cach 3
  // const balanceNative = useWETHBalances([lpTokenAddress])[
  //   lpTokenAddress
  // ]?.toExact()
  //cach 4
  const balanceNative = useWETHBalances(['0x38739FF518614Fd2CD36F5b3a6E561FAF7791dd1'])[
    '0x38739FF518614Fd2CD36F5b3a6E561FAF7791dd1'
  ]?.toExact()

  const handleOpenDeposit = () => {
    setIsOpenDeposit(true)
  }

  const onDismissDeposit = () => {
    setIsOpenDeposit(false)
  }

  const handleDismisReject = () => {
    setShowReject(false)
  }

  const fetchData = async () => {
    // console.log('1: ', farm.type === FarmTypeEnum.LP)
    // console.log('2: ', !balanceNative)
    // console.log('3: ', farm.pair.token.id === NATIVE_TOKEN_ADDRESS || farm.pair.quoteToken.id === NATIVE_TOKEN_ADDRESS)

    if (
      farm.type === FarmTypeEnum.LP &&
      !balanceNative &&
      (farm.pair.token.id === NATIVE_TOKEN_ADDRESS || farm.pair.quoteToken.id === NATIVE_TOKEN_ADDRESS)
    )
      return

    const [
      totalStake,
      userStake,
      apyTken0,
      apyTken1,
      apyTokenHotpot,
      token0RewardHex,
      token1RewardHex,
      lpTotalSupply,
      hotpotPrice,
    ] = await Promise.all([
      lpTokenContract.methods.balanceOf(farm.active ? MASTER_CHEF_V2[chainId] : MASTER_CHEF[chainId]).call() || 0,
      farm.active
        ? (account && farmingContractV2 && farmingContractV2.userInfo(farm.pid, account)) || 0
        : (account && farmingContract && farmingContract.userInfo(farm.pid, account)) || 0,
      getFarmAPYToken0(),
      getFarmAPYToken1(),
      getFarmAPYHotpot(),
      (farm.pair.token.earning &&
        account &&
        (farm.active
          ? farmingContractV2.pendingGift(farm.pid, account)
          : farmingContract.pendingGift(farm.pid, account))) ||
        0,
      (farm.pair.quoteToken.earning &&
        account &&
        (farm.active
          ? farmingContractV2.pendingGift(farm.pid, account)
          : farmingContract.pendingGift(farm.pid, account))) ||
        0,
      lpTokenContract.methods.totalSupply().call() || 0,
      0,
    ])

    const checkClaim = 0

    const hotpotRewardHex = account
      ? farm.active && farm.hotpotEarning
        ? await (farmingContractV2.pendingHotpot(farm.pid, account) || 0)
        : !checkClaim
        ? await (farmingContract.pendingHotpot(farm.pid, account) || 0)
        : 0
      : 0

    const totalStakedForFarmToken = farm.active ? farmingContractV2 && (await farmingContractV2.totalHotpotStaked()) : 0

    const poolTotalUSD = 0
    const tokenPrice = 0
    const quoteTokenPrice = 0
    const lpPrice =
      new BigNumber(poolTotalUSD).div(convertToNumber(lpTotalSupply, farm.lpTokenAddress.decimals)).toNumber() || 0

    const hotpotReward = new BigNumber(convertToNumber(hotpotRewardHex, 18)).times(hotpotPrice).toNumber() || 0
    const token0Reward = new BigNumber(convertToNumber(token0RewardHex, farm.pair.token.decimals)).toNumber()
    const token0RewardUsd =
      new BigNumber(convertToNumber(token0RewardHex, farm.pair.token.decimals)).times(tokenPrice).toNumber() || 0
    const token1Reward = new BigNumber(convertToNumber(token1RewardHex, farm.pair.quoteToken.decimals)).toNumber()
    const token1RewardUsd =
      new BigNumber(convertToNumber(token1RewardHex, farm.pair.quoteToken.decimals))
        .times(quoteTokenPrice)
        .toNumber() || 0
    const apy = apyTken0 + apyTken1 + apyTokenHotpot

    let totalAmountReward = 0,
      remainingReward = 0
    if (farm.pair.token.limitedAmount !== undefined) {
      const limitedAmount = farm.pair.token.limitedAmount
      totalAmountReward = new BigNumber(limitedAmount).times(tokenPrice).toNumber()
      const now = new Date().getTime()
      remainingReward = new BigNumber(((farm.endDateInMilis - now) * limitedAmount) / farm.duration)
        .times(tokenPrice)
        .toNumber()
    }

    if (farm.pair.quoteToken.limitedAmount !== undefined) {
      const limitedAmount = farm.pair.quoteToken.limitedAmount
      totalAmountReward = new BigNumber(limitedAmount).times(quoteTokenPrice).toNumber()
      const now = new Date().getTime()
      remainingReward = new BigNumber(((farm.endDateInMilis - now) * limitedAmount) / farm.duration)
        .times(quoteTokenPrice)
        .toNumber()
    }
    const tokenPriceUSD = 0
    const totalStakeForFarmToken =
      farm.type === FarmTypeEnum.TOKEN &&
      new BigNumber(convertToNumber(totalStakedForFarmToken, farm.pair.token.decimals)).toNumber()
    const yourStakeForFarmToken =
      new BigNumber(convertToNumber(userStake?.amount, farm.pair.token.decimals)).toNumber() || 0

    let tokenFarmAPY = 0

    if (farm.type === FarmTypeEnum.TOKEN) {
      const rewardAllBlock = farm.active
        ? farmingContractV2 && (await farmingContractV2.hotpotPerBlock())
        : farmingContract && (await farmingContract.hotpotPerBlock())
      const blockPerYear = BLOCK_PER_YEAR_ENUM[chainId]
      const rewardPerBlock = convertToNumber(rewardAllBlock, farm.pair.token.decimals) / farmLength
      tokenFarmAPY =
        Number(totalStakedForFarmToken) === 0
          ? 0
          : (rewardPerBlock * blockPerYear * 100) / convertToNumber(totalStakedForFarmToken, farm.pair.token.decimals)
    }

    setData({
      ...data,
      totalStake:
        farm.type === FarmTypeEnum.TOKEN
          ? totalStakeForFarmToken
          : new BigNumber(convertToNumber(totalStake, farm.lpTokenAddress.decimals)).toNumber() || 0,
      userStake:
        farm.type === FarmTypeEnum.TOKEN
          ? yourStakeForFarmToken
          : new BigNumber(convertToNumber(userStake?.amount, farm.lpTokenAddress.decimals)).toNumber() || 0,
      rawUserStake: userStake ? formatEther(userStake?.amount) : 0,
      lpPrice,
      token0Reward,
      token0RewardUsd,
      apyTken0,
      apyTken1,
      apyTokenHotpot,
      token1Reward,
      token1RewardUsd,
      apy,
      hotpotReward,
      totalAmountReward,
      remainingReward,
      hotpotTokenReward: new BigNumber(convertToNumber(hotpotRewardHex, 18)).toNumber(),
      tokenPriceUSD,
      tokenFarmAPY,
      checkClaim,
    })
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [account, balanceNative])

  const getLpTokenPerYear = () => {
    if (networkSupport.supportedChainIds.includes(chainId)) {
      const blockPerYear = new BigNumber((60 / BLOCK_TIME[chainId]) * 60 * 24 * 365)
      return blockPerYear.times(TOKEN_HOTPOT_PER_BLOCK[chainId])
    } else return 0
  }

  const getFarmAPYHotpot = async () => {
    try {
      let hotpotPerYear = farm.hotpotEarning ? new BigNumber(getLpTokenPerYear()) : new BigNumber(0)
      let apyTokenHotpot = farm.hotpotEarning ? await getApyForToken(HOTPOT_TOKEN[`${chainId}`], hotpotPerYear) : 0

      return apyTokenHotpot
    } catch (e) {
      return 0
    }
  }

  const getFarmAPYToken1 = async () => {
    let token1PerYear =
      farm.pair.quoteToken.tokenPerYear != 0 && farm.pair.quoteToken.tokenPerYear !== undefined
        ? new BigNumber(farm.pair.quoteToken.tokenPerYear)
        : new BigNumber(getLpTokenPerYear())
    let apyQuoteToken = farm.pair.quoteToken.earning ? await getApyForToken(farm.pair.quoteToken.id, token1PerYear) : 0
    return apyQuoteToken
  }

  const getFarmAPYToken0 = async () => {
    let token0PerYear =
      farm.pair.token.tokenPerYear != 0 && farm.pair.token.tokenPerYear !== undefined
        ? new BigNumber(farm.pair.token.tokenPerYear)
        : new BigNumber(getLpTokenPerYear())
    let apyToken = farm.pair.token.earning ? await getApyForToken(farm.pair.token.id, token0PerYear) : 0
    return apyToken
  }

  const getApyForToken = useCallback(
    async (token: string, tokenPerYear: BigNumber) => {
      let [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceSR, lpTotalSupply, farmInfo, totalAllocPoint] =
        await Promise.all([
          token === farm.pair.quoteToken.id
            ? quoteTokenContract.methods.balanceOf(farm.lpTokenAddress[`${chainId}`]).call()
            : token0?.isNative
            ? balanceNative
            : tokenContract.methods.balanceOf(farm.lpTokenAddress[`${chainId}`]).call(),
          farm.pair.quoteToken.id === NATIVE_TOKEN_ADDRESS
            ? balanceNative
            : quoteTokenContract.methods.balanceOf(farm.lpTokenAddress[`${chainId}`]).call(),
          lpTokenContract.methods.balanceOf(farm.active ? MASTER_CHEF_V2[chainId] : MASTER_CHEF[chainId]).call(),
          lpTokenContract.methods.totalSupply().call(),
          farm.active ? farmingContractV2.farmInfo(farm.pid) : farmingContract.farmInfo(farm.pid),
          farm.active ? farmingContractV2.totalAllocPoint() : farmingContract.totalAllocPoint(),
        ])
      if (
        token == HOTPOT_TOKEN[chainId] &&
        farm.pair.token.id != HOTPOT_TOKEN[chainId] &&
        farm.pair.quoteToken.id != HOTPOT_TOKEN[chainId]
      ) {
        const [hotpotInLp, quoteInLp] = await Promise.all([
          hotpotTokenContract.options.address &&
            hotpotTokenContract.methods.balanceOf(farm?.lpAddressHotpotVsQuote[`${chainId}`]).call(),
          quoteTokenContract.options.address && farm.pair.quoteToken.id === NATIVE_TOKEN_ADDRESS
            ? useWETHBalances([farm?.lpAddressHotpotVsQuote[`${chainId}`]])[
                farm?.lpAddressHotpotVsQuote[`${chainId}`]
              ]?.toExact()
            : quoteTokenContract.methods.balanceOf(farm?.lpAddressHotpotVsQuote[`${chainId}`]).call(),
        ])
        tokenBalanceLP = toFixed(
          Number(
            new BigNumber(convertToNumber(quoteTokenBalanceLP, farm.pair.quoteToken.decimals))
              .times(convertToNumber(hotpotInLp, 18))
              .div(convertToNumber(quoteInLp, farm.pair.quoteToken.decimals))
          )
        )
      } else {
        tokenBalanceLP = convertToNumber(tokenBalanceLP, farm.lpTokenAddress.decimals)
      }

      const lpTokenRatio = new BigNumber(lpTokenBalanceSR ? lpTokenBalanceSR : 0).div(
        lpTotalSupply ? new BigNumber(lpTotalSupply) : 0
      )
      const lpTotalInQuoteToken = new BigNumber(quoteTokenBalanceLP)
        // .div(new BigNumber(10).pow(18))
        .times(new BigNumber(2))
        .times(lpTokenRatio)
      const tokenAmount = new BigNumber(tokenBalanceLP ? tokenBalanceLP : 0)
        // .div(new BigNumber(10).pow(farm.pair.token.decimals))
        .times(lpTokenRatio)
      const quoteTokenAmount = new BigNumber(quoteTokenBalanceLP ? quoteTokenBalanceLP : 0)
        // .div(new BigNumber(10).pow(farm.pair.quoteToken.decimals))
        .times(lpTokenRatio)
      const tokenPriceVsQuote = tokenAmount.toNumber()
        ? new BigNumber(quoteTokenAmount).div(tokenAmount)
        : new BigNumber(0)
      // const tokenPriceVsQuote = new BigNumber(quoteTokenAmount).div(tokenAmount);

      // sdcPriceInQuote * sdcRewardPerYearAllocation / lpTotalInQuoteToken
      const yearlyHOTPOTRewardAllocation = new BigNumber(farmInfo.allocPoint.toString())
        .times(tokenPerYear.toNumber())
        .div(new BigNumber(totalAllocPoint.toString()))
      const apy = tokenPriceVsQuote.times(yearlyHOTPOTRewardAllocation).div(lpTotalInQuoteToken).times(100)
      const resultApy = !apy.isNaN() ? apy : new BigNumber(0)
      return resultApy.toNumber()
    },
    [balanceNative]
  )

  const handleDeposit = async (val: number) => {
    setIsOpenDeposit(false)
    const estimate = farmingContractV2.estimateGas.stake
    const method = farmingContractV2.stake
    const args = [farm.pid, parseEther(val.toString())]
    await estimate(...args)
      .then((estimatedGasLimit) =>
        method(...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          addTransaction(response, {
            summary: `Deposit ${val} ${
              farm.type === FarmTypeEnum.LP
                ? `LP-${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
                : 'Token Hotpot'
            }`,
          })
        })
      )
      .catch((error) => {
        // we only care if the error is something _other_ than the user rejected the tx
        setShowReject(true)
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const handleWithdraw = async (val: any) => {
    setIsOpenWithDraw(false)
    const estimate = farmingContractV2.estimateGas.withdraw
    const method = farmingContractV2.withdraw
    const args = [farm.pid, parseEther(val.toString())]

    await estimate(...args)
      .then((estimatedGasLimit) =>
        method(...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          addTransaction(response, {
            summary: `Withdraw ${val} ${
              farm.type === FarmTypeEnum.LP
                ? `LP-${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
                : 'Token Hotpot'
            } and claim`,
          })
        })
      )
      .catch((error) => {
        setShowReject(true)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const handleEmergencyWithdraw = async () => {
    const estimate = farmingContract.estimateGas.emergencyWithdraw
    const method = farmingContract.emergencyWithdraw
    const args = [farm.pid]

    await estimate(...args)
      .then((estimatedGasLimit) =>
        method(...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          addTransaction(response, {
            summary: `Withdraw all ${
              farm.type === FarmTypeEnum.LP
                ? `LP-${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
                : 'Token Hotpot'
            }`,
          })
        })
      )
      .catch((error) => {
        setShowReject(true)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const handleClaim = async () => {
    const estimate = farm.active ? farmingContractV2.estimateGas.stake : farmingContractV2.estimateGas.claimOldHotpot
    const method = farm.active ? farmingContractV2.stake : farmingContractV2.claimOldHotpot
    const args = farm.active ? [farm.pid, new BigNumber(0).times(new BigNumber(10).pow(18)).toString()] : [farm.pid]

    await estimate(...args)
      .then((estimatedGasLimit) =>
        method(...args, {
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          addTransaction(response, {
            summary: `Claim ${farm.hotpotEarning ? 'HOTPOT' : ''} ${
              farm.hotpotEarning
                ? farm.pair.token.earning
                  ? '-' + farm.pair.token.symbol
                  : ''
                : farm.pair.token.earning
                ? farm.pair.token.symbol
                : ''
            } ${
              farm.hotpotEarning
                ? farm.pair.quoteToken.earning
                  ? '-' + farm.pair.quoteToken.symbol
                  : ''
                : farm.pair.quoteToken.earning
                ? farm.pair.quoteToken.symbol
                : ''
            }`,
          })
        })
      )
      .catch((error) => {
        setShowReject(true)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const dataTotalSkate = data?.totalStake || 0
  const dataApyTken0 = data?.apyTken0 || 0
  const dataApyTken1 = data?.apyTken1 || 0
  const dataApyTokenHotpot = data?.apyTokenHotpot || 0

  const handleToFixedDataTip = (value, numberFix) => {
    let valueStr = value !== undefined || value !== 'undefined' ? String(value) : '0'
    let valueNum = value !== undefined || value !== 'undefined' ? Number(value) : 0
    if (valueNum % 1 == 0) {
      return valueStr
    } else if (
      valueNum === 0 ||
      valueStr === '0' ||
      (Number(value) < 0.0000000001 && Math.round(Number(value)) === 0)
    ) {
      return 0
    }
    return valueNum.toFixed(numberFix)
  }
  const handleFarmingAPYDecimal = (value) => {
    let valueStr = value !== undefined || value !== 'undefined' ? String(value) : '0'
    let valueNum = value !== undefined || value !== 'undefined' ? Number(value) : 0
    if (valueNum % 1 == 0) {
      return valueStr
    } else {
      let dotIndex = valueStr.indexOf('.')
      let intergerValue = valueStr.substring(0, dotIndex)
      let decimalValue = valueStr.substring(dotIndex + 1)
      return intergerValue + '.' + decimalValue.substring(0, 2)
    }
  }

  let totalDataAPY = `<p></p><p></p>${
    dataApyTken0 !== 0 ? `<div>${dataApyTken0.toFixed(2)}%  - ${farm.pair.token.symbol} Farming APY</div>` : ''
  }${
    dataApyTken1 !== 0
      ? `<div>${handleFarmingAPYDecimal(dataApyTken1)}% - ${farm.pair.quoteToken.symbol} Farming APY</div>`
      : ''
  }${
    dataApyTokenHotpot !== 0 ? `<div>${handleFarmingAPYDecimal(dataApyTokenHotpot)}% - HOTPOT Farming APY</div>` : '0%'
  }`
  const timeNow = new Date().getTime()

  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <FarmItem>
            <div className="text-left select-none text-primary text-sm md:text-lg item-list">
              <div className="item-total">
                <div className="flex flex-col justify-center">
                  <TextTotal>{i18n._(t`Total Staked`)}</TextTotal>
                  <NumberTotal>
                    <NewTooltip
                      dataTip={handleToFixedDataTip(dataTotalSkate, 2)}
                      dataValue={handleAdvancedDecimal(toFixed(dataTotalSkate), 6)}
                    />
                  </NumberTotal>
                </div>
                <div className="flex flex-col text-right">
                  <TextTotal>{i18n._(t`Farming APY`)}</TextTotal>
                  <NumberTotal className="text-right">
                    <NewTooltip
                      dataTip={farm.type === FarmTypeEnum.TOKEN ? `${data.tokenFarmAPY || 0}%` : totalDataAPY}
                      dataValue={
                        farm.type === FarmTypeEnum.TOKEN
                          ? `${handleAdvancedDecimal(data.tokenFarmAPY || 0, 6)}%`
                          : `${handleAdvancedDecimal(dataApyTken0 + dataApyTken1 + dataApyTokenHotpot, 6)}%`
                      }
                    />
                  </NumberTotal>
                  <div></div>
                </div>
              </div>
              <div className="tit-token">
                <DoubleLogo farmType={farm.type} currency0={token0} currency1={token1} size={40} />
                <div className="flex flex-col justify-center">
                  <div className="font-bold title-token py-3.5">
                    {`${i18n._(t`Deposit`)} 
                    ${
                      farm.type === FarmTypeEnum.TOKEN
                        ? 'HOTPOT'
                        : farm.type === FarmTypeEnum.NFT
                        ? 'NFTs'
                        : `${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
                    }
                    ${i18n._(t`to earn`)} ${farm.hotpotEarning ? 'HOTPOT' : ''}
                    ${
                      farm.hotpotEarning
                        ? farm.pair.token.earning
                          ? i18n._(t`and`) + farm.pair.token.symbol
                          : farm.pair.quoteToken.earning
                          ? i18n._(t`and`) + ' ' + farm.pair.quoteToken.symbol
                          : ''
                        : farm.pair.token.earning
                        ? farm.pair.token.symbol
                        : farm.pair.quoteToken.earning
                        ? farm.pair.quoteToken.symbol
                        : ''
                    }`}
                  </div>
                  <div className="w-full flex justify-center">
                    {farm.active ? (
                      <StatusCard>
                        {`${i18n._(t`Active`)}
                          ${
                            (farm.hotpotEarning && !farm.pair.token.earning && !farm.pair.quoteToken.earning) ||
                            (!farm.singleFarm && farm.endDate < timeNow)
                              ? i18n._(t`For HOTPOT Only`)
                              : ''
                          }
                          ${
                            !farm.hotpotEarning && farm.pair.token.earning && !farm.pair.quoteToken.earning
                              ? i18n._(t`For `) + farm.pair.token.symbol + i18n._(t` Only`)
                              : ''
                          }
                          ${
                            !farm.hotpotEarning && !farm.pair.token.earning && farm.pair.quoteToken.earning
                              ? i18n._(t`For `) + farm.pair.quoteToken.symbol + i18n._(t` Only`)
                              : ''
                          }
                        `}
                      </StatusCard>
                    ) : (
                      <StatusCard>{i18n._(t`Ended`)}</StatusCard>
                    )}
                  </div>
                </div>
              </div>
              <BoxContent>
                <div>
                  {farm.active && farm.endDate !== 0 ? (
                    <div className="flex justify-between items-center py-1">
                      <TextStart>{i18n._(t`Start date`)}</TextStart>
                      <StartDate>{`${moment(farm.startDate).format('DD MMM YYYY HH:mm:ss')}`}</StartDate>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                <div>
                  {farm.endDate !== 0 ? (
                    farm.active ? (
                      <div className="flex justify-between items-center py-1">
                        <TextStart>{i18n._(t`End date`)}</TextStart>
                        <StartDate>{`${moment(farm.endDate).format('DD MMM YYYY HH:mm:ss')}`}</StartDate>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-1">
                        <TextStart>{i18n._(t`Ended at`)}</TextStart>
                        <StartDate>{`${moment(farm.endDate).format('DD MMM YYYY HH:mm:ss')}`}</StartDate>
                      </div>
                    )
                  ) : (
                    ''
                  )}
                </div>
                <div className="flex justify-between items-center py-1">
                  <TextStake>{i18n._(t`Your stake`)}</TextStake>
                  <CountStake>
                    <NewTooltip
                      dataValue={handleAdvancedDecimal(hotpotardData(data.userStake), 10)}
                      dataTip={` ${handleToFixedDataTip(hotpotardData(data.userStake), 10)}`}
                    />
                  </CountStake>
                </div>
                {farm.hotpotEarning && (
                  <div className="flex justify-between py-1 items-center">
                    <TextStake>{i18n._(t`HOTPOT reward `)}</TextStake>
                    <CountStake>
                      {/* ${hotpotardData(data?.token0Reward?.toFixed(2))} */}
                      <NewTooltip
                        dataValue={handleAdvancedDecimal(hotpotardData(data?.hotpotTokenReward), 10)}
                        dataTip={` ${handleToFixedDataTip(hotpotardData(data?.hotpotTokenReward), 10)}`}
                      />
                    </CountStake>
                  </div>
                )}
                {farm.pair.token.earning && (
                  <>
                    <div className="flex justify-between py-1 items-center">
                      <TextStake>
                        {farm.pair.token.symbol} {i18n._(t`reward`)}
                      </TextStake>
                      <CountStake>
                        <NewTooltip
                          dataTip={'$' + handleToFixedDataTip(hotpotardData(data?.token0RewardUsd), 10)}
                          dataValue={` $${handleAdvancedDecimal(hotpotardData(data?.token0RewardUsd), 10)}`}
                        />
                      </CountStake>
                    </div>
                    <div className="flex justify-between py-1 items-center">
                      <TextStake>
                        {farm.pair.quoteToken.symbol} {i18n._(t`reward`)}
                      </TextStake>
                      <CountStake>
                        <NewTooltip
                          dataTip={handleToFixedDataTip(hotpotardData(data?.token0Reward), 10)}
                          dataValue={` ${handleAdvancedDecimal(hotpotardData(data?.token0Reward), 10)}`}
                        />
                      </CountStake>
                    </div>
                  </>
                )}
                {farm.pair.quoteToken.earning && (
                  <>
                    <div className="flex justify-between py-1 items-center">
                      <TextStake>
                        {farm.pair.quoteToken.symbol} {i18n._(t`reward`)} ($)
                      </TextStake>
                      <CountStake>
                        {/* ${hotpotardData(data?.token0Reward?.toFixed(2))} */}
                        <NewTooltip
                          dataValue={'$' + handleAdvancedDecimal(hotpotardData(data?.token1RewardUsd), 10)}
                          dataTip={` $${handleToFixedDataTip(hotpotardData(data?.token1RewardUsd), 10)}`}
                        />
                      </CountStake>
                    </div>
                    <div className="flex justify-between py-1 items-center">
                      <TextStake>
                        {farm.pair.quoteToken.symbol} {i18n._(t`reward`)}
                      </TextStake>
                      <CountStake>
                        <NewTooltip
                          dataTip={handleToFixedDataTip(hotpotardData(data?.token1Reward), 10)}
                          dataValue={` ${handleAdvancedDecimal(hotpotardData(data?.token1Reward), 10)}`}
                        />
                      </CountStake>
                    </div>
                  </>
                )}
                {(farm.pair.token.limitedAmount !== undefined || farm.pair.quoteToken.limitedAmount !== undefined) && (
                  <div className="flex justify-between py-1 items-center">
                    <TextStake>
                      {i18n._(t`Total reward`)} {farm.pair.token.symbol}
                    </TextStake>
                    <CountStake>
                      <NewTooltip
                        dataTip={'$' + handleToFixedDataTip(data?.totalAmountReward, 10)}
                        dataValue={` $${handleAdvancedDecimal(hotpotardData(data?.totalAmountReward), 10)}`}
                      />
                    </CountStake>
                  </div>
                )}
                {(farm.pair.token.limitedAmount !== undefined || farm.pair.quoteToken.limitedAmount !== undefined) && (
                  <div className="flex justify-between py-1 items-center">
                    <TextStake>
                      {i18n._(t`Remain reward`)}{' '}
                      {farm.pair.token.limitedAmount !== undefined ? farm.pair.token.symbol : farm.pair.token.symbol}
                    </TextStake>
                    <CountStake>
                      <NewTooltip
                        dataTip={'$' + handleToFixedDataTip(hotpotardData(data?.remainingReward), 10)}
                        dataValue={` $${handleAdvancedDecimal(hotpotardData(data?.remainingReward), 10)}`}
                      />
                    </CountStake>
                  </div>
                )}
                {!account ? (
                  <ButtonConnect onClick={toggleWalletModal}>{i18n._(t`Connect wallet`)}</ButtonConnect>
                ) : (
                  <div>
                    <div className="flex flex-row items-center btn-container">
                      <button
                        disabled={!farm.active}
                        className={`bg-gradient-to-r from-blue to-pink btn-primary1 ${!farm.active && 'disable-btn'}`}
                        onClick={handleOpenDeposit}
                      >
                        <div className="label">{i18n._(t`Deposit`)}</div>
                        <div className="desc">
                          {farm.type === FarmTypeEnum.TOKEN
                            ? 'HOTPOT'
                            : farm.type === FarmTypeEnum.NFT
                            ? 'NFT'
                            : `hotpotLP-${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`}
                        </div>
                      </button>
                      {isOpenDeposit && (
                        <Deposit
                          farm={farm}
                          userStake={data.userStake}
                          apy={farm.type === FarmTypeEnum.TOKEN ? data.tokenFarmAPY : data?.apyTokenHotpot}
                          lpPrice={data.lpPrice}
                          isOpenDeposit={isOpenDeposit}
                          currencies={{ token0, token1, currencyLp }}
                          onDismissDeposit={onDismissDeposit}
                          onDeposit={handleDeposit}
                          context={{ chainId, account }}
                          tokenPriceUSD={data.tokenPriceUSD}
                          farmType={farm.type}
                        />
                      )}
                      <button
                        className={`bg-gradient-to-r from-blue to-pink btn-primary1 ${
                          ((data.hotpotTokenReward === 0 && data.token0Reward === 0 && data.token1Reward === 0) ||
                            (!farm.isActive && data.checkClaim)) &&
                          'disable-btn'
                        } `}
                        disabled={
                          (!farm.isActive && data.checkClaim) ||
                          (data.hotpotTokenReward === 0 && data.token0Reward === 0 && data.token1Reward === 0)
                        }
                        onClick={handleClaim}
                      >
                        <div className="label">{i18n._(t`Claim`)}</div>
                        <div className="desc">
                          {`${farm.hotpotEarning ? 'HOTPOT' : ''}
                              ${
                                farm.pair.token.earning
                                  ? data.token0Reward === 0 && data.hotpotTokenReward !== 0
                                    ? ''
                                    : i18n._(t`and`) + ' ' + farm.pair.token.symbol
                                  : ''
                              }
                              ${
                                farm.pair.quoteToken.earning
                                  ? data.token1Reward === 0 && data.hotpotTokenReward !== 0
                                    ? ''
                                    : i18n._(t`and`) + ' ' + farm.pair.quoteToken.symbol
                                  : ''
                              } ${i18n._(t`reward`)}`}
                        </div>
                      </button>
                    </div>
                    <div className="flex flex-row items-center btn-container mb-36">
                      <button
                        className={`bg-gradient-to-r from-blue to-pink btn-primary1 ${
                          (data.userStake === 0 || (!farm.active && !data.checkClaim)) && 'disable-btn'
                        } `}
                        disabled={(!farm.active && !data.checkClaim) || data.userStake === 0}
                        onClick={farm.active ? handleOpenWithDraw : handleEmergencyWithdraw}
                      >
                        <div className="label capitalize">
                          {farm.active ? i18n._(t`Withdraw and Claim`) : 'Withdraw'}
                          {`${
                            farm.type === FarmTypeEnum.TOKEN ? ' HOTPOT' : farm.type === FarmTypeEnum.NFT ? ' NFT' : ''
                          }`}
                        </div>
                        <div className="desc">
                          {farm.type !== FarmTypeEnum.TOKEN && farm.type !== FarmTypeEnum.NFT
                            ? `hotpotLP-${farm.pair.token.symbol}-${farm.pair.quoteToken.symbol}`
                            : ''}
                        </div>
                      </button>
                      {isOpenWithDraw && (
                        <WithDrawModal
                          userStake={data.rawUserStake}
                          onWithdraw={handleWithdraw}
                          lpPrice={data.lpPrice}
                          depositSymbol={farm.depositSymbol}
                          isOpenWithDraw={isOpenWithDraw}
                          onDismissWithDraw={onDismissWithDraw}
                          farm={farm}
                          size={48}
                          tokenPriceUSD={data.tokenPriceUSD}
                          farmType={farm.type}
                        />
                      )}
                    </div>
                  </div>
                )}
              </BoxContent>
            </div>
          </FarmItem>

          {showReject && <TransactionFailedModal isOpen={showReject} onDismiss={handleDismisReject} />}
        </>
      )}
    </Disclosure>
  )
}
export default FarmListItem
const MouseoverTooltipNumber = styled(MouseoverTooltip)`
  .style-number {
    font-weight: 600;
    text-align: right;
    font-size: 16px;
    letter-spacing: 0.015em;
    text-transform: capitalize;
    color: ${({ theme }) => theme.textTotal};
    @media screen and (max-width: 768px) {
      font-size: 14px;
    }
  }
`
const FarmItem = styled.div`
  width: 300px;
  margin-bottom: 40px;

  & .item-list {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.borderColor};
    box-sizing: border-box;
    box-shadow: 0px 4px 30px ${({ theme }) => theme.shadowColor};
    border-radius: 20px;
  }

  & .tit-token {
    padding: 30px 46px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: -50px;
    @media screen and (max-width: 768px) {
      padding: 30px 20px;
    }
  }

  & .title-token {
    font-weight: 600;
    font-size: 16px;
    line-height: 126.5%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    letter-spacing: 0.015em;
    color: ${({ theme }) => theme.titleToken};
    @media screen and (max-width: 768px) {
      font-size: 14px;
    }
  }

  & .item-total {
    display: flex;
    justify-content: space-between;
    background: linear-gradient(89.89deg, #243329 0.15%, #1e2539 99.97%);
    padding: 27px 29px;
    border-radius: 20px 20px 0px 0px;
    @media screen and (max-width: 768px) {
      padding: 18px 21px;
    }
  }

  & .disable-btn {
    background-color: rgba(31, 55, 100, 0.5) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    cursor: not-allowed;
  }

  .btn-container {
    margin-left: -10px;
    margin-right: -10px;
  }

  .mb-36 {
    margin-bottom: 36px;
  }

  .btn-primary1 {
    margin-top: 20px;
    margin-left: 10px;
    margin-right: 10px;
    background: ${({ theme }) => theme.greenButton};
    border-radius: 15px;
    color: ${({ theme }) => theme.white};
    min-height: 63px;
    width: 100%;
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;

    .label {
      font-size: 18px;
      line-height: 21.48px;
      font-weight: 700;
      @media screen and (max-width: 768px) {
        font-size: 14px;
      }
    }

    .desc {
      font-size: 12px;
      line-height: 14.32px;
      font-weight: 600;
      @media screen and (max-width: 768px) {
        font-size: 10px;
      }
    }
    @media screen and (max-width: 768px) {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
`
const StatusCard = styled.p`
  background: rgba(0, 116, 223, 0.2);
  color: $rgb(0, 116, 223);
  border-radius: 30px;
  padding: 7px 15px;
  font-weight: 600;
  font-size: 14px;
  align-item: center;
  display: flex;
  justify-content: center;
  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
`
const TextTotal = styled.p`
  color: ${({ theme }) => theme.textTotal};
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.015em;
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
  text-transform: capitalize;
`
const NumberTotal = styled.div`
  font-weight: 600;

  font-size: 16px;
  letter-spacing: 0.015em;
  text-transform: capitalize;
  color: ${({ theme }) => theme.textTotal};
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
`
const TextStart = styled.p`
  font-weight: 500;
  font-size: 16px;
  line-height: 126.5%;
  letter-spacing: 0.015em;
  color: ${({ theme }) => theme.colorDate};
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
  margin: 0;
`
const StartDate = styled.p`
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.015em;
  color: ${({ theme }) => theme.colorStart};
  margin: 0;
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
`
const BoxContent = styled.div`
  padding: 0 29px;
  @media screen and (max-width: 768px) {
    padding: 0 20px;
  }
`
const TextStake = styled.p`
  font-weight: 500;
  font-size: 16px;
  line-height: 126.5%;
  letter-spacing: 0.015em;
  color: ${({ theme }) => theme.colorDate};
  margin: 0;
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
`
const CountStake = styled.p`
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.015em;
  color: ${({ theme }) => theme.colorStart};
  margin: 0;
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
`
const ButtonConnect = styled.button`
  background: ${({ theme }) => theme.greenButton};
  border-radius: 15px;
  color: ${({ theme }) => theme.white};
  min-height: 63px;
  width: 100%;
  font-family: SF UI Display;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 17px;
  margin: 10px 0 36px;

  @media screen and (max-width: 768px) {
    font-size: 14px;
    margin: 10px 0 27px;
  }
`
