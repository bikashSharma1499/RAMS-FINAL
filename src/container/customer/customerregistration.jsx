import { useState, useCallback, useRef, useEffect } from "react";
import { Row, Col, Form, Button } from 'react-bootstrap';
import { showPopup,encryptKeyWithExpiry,decryptKeyWithExpiry } from "../../utils/validation";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";

function CustomerNewRegistration() {
    const [showMobileInput, setShowMobileInput] = useState(true);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setSentOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState("Landlord");
    const [inputMobile, setInputMobile] = useState("");
    // const [type, setType] = useState("Broker");
    const [trnType, setTrnType] = useState("I");
    const [custCode, setCustCode] = useState("0");

    const [title, setTitle] = useState("Mr.");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [mobile, setMobile] = useState("");
    const [address, setAddress] = useState("");
    const [aadhar, setAadhar] = useState("");
    const [pan, setPan] = useState("");
    const [fathername, setFathername] = useState("");
    const [age, setAge] = useState("");
    const [mail, setMail] = useState("");
    const [check, setCheck] = useState(false);
    const [error, setError] = useState();
    const [errors, setErrors] = useState(
        {
            fname:"",
            lname:"",
            address:"",
            check:""
        }
    );
    useEffect( ()=>{
        const check = async ()=>{
            const item = JSON.parse(localStorage.getItem('custEdit'));
            if(item && item.trnType==='U'){
                setTrnType("U");
                setCustCode(item.custCode);
                setShowMobileInput(false);
                setLoginType(item.custType);

                const response = await axios.post("https://api.4slonline.com/rams/api/User/CustomerList",
                    {
                        customerType:item.custType,
                        customerCode:item.custCode,
                    } );
                    console.log(response.data);
                    if(response.status===200){
                        const data = response.data[0];
                        setTitle(data.Title);
                        setFname(data.first_name);
                        setLname(data.last_name);
                        setInputMobile(data.mobile_no);
                        setAddress(data.address);
                        setPan(data.pan_no);
                        setAadhar(data.adhaar_no);
                        setFathername(data.father_name);
                        setAge(data.age);
                        setMail(data.mail_id);
                    }
            }
        }
        check();
    },[]);

const[valid, setValid]=useState(false);
    const handleSendOtp = async () => {
        console.log(valid);
       if(!valid){
        setError("Please Enter valid mobile Number");
        return;
       }
  
        setSendingOtp(true);
        try {
            const response = await axios.post(API_ENDPOINTS.otpAuthentication, {
                transactionType: "Registration",
                customerType: loginType,
                userMobileNo: inputMobile,
                diviceId: "64654",
            });
            if (response.status === 200) {
              //  debugger;
                const resultArray = response.data.result.split(",");
                const msg =
                   resultArray[0] === "success"
                        ? "OTP has been sent to your mobile no"
                        : resultArray[4];
                showPopup({ title: resultArray[4] + resultArray[0], msg: msg, iconType: resultArray[0] })
                if(resultArray[0]==='success'){
                  //  setSendingOtp(false);
                    setSentOtp(true);
                    const otp = encryptKeyWithExpiry(resultArray[4], 120);
                    const userKey = encryptKeyWithExpiry(resultArray[3], 120);
                    const userType = encryptKeyWithExpiry(resultArray[2],300);
                    localStorage.setItem('regUserType',userType);
                    localStorage.setItem("regOtp", otp);
                    localStorage.setItem("regUserKey", userKey);
                }
            } else {
                console.log("Request Failed");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleMobileNumberChange = (e) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) {
          setError("Only numeric values are allowed.");
          return;
        }
        setError(""); 
        setInputMobile(value);
        setValid(true);
      };
    const inputRefs = {
        one: useRef(null),
        two: useRef(null),
        three: useRef(null),
        four: useRef(null),
    };

    const handleInputChange = useCallback((currentId, nextId) => {
        const currentInput = inputRefs[currentId].current;
        if (currentInput && currentInput.value.length === 1) {
            const nextInput = inputRefs[nextId] ? inputRefs[nextId].current : null;
            if (nextInput) {
                nextInput.focus();
            }
        }
    }, [inputRefs]);

    const handleOtpSubmit = () => {
        const currentInput = inputRefs.four.current;
        const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
        const correctCode = decryptKeyWithExpiry(localStorage.getItem('regOtp'));  
        if(correctCode.valid){
            if (enteredCode === correctCode.data) {
                showPopup({ title: "Success", msg: "OTP Validated Successfully", iconType: "success" });
        setTimeout(() => {
            setShowMobileInput(false);
        }, 1500);
        setMobile(inputMobile);
            } else {
                Object.keys(inputRefs).forEach(refKey => {
                    inputRefs[refKey].current.value = '';
                });
                const data ={title:"Invalid OTP", text:"The entered code is incorrect. Please try again",iconType:"error"} 
                showPopup(data);
            }
        }else{
            const data ={title:"OTP Expired", text:"OTP has expired. Please try resend the OTP",iconType:"error"} 
            showPopup(data);
            Object.keys(inputRefs).forEach(refKey => {
                inputRefs[refKey].current.value = '';
            });
        }
    };


//form section
const handleSubmit = async (event) => {
//    debugger;
    event.preventDefault();
    setIsLoading(true);
    let formValid = true;

    // Validation logic
    if (!fname.trim()) {
        formValid = false;
        setErrors((prevErrors) => ({ ...prevErrors, fname: "First name is required." }));
    }

    if (!lname.trim()) {
        formValid = false;
        setErrors((prevErrors) => ({ ...prevErrors, lname: "Last name is required." }));
    }

    if (!inputMobile.trim()) {
        formValid = false;
        setErrors((prevErrors) => ({ ...prevErrors, mobile: "Mobile number is required." }));
    } else if (inputMobile.length !== 10) {
        formValid = false;
        setErrors((prevErrors) => ({ ...prevErrors, mobile: "Mobile number must be exactly 10 digits." }));
    } else if (!/^\d*$/.test(inputMobile)) {
        formValid = false;
        setErrors((prevErrors) => ({ ...prevErrors, mobile: "Only numeric values are allowed." }));
    }

    if (!check) {
        formValid = false;
        setErrors((prevErrors) => ({ ...prevErrors, check: "Please accept the terms and conditions." }));
    }

    if (formValid) {
        setErrors({ 
            fname: "", 
            lname: "", 
            address: "", 
            check: "", 
            mobile: "", 
            pan: "", 
            aadhar: "", 
            fathername: "", 
            age: "", 
            mail: "" 
        });



        console.log({ title, fname, lname, address, check });

        try {
            // debugger;
            const response = await axios.post(API_ENDPOINTS.CustomerNewRegistration, {
                
                transactionType: trnType,
                customerCode: custCode ,
                customerType: loginType,
                title: title,
                firstName: fname,
                lastName: lname,
                mobileNo: inputMobile,
                address: address,
                panNo: pan,
                adhaarNo: aadhar,
                fatherName: fathername,
                age: age,
                mailId: mail,
                entryType: "Customer",
                entryCustomerCode: GetLoginInfo().userKey,
            });
            if (response.status === 200 && response.data ) {
                showPopup({ 
                    title: "Success", 
                    msg: response.data.result || "Form submitted successfully!", 
                    iconType: "success" 
                });
                localStorage.removeItem('custEdit');
                console.log("API Response: ", response.data);
                setTimeout(() => {
                    window.location.href = '/customer/customerlist/';
                }, 1500);
            } else {
                const errorMsg = response.data?.message || "Something went wrong. Please try again.";
                showPopup({ 
                    title: "Error", 
                    msg: errorMsg, 
                    iconType: "error" 
                });
            }
        } catch (error) {
            console.error("API Error: ", error);
            showPopup({ 
                title: "Error", 
                msg: error.message || "Something went wrong. Please try again.", 
                iconType: "error" 
            });
        } finally {
            setIsLoading(false);
        }

    } else {
        setIsLoading(false);
    }
};


    return (
        <>
            {showMobileInput ? (
                <>
                    <Col xl={6}>
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
                    </Col>
                    <Row>

                        <Col lg={3} md={4} sm={5}>
                            <Form.Group>
                                <Form.Label>Mobile Number</Form.Label>
                                <Form.Control
                                required
                                type="text"
                                placeholder="Enter Mobile Number"
                                maxLength={10}
                                value={inputMobile}
                                autoComplete="off"
                                onChange={handleMobileNumberChange} 
                                isInvalid={
                                    !!error ||
                                    (inputMobile.length > 0 && inputMobile.length !== 10)
                                  }
                                  isValid={!!valid || inputMobile.length === 10}
                                  disabled={sendingOtp} />
                                  <Form.Control.Feedback type="invalid">
                  {error || "Mobile number must be exactly 10 digits."}
                </Form.Control.Feedback>
                <Form.Control.Feedback type="valid">
                  {valid}
                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        {!otpSent && (
                            <Col lg={3} md={6} sm={6}>
                                <Button onClick={handleSendOtp} disabled={sendingOtp} className="btn btn-primary mt-4">
                                    {sendingOtp ? "... Sending" : "Send OTP"}
                                </Button>
                            </Col>
                        )}
                    </Row>

                    {otpSent && (
                        <>
                            <Row>
                                <Col>
                                    <h4>Enter OTP</h4>
                                    <Row>
                                        {Object.keys(inputRefs).map((key, index) => (
                                            <div className="col-3" key={key}>
                                                <Form.Control
                                                    type="text"
                                                    className="form-control-lg text-center"
                                                    id={key}
                                                    maxLength={1}
                                                    autoComplete="off"
                                                    onChange={() => handleInputChange(key, Object.keys(inputRefs)[index + 1])}
                                                    ref={inputRefs[key]}
                                                />
                                            </div>
                                        ))}
                                    </Row>
                                    <div className="form-check mt-2">
                                         
                                        </div>
                                </Col>
                                <Col xl={3} className="d-grid mt-2">
                                <Button onClick={handleOtpSubmit}>Validate</Button>
                                </Col>
                            </Row>
                        </>
                    )}
                </>
            ) : (
                <>
                    <h3>Form</h3>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xl={12}>
                                <Form.Group className="mb-3" controlId="validationRole">
                                    <Form.Label>Select a role</Form.Label>
                                    <div className="d-flex ">
                                        <Form.Check
                                            inline
                                            label="Landlord"
                                            name="loginType"
                                            type="radio"
                                            id="role-landlord"
                                          defaultChecked={loginType === 'Landlord'}
                                            disabled
                                            value={loginType}
                                            //  onChange={(e) => setLoginType(e.target.value)}
                                            required
                                        />
                                        <Form.Check
                                            inline
                                            label="Broker"
                                            name="loginType"
                                            type="radio"
                                            id="role-broker"
                                            value={loginType}
                                            defaultChecked={loginType === 'Broker'}
                                            disabled
                                            //  onChange={(e) => setLoginType(e.target.value)}
                                            required
                                        />
                                        <Form.Check
                                            inline
                                            label="Tenant"
                                            name="loginType"
                                            type="radio"
                                            id="role-tenant"
                                            value={loginType}
                                            defaultChecked={loginType === 'Tenant'}
                                            disabled
                                            //  onChange={(e) => setLoginType(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Form.Control.Feedback type="invalid">
                                        Please select a role.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>


                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Select value={title} onChange={(e) => setTitle(e.target.value)}>
                                        <option>Mr.</option>
                                        <option>Ms.</option>
                                        <option>Mrs.</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={fname}
                                        onChange={(e) => setFname(e.target.value)}
                                        isInvalid={!!errors.fname}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.fname}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={lname}
                                        onChange={(e) => setLname(e.target.value)}
                                        isInvalid={!!errors.lname}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.lname}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mobile</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={inputMobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        disabled
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Aadhaar No.</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={aadhar}
                                        onChange={(e) => setAadhar(e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pan No.</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={pan}
                                        onChange={(e) => setPan(e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Father's Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={fathername}
                                        onChange={(e) => setFathername(e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Age</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col xl={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>mailId</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={mail}
                                        onChange={(e) => setMail(e.target.value)}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="I agree to the terms and conditions"
                                checked={check}
                                onChange={(e) => setCheck(e.target.checked)}
                                isInvalid={!!errors.check}
                            />
                            <Form.Control.Feedback type="invalid">{errors.check}</Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" disabled={isLoading} onClick={() => setShowList(true)}>
                            {isLoading ? "Submitting..." : "Submit"}
                        </Button>
                    </Form>
                </>
            )}
        </>
    );
}

export default CustomerNewRegistration;
