import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button, Card, Col, Row, Form, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import desktoplogo from "../../assets/images/brand-logos/desktop-logo.png";
import desktopdarklogo from "../../assets/images/brand-logos/desktop-dark.png";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import SetLoginInfo from './logindata';
import {
  deviceInfo,
  encryptKeyWithExpiry,
  decryptKeyWithExpiry,
  showPopup,
} from "../../utils/validation";
import { sendSMS } from "../../utils/sms";

const Signin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [loginType, setLoginType] = useState("Landlord");
  const [validated, setValidated] = useState(false);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // Timer initialized to 120 seconds
  const [isActive, setIsActive] = useState(false); // To track if the timer should run
  const [showOTP, setShowOTP] = useState(false);
  const navigate = useNavigate();

  const inputRefs = {
    one: useRef(null),
    two: useRef(null),
    three: useRef(null),
    four: useRef(null),
  };
  const [finalValue, setFinalValue] = useState("");

  //#region Sign In Form
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
          title: resultArray[4] + resultArray[0],
          text: msg,
          iconType: resultArray[0],
        };

       await axios.post("https://localhost:7069/api/Sms/send-sms",{
          phoneNumber:mobileNumber,
          name:"User",
          otp:resultArray[4]
        }).then(console.log(response))

        showPopup(data);

        if (resultArray[0] === "success") {
          const otp = encryptKeyWithExpiry(resultArray[4], 120);
          const userKey = encryptKeyWithExpiry(resultArray[3], 120);
          const userType = encryptKeyWithExpiry(resultArray[2], 300);
          localStorage.setItem("userType", userType);
          localStorage.setItem("otpUser", otp);
          localStorage.setItem("userKey", userKey);
          // await sendSMS(loginType,mobileNumber,resultArray[4]);

          // setTimeout(() => {
          //   navigate(`${import.meta.env.BASE_URL}auth/twostep/`);
          // }, 2000);

          if (!isActive && !showOTP) {
            setShowOTP(true);
          }
          setIsActive(true);
          startTimer();
          setTimeLeft(120);
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
  //#endregion

  //#region OTP Validation

  const handleNavigate = () => {
    navigate(`${import.meta.env.BASE_URL}dashboard`, {
      state: { fetchData: true },
    });
   
  };

  const handleInputChange = useCallback(
    (currentId, nextId) => {
      const currentInput = inputRefs[currentId].current;

      if (currentInput && currentInput.value.length === 1) {
        const nextInput = inputRefs[nextId] ? inputRefs[nextId].current : null;

        if (nextInput) {
          nextInput.focus();
        }
      }
    },
    [inputRefs]
  );

  const handleKeyDown = (e) => {
    const currentInput = inputRefs.four.current;
    if (currentInput && currentInput.value.length === 1) {
      handleVerify();
    }
  };

  const handleVerify = () => {
    const currentInput = inputRefs.four.current;
    const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
    const correctCode = decryptKeyWithExpiry(localStorage.getItem("otpUser"));
    if (correctCode.valid) {
      if (enteredCode === correctCode.data) {
        const userKey = decryptKeyWithExpiry(
          localStorage.getItem("userKey")
        ).data;
        const userType = decryptKeyWithExpiry(
          localStorage.getItem("userType")
        ).data;
        console.log(userKey);
        
        SetLoginInfo(userType, userKey);
        handleNavigate();
      } else {
        Object.keys(inputRefs).forEach((refKey) => {
          inputRefs[refKey].current.value = "";
        });
        const data = {
          title: "Invalid OTP",
          text: "The entered code is incorrect. Please try again",
          iconType: "error",
        };
        showPopup(data);
      }
    } else {
      const data = {
        title: "OTP Expired",
        text: "OTP has expired. Please try resend the OTP",
        iconType: "error",
      };
      showPopup(data);
      Object.keys(inputRefs).forEach((refKey) => {
        inputRefs[refKey].current.value = "";
      });
    }
  };
  useEffect(() => {
    let timerInterval;

    if (isActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // Update every second
    } else if (timeLeft === 0) {
      clearInterval(timerInterval);
      setIsActive(false); // Stop the timer once it reaches 0
    }

    return () => clearInterval(timerInterval); // Clean up interval on component unmount
  }, [isActive, timeLeft]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const startTimer = () => {
    setIsActive(true); // Start the timer
  };

  //#endregion

  return (
    <>
      {!showOTP ? (
        <>
          <div className="container">
            <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
              <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                <Card className="custom-card">
                  <div className="mt-2 d-flex justify-content-center">
                    <img
                      src={desktoplogo}
                      alt="logo"
                      className="desktop-logo"
                    />
                    <img
                      src={desktopdarklogo}
                      alt="logo"
                      className="desktop-dark"
                    />
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
                          (mobileNumber.length > 0 &&
                            mobileNumber.length !== 10)
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
                          to={`${import.meta.env.BASE_URL}auth/signup/`}
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
        </>
      ) : (
        <div className="container-lg">
          <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
            <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
              <div className="my-5 d-flex justify-content-center">
                <Link to={`${import.meta.env.BASE_URL}dashboards/crm/`}>
                  <img src={desktoplogo} alt="logo" className="desktop-logo" />
                  <img
                    src={desktopdarklogo}
                    alt="logo"
                    className="desktop-dark"
                  />
                </Link>
              </div>
              <Card className="custom-card">
                <Card.Body className="p-5">
                  <p className="h5 fw-semibold mb-2 text-center">
                    Verify Your Account
                  </p>
                  <p className="mb-4 text-muted op-7 fw-normal text-center">
                    Enter the 4 digit code sent to the {mobileNumber}.
                  </p>
                  <div className="row gy-3">
                    <Col xl={12} className="mb-2">
                      <Row>
                        <div className="col-3">
                          <Form.Control
                            type="text"
                            className="form-control-lg text-center"
                            id="one"
                            maxLength={1}
                            autoComplete="off"
                            onChange={() => handleInputChange("one", "two")}
                            ref={inputRefs.one}
                          />
                        </div>
                        <div className="col-3">
                          <Form.Control
                            type="text"
                            className="form-control-lg text-center"
                            id="two"
                            maxLength={1}
                            autoComplete="off"
                            onChange={() => handleInputChange("two", "three")}
                            ref={inputRefs.two}
                          />
                        </div>
                        <div className="col-3">
                          <Form.Control
                            type="text"
                            className="form-control-lg text-center"
                            id="three"
                            maxLength={1}
                            autoComplete="off"
                            onChange={() => handleInputChange("three", "four")}
                            ref={inputRefs.three}
                          />
                        </div>
                        <div className="col-3">
                          <Form.Control
                            type="text"
                            className="form-control-lg text-center"
                            id="four"
                            maxLength={1}
                            autoComplete="off"
                            onKeyDown={() => handleKeyDown} // Handle keydown for verification
                            ref={inputRefs.four}
                          />
                        </div>
                      </Row>

                      {isActive ? (
                        <>
                          <p className="mt-3">
                            Resend OTP in {formatTime(timeLeft)}
                          </p>
                        </>
                      ) : (
                        ""
                      )}
                     
                    </Col>
                    <Col xl={12} className="d-grid mt-2">
                      {isActive ? (
                        <>
                          {" "}
                          <button
                            className=" btn-save mx-auto"
                            onClick={handleVerify}
                          >
                            Verify
                          </button>{" "}
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-update mx-auto"
                            onClick={handleSubmit}
                          >
                            {" "}
                            {isLoading ? (
                           <>   <Spinner></Spinner> "Resending..."</>
                            ) : (
                              "Resend"
                            )}{" "}
                          </button>
                        </>
                      )}
                    </Col>
                  </div>
                  <div className="text-center">
                    <p className="fs-12 text-danger mt-3 mb-0">
                      <sup>
                        <i className="ri-asterisk"></i>
                      </sup>
                      Don't share the verification code with anyone!
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </div>
        </div>
      )}
    </>
  );
};

export default Signin;
