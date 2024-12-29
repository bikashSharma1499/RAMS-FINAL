import { Row, Col, Form, Button } from "react-bootstrap";
import { useEffect, useState, useCallback, useRef } from "react";
import Select from "react-select";
import axios from "axios";
import { GetLoginInfo } from "../auth/logindata";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { mobileAuthentication } from "./agreementdata";
import {
  decryptKeyNormal,
  decryptKeyWithExpiry,
  encryptKeyNormal,
  encryptKeyWithExpiry,
  showPopup,
} from "../../utils/validation";
import RentAgreementTenantList from "./agreementlist";

const SecondPartyValidation =  ({ goToStep}) => {
  const user = GetLoginInfo();
  const [inputMobile, setInputMobile] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [otpValidation, setOtpValidation] = useState(false);

  const [showTenantList, SetShowTennantList] = useState(true);
  const [tenantAdd, setAddTenant] = useState(false);
  const [errors, setErrors] = useState({
    sp_email: "",
    sp_title: "",
    sp_fname: "",
    sp_lname: "",
    sp_fathername: "",
    sp_age: "",
    sp_address: "",
  });

  const initialState = {
    sp_email: "",
    sp_title: "",
    sp_fname: "",
    sp_lname: "",
    sp_fathername: "",
    sp_age: "",
    sp_address: "",
  };
  const [userData, setUserData] = useState(null);
  const [inputData, setInputData] = useState(initialState);

  const [error, setError] = useState("");
const [nextEnabled, setNextEnabled]= useState(false);

  useEffect(() => {
  
    const setNextEnable=()=>{
const count = localStorage.getItem('tenantCount');
if(count && count>0){
  setNextEnabled(true);
}    };
    setNextEnable();
  }, [showTenantList]);


  //#region OTP Handling
  const inputRefs = useRef({
    one: useRef(null),
    two: useRef(null),
    three: useRef(null),
    four: useRef(null),
  });

  const mobileOtp = async () => {
    if (inputMobile.length !== 10) {
      return showPopup({
        title: "Error",
        msg: "Invalid mobile number",
        iconType: "error",
      });
    }
    try {
      const response = await mobileAuthentication({
        type: "Auth",
        custType: "Tenant",
        mobileNo: inputMobile,
      });
      if (Array.isArray(response) && response.length > 3) {
        showPopup({
          title: "OTP Sent",
          msg: response[4],
          icontype: "success",
        });
        // localStorage.removeItem("rentOtp");
        //localStorage.removeItem("rent_styp");
        localStorage.setItem("rentOtpSP", encryptKeyNormal(response[4]), 120);
        localStorage.setItem("rent_tnt_k", encryptKeyNormal(response[3]));
        localStorage.setItem("rent_styp", response[0]);
        setOtpValidation(true);
      } else {
        showPopup({
          title: "Error",
          msg: "Something went wrong",
          icontype: "error",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputOTP = (currentId, nextId) => {
    const currentInput = inputRefs.current[currentId]?.current;
    if (currentInput && currentInput.value.length === 1) {
      const nextInput = inputRefs.current[nextId]?.current;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpVerify = async (e) => {
    const enteredCode = `${inputRefs.current.one.current.value}${inputRefs.current.two.current.value}${inputRefs.current.three.current.value}${inputRefs.current.four.current.value}`;

    if (enteredCode.length != 4) {
      showPopup({
        title: "Input Reuired",
        msg: "All fields are required",
        iconType: "error",
      });
      return;
    } else {
      const correctCode = decryptKeyNormal(localStorage.getItem("rentOtpSP"));
      if (enteredCode === correctCode) {
        const key = decryptKeyNormal(localStorage.getItem("rent_tnt_k"));
        if (key != 0) {
          showPopup({
            title: "Success",
            msg: "OTP verified successfully",
            iconType: "success",
          });
          loadTenant();
        } else {
          showPopup({
            title: "No Tenant Found",
            msg: "OTP Verified. No Tenant Found. Please Add",
            iconType: "success",
          });
        }
        setShowForm(true);
      } else {
        showPopup({ title: "Error", msg: "Invalid OTP", icontype: "error" });
      }
    }
   // setShowForm(false);SetShowTennantList(true);
  };

  //#endregion

  //#region Dataloading if User Tenanat Found
  const loadTenant = async () => {
    //debugger;
    try {
      const response = await axios.post(API_ENDPOINTS.customerList, {
        customerType: "Tenant",
        customerCode: decryptKeyNormal(localStorage.getItem("rent_tnt_k")),
      });
  
      if (Array.isArray(response.data) && response.data.length > 0) {
        const user = response.data[0]; // Extract user data
        setUserData(user); // Update the userData state
  
        // Map user data to inputData state with proper fallback checks
        setInputData({
          sp_email: typeof user.mail_id === "string" ? user.mail_id : "",
          sp_title: typeof user.title === "string" ? user.title : "",
          sp_fname: typeof user.first_name === "string" ? user.first_name : "",
          sp_lname: typeof user.last_name === "string" ? user.last_name : "",
          sp_fathername: typeof user.father_name === "string" ? user.father_name : "",
          sp_age: typeof user.age === "string" || typeof user.age === "number" ? user.age : "",
          sp_address: typeof user.address === "string" ? user.address : "",
        });
      } else {
        console.error("Unexpected data structure or empty array");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Handle input change and validate individual fields
  const handleInputChange = (eventOrValue, actionMeta) => {
    let validationErrors = { ...errors };
    if (actionMeta) {
      // For `Select` component
      const { name } = actionMeta;
      const value = eventOrValue.value;

      // Validate the field
      if (!value) {
        validationErrors[name] = `${name.replace("sp_", "")} is required.`;
      } else {
        validationErrors[name] = ""; // Clear error if valid
      }

      setInputData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      // For regular input field
      const { name, value } = eventOrValue.target;
      setInputData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      // Validate the field
      if (!value) {
        validationErrors[name] = `${name.replace("sp_", "")} is required.`;
      } else if (name === "sp_age" && isNaN(value)) {
        validationErrors[name] = "Valid age is required.";
      } else if (name === "sp_email" && !emailRegex.test(value)) {
        validationErrors[name] = "Please enter a valid email address.";
      } else {
        validationErrors[name] = ""; // Clear error if valid
      }
    }

    setErrors(validationErrors);
  };

  // Handle form submission
  const handleSubmit = async (retryCount = 0) => {
   
    let validationErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(inputData).forEach((key) => {
      const value = inputData[key];
      if (!value) {
        validationErrors[key] = `${key.replace("sp_", "")} is required.`;
        isValid = false;
      } else if (key === "sp_age" && isNaN(value)) {
        validationErrors[key] = "Valid age is required.";
        isValid = false;
      } else if (key === "sp_email" && !emailRegex.test(value)) {
        validationErrors[key] = "Please enter a valid email address.";
        isValid = false;
      }
    });

    // Update error state
    setErrors(validationErrors);

    // If invalid, stop form submission
    if (!isValid) {
      // showPopup({
      //   title: "Validation Error",
      //   msg: "Please fill all required fields.",
      //   iconType: "error",
      // });
      return;
    }
    setAddTenant(true);
    // Proceed with form submission if valid
    const agr = JSON.parse(localStorage.getItem("rg_rcd"));
    try {
      const response = await axios.post(API_ENDPOINTS.agreementSecondParty, {
        agreementCode: agr?.agr_k,
        partyType: "Tenant",
        mobileNumber: inputMobile,
        title: inputData.sp_title,
        firstName: inputData.sp_fname,
        lastName: inputData.sp_lname,
        email: inputData.sp_email,
        fatherName: inputData.sp_fathername,
        age: inputData.sp_age,
        address: inputData.sp_address,
      });

      console.log("Submit Response:", response.data.result);
      showPopup({
        title: "Success",
        msg: "Tenant Added Successfully",
        iconType: "success",
      });
      setOtpValidation(false);
      setInputData(initialState);
      setTimeout(() => {
        SetShowTennantList(true);
      }, 1200);
    } catch (error) {
      console.error("Submission error:", error);

      // Handle error and retry logic
      if (retryCount < 3) {
        // Retry limit
        console.log("Retrying submission...");
        handleSubmit(retryCount + 1); // Recall the function with incremented retry count
      } else {
        showPopup({
          title: "Error",
          msg: "Error submitting data. Please try again.",
          iconType: "error",
        });
      }
    }
    setAddTenant(false);
  };
  //#endregion



  //#region  Add New tenant state
  const handleNewTenant = () => {
    
    SetShowTennantList(false);
    setShowForm(false);
    setOtpValidation(false);
  };

  const handleCancel =()=>{
    SetShowTennantList(true);
    setShowForm(false);
    setOtpValidation(false);
  }
  //#endregion
  return (
    <div>
      <h4 className="fw-bolder text-dark">Second Party</h4>
      {showTenantList ? (
        <>
          <Row>
            <Col xs={12}>
              <Button
                onClick={handleNewTenant}
                className=" btn btn-primary float-end "
              >
                {" "}
                <i className=" bi-plus-circle"></i> Add Tenant
              </Button>
            </Col>
            <Col></Col>
          </Row>
          <RentAgreementTenantList />

          <Row>
            <Col>
            <Button className=" float-start"  onClick={()=>goToStep(1)} >Prev</Button>
            <Button className=" float-end"  onClick={()=>goToStep(3)} >Next</Button>
            </Col>
          </Row>
        </>
      ) : (
        <>
          {!showForm ? (
            <Row className="mb-4">
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label>Mobile No</Form.Label>
                  <Form.Control
                    value={inputMobile}
                    maxLength={10}
                    autoComplete="off"
                    disabled={otpValidation}
                    onChange={(e) =>
                      setInputMobile(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </Form.Group>
              </Col>
              <Col lg={3} className=" ms-md-5 mt-4">
                {!otpValidation ? (
                  <Button
                    onClick={mobileOtp}
                  
                    className="btn btn-success "
                  >
                    Send OTP
                  </Button>
                ) : (
                  <>
                    <Row>
                      {["one", "two", "three", "four"].map((id, index) => (
                        <Col key={id} lg={3}>
                          <Form.Control
                            type="text"
                            className="form-control-lg text-center"
                            maxLength={1}
                            autoComplete="off"
                            onChange={() =>
                              handleInputOTP(
                                id,
                                ["one", "two", "three", "four"][index + 1]
                              )
                            }
                            ref={inputRefs.current[id]}
                            onKeyDown={(e) =>
                              id === "four" &&
                              e.key === "Enter" &&
                              handleOtpVerify()
                            }
                          />
                        </Col>
                      ))}
                    </Row>
                    <Button
                      onClick={handleOtpVerify}
                      className="btn btn-primary mx-auto mt-3"
                    >
                      Validate OTP
                    </Button>

                    <Button  onClick={mobileOtp} className="btn btn-primary mt-3 ms-2" > Resend OTP</Button>
                  </>
                )}
              </Col>
            </Row>
          ) : (
            <div>
              {/* Form Fields */}
              <Row>
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>Mobile No</Form.Label>
                    <Form.Control
                      disabled
                      name="sp_mobile"
                      value={inputMobile}
                    ></Form.Control>
                    {errors.sp_mobile && (
                      <div className="text-danger">{errors.sp_mobile}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={inputData.sp_email}
                      onChange={handleInputChange}
                      name="sp_email"
                    ></Form.Control>
                    {errors.sp_email && (
                      <div className="text-danger">{errors.sp_email}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Select
                      options={[
                        { label: "Mr", value: "Mr" },
                        { label: "Mrs", value: "Mrs" },
                        { label: "Miss", value: "Miss" },
                      ]}
                      value={
                        inputData.sp_title
                          ? {
                              label: inputData.sp_title,
                              value: inputData.sp_title,
                            }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleInputChange(selectedOption, {
                          name: "sp_title",
                        })
                      }
                      placeholder="Select"
                    />
                    {errors.sp_title && (
                      <div className="text-danger">{errors.sp_title}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      name="sp_fname"
                      value={inputData.sp_fname}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={50}
                    ></Form.Control>
                    {errors.sp_fname && (
                      <div className="text-danger">{errors.sp_fname}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      name="sp_lname"
                      value={inputData.sp_lname}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={50}
                    ></Form.Control>
                    {errors.sp_lname && (
                      <div className="text-danger">{errors.sp_lname}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>Father Name</Form.Label>
                    <Form.Control
                      name="sp_fathername"
                      value={inputData.sp_fathername}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={50}
                    ></Form.Control>
                    {errors.sp_fathername && (
                      <div className="text-danger">{errors.sp_fathername}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      name="sp_age"
                      value={inputData.sp_age}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={2}
                    ></Form.Control>
                    {errors.sp_age && (
                      <div className="text-danger">{errors.sp_age}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col lg={3} md={4} sm={6}>
                  <Form.Group>
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      name="sp_address"
                      value={inputData.sp_address}
                      onChange={handleInputChange}
                      type="text"
                    ></Form.Control>
                    {errors.sp_address && (
                      <div className="text-danger">{errors.sp_address}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col lg={3} md={4} sm={6}></Col>
              </Row>
              <Row>
                <Col>
                  <Button
                    onClick={handleSubmit}
                    disabled={tenantAdd}
                    className="btn btn-success mt-3"
                  >
                    {tenantAdd ? (
                      "Adding Tenant ..."
                    ) : (
                      <>
                        <i className="bi bi-plus-circle"></i> Add
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCancel} className="btn btn-danger  mt-3 ms-2">
Cancel
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SecondPartyValidation;
