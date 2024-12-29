import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import ComponentKYC from "./cmptKYC";
import ComponentReference from "./cmptReference";
import ComponentAddress from "./cmptAddress";
import ComponentCriminal from "./cmptCriminal";
import { GetLoginInfo } from "../auth/logindata";
import { showPopup } from "../../utils/validation";
import { useNavigate } from "react-router-dom";

const VerificationForm = () => {
  const [srvLoading, setSrvLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceCode, setSelectedServiceCode] = useState(0);
  const [components, setComponents] = useState([]);
  const [basicDetailsFilled, setBasicDetailsFilled] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState([]); // Track selected components
  const initialState = {
    cndName: "",
    cndMobile: "",
    cndMail: "",
  };
  const [errors, setErrors] = useState({});
  const [candidateDetails, setCandidateDetails] = useState(initialState);

  const[componentCount , setComponentCount] = useState(0);
  const [totalGross, setTotalGross] = useState(0);
  const [totalGstAmt, setTotalGstAmt] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentPage, setPaymentPage]= useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setSrvLoading(true);
    axios
      .post(API_ENDPOINTS.serviceList, { serviceCode: 0 })
      .then((response) => {
        const filteredServices = response.data.filter(
          (item) => item.service_type !== "Agreement"
        );
        setServices(filteredServices);
      })
      .catch((error) => console.error("Error fetching services:", error));
    setSrvLoading(false);
  }, []);

  const handleServiceSelection = (service) => {
    setSelectedService(service);
    setSelectedServiceCode(service.service_code);
    axios
      .post(API_ENDPOINTS.serviceComponentList, {
        transactionType: "1",
        serviceCode: service.service_code,
        componentCcode: "0",
      })
      .then((response) => setComponents(response.data))
      .catch((error) => console.error("Error fetching components:", error));
  };
  const handleComponentSelect = (comp) => {
    //debugger;
    setSelectedComponents((prevComponents) => {
      const isComponentSelected = prevComponents.includes(comp);
  
      // Update the selected components array
      const newComponents = isComponentSelected
        ? prevComponents.filter((c) => c !== comp)
        : [...prevComponents, comp];
  
      // Safely calculate gross amount (sum of prices)
      const newTotalGross = newComponents.reduce((sum, c) => sum + (c.amount || 0), 0);
  
      // Calculate GST (18% of gross), rounded to 2 decimal places
      const newTotalGstAmt = Math.round(newTotalGross * 0.18 * 100) / 100;
  
      // Calculate total amount (gross + GST), rounded up to the nearest whole number
      const newTotalAmount = Math.ceil(newTotalGross + newTotalGstAmt);
  
      // Update related states
      setComponentCount(newComponents.length);
      setTotalGross(newTotalGross);
      setTotalGstAmt(newTotalGstAmt);
      setTotalAmount(newTotalAmount);
  
      return newComponents;
    });
  };
  
  

  const renderFormComponent = (component) => {
    switch (component.component_code) {
      case 1:
        return <ComponentKYC key={component.component_code} />;
      case 2:
        return <ComponentReference key={component.component_code} />;
      case 3:
        return <ComponentAddress key={component.component_code} />;
      case 6:
        return <ComponentCriminal key={component.component_code} />;
      default:
        return (
          <div key={component.component_code}>
            No form available for this component.
          </div>
        );
    }
  };

  //#region  Inital Verification ID and Canidate Details
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCandidateDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear errors as the user types
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    const mobileRegex = /^[0-9]{10}$/; // 10-digit mobile number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation

    if (!candidateDetails.cndName.trim()) {
      newErrors.cndName = "Candidate Name is required.";
    }

    if (candidateDetails.cndMobile.length > 0) {
      if (!mobileRegex.test(candidateDetails.cndMobile)) {
        newErrors.cndMobile = "Enter a valid 10-digit mobile number.";
      }
    }
    if (candidateDetails.cndMail.length > 0) {
      if (!emailRegex.test(candidateDetails.cndMail)) {
        newErrors.cndMail = "Enter a valid email address.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleBasicDetailsSubmit = async () => {
    if (validate()) {
      try {
        const user = GetLoginInfo();

        if (!user || !user.userKey) {
          alert("User not logged in. Please log in and try again.");
          return;
        }

        const payload = {
          customerCode: user.userKey,
          serviceCode: selectedServiceCode,
        };

        // First API Call
        const response = await axios.post(
          API_ENDPOINTS.serviceNewRequest,
          payload
        );

        if (response.data && response.status === 200 && response.data.result) {
          const verificationCode = response.data.result;
          console.log("Service request successful:", verificationCode);
          localStorage.setItem("vrfCode", verificationCode);

          // Validate candidateDetails before making the second API call
          if (candidateDetails.cndName) {
            const candidatePayload = {
              verificationCode: verificationCode,
              candidateName: candidateDetails.cndName,
              mobileNumber: candidateDetails.cndMobile,
              emailID: candidateDetails.cndMail,
            };
          //  debugger;
            // Second API Call
            const responseCandidate = await axios.post(
              API_ENDPOINTS.seriveCandidateDetailsAdd,
              candidatePayload
            );

            if (responseCandidate.data && responseCandidate.status === 200) {
              console.log(candidatePayload, responseCandidate);
              showPopup({
                title: "Saved",
                msg: "Candidate Details Saved Successfully",
                iconType: "success",
              });
              localStorage.setItem(
                "vrfCandidate",
                JSON.stringify(candidatePayload)
              );
              const count= localStorage.getItem('vrfCount');
              if(count){
                localStorage.setItem('vrfCount',parseInt(count)+1);
              }else{
                localStorage.setItem('vrfCount',1);
              }
              setTimeout(() => {
                setBasicDetailsFilled(true);
              }, 1200);
            } else {
              throw new Error("Failed to save candidate details.");
            }
          } else {
            alert("Candidate details are incomplete. Please check the form.");
          }
        } else {
          throw new Error("Service request failed. No result received.");
        }
      } catch (error) {
        console.error(
          "Error submitting service request:",
          error.message || error
        );
        alert("Failed to submit details. Please try again later.");
      }
    } else {
      alert("Please fill in all required fields correctly before submitting.");
    }
  };

  //#endregion


  //#region 
  const handlePayment=()=>{
    const count= localStorage.getItem('vrfCount');
    if(totalAmount>0){
      if(count && count!=="0"){
        showPopup({title:"Components Saved", msg:"Redirecting you to payment page ", iconType:"success"});
        localStorage.removeItem("vrfCandidate");
        localStorage.removeItem("vrfCode");
        localStorage.removeItem("vrfCount");
        setTimeout(() => {
          setPaymentPage(true);
        }, 1200);
      }else{
        showPopup({title:"Components are not Saved", msg:"Fill Components Details ", iconType:"error"});
      }
      }else{
      showPopup({title:"No Components", msg:"No components Selected", iconType:"error"});
    }
  }

  const handleCheckout =()=>{
    event.preventDefault();
    showPopup({title:"Successfull", msg:"Your Payment Was Successfull", iconType:"success"});
    setTimeout(() => {
      setPaymentPage(false);
      navigate(`${import.meta.env.BASE_URL}verification/list/`);
    }, 2000);
  }
  //#endregion
  return (
    <>
      <Pageheader
        title="New Verification"
        heading="Verification"
        active="New Verification"
      />

{!paymentPage ? 
(
 <div>
        {!selectedService ? (
          <>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3 text-primary fw-bold">Choose a Service</h5>
                {srvLoading ? (
                  <>Loading... Please hold on</>
                ) : (
                  <>
                    <Row>
                      {services.map((service) => (
                        <Col lg={4} md={6} sm={6} key={service.service_code}>
                          <div
                            style={{
                              border: "1px solid #ddd",
                              margin: "5px 0",
                              borderRadius: "8px",
                              padding: "16px",
                              textAlign: "center",
                              cursor: "pointer",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                              transition:
                                "transform 0.3s ease, box-shadow 0.3s ease",
                            }}
                            className="service-card"
                            onClick={() => handleServiceSelection(service)}
                          >
                            <Row
                              style={{ height: "60px" }}
                              className="align-items-center my-1 "
                            >
                              <Col xs={3}>
                                <img
                                  src={service.service_image}
                                  alt={service.service_name}
                                  height={40}
                                />
                              </Col>
                              <Col className=" d-flex flex-column text-end">
                                <p className="mb-1 text-dark float-end fw-bold">
                                  {service.service_name}
                                </p>
                                <span className="text-muted float-end fs-13">
                                  Verify Now{" "}
                                  <i className="ti ti-arrow-narrow-right text-primary fw-bold fs-20 mt-2 mx-1"></i>
                                </span>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card>
          </>
        ) : (
          <div>
            <h5>
              {selectedService.service_name}{" "}
              {basicDetailsFilled ? (
                ""
              ) : (
                <>
                  <button
                    className="btn-attractive"
                    onClick={() => setSelectedService(false)}
                  >
                    Change
                  </button>
                </>
              )}
            </h5>

            <Card className="shadow-sm mb-4">
              <Card.Header
                style={{
                  backgroundColor: "#f8f9fa", // Light gray background for professionalism
                  color: "#212529", // Darker text for contrast
                  fontWeight: "600", // Slightly bold for emphasis
                  textTransform: "uppercase", // Capitalize the header text
                  letterSpacing: "0.5px", // Subtle spacing for modern feel
                  padding: "15px", // Proper padding for spacing
                  border: "1px solid #dee2e6", // Thin border for structure
                  borderRadius: "4px", // Rounded corners for softness
                  display: "flex", // Flexbox for alignment
                  alignItems: "center", // Center vertical alignment
                  justifyContent: "space-between", // Equal spacing
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i
                    className="ti ti-user me-2"
                    style={{ fontSize: "18px", color: "#6c757d" }} // Subtle icon styling
                  ></i>
                  Candidate Basic Details
                </div>
                <div>
                  <span
                    className="badge bg-secondary"
                    style={{ fontSize: "12px" }}
                  >
                    Required Info
                  </span>
                </div>
              </Card.Header>

              <Card.Body>
                <Row>
                  <Col md={4} sm={6}>
                    <Form.Group>
                      <Form.Label>Candidate Name</Form.Label>
                      <Form.Control
                        name="cndName"
                        value={candidateDetails.cndName}
                        onChange={handleChange}
                        placeholder="Enter candidate name"
                        isInvalid={!!errors.cndName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cndName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4} sm={6}>
                    <Form.Group>
                      <Form.Label>Mobile No</Form.Label>
                      <Form.Control
                        name="cndMobile"
                        value={candidateDetails.cndMobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        isInvalid={!!errors.cndMobile}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cndMobile}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4} sm={6}>
                    <Form.Group>
                      <Form.Label>Mail ID</Form.Label>
                      <Form.Control
                        name="cndMail"
                        value={candidateDetails.cndMail}
                        onChange={handleChange}
                        placeholder="Enter email"
                        isInvalid={!!errors.cndMail}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cndMail}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={3} md={4} sm={6} className="d-flex align-items-end">
                  
                    <button
                      className={`mt-2 ${
                        basicDetailsFilled ? "btn-update" : "btn-save"
                      }`}
                      onClick={handleBasicDetailsSubmit}
                    >
                      {basicDetailsFilled ? "" : "Submit"}
                    </button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {basicDetailsFilled ? (
              <>
                <Row>
                  <Col lg={7}>
                    <Card className="shadow border-0">
                      <Card.Body>
                        {components.map((comp) => (
                          <div key={comp.srv_component_code} className="mb-4">
                            <div
                              className={`p-3 rounded d-flex justify-content-between align-items-center ${
                                selectedComponents.includes(comp)
                                  ? "bg-success text-white shadow-sm"
                                  : "bg-light text-dark border"
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleComponentSelect(comp)}
                            >
                              <span className="fw-bold">
                                {comp.component_name}
                              </span>
                              <span>
                                <span className="badge bg-info me-2">
                                  ₹{comp.amount}
                                </span>
                                <span className="badge bg-warning">
                                  TAT: {comp.duration_desc}
                                </span>
                              </span>
                            </div>
                            {selectedComponents.includes(comp) && (
                              <div className="mt-3 border p-3 rounded bg-white">
                                {renderFormComponent(comp)}
                              </div>
                            )}
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={5}>
                    <Card className="shadow border-0">
                      <Card.Header className="bg-dark text-white text-center fw-bold">
                        Your Billing
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-3">
                          <span className="text-secondary">
                            Gross ({componentCount} Components)
                          </span>
                          <span className="fw-bold">₹ {totalGross}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                          <span className="text-secondary">GST (18%)</span>
                          <span className="fw-bold">₹ {totalGstAmt}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-3">
                          <span className="fw-bold">Total</span>
                          <span className="fw-bold text-success">₹ {totalAmount}</span>
                        </div>
                        <button onClick={handlePayment} className="btn-save w-100 fw-bold mt-3">
                          Pay Now
                        </button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              ""
            )}
          </div>
        )}
      </div>

):(<>

<Row className="justify-content-center">
  <Col lg={4} md={8} sm={12}>
    <Card className="shadow border-0">
      <Card.Body>
        {/* Header Section */}
        <h5 className="text-center mb-4">Enter Card Details and Pay</h5>

        {/* Payment Details Section */}
        <div className="text-center mb-4">
          <h5 className="text-muted">Paying to Redchek PVT LTD</h5>
          <div className="d-flex justify-content-center align-items-center mb-3">
            <span>Purpose of Payment</span>
            <span className="mx-2 text-primary">Instapay</span>
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <span>Amount</span>
            <span className="mx-2">₹ 469</span>
          </div>
        </div>

        {/* Card Payment Form */}
        <form onSubmit={handleCheckout}>
          {/* Card Number */}
          <div className="mb-4">
            <label htmlFor="cardNumber" className="form-label">Card Number</label>
            <input type="text" id="cardNumber" className="form-control" placeholder="Card Number" />
          </div>

          {/* Expiry Date and CVV */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="expiry" className="form-label">Expiry</label>
              <input type="text" id="expiry" className="form-control" placeholder="MM/YY" />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="cvv" className="form-label">CVV</label>
              <input type="text" id="cvv" className="form-control" placeholder="CVV" />
            </div>
          </div>

          {/* Payment Button */}
          <div className="text-center mb-4">
            <button type="submit"   className="btn btn-success btn-lg w-100"> ₹ 469</button>
          </div>
        </form>

        {/* Terms & Conditions Section */}
        <div className="text-center">
          <a href="#" className="text-muted">Terms of Service and Refund Policy</a>
        </div>
        
        {/* Footer with Payment Method Logos */}
        <div className="text-center mt-4">
          <img src="https://www.redcheckes.com/pay/mc.png" height={20}  alt="Mastercard" className="mx-2" />
          <img src="https://www.redcheckes.com/pay/rp.png" height={20} alt="RuPay" className="mx-2" />
          <img src="https://www.redcheckes.com/pay/visa.png"height={20} alt="Visa" className="mx-2" />
          <img src="https://www.redcheckes.com/pay/upi.png"height={20} alt="UPI" className="mx-2" />
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>





</>)}
     
    </>
  );
};

export default VerificationForm;
