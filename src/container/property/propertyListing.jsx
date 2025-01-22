import { useState, useRef, useCallback, useEffect } from "react";
import { Card, Row, Col, Button, InputGroup, Form } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import PropertyMultistepForm from "./propertymultiform";
import { GetLoginInfo } from "../auth/logindata";
import {
  deviceInfo,
  MaskInitial,
  showPopup,
  encryptKeyWithExpiry,
  decryptKeyWithExpiry,
} from "../../utils/validation";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { FaPhoneAlt } from "react-icons/fa";
import { use } from "react";

function PropertyListing() {
  const [showList, setShowList] = useState(true);
  const [mobileInput, setMobileInput] = useState(true);
  const [landlordMobile, setLandlordMobile] = useState("");
  const [inputDisable, setInputDisable] = useState(false);
  const [validated, setValidated] = useState(false);
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  //#region OTP Submission
  const handleOtpSubmit = () => {
    const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
    if (enteredCode.length != 4) {
      setError("Invalid OTP. Please enter 4 digit OTP.");
      return;
    } else {
      handleVerify();
    }
  };
  const handleVerify = async () => {
    setIsLoading(true);
    let dataPopup = null;
    const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
    const correctCode = decryptKeyWithExpiry(
      localStorage.getItem("propOtp")
    ).data;
    console.log(correctCode);

    if (enteredCode === correctCode) {
      dataPopup = {
        title: "Successfull",
        text: "OTP Validated Successfully",
        iconType: "success",
      };

      //#region Triggering Condition for Update / Insert

      const checkProcess = localStorage.getItem("prop_process");
      const processData = JSON.parse(checkProcess);
      if (!processData ||  (processData.process_p === "0" && processData.actual_p == "U")  ) {
        const data = {
          inital_p: "I",
          actual_p: "I",
          process_p: "0",
          process_r: "0",
        };

        localStorage.setItem("prop_process", JSON.stringify(data));
      }
      showPopup(dataPopup);
      //#endregion

      setTimeout(() => {
        setValidated(true);
        setMobileInput(false);
      }, 1500);
    } else {
      Object.keys(inputRefs).forEach((refKey) => {
        inputRefs[refKey].current.value = "";
      });

      dataPopup = {
        title: "Invalid OTP",
        msg: "The entered code is incorrect. Please try again",
        iconType: "error",
      };
      showPopup(dataPopup);
    }
    setIsLoading(false);
  };
  //#endregion
  useEffect(() => {
    // Debugger for step-by-step inspection

    const checkTransaction = () => {
      const checkProcess = localStorage.getItem("prop_process");
      console.log("Raw checkProcess from localStorage:", checkProcess);

      if (checkProcess) {
        try {
          const processData = JSON.parse(checkProcess);
          console.log("Parsed processData:", processData);

          // Check the condition values explicitly
          console.log("inital_p:", processData?.inital_p);
          console.log("process_p:", processData?.process_p);

          if (processData?.inital_p === "U" && processData?.process_p !== "0") {
            console.log("Conditions met. Updating states...");
            setValidated(true);
            setMobileInput(false);
            setShowList(false);
          } else {
            console.log("Conditions not met.");
          }
        } catch (error) {
          console.error(
            "Error parsing 'prop_process' from localStorage:",
            error
          );
        }
      } else {
        console.log("No 'prop_process' found in localStorage.");
      }
    };

    checkTransaction();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await GetLoginInfo();
        setUserData(user);
        if (user.userType === "Landlord") {
          setLandlordMobile(
            MaskInitial({ input: user.userMobile, endIndex: 6 })
          );
          setInputDisable(true);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  //#region Mobile No Authenitication
  const inputRefs = {
    one: useRef(null),
    two: useRef(null),
    three: useRef(null),
    four: useRef(null),
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
      setError("");
    },
    [inputRefs]
  );

  const sendOTP = async () => {
    //
    setIsLoading(true);
    const ipAddr = await deviceInfo();
    const response = await axios.post(API_ENDPOINTS.otpAuthentication, {
      transactionType: "Login",
      customerType: "Landlord", // Replace with the correct value
      userMobileNo:
        userData.userType === "Landlord" ? userData.userMobile : landlordMobile,
      diviceId: ipAddr.ip,
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
        localStorage.removeItem("propOtp");
        localStorage.setItem(
          "propOtp",
          encryptKeyWithExpiry(resultArray[4], 120)
        );
        setMobileInput(false);
      }
    }
    setIsLoading(false);
  };

  //#endregion

  const handleCancel = () => {
    setShowList(true);
    setValidated(false);
    setMobileInput(true);
    localStorage.removeItem("prop_process");
    localStorage.removeItem("next_stpro");
    setIsLoading(false);
  };

  const handleNewProperty = (e) => {
    const checkProcess = localStorage.getItem("prop_process");
    const processData = JSON.parse(checkProcess);
    if (
      !processData ||
      (processData.process_p === "0" && processData.actual_p == "U")
    ) {
      const data = {
        inital_p: "I",
        actual_p: "I",
        process_p: "0",
        process_r: "0",
      };

      localStorage.setItem("prop_process", JSON.stringify(data));
      setShowList(false);
      setMobileInput(true);
      setValidated(false);
    }
  };

  const handleChangeNumber = () => {
    setMobileInput(true);
    setIsLoading(false);
  };

  return (
    <>
      <Pageheader
        title="Property Registration"
        heading="Property"
        active="Registration"
      />
      {GetLoginInfo().userType !== "Tenant" ? (
        <>
          <Card>
            <Card.Body>
              {showList ? (
                <>
                  <section className="property-section py-4">
                    <Row>
                      {/* Header Section */}
                      <Col xs={12} className="mb-3">
                        <button
                          className="btn-new float-end d-flex align-items-center"
                          onClick={() => setShowList(false)}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          <span>New Property</span>
                        </button>
                      </Col>

                      {/* Steps Section */}
                      <Col md={7}>
                        <h4 className="property-header">
                          List your property within minutes...
                        </h4>
                        <ul className="steps-list list-unstyled">
                          <li className="d-flex align-items-center mb-3">
                            <i className="bi bi-phone-vibrate me-3 text-primary fs-4"></i>
                            <span>Verify the Landlord's Number</span>
                          </li>
                          <li className="d-flex align-items-center mb-3">
                            <i className="bi bi-house-door me-3 text-success fs-4"></i>
                            <span>Fill Basic Property Details</span>
                          </li>
                          <li className="d-flex align-items-center mb-3">
                            <i className="bi bi-tools me-3 text-warning fs-4"></i>
                            <span>Add Amenities</span>
                          </li>
                          <li className="d-flex align-items-center mb-3">
                            <i className="bi bi-wrench me-3 text-danger fs-4"></i>
                            <span>Maintenance Details</span>
                          </li>
                          <li className="d-flex align-items-center mb-3">
                            <i className="bi bi-currency-dollar me-3 text-info fs-4"></i>
                            <span>Rental Information</span>
                          </li>
                        </ul>
                      </Col>
                      <Col md={5}>
                        <img
                          src="https://www.infotrack.co.uk/media/zbgjrcul/hero-2-search.png?height=457&width=840&quality=75&mode=Pad&center=0.5,0.5&bgcolor=transparent"
                          height={320}
                        ></img>
                      </Col>

                      {/* DataTable Section */}
                    </Row>
                  </section>
                </>
              ) : (
                <>
                  <Row>
                    {mobileInput ? (
                      <>
                        <Col lg={3} md={4} sm={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fs-5 fw-bold text-secondary">
                              Landlord Mobile No
                            </Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FaPhoneAlt size={20} color="#007bff" />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                onChange={(e) =>
                                  setLandlordMobile(e.target.value)
                                }
                                value={landlordMobile}
                                disabled={setInputDisable}
                                maxLength={10}
                                placeholder="Enter mobile number"
                                className="input-field"
                              />
                            </InputGroup>
                            <Form.Text className="text-muted">
                              Enter the 10-digit mobile number of the landlord.
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col lg={3} md={4} sm={6}>
                          <button
                            onClick={sendOTP}
                            style={{ position: "relative", top: "14px" }}
                            disabled={isLoading}
                            className=" btn-save mt-4"
                          >
                            {" "}
                            {isLoading ? "Sending...." : "Send OTP"}
                          </button>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col lg={4} md={8} className="mx-auto">
                          {!validated ? (
                            <>
                              <Row>
                                <Col className="text-center">
                                  <h6>
                                    {" "}
                                    Enter OTP Sent to Mobile No {
                                      mobileInput
                                    }{" "}
                                    <button
                                      onClick={handleChangeNumber}
                                      className=" border-0 text-danger-emphasis  bg-transparent  btn-link"
                                    >
                                      Change
                                    </button>
                                  </h6>
                                </Col>
                              </Row>
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
                                  />
                                </div>
                                <div className="col-12">
                                  {error && (
                                    <div className="text-danger mt-2">
                                      {error}
                                    </div>
                                  )}
                                </div>
                              </Row>
                              <Row>
                                <Col className="text-center">
                                  <button
                                    onClick={handleOtpSubmit}
                                    disabled={isLoading}
                                    className="mt-3 btn-save mx-auto"
                                  >
                                    {" "}
                                    {isLoading ? "Validating..." : "Validate"}
                                  </button>
                                </Col>
                              </Row>
                            </>
                          ) : (
                            ""
                          )}
                        </Col>
                      </>
                    )}
                  </Row>

                  {validated ? (
                    <>
                      <Row>
                        <Col>
                          <PropertyMultistepForm />
                        </Col>
                      </Row>
                    </>
                  ) : (
                    ""
                  )}
                </>
              )}
              {!showList ? (
                <>
                  <button
                    className="btn btn-cancel mt-5"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                ""
              )}
            </Card.Body>
          </Card>
        </>
      ) : (
        <h4 className=" text-primary ">
          Opps ! 😶 You Cannot add any property. Since your a Tenant.
        </h4>
      )}
    </>
  );
}

export default PropertyListing;
