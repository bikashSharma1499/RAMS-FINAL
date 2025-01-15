import React, { useState } from "react";

const InstamojoPayment = () => {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const handlePayment = async () => {
    if (!amount || !name || !email || !mobile) {
      alert("Please fill all the fields.");
      return;
    }

    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "Mhn9GO0gRxAZ2eP0xWs7HXeezgajJnI8ya5VSVzG", // Replace with your actual client ID
        client_secret: "ljXOi8AuP5UpLSDXL1t3B3xl4I3BAJr8psTldnT3GPJ6Hl5Nv7U2tZMf5ByECDfTFlMNvOoxCCIOHJwYgLT1T8lgcXotWAVqlJaLqPEhRc7hBAaVh2eobRgSi3VKfB6T", // Replace with your actual client secret
      }),
    };

    try {
      // Step 1: Generate Bearer Token
      const tokenResponse = await fetch("https://api.instamojo.com/oauth2/token/", options);
      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        alert("Failed to generate access token. Please try again.");
        return;
      }

      const accessToken = tokenData.access_token;

      // Step 2: Create Payment Request
      const paymentOptions = {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount,
          purpose: "Test Payment", // Replace with your payment purpose
          buyer_name: name,
          email,
          phone: mobile,
          redirect_url: "localhost:5173/verification/payment-history", // Replace with your redirect URL
          send_email: false,
          allow_repeated_payments: false,
        }),
      };

      const paymentResponse = await fetch("https://api.instamojo.com/v2/payment_requests/", paymentOptions);
      const paymentData = await paymentResponse.json();

      if (!paymentData.payment_request || !paymentData.payment_request.longurl) {
        alert("Failed to create payment request. Please try again.");
        return;
      }

      // Step 3: Open Instamojo Payment Modal
      const paymentUrl = paymentData.payment_request.longurl;
      if (window.Instamojo) {
        window.Instamojo.open(paymentUrl);
      } else {
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the payment. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h3>Instamojo Payment</h3>
      <div>
        <label>
          Amount:{" "}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount"
          />
        </label>
      </div>
      <div>
        <label>
          Name:{" "}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Name"
          />
        </label>
      </div>
      <div>
        <label>
          Email:{" "}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
          />
        </label>
      </div>
      <div>
        <label>
          Mobile:{" "}
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter Mobile Number"
          />
        </label>
      </div>
      <button onClick={handlePayment} style={{ marginTop: "20px" }}>
        Pay Now
      </button>
    </div>
  );
};

export default InstamojoPayment;
