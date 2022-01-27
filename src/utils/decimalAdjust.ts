import { i18n } from "@lingui/core";
import { t } from "@lingui/macro";
import { isMobile } from "react-device-detect";

export function decimalAdjust(type, value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

export function formatNumber(value, exp) {
  if (value && value.includes(".")) {
    const numString = value.toString().split('.');
    if (numString[1].length > exp) return;
  }
  return value;
}

export const scientificToDecimal = (num) => {
  const nsign = Math.sign(num);
  //remove the sign
  num = Math.abs(num);
  //if the number is in scientific notation remove it
  if (/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    const zero = '0';
    const parts = String(num).toLowerCase().split('e'); //split into coeff and exponent
    const e = parts.pop(); //store the exponential part
    let l = Math.abs(+e); //get the number of zeros
    const sign = +e / l;
    const coeff_array = parts[0].split('.');
    if (sign === -1) {
      l = l - coeff_array[0].length;
      if (l < 0) {
        num = coeff_array[0].slice(0, l) + '.' + coeff_array[0].slice(l) + (coeff_array.length === 2 ? coeff_array[1] : '');
      }
      else {
        num = zero + '.' + new Array(l + 1).join(zero) + coeff_array.join('');
      }
    }
    else {
      let dec = coeff_array[1];
      if (dec?.length > 8) return;
      if (dec)
        l = l - dec.length;
      if (l < 0) {
        num = coeff_array[0] + dec.slice(0, l) + '.' + dec.slice(l);
      } else {
        num = coeff_array.join('') + new Array(l + 1).join(zero);
      }
    }
  }

  return nsign < 0 ? '-' + num : num;
};

export const toFixed = (x) => {
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split('e-')[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += (new Array(e + 1)).join('0');
    }
  }
  return x;
}
export const handleAdvancedDecimal = (value, lengthInterger) => {
 
  let newLengthInterger = lengthInterger ? lengthInterger : 0;
  let valueStr = (value !== undefined || value !== 'undefined') ? String(value) : '0';
  let valueNum = (value !== undefined || value !== 'undefined') ? Number(value) : 0;
  if (value === Infinity) {
    return i18n._(t`Infinity`)
  }
  else if (valueNum % 1 == 0) {
    if (isMobile) {
      return (valueStr.length > 2) ? (valueStr.substring(0, 2) + '... ') : valueNum;
    }
    return (valueStr.length > 10) ? (valueStr.substring(0, 10) + '... ') : valueNum;
  } else if(Number(value) < 0.00000001 ){
    return Number(value)!== 0 ? '0.00...' : 0
  }
  else {
    let dotIndex = valueStr.indexOf('.');
    let intergerValue = valueStr.substring(0, dotIndex);
    let decimalValue = valueStr.substring(dotIndex + 1);
    if (intergerValue.length > lengthInterger) {
      let newValueStr = valueStr.substring(0, lengthInterger) + '... ';
      return newValueStr;
    }
    return intergerValue + '.' + decimalValue.substring(0, 2) + '... ';
  }
}

export const toFixedNumber = (number: number, fixedNumber: number) => {
  if (!number || isNaN(number)) {
    return 0;
  }

  if (number % 1 == 0) {
    return number;
  }

  const numberStr = String(number);
  const dotIndex = numberStr.indexOf('.');
  const decimalLength = numberStr.substring(dotIndex + 1).length;

  return decimalLength > fixedNumber
    ? `${numberStr.substring(0, dotIndex)}${numberStr.substring(dotIndex, dotIndex + fixedNumber + 1)}...`
    : numberStr
}
