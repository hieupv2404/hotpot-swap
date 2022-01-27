import { BigNumber } from "ethers";
export const convertToNumber = (value, decimal: number) => {
  return value / (10 ** decimal);
}

export const convertToDecimals = (value, decimal: number) => {
  return Number(value) * (10 ** decimal)
}

export const convertToNumberBigNumber = (value, decimal: number) => {
  const i = BigNumber.from(value).div(BigNumber.from(10).pow(decimal));
  const d = BigNumber.from(value).mod(BigNumber.from(10).pow(decimal));
  return `${i}.${d}`;
}