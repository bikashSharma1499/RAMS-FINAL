import React, { useState } from "react";
import axios from "axios";

const InstamojoPayment = () => {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [token, setToken] = useState("");

  const handlePayment = async () => {

  //  debugger;
      try {
          const response = await axios.post('https://api.redcheckes.com/proxy/payment', {
              name: name,
              amount: amount,
              phone: mobile,
              email: email,
              redirect_url: 'https://rams.redcheckes.com', 
          });
          
          console.log("Response", response.data);
          const link = response.data.paymentLink;
          console.log("Payment link", link);
          if (link!=null) {
             // window.location.href = link;
             alert("Payment link: "+link);
          }
      } catch (error) {
          console.error("Error creating payment link", error);
      }
};


  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h3>Instamojo Payment</h3>
      <div>
        <label>
          Amount:{" "}
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter Amount" />
        </label>
      </div>
      <div>
        <label>
          Name:{" "}
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Name" />
        </label>
      </div>
      <div>
        <label>
          Email:{" "}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" />
        </label>
      </div>
      <div>
        <label>
          Mobile:{" "}
          <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter Mobile Number" />
        </label>
      </div>
      <button onClick={handlePayment} style={{ marginTop: "20px" }}>
        Pay Now
      </button>
    </div>
  );
};

export default InstamojoPayment;
