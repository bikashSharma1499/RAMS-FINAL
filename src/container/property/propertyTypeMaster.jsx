import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";

export const property = async () => {
  const user = GetLoginInfo();

  try {
    const response = await axios.post(API_ENDPOINTS.propertyListPost, {
      transactionType: user.userName,
      CustomerCode: user.userKey,
    });

    if (response.status === 200) {
      // Return the fetched data to use in dropdown
      return response.data;
    } else {
      console.error("Error fetching property list: ", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching property list: ", error);
    return [];
  }
};


export const propertyType = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.propertyType);
      if (response.status === 200) {
        // Return the fetched data to use in dropdown
        return response.data;
      } else {
        console.error("Error fetching property list: ", response.status);
        return [];
      }
    } catch (error) {
      console.error("Error fetching property list: ", error);
      return [];
    }
  };

  
  export const propertyHousingType = async (typeCode) => {

    try {
      const response = await axios.post(API_ENDPOINTS.propertyHousingType,{
        propertyTypeCode:typeCode,
        houseCode:0
      });
      if (response.status === 200) {
       
        return response.data; // This will always return an array
      } else {
        console.error("Error fetching property list: ", response.status);
        return []; // Return an empty array for non-200 responses
      }
    } catch (error) {
      console.error("Error fetching property list: ", error);
      return []; // Return an empty array on error
    }
  };
  

  export const propertyMaintenance =async() =>{
    try {
      const response = await axios.get(API_ENDPOINTS.propertyMaintenance);
      if (response.status === 200) {
        return response.data; // This will always return an array
      } else {
        console.error("Error fetching property list: ", response.status);
        return []; // Return an empty array for non-200 responses
      }
    } catch (error) {
      console.error("Error fetching property list: ", error);
      return []; // Return an empty array on error
    }
  };
  
  
export const createAgreement= async() =>{
const user =GetLoginInfo();
  try{
    const response =await axios.post(API_ENDPOINTS.newAgreementRecord,{
      entryType:user.userType,
      mobileNumber:user.userMobile
    });
    if(response.status===200){
      const resultArray = response.data.result.split(",");
      return resultArray;
    };
  }catch(e){
    console.log("Error occured while creating new Agreement Record");
    return [];
  }
};
 

export const mobileAuthentication = async (prop) => {
  try {
    const response = await axios.post(API_ENDPOINTS.otpAuthentication, {
      transactionType: prop.type,
      customerType: prop.custType,
      userMobileNo: prop.mobileNo,
      diviceId:'random'
    });

    // Check if the response status is 200 and result exists
    if (response.status === 200 && response.data?.result) {
      const resultArray = response.data.result.split(",");
      return resultArray; // Return the parsed array
    } else {
      console.warn("Unexpected response structure:", response.data);
      return []; // Return an empty array if the response is unexpected
    }
  } catch (error) {
    console.error("Error in mobileAuthentication:", error);
    return []; // Return an empty array in case of an error
  }
};
