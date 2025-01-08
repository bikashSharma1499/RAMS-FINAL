import { useState, useRef, useCallback, useEffect } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

import Pageheader from "../../components/pageheader/pageheader";
import stampPaper from "../../assets/images/agreement/stamp-paper.jpg";
import MultistepForm from "./agrMultiform";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import {
  deviceInfo,
  encryptKeyWithExpiry,
  MaskInitial,
  showPopup,
  decryptKeyWithExpiry,
} from "../../utils/validation";
import { GetLoginInfo } from "../auth/logindata";
import { createAgreement } from "./agreementAuthData";

import AgreementPendingList from "./agrPendingList";

function NewAgreement() {
  const [mobileNo, setMobileNo] = useState("");
  const [error, setError] = useState("");
  const [showAgreement, setShowAgreement] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [inputOtp, setInputOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAgreementList, setShowAgreementList] = useState(true);
  const [showResendOtp, setShowResendOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // Timer initialized to 120 seconds
  const [isActive, setIsActive] = useState(false); // To track if the timer should run

  const user = GetLoginInfo();

  const inputRefs = {
    one: useRef(null),
    two: useRef(null),
    three: useRef(null),
    four: useRef(null),
  };
  const [finalValue, setFinalValue] = useState("");
  const handleProceed = async () => {
    setIsLoading(true);
    try {
      const deviceId = (await deviceInfo()).ip; // Ensure deviceInfo is working correctly
      const response = await axios.post(API_ENDPOINTS.otpAuthentication, {
        transactionType: "Login",
        customerType: user.userType, // Replace with the correct value
        userMobileNo: user.userType === "Landlord" ? user.userMobile : mobileNo,
        diviceId: deviceId,
      });

      if (response.status === 200) {
        const resultArray = response.data.result.split(",");
        const msg =
          resultArray[0] === "success"
            ? "OTP has been sent to your mobile number."
            : resultArray[4];
        // Handle popup or notification
        const dataOutput = {
          title: `${resultArray[4]} ${resultArray[0]}`,
          text: msg,
          iconType: resultArray[0],
        };
        showPopup(dataOutput);
        if (resultArray[0] === "success") {
          localStorage.removeItem("rentOtp");
          localStorage.setItem(
            "rentOtp",
            encryptKeyWithExpiry(resultArray[4], 120)
          );
          setShowOtp(true);
          setIsActive(true);
          startTimer();
          setTimeLeft(120);
        }
      }
    } catch (error) {
      console.error("Error in OTP generation:", error);
      setError("Failed to send OTP. Please try again.");
    }
  };

  /*OTP Handling*/
  const handleInputChange = useCallback(
    (currentId, nextId) => {
      const currentInput = inputRefs[currentId].current;

      if (currentInput && currentInput.value.length === 1) {
        const nextInput = inputRefs[nextId] ? inputRefs[nextId].current : null;
        if (nextInput) {
          nextInput.focus();
        }
      }
      setError("");
    },
    [inputRefs]
  );

  const handleOtpVerify = (e) => {
    // const currentInput = inputRefs.four.current;
    const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
    if (enteredCode.length != 4) {
      setError("Invalid OTP. Please enter 4 digit OTP.");
      return;
    } else {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
    const correctCode = decryptKeyWithExpiry(
      localStorage.getItem("rentOtp")
    ).data;
    console.log(correctCode);
    // debugger;
    if (enteredCode === correctCode) {
      const data = {
        title: "Successfull",
        text: "OTP Validated Successfully Proceeding for Rent Agreement....",
        iconType: "success",
      };
      const result = await createAgreement();
      console.log(result);
      const agrData = {
        agr_k: result[1],
        is_n: true,
        is_step: 0,
      };
      localStorage.setItem("rg_rcd", JSON.stringify(agrData));
      showPopup(data);
      setTimeout(() => {
        setShowAgreement(true);
        showOtp(false);
      }, 1200);
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
  };

  const handleNumericInput = (e) => {
    const charCode = e.charCode || e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  //#region countDownTimer
  useEffect(() => {
    let timer;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }else{
      setIsActive(false);
    }

    // Cleanup the interval on component unmount or when isActive changes
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setIsActive(true); // Start the timer
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  //#endregion
  return (
    <>
      <Pageheader
        title="New Rent Agreement"
        heading="Customer"
        active="New Agreement"
      />
      <div className=" mt-4">
        {!showAgreement ? (
          <Card style={{ minHeight: "" }} className="">
            <Card.Body>
              {!showAgreementList ? (
                <>
                  {!showOtp ? (
                    <Row>
                      <Col md={6} lg={5} className="p-5">
                        <h4 style={{ letterSpacing: "0.8px" }}>
                          {" "}
                          Get Started on your{" "}
                          <span className=" text-green h3 bg-active">
                            Agreement
                          </span>{" "}
                          - Simple,Fast and Secure{" "}
                        </h4>
                        <Form.Group>
                          <Form.Label className=" h4 fw-bold mb-2 text-muted">
                            {user.userType === "Landlord"
                              ? "Your Mobile no"
                              : "Enter Landlord Mobile No"}
                          </Form.Label>
                          <Form.Control
                            readOnly
                            value={MaskInitial({
                              input: user.userMobile,
                              endIndex: 6,
                            })}
                            onChange={(e) => setMobileNo(e.target.value)}
                            isInvalid={!!error}
                          />
                          <Form.Control.Feedback type="invalid">
                            {error}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Button
                          onClick={handleProceed}
                          className="btn btn-primary mt-3"
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
                        <Button
                          onClick={() => setShowAgreementList(true)}
                          className="btn btn-danger ms-2 mt-3"
                          type="button"
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </Col>
                      <Col
                        md={6}
                        lg={6}
                        className="d-none d-grid text-center  d-md-block"
                      >
                        <img
                          height={350}
                          className=" mt-5"
                          src={stampPaper}
                          alt="Stamp Paper"
                        />
                      </Col>
                    </Row>
                  ) : (
                    <>
                      <Row>
                        <Col md={6} className="mx-auto" lg={4}>
                          <Card className=" mt-5 border-1  border-dark-subtle border">
                            <Card.Body>
                              <h5 className="  mb-4">
                                Enter OTP Sent to{" "}
                                {user.userType === "Landlord"
                                  ? MaskInitial({
                                      input: user.userMobile,
                                      endIndex: 6,
                                    })
                                  : MaskInitial({
                                      input: mobileNo,
                                      endIndex: 6,
                                    })}{" "}
                              </h5>
                              <Row>
                                <div className="col-3">
                                  <Form.Control
                                    type="text"
                                    className="form-control-lg text-center"
                                    id="one"
                                    maxLength={1}
                                    autoComplete="off"
                                    onChange={() =>
                                      handleInputChange("one", "two")
                                    }
                                    ref={inputRefs.one}
                                    onKeyPress={handleNumericInput}
                                  />
                                </div>
                                <div className="col-3">
                                  <Form.Control
                                    type="text"
                                    className="form-control-lg text-center"
                                    id="two"
                                    maxLength={1}
                                    autoComplete="off"
                                    onChange={() =>
                                      handleInputChange("two", "three")
                                    }
                                    ref={inputRefs.two}
                                    onKeyPress={handleNumericInput}
                                  />
                                </div>
                                <div className="col-3">
                                  <Form.Control
                                    type="text"
                                    className="form-control-lg text-center"
                                    id="three"
                                    maxLength={1}
                                    autoComplete="off"
                                    onChange={() =>
                                      handleInputChange("three", "four")
                                    }
                                    ref={inputRefs.three}
                                    onKeyPress={handleNumericInput}
                                  />
                                </div>
                                <div className="col-3">
                                  <Form.Control
                                    type="text"
                                    className="form-control-lg text-center"
                                    id="four"
                                    maxLength={1}
                                    autoComplete="off"
                                    // onChange={() => handleOtpVerify}
                                    ref={inputRefs.four}
                                    onKeyPress={handleNumericInput}
                                  />
                                </div>
                              </Row>
                   
                                    <Row>
                                    <Col>
                                      {error && (
                                        <div className="text-danger mt-2">
                                          {error}
                                        </div>
                                      )}
                                    </Col>
                                  </Row>
                  
                          
                              <Row>
                                <Col xs={12}>
                                  {isActive ? (
                                    <>
                                      <p>
                                        Resend OTP in {formatTime(timeLeft)}
                                      </p>
                                    </>
                                  ) : (
                                    ""
                                  )}
                                </Col>
                                <Col className="mx-auto text-center" md={6}>
                                  {isActive ? (
                                    <>
                                      <button
                                        onClick={handleOtpVerify}
                                        className="mt-3 btn-save"
                                      >
                                        {" "}
                                        Verify
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      
                                      onClick={handleProceed}
                                      className="mt-3  btn-attractive"
                                    >
                                      {" "}
                                      Resend
                                    </button>
                                  )}
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className=" w-100  d-flex justify-content-between">
                    <h5>Continue or Create a new Agreement</h5>
                    <Button onClick={() => setShowAgreementList(false)}>
                      {" "}
                      <i className=" bi-plus-circle"></i> Create Agreement{" "}
                    </Button>
                  </div>
                  {/* <AgreementPendingList /> */}
                </>
              )}
            </Card.Body>
          </Card>
        ) : (
          <MultistepForm />
        )}
      </div>
    </>
  );
}

export default NewAgreement;
