import React, { useState } from "react";
import { Button, Card, Col, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import desktoplogo from "../../assets/images/brand-logos/desktop-logo.png";
import desktopdarklogo from "../../assets/images/brand-logos/desktop-dark.png";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { deviceInfo, encryptKeyWithExpiry, showPopup  } from "../../utils/validation";

const Signin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loginType, setLoginType] = useState("Landlord");
  const [validated, setValidated] = useState(false);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) {
      setError("Only numeric values are allowed.");
      return;
    }
    setError(""); 
    setMobileNumber(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    const form = event.currentTarget;
  
    if (mobileNumber.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
  
    if (!form.checkValidity()) {
      event.stopPropagation();
      return;
    }
  
    setValidated(true);
    setIsLoading(true);
  
    try {
      console.log(API_ENDPOINTS.otpAuthentication);
  
      const deviceId = (await deviceInfo()).ip; // Ensure deviceInfo is working correctly
      const response = await axios.post(API_ENDPOINTS.otpAuthentication, {
        transactionType: "Login",
        customerType: loginType,
        userMobileNo: mobileNumber,
        diviceId: deviceId,
      });
  
      if (response.status === 200) {
        const resultArray = response.data.result.split(",");
        const msg =
          resultArray[0] === "success"
            ? "OTP has been sent to your mobile no"
            : resultArray[4];
  
        const data = {
          title: resultArray[4]+ resultArray[0],
          text: msg,
          iconType: resultArray[0],
        };
  
        showPopup(data);
  
        if (resultArray[0] === "success") {
     
          const otp = encryptKeyWithExpiry(resultArray[4], 120);
          const userKey = encryptKeyWithExpiry(resultArray[3], 120);
          const userType = encryptKeyWithExpiry(resultArray[2],300);
          localStorage.setItem('userType',userType);
          localStorage.setItem("otpUser", otp);
          localStorage.setItem("userKey", userKey);
      
        
          setTimeout(() => {
            navigate(`${import.meta.env.BASE_URL}auth/twostep/`);
          }, 2000);
        }
      } else {
        showPopup({
          title: "Failed",
          text: "Fetching failed",
          iconType: "error",
        });
      }
    } catch (error) {
      showPopup({
        title: "Error",
        text: "Something went wrong",
        iconType: "error",
      });
      console.error("Login API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
        <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
          <Card className="custom-card">
            <div className="mt-2 d-flex justify-content-center">
              <img src={desktoplogo} alt="logo" className="desktop-logo" />
              <img src={desktopdarklogo} alt="logo" className="desktop-dark" />
            </div>
            <Card.Body className="pb-5">
              <p className="h5 fw-semibold mb-2 text-center">Sign In</p>

              {/* Role Selection */}
              <Form.Group className="mb-3" controlId="validationRole">
                <Form.Label>Select a role</Form.Label>
                <div className="d-flex ">
                  <Form.Check
                    inline
                    label="Landlord"
                    name="loginType"
                    type="radio"
                    id="role-landlord"
                    defaultChecked
                    value="Landlord"
                    onChange={(e) => setLoginType(e.target.value)}
                    required
                  />
                  <Form.Check
                    inline
                    label="Broker"
                    name="loginType"
                    type="radio"
                    id="role-broker"
                    value="Broker"
                    onChange={(e) => setLoginType(e.target.value)}
                    required
                  />
                  <Form.Check
                    inline
                    label="Tenant"
                    name="loginType"
                    type="radio"
                    id="role-tenant"
                    value="Tenant"
                    onChange={(e) => setLoginType(e.target.value)}
                    required
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  Please select a role.
                </Form.Control.Feedback>
              </Form.Group>

              {/* Mobile Number Input */}
              <Form.Group className="mb-3" controlId="validationMobile">
                <Form.Label>Mobile No</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter Mobile Number"
                  maxLength={10}
                  value={mobileNumber}
                  autoComplete="off"
                  onChange={handleMobileNumberChange}

                  isInvalid={
                    !!error ||
                    (mobileNumber.length > 0 && mobileNumber.length !== 10)
                  }
                  isValid={!!valid || mobileNumber.length === 10}
                />
                <Form.Control.Feedback type="invalid">
                  {error || "Mobile number must be exactly 10 digits."}
                </Form.Control.Feedback>
                <Form.Control.Feedback type="valid">
                  {valid}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                className="btn btn-primary w-100"
                type="button"
                disabled={isLoading} // Disable the button while loading
              >
                {isLoading ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="fs-12 text-muted mt-3">
                  Don't have an account?{" "}
                  <Link
                    to={`${
                      import.meta.env.BASE_URL
                    }auth/signup/`}
                    className="text-primary"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </div>
    </div>
  );
};

export default Signin;
