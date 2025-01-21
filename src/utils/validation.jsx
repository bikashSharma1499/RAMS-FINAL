import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
const SECRET_KEY = '4f91e2c9b1a76f0d2b3f19c1e7a48e3d2c4a5b6d8f9e0a1b3c4d5e6f7a8b9c0d'; 

// Encryption function
export const encryptKeyNormal = (value) => {
  console.log("Value to encrypt:", value);
  
  let encrypted = "";

  // Check if the value is a string; otherwise, use "demo"
  if (typeof value === "string" && value.trim() !== "") {
    encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  } else {
    console.warn("Invalid value detected, using default value 'demo'");
    encrypted = CryptoJS.AES.encrypt("demo", SECRET_KEY).toString();
  }
  
  return encrypted;
};



// Decryption function
export const decryptKeyNormal = (value) => {
  const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};


/*Encyption and decryption with Timespan*/
export const encryptKeyWithExpiry = (data, ttlInSeconds) => {
    const expiryTime = Date.now() + ttlInSeconds * 1000; 
    const payload = JSON.stringify({ data, expiryTime });
    return CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
  };
  

 export const decryptKeyWithExpiry = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      const decryptedPayload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  
      const { data, expiryTime } = decryptedPayload;
      if (Date.now() > expiryTime) {
        return { valid: false, message: 'Data has expired'};
      }
      return { valid: true, message:'decryption successfull', data };
    } catch (error) {
      return { valid: false, message: 'Invalid data or decryption failed' };
    }
  };

  /*popup Message */
  export const showPopup=(data) =>{
    Swal.fire({
        icon:data.iconType,
        title:data.title,
        text:data.msg,
        timer:3000
    });
  }

  /*DEVICE INFORMATION*/
  function getBrowserName() {
    const userAgent = navigator.userAgent;
  
    if (userAgent.includes("Chrome")) {
      return "Chrome";
    } else if (userAgent.includes("Firefox")) {
      return "Firefox";
    } else if (userAgent.includes("Safari")) {
      return "Safari";
    } else if (userAgent.includes("Edge")) {
      return "Edge";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      return "Opera";
    } else if (userAgent.includes("Trident") || userAgent.includes("MSIE")) {
      return "Internet Explorer";
    } else {
      return "Unknown";
    }
  }

export const deviceInfo = async()=> {

  let ipAddress ="0";
try {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  ipAddress = data.ip;
} catch (error) {}

const deviceDetails={
  ip:ipAddress,
  browser: getBrowserName(),
}
return deviceDetails;
} 


export const MaskInitial =(props) =>  {
  const inputStr = props.input.toString();
  const lastIndex= props.endIndex;
  if (inputStr.length <= lastIndex) {
    return "*".repeat(inputStr.length);
  }
  const maskedPart = "*".repeat(lastIndex);
  const remainingPart = inputStr.slice(lastIndex);
  return maskedPart + remainingPart;
}


/**/

export const GenerateOtp = (digits) =>{
    if (digits < 1) {
        throw new Error("OTP must have at least 1 digit.");
    }
    const min = Math.pow(10, digits - 1); // The smallest number with 'digits' number of digits
    const max = Math.pow(10, digits) - 1; // The largest number with 'digits' number of digits
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



export const useSessionStorage = (key) => {
  const [value, setValue] = useState(() => sessionStorage.getItem(key));

  useEffect(() => {
    const handler = () => setValue(sessionStorage.getItem(key));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  return value;
};
