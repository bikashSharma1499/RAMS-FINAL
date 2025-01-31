import axios from "axios";

export async function sendSMS(name, mobile, otp) {
  debugger;
  try {
    const response= await axios.post('https://api.4slonline.com/rams/api/Sms/send-sms',
      {
        templateID:"25117",
        PhoneNumber:mobile,
        name:name,
        otp:otp
      }
    )
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    throw error;
  }
}
