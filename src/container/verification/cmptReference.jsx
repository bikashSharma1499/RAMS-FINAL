import axios from "axios";
import React, { useState,useEffect  } from "react";
import { Row, Col, Form, Accordion, Button } from "react-bootstrap";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { showPopup } from "../../utils/validation";

const ComponentReference = ({ onUpdate }) => {

    const [transactionType, setTransactionType] = useState("I");
    const [referCode, setReferCode] = useState(0);
  const [referName, setReferName] = useState("");
  const [referMob, setReferMob] = useState("");
  const [referMail, setReferMail] = useState("");
  const [errors, setErrors] = useState({});

  // Regex patterns
  const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //#region 
   useEffect(() => {
    const fetchData = async () => {
      const code = localStorage.getItem("vrfCode");
      console.log("Verification Code:", code);
  
      if (code) {
        try {
          const response = await axios.post(API_ENDPOINTS.serviceReferenceList, {
            verificationCode: code,
          });
  
          console.log("API Response:", response.data);
  
          const data = response.data[0];
          if (data && data.address_code) {
            setTransactionType("U");
            setReferCode(data.address_code);
            setReferName(data.refer_person);
            setReferMail(data.refer_mail);
            setReferMob(data.refer_mobile)
     
           } else {
            console.warn("No valid data returned from the API");
          }
        } catch (error) {
          console.error("Error fetching data:", error.response || error.message);
        }
      }
    };
  
    fetchData();
  }, []);
  

  //#endregion

  //#region Validate and Submisssion

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "referName") {
      if (!value.trim()) {
        newErrors.referName = "Name is required.";
      } else {
        delete newErrors.referName;
      }
    }

    if (name === "referMob") {
      if (!value.trim()) {
        newErrors.referMob = "Mobile number is required.";
      } else if (!mobileRegex.test(value)) {
        newErrors.referMob = "Invalid mobile number.";
      } else {
        delete newErrors.referMob;
      }
    }

    if (name === "referMail") {
      if (!value.trim()) {
        newErrors.referMail = "Email is required.";
      } else if (!emailRegex.test(value)) {
        newErrors.referMail = "Invalid email address.";
      } else {
        delete newErrors.referMail;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    if (Object.keys(errors).length > 0 || !referName || !referMob || !referMail) {
      alert("Please correct the errors before submitting.");
      return;
    }

    const vrfData=  JSON.parse(localStorage.getItem('vrfCandidate'));
    // API Call Logic
    const payload = {
      transactionType:transactionType,
      referalCode:referCode,
      verificationCode:localStorage.getItem('vrfCode'),
      candidateName:vrfData.candidateName,
      mobileNumber:vrfData.mobileNumber,
      emailID:vrfData.emailID,
      referalName:referName,
      referalMobile:referMob,
      referalMail:referMail,
    };
    console.log(payload);
    try {
      const response = await axios.post(API_ENDPOINTS.serviceReference, payload);
      if (response.status === 200 && response.data) {
        const { result } = response.data;
        const resultArray = result ? result.split(",") : [];
        debugger;
        if (resultArray.length > 4) {
          showPopup({
            title: resultArray[1],
            msg: resultArray[4],
            iconType: "success",
          });
          const count= localStorage.getItem('vrfCount');
          if(count){
            localStorage.setItem('vrfCount',parseInt(count)+1);
          }else{
            localStorage.setItem('vrfCount',1);
          }
        } else {
          showPopup({
            title: "Unexpected Response",
            msg: "The server returned an incomplete response.",
            iconType: "error",
          });
        }
      } else {
        showPopup({
          title: "Submission Failed",
          msg: "The server returned an error. Please try again.",
          iconType: "error",
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      showPopup({
        title: "Error",
        msg: error.message || "An unexpected error occurred.",
        iconType: "error",
      });
    }
    
  }
  //#endregion

  return (
    <div>
      <Accordion defaultActiveKey={["0"]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Fill reference details</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col lg={4} md={6} sm={6}>
                <Form.Group>
                  <label>Referal Name</label>
                  <Form.Control
                    type="text"
                    value={referName}
                    onChange={(e) => {
                      setReferName(e.target.value);
                      validateField("referName", e.target.value);
                    }}
                    placeholder="Enter name"
                    isInvalid={!!errors.referName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.referName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={4} md={6} sm={6}>
                <Form.Group>
                  <label>Referal Mobile</label>
                  <Form.Control
                    type="text"
                    value={referMob}
                    maxLength={10}
                    onChange={(e) => {
                      setReferMob(e.target.value);
                      validateField("referMob", e.target.value);
                    }}
                    placeholder="Enter mobile number"
                    isInvalid={!!errors.referMob}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.referMob}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col lg={4} md={6} sm={6}>
                <Form.Group>
                  <label>Refer Mail</label>
                  <Form.Control
                    type="text"
                    value={referMail}
                    onChange={(e) => {
                      setReferMail(e.target.value);
                      validateField("referMail", e.target.value);
                    }}
                    placeholder="Enter email"
                    isInvalid={!!errors.referMail}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.referMail}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <Button variant="primary" onClick={handleSubmit}>
                { transactionType=='U' ?
                  ("Update"):("Submit")
                  }
                </Button>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ComponentReference;
