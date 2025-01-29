import { Row, Col, Form, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { showPopup } from "../../utils/validation";
import { GetLoginInfo } from "../auth/logindata";

const FirstPartyValidation = ({ goToStep }) => {
  const user = GetLoginInfo();
  const [userData, setUserData] = useState(null); // Holds user data
  const [inputData, setInputData] = useState({
    fatherName: "",
    age: "",
    address: "",
    mobileNumber: "",
    email: "",
    title: "",
    firstName: "",
    lastName: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(API_ENDPOINTS.customerList, {
          customerType: user.userType,
          customerCode: user.userKey,
        });
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          setUserData(data[0]);
        } else {
          console.error("Unexpected data structure or empty response.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [user.userType, user.userKey]);

  // Populate input fields with fetched data
  useEffect(() => {
    if (userData) {
      setInputData({
        fatherName: userData.father_name || "",
        age: userData.age || "",
        address: userData.address || "",
        mobileNumber: userData.mobile_no || "",
        email: userData.mail_id || "",
        title: userData.Title || "",
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
      });
    }
  }, [userData]);

  // Handle input change and clear validation errors
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  // Field validation
  const validateFields = () => {
    const errors = {};

    if (!inputData.fatherName.trim()) {
      errors.fatherName = "Father's Name is required.";
    }
    if (!inputData.age.trim()) {
      errors.age = "Age is required.";
    }
    if (!inputData.address.trim()) {
      errors.address = "Address is required.";
    }
    if (!inputData.mobileNumber.trim() || !/^\d{10}$/.test(inputData.mobileNumber)) {
      errors.mobileNumber = "Please provide a valid 10-digit mobile number.";
    }
    if (!inputData.email.trim() || !/\S+@\S+\.\S+/.test(inputData.email)) {
      errors.email = "Please provide a valid email address.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    const agreementData = JSON.parse(localStorage.getItem("rg_rcd"));
    try {
      await axios.post(API_ENDPOINTS.agreementFirstParty, {
        agreementCode: agreementData?.agr_k,
        partyType: userData.customer_type,
        mobileNumber: inputData.mobileNumber,
        title: inputData.title,
        firstName: inputData.firstName,
        lastName: inputData.lastName,
        email: inputData.email,
        fatherName: inputData.fatherName,
        age: inputData.age,
        address: inputData.address,
      });

      showPopup({
        title: "Successful",
        msg: "First Party data updated.",
        iconType: "success",
      });
      sessionStorage.setItem("step_3_nextEnabled", "true");
      setTimeout(() => {
        goToStep(2);
      }, 1200);
    } catch (error) {
      showPopup({
        title: "Error",
        msg: "Failed to submit data. Please try again.",
        iconType: "error",
      });
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h3 className="fw-bolder  text-secondary-emphasis">First Party Details {"(Landlord)"} </h3>

      <Row className="mb-4">
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Mobile No</Form.Label>
            <Form.Control
              name="mobileNumber"
              value={inputData.mobileNumber}
              onChange={handleInputChange}
              disabled
              isInvalid={!!validationErrors.mobileNumber}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.mobileNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              value={inputData.email}
              onChange={handleInputChange}
              isInvalid={!!validationErrors.email}
              autoComplete="off"
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
            <Form.Control
              name="title"
              value={inputData.title}
              onChange={handleInputChange}
              disabled
            />
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              name="firstName"
              value={inputData.firstName}
              onChange={handleInputChange}
                autoComplete="off"
                disabled
            />
          </Form.Group>
        </Col>
        <Col lg={3} md={4} sm={6}>
          <Form.Group>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              name="lastName"
              value={inputData.lastName}
              onChange={handleInputChange}
                autoComplete="off"
                disabled
            />
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
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.address}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button
            onClick={handleSubmit}
            className="btn btn-primary float-end mt-3"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Next"}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default FirstPartyValidation;
