import { useState, useRef, useCallback, useEffect } from "react";
import { Card, Row, Col, Button, Form } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import PropertyMultistepForm from "./propertymultiform";
import { GetLoginInfo } from "../auth/logindata";
import { deviceInfo, MaskInitial, showPopup ,encryptKeyWithExpiry,decryptKeyWithExpiry  } from "../../utils/validation";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";

function PropertyListing() {
  const [showList, setShowList] = useState(true);
  const [mobileInput, setMobileInput] = useState(true);
  const[landlordMobile, setLandlordMobile] = useState("");
  const [inputDisable, setInputDisable] =useState(false);
  const [validated, setValidated] = useState(false);
 const [userData, setUserData]= useState([]);
 //#region OTP Submission
   const handleOtpSubmit = () =>{
     
    

        const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
        if (enteredCode.length != 4) {
          setError("Invalid OTP. Please enter 4 digit OTP.");
          return;
        } else {
          handleVerify();
        }
      };
      const handleVerify = async () => {
        let dataPopup=null;
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
            text: "The entered code is incorrect. Please try again",
            iconType: "error",
          };
          showPopup(dataPopup);
        }
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

        if (processData?.inital_p === 'U' && processData?.process_p !== '0') {
          console.log("Conditions met. Updating states...");
          setValidated(true);
          setMobileInput(false);
          setShowList(false);
        } else {
          console.log("Conditions not met.");
        }
      } catch (error) {
        console.error("Error parsing 'prop_process' from localStorage:", error);
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
      if (user.userType === 'Landlord') {
        setLandlordMobile( MaskInitial({input:user.userMobile,endIndex:6}));
        setInputDisable(true);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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

  const sendOTP=  async ()=>{
   // 
    const ipAddr = await deviceInfo();
    const response = await axios.post(API_ENDPOINTS.otpAuthentication, {
      transactionType: "Login",
      customerType: "Landlord", // Replace with the correct value
      userMobileNo: userData.userType==='Landlord' ? userData.userMobile : landlordMobile,
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
        localStorage.removeItem('propOtp');
        localStorage.setItem(
          'propOtp',
          encryptKeyWithExpiry(resultArray[4], 120)
        );
        setMobileInput(false);
      }
    }
  }

  //#endregion

  const handleCancel =() =>{
    setShowList(true);
    setValidated(false);
    setMobileInput(true);
    localStorage.removeItem('prop_process');
    localStorage.removeItem('next_stpro');
    setLandlordMobile("");
  }

  const handleNewProperty=(e)=>{
    const checkProcess = localStorage.getItem("prop_process");
    const processData = JSON.parse(checkProcess);
    if (!processData || ( processData.process_p==='0' && processData.actual_p=='U' ) ) {
      const data = {
        inital_p: "I",
        actual_p: "I",
        process_p: "0",
        process_r:"0"
      };
    
      localStorage.setItem('prop_process', JSON.stringify(data)); 
      setShowList(false)
      setMobileInput(true);
      setValidated(false);
    }
  }

  return (
    <>
      <Pageheader
        title="Property Listing"
        heading="Customer"
        active="Property Listing"
      />
      <Card>
        <Card.Body>
          {showList ? (
            <>
              <Row>
                <Col xs={12}>
                  <Button
                    className=" float-end"
                    onClick={(e)=>setShowList(false)}
                  >
                    {" "}
                    <i className=" bi bi-plus-circle"></i> New Property
                  </Button>
                </Col>
                <Col xs={12}>Property List Datatables</Col>
              </Row>
            </>
          ) : (
            <>
              <Row>
                { (mobileInput)?  (
                  <>
                    <Col lg={3} md={4} sm={6}>
                      <Form.Group>
                        <Form.Label>Landlord Mobile No</Form.Label>
                        <Form.Control  onChange={(e)=>setLandlordMobile(e.target.value)} value={landlordMobile}  disabled={setInputDisable} maxLength={10} ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col lg={3} md={4} sm={6}>
                      <Button  onClick={sendOTP} className="mt-4">Send OTP</Button>
                    </Col>
                  </>
                ) : (
                  <>
                    <Col lg={4} md={8} className="mx-auto">                  
                    {!validated ? (<>
                      <Row >
                      <Col className="text-center">
                        <h6> Enter OTP Sent to Mobile No {mobileInput} <button className=" border-0 text-danger-emphasis  bg-transparent  btn-link">Change</button></h6> 
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
                        <Button onClick={handleOtpSubmit} className="mt-3 mx-auto">Validate</Button>
                        </Col>
                      </Row>
                    </>) : ""}
                  
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
              <Button
                className="btn btn-danger mt-5"
                onClick={handleCancel}
              >
                Cancel Property Listing
              </Button>
            </>
          ) : (
            ""
          )}
        </Card.Body>
      </Card>
    </>
  );
}

export default PropertyListing;
