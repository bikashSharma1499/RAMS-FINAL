import { decryptKeyNormal, encryptKeyNormal } from "../../utils/validation";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";

async function SetLoginInfo(type, key) {
 // debugger;
  try {
    const customer = await getCustomerByCode(type, key);
    if (!customer) {
      console.error(`Customer with code ${key} not found.`);
      return;
    }

    const data = {
      userKey: encryptKeyNormal(key),
      isAuthenticated: encryptKeyNormal("true"),
      userName: encryptKeyNormal(customer.customer_name),
      userMobile: encryptKeyNormal(customer.mobile_no),
      userEmail: encryptKeyNormal(customer.mail_id),
      userId: encryptKeyNormal(customer.customer_id),
      userType: encryptKeyNormal(customer.customer_type),
    };

    // Convert data object to a string before storing in localStorage
    localStorage.setItem("userAuth", JSON.stringify(data));
  } catch (error) {
    console.error("Error setting login info:", error);
  }
}

async function getCustomerByCode(type, custCode) {
  try {
    const payload = {
      customerType: String(type),
      customerCode: String(custCode),
    };
    console.log("Request Payload:", payload);

    const response = await axios.post(API_ENDPOINTS.customerList, payload);
    console.log("API Response:", response.data);

    const customerList = response.data;
    const customer = customerList.find(
      (customer) => String(customer.customer_code) === String(custCode)
    );
    return customer || null;
  } catch (error) {
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error Request:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }
    return null;
  }
}


export const GetLoginInfo = () => {
  try {
    // Fetch data from localStorage
    const userAuthString = localStorage.getItem('userAuth');
    if (!userAuthString) {
      console.warn("No userAuth found in localStorage");
      return null; // No data found
    }

    // Parse the JSON string
    const userAuth = JSON.parse(userAuthString);
    if (!userAuth || typeof userAuth !== "object") {
      console.error("Invalid userAuth structure");
      return null; // Invalid data structure
    }

    // Decrypt and construct the user data
    const data = {
      userKey: decryptKeyNormal(userAuth.userKey || ""),
      userName: decryptKeyNormal(userAuth.userName || ""),
      userMobile: decryptKeyNormal(userAuth.userMobile || ""),
      userEmail: decryptKeyNormal(userAuth.userEmail || ""),
      userId: decryptKeyNormal(userAuth.userId || ""),
      userType: decryptKeyNormal(userAuth.userType || ""),
    };

    // Return the decrypted user data
    return data;
  } catch (error) {
    // Log any errors for debugging
    console.error("Error in GetLoginInfo:", error);
    return null; // Return null if any error occurs
  }
};

export default SetLoginInfo;
