import axios from "axios";

export async function sendSMS(name, mobile, otp) {
  const queryString = `?template_id=25117&to=${mobile}|${name}|${otp}&type=Trans&sms_type=smart&var_header=var|var1`;
  const url = `https://panelv2.cloudshope.com/api/send_sms${queryString}`;
  const token = '366681|r2oPci36X7bV2TvHG3jyxClx7RAkByCqQRfh6INv';
  try {
    debugger;
    const response = await axios.post(url, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/xml'
      },
    });
    console.log('SMS sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    throw error;
  }
}
