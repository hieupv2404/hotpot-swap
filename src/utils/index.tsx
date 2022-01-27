import Numeral from "numeral";

export const toK = (num) => {
  return Numeral(num).format("0.[00]a");
};

export const formatDollarAmount = (num, digits) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return formatter.format(num);
};

export const formattedNum = (number, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === "" || number === undefined) {
    return usd ? "$0" : 0;
  }
  let num = parseFloat(number);

  if (num > 500000000) {
    return (usd ? "$" : "") + toK(num.toFixed(0));
  }

  if (num === 0) {
    if (usd) {
      return "$0";
    }
    return 0;
  }

  if (num < 0.0001 && num > 0) {
    return usd ? "< $0.0001" : "< 0.0001";
  }

  if (num > 1000) {
    return usd
      ? formatDollarAmount(num, 0)
      : Number(parseFloat(num.toString()).toFixed(0)).toLocaleString();
  }

  if (usd) {
    if (num < 0.1) {
      return formatDollarAmount(num, 4);
    } else {
      return formatDollarAmount(num, 2);
    }
  }

  return Number(parseFloat(num.toString()).toFixed(18)).toLocaleString();
};

export function handleTime(timeStart) {
  const timeLocalNow = new Date();
  const timeUTCNow =
    Date.UTC(
      timeLocalNow.getUTCFullYear(),
      timeLocalNow.getUTCMonth(),
      timeLocalNow.getDate(),
      timeLocalNow.getUTCHours(),
      timeLocalNow.getUTCMinutes(),
      timeLocalNow.getSeconds()
    ) / 1000;

  const timeAgo = timeUTCNow - timeStart;

  if (timeAgo > 59 && timeAgo < 3600) {
    return Math.floor(timeAgo / 60) + " minutes ago";
  } else if (timeAgo >= 3600 && timeAgo < 3600 * 24) {
    return Math.floor(timeAgo / 3600) + " hours ago";
  } else if (timeAgo >= 3600 * 24 && timeAgo < 3600 * 24 * 30) {
    return Math.floor(timeAgo / (3600 * 24)) + " days ago";
  } else if (timeAgo >= 3600 * 24 * 30 && timeAgo < 3600 * 24 * 30 * 12) {
    return Math.floor(timeAgo / (3600 * 24 * 30)) + " months ago";
  } else if (timeAgo >= 3600 * 24 * 30 * 12) {
    return Math.floor(timeAgo / (3600 * 24 * 30 * 12)) + " years ago";
  }
  return timeAgo + " seconds ago";
}

export const numberExponentToLarge = (numIn) =>{
  numIn +="";                                            
  let sign="";                                           
  numIn.charAt(0)=="-" && (numIn =numIn.substring(1),sign ="-"); 
  let str = numIn.split(/[eE]/g);                        
  if (str.length<2) return sign+numIn;                   
  const power = str[1];                                   
  if (power ==0 || power ==-0) return sign+str[0];       
 
  const deciSp = 1.1.toLocaleString().substring(1,2);  
  str = str[0].split(deciSp);                        
  let baseRH = str[1] || "",                        
      baseLH = str[0];                               
 
   if (power>0) {  
      if (power> baseRH.length) baseRH +="0".repeat(power-baseRH.length); 
      baseRH = baseRH.slice(0,power) + deciSp + baseRH.slice(power);      
      if (baseRH.charAt(baseRH.length-1) ==deciSp) baseRH =baseRH.slice(0,-1); 
 
   } else {         
     const num= Math.abs(power) - baseLH.length;                               
      if (num>0) baseLH = "0".repeat(num) + baseLH;                       
      baseLH = baseLH.slice(0, power) + deciSp + baseLH.slice(power);     
      if (baseLH.charAt(0) == deciSp) baseLH="0" + baseLH;               
   }
  return sign + baseLH + baseRH;                                          
  }
 