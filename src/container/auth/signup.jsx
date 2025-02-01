import { FC, Fragment, useState,useCallback, useRef } from "react";

import { Button, Card,Row , Col, Form } from "react-bootstrap";
import desktoplogo from "../../assets/images/brand-logos/desktop-logo.png";
import desktopdarklogo from "../../assets/images/brand-logos/desktop-dark.png";
import { Link } from "react-router-dom";
import Select from "react-select";
import { SelectNameTitle } from "./signupdata";
import Swal from "sweetalert2";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AES } from "crypto-js";
import { deviceInfo,decryptKeyWithExpiry, encryptKeyWithExpiry, showPopup } from "../../utils/validation";
import { sendSMS } from "../../utils/sms";
const Signup = () => {
  const [validated, setValidated] = useState(false);
  const [valid, setValid] = useState(false);
  const [loginType, setLoginType] = useState("Landlord");
  const [title, setTitle] = useState(SelectNameTitle[0].value);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [mobile, setMobile] = useState("");
  const [check, setCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    fname: "",
    lname: "",
    mobile: "",
    check: "",
  });

  const[error, setError] =useState("");
  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    let error = "";

    if (!/^\d*$/.test(value)) {
      error = "Only numeric values are allowed.";
      setMobile("");
    } else if (value.length > 10) {
      error = "Mobile number must be exactly 10 digits.";
    }

    setMobile(value);
    setErrors((prevErrors) => ({ ...prevErrors, mobile: error }));
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    let formValid = true;

    if (!fname.trim()) {
      formValid = false;
      setErrors((prevErrors) => ({
        ...prevErrors,
        fname: "First name is required.",
      }));
    }

    if (!lname.trim()) {
      formValid = false;
      setErrors((prevErrors) => ({
        ...prevErrors,
        lname: "Last name is required.",
      }));
    }

    if (!mobile.trim()) {
      formValid = false;
      setErrors((prevErrors) => ({
        ...prevErrors,
        mobile: "Mobile no is required.",
      }));
    } else if (mobile.length !== 10) {
      formValid = false;
      setErrors((prevErrors) => ({
        ...prevErrors,
        mobile: "Mobile number must be exactly 10 digits.",
      }));
    } else if (!/^\d*$/.test(mobile)) {
      formValid = false;
      setErrors((prevErrors) => ({
        ...prevErrors,
        mobile: "Only numeric values are allowed.",
      }));
    }

    if (!check) {
      formValid = false;
      setErrors((prevErrors) => ({
        ...prevErrors,
        check: "Please accept terms and conditions.",
      }));
    }

    if (formValid) {
      setValid(true);
      setErrors({ title: "", fname: "", lname: "", mobile: "" });
      console.log({ title, fname, lname, mobile, loginType });
      try {
       
        const response = await axios.post(API_ENDPOINTS.otpAuthentication, {
          transactionType: "Registration",
          customerType: loginType,
          userMobileNo: mobile,
          diviceId: "randomDeviceId123",
        });

        console.log(API_ENDPOINTS.otpAuthentication);
        if (response.status === 200) {
          const resultArray = response.data.result.split(",");
          Swal.fire({
            icon: resultArray[0],
            title: resultArray[4],
            text: resultArray[4],
            timer: 1500,
          });
          if (resultArray[0] === "success") {
            sendSMS(fname,mobile,resultArray[4]);
            localStorage.setItem('regOtp', encryptKeyWithExpiry(resultArray[4],180));
            setTimeout(() => {
              setValidated(true);
            }, 1000);
              
          }

          console.log("Array Values:", resultArray);
        } else {
          setError(response.data.message || "Something went wrong.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text:
            error.response?.data?.message || "An unexpected error occurred.",
        });
      } finally {
        setIsLoading(false); 
      }
    } else {
      setValid(false);
    }
    setIsLoading(false);
  };

  // Add a class for invalid fields
  const inputClass = (field) => {
    return errors[field] ? "is-invalid" : "";
  };


  //#region Mobile OTP Validatin
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



  //#endregion
  
  //#region Hanlde OTP submission and auto Registration
  const handleOtpSubmit = () =>{
    const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
    if (enteredCode.length != 4) {
      setError("Invalid OTP. Please enter 4 digit OTP.");
      return;
    }
     else {
      handleAutoRegister();
    }
  };


  const handleAutoRegister = async () => {
    //debugger;
    let dataPopup = null;
    const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
    const decryptionResult = decryptKeyWithExpiry(localStorage.getItem("regOtp"));
    if (!decryptionResult || !decryptionResult.data) {
      console.error("Failed to decrypt OTP:", decryptionResult);
      showPopup({title:"Error", msg:"OTP has been expired.Try once again", iconType:"error"});
      setTimeout(() => {
        setValidated(false);
      }, 1200);
    
      return;
    }
    const correctCode = decryptionResult.data;
    console.log("Correct Code:", correctCode);
  
    if (enteredCode === correctCode) {
      const payload = {
        transactionType: "I",
        customerCode: "0",
        customerType: loginType,
        title: title,
        firstName: fname,
        lastName: lname,
        mobileNo: mobile,
        address: "",
        mailId: "",
        panNo: "",
        adhaarNo: "",
        fatherName: "",
        age: "",
        entryType: "Customer",
        entryCustomerCode: "0",
      };
      console.log("Payload for registration:", payload);
  
      try {
        const response = await axios.post(API_ENDPOINTS.customerRegistrationMin, payload);
        if (response.status === 200) {
          console.log("Response Data:", response.data[0]);
          const output= response.data[0];
          if(output._type==='Success'){
            showPopup({ title: "Succesfull",msg: "You have successfully Resgisterd. Now you can Login", iconType: "success",})
            setTimeout(() => {
              navigate(`${import.meta.env.BASE_URL}auth/signin/`);
            }, 2500);
          }else{
            showPopup({
              title: "Already Registered",
              msg: `This ${mobile} is already associated with ${loginType}`,
              iconType: "success",
            });
            
            setValidated(false);
          }
          console.log(output._type);
        }
      } catch (error) {
        console.error("Axios error:", error.response || error.message);
        if (error.response) {
          console.log("Error Response Data:", error.response.data);
          console.log("Error Status:", error.response.status);
        }
      }
    } else {
      Object.keys(inputRefs).forEach((refKey) => {
        inputRefs[refKey].current.value = "";
      });
  
      dataPopup = {
        title: "Invalid OTP",
        text: "The entered code is incorrect. Please try again",
        iconType: "error",
      };
      showPopup(dataPopup);
    }
  };
  
  //#endregion


  return (
    <Fragment>
      <div className="container-lg">
        <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
          <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
            <Card className="custom-card">
              {!validated ? (
                <Card.Body className="p-5 pt-1">
                  <div className="my-1 d-flex justify-content-center">
                    <Link to={`${import.meta.env.BASE_URL}dashboards/crm/`}>
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
                    </Link>
                  </div>
                  <p className="h5 fw-semibold mb-2 text-center">Sign Up</p>
                  <p className="mb-4 text-muted op-7 fw-normal text-center">
                    Welcome & Join us by creating a free account!
                  </p>
                  <div className="row gy-3">
                    {/* Role Selection */}
                    <Col xl={12}>
                      <Form.Group className="mb-3" controlId="validationRole">
                        <Form.Label>Type</Form.Label>
                        <div className="d-flex justify-content-between mt-2">
                          <Form.Check
                            inline
                            label="Landlord"
                            defaultChecked
                            name="loginType"
                            type="radio"
                            id="role-landlord"
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
                    </Col>
                    <Col xl={12}>
                      <Form.Label
                        htmlFor="signup-title"
                        className="form-label text-default"
                      >
                        Title
                      </Form.Label>
                      <Select
                        name="state"
                        options={SelectNameTitle}
                        className="basic-multi-select"
                        isSearchable
                        menuPlacement="auto"
                        classNamePrefix="Select2"
                        onChange={(selectedOption) => {
                          console.log(selectedOption); // Log the selected option
                          setTitle(selectedOption?.value || ""); // Update state
                        }}
                        defaultValue={SelectNameTitle[0]} // Set default value
                      />
                    </Col>
                    <Col xl={12}>
                      <Form.Label
                        htmlFor="signup-firstname"
                        className="form-label text-default"
                      >
                        First Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={fname}
                        onChange={(e) => {
                          setFname(e.target.value);
                          setErrors({ ...errors, fname: "" });
                        }}
                        className={`form-control form-control-lg ${inputClass(
                          "fname"
                        )}`}
                        id="signup-firstname"
                        autoComplete="off"
                        autoFocus
                        placeholder="First name"
                      />
                      {errors.fname && (
                        <Form.Text className="text-danger">
                          {errors.fname}
                        </Form.Text>
                      )}
                    </Col>
                    <Col xl={12}>
                      <Form.Label
                        htmlFor="signup-lastname"
                        className="form-label text-default"
                      >
                        Last Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={lname}
                        onChange={(e) => {
                          setLname(e.target.value);
                          setErrors({ ...errors, lname: "" });
                        }}
                        className={`form-control-lg ${inputClass("lname")}`}
                        id="signup-lastname"
                        placeholder="Last name"
                        autoComplete="off"
                        autoFocus
                      />
                      {errors.lname && (
                        <Form.Text className="text-danger">
                          {errors.lname}
                        </Form.Text>
                      )}
                    </Col>
                    <Col xl={12}>
                      <Form.Label
                        htmlFor="signup-mobilenumber"
                        className="form-label text-default"
                      >
                        Mobile No
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={mobile}
                        inputMode="number"
                        className={`form-control-lg ${inputClass("mobile")}`}
                        id="signup-mobilenumber"
                        autoComplete="off"
                        onChange={handleMobileNumberChange}
                        isInvalid={!!errors.mobile}
                        placeholder="Mobile No"
                        maxLength={10}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.mobile}
                      </Form.Control.Feedback>
                    </Col>
                    <Col xl={12} className="mb-2">
                      <div className="form-check mt-3">
                        <Form.Check
                          className=""
                          type="checkbox"
                          value=""
                          id="defaultCheck1"
                          checked={check}
                          onChange={() => setCheck(!check)} // Toggle checkbox state
                          isInvalid={!!errors.check} // Apply invalid style if there's an error
                        />
                        <Form.Label
                          className="form-check-label text-muted fw-normal"
                          htmlFor="defaultCheck1"
                        >
                          By creating an account, you agree to our{" "}
                          <Link
                            to={`${
                              import.meta.env.BASE_URL
                            }pages/termsconditions/`}
                            className="text-success"
                          >
                            <u>Terms & Conditions</u>
                          </Link>{" "}
                          and{" "}
                          <Link to="#" className="text-success">
                            <u>Privacy Policy</u>
                          </Link>
                        </Form.Label>
                        {errors.check && (
                          <Form.Text className="text-danger">
                            {errors.check}
                          </Form.Text>
                        )}
                      </div>
                    </Col>
                    <Col xl={12} className="d-grid mt-2">
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        className="btn btn-lg"
                        disabled={isLoading}
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
                          "Validate"
                        )}
                      </Button>
                    </Col>
                  </div>
                  <div className="text-center">
                    <p className="fs-12 text-muted mt-3">
                      Already have an account?{" "}
                      <Link
                        to={`${import.meta.env.BASE_URL}auth/signin/`}
                        className="text-primary"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              ) : (
                <>

                <Card>
                  <Card.Body className=" p-4" >
                  <Row >
                      <Col className="text-center">
                        <h6> Enter OTP Sent to Mobile No {mobile} <button onClick={()=>setValidated(false)} className=" border-0  text-primary bg-transparent  btn-link">Change</button></h6> 
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
                            // onChange={() => handleOtpVerify}
                            ref={inputRefs.four}
                          />
                        </div>
                      </Row>
                      <Row>
                        <Col className="text-center">
                        <Button onClick={handleOtpSubmit} className="mt-3 mx-auto">Submit</Button>
                        </Col>
                      </Row>
                  </Card.Body>
                </Card>
            
                
                </>


              )}
            </Card>
          </Col>
        </div>
      </div>
    </Fragment>
  );
};

export default Signup;
