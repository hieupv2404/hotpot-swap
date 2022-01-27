import { BigNumber } from "ethers"

export const compareNumber = (exp, num1, num2) => {
  if (exp === "max") {
    return BigNumber.from(num1).gt(num2) ? num1 : num2;
  }
  if (exp === "min") {
    return BigNumber.from(num1).lt(num2) ? num1 : num2;
  }
}