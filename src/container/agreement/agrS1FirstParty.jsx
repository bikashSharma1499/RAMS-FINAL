import { Row, Col, Form, Button } from "react-bootstrap";
import { GenerateOtp, MaskInitial, showPopup } from "../../utils/validation";
import { GetLoginInfo } from "../auth/logindata";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";

const FirstPartyValidation = ({  goToStep }) => {
  const user = GetLoginInfo();
  const [userData, setUserData] = useState(null); // Initially null to indicate loading
  const [inputData, setInputData] = useState({
    fatherName: "",
    age: "",
    address: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    fatherName: "",
    age: "",
    address: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(API_ENDPOINTS.customerList, {
          customerType: user.userType,
          customerCode: user.userKey,
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          setUserData(response.data[0]);
        } else {
          console.error("Unexpected data structure or empty array");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user.userType, user.userKey]);

  useEffect(() => {
    if (userData) {
      setInputData({
        fatherName: userData.father_name || "",
        age: userData.age || "",
        address: userData.address || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear any validation error when user changes input
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateFields = () => {
    let errors = {};

    // Validate Father Name
    if (!inputData.fatherName.trim()) {
      errors.fatherName = "Father's Name is required";
    }

    // Validate Age
    if (!inputData.age.trim()) {
      errors.age = "Age is required";
    }

    // Validate Address
    if (!inputData.address.trim()) {
      errors.address = "Address is required";
    }

    // Validate Email
    if (!userData?.mail_id || !/\S+@\S+\.\S+/.test(userData.mail_id)) {
      errors.email = "Please enter a valid email address";
    }

    setValidationErrors(errors);

    // Return true if there are no errors, otherwise false
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!userData || !inputData) {
      alert("Data is not fully loaded. Please wait.");
      return;
    }

    if (!validateFields()) {
      return; // Prevent submission if there are validation errors
    }

    setIsLoading(true);
    const agr = JSON.parse(localStorage.getItem("rg_rcd"));
    try {
      const response = await axios.post(API_ENDPOINTS.agreementFirstParty, {
        agreementCode: agr?.agr_k,
        partyType: userData.customer_type,
        mobileNumber: userData.mobile_no,
        title: userData.Title,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.mail_id,
        fatherName: inputData.fatherName,
        age: inputData.age,
        address: inputData.address,
      });

    //  console.log("Submit Response:", response.data.result);
      showPopup({title:"Successfull",msg:"First Party data updated",iconType:"success"});
     // alert("Data submitted successfully.");
      sessionStorage.setItem("step_3_nextEnabled", "true");
      setTimeout(()=>{
        goToStep(2);
      },1200);
      
    } catch (error) {
      showPopup({title:"Error",msg:error,iconType:"erroe"});
     // console.error(`Error occurred: ${error}`);
     // alert("Error submitting data. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h4 className="fw-bolder text-danger-subtle">
        First Party
      </h4>

      <Row className="mb-4">
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Mobile No</Form.Label>
            <Form.Control
              value={MaskInitial({ input: user.userMobile, endIndex: 6 })}
              disabled
            />
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={userData?.mail_id || ""}
              
              isInvalid={!!validationErrors.email}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col xl={3}>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control value={userData?.Title || ""} disabled />
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>First Name</Form.Label>
            <Form.Control value={userData?.first_name || ""} disabled />
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Last Name</Form.Label>
            <Form.Control value={userData?.last_name || ""} disabled />
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Age</Form.Label>
            <Form.Control
              name="age"
              value={inputData.age}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.age}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.age}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Father Name</Form.Label>
            <Form.Control
              name="fatherName"
              value={inputData.fatherName}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.fatherName}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.fatherName}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Address</Form.Label>
            <Form.Control
              name="address"
              value={inputData.address}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.address}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.address}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button onClick={handleSubmit} className="btn btn-primary float-end mt-3" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Next'}
          </Button>
        </Col>
     
      </Row>
      <p> <span  className="text-danger">Note:</span> To Update those disabled fields. Go to Profile</p>
    
    </div>
  );
};

export default FirstPartyValidation;
