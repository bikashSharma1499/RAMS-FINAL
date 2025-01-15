import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Col, Row, Button, Modal, Card } from "react-bootstrap";
import Select from "react-select";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios, { AxiosHeaders } from "axios";
import { showPopup } from "../../utils/validation";
import { GetLoginInfo } from "../auth/logindata";

const RentalDetails = ({ goToStep }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    i_rent: "",
    i_advamt: "",
    i_ntcperiod: "",
    i_rentdur: "",
    i_rentpaydate: null,
    waterBill: 0,
    electricBill: 0,
    societyFees: 0,
    escalation_rate: "",
    agreement_start_date: "",
    place: "",
  });
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    if (!validateForm()) return;
    setShow(true);
  };

  const [errors, setErrors] = useState({});
  const [agreementRate, setAgreementRate] = useState(0);
  const [agreementValCode, setAgreementValCode] = useState(0);
  const [agreementAmount, setAgreementAmount] = useState(0);
  // Generate options dynamically for rent payment date
  const rentPaymentDateOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: i + 1,
  }));
  const [agreementOptions, setAgreementOptions] = useState([]);
  const [targetPaymentLabel, setTargetPaymentLabel] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateForm();
  };

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: checked ? 1 : 0,
    }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      i_rentpaydate: selectedOption ? selectedOption.value : null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.i_rent) newErrors.i_rent = "Rent per month is required";
    if (!formData.i_advamt) newErrors.i_advamt = "Advance amount is required";
    if (!formData.i_ntcperiod)
      newErrors.i_ntcperiod = "Notice period is required";
    if (!formData.i_rentdur) newErrors.i_rentdur = "Rent duration is required";
    if (!formData.i_rentpaydate)
      newErrors.i_rentpaydate = "Rent payment date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handlePayment =()=>{
    handleSubmit();
    if(agreementAmount>0){
      setShowPayment(true);
    
    }else{
      navigate(`${import.meta.env.BASE_URL}agreement/list`);
 
    }

  }

  const handleSubmit = async () => {
    if (!validateForm()){
      setShow(false);
       return; // Ensure the form is validated
    }
    const agr = JSON.parse(localStorage.getItem("rg_rcd"));
    // Retrieve maintenanceCodes from localStorage and handle null case
    const maintenanceCodes =
      JSON.parse(localStorage.getItem("maintenanceCodes")) || [];
    debugger; // For debugging during development
    // Prepare API payload
    const payload = {
      agreementCode: agr.agr_k || null, // Ensure fallback if `agr` or `agr_k` is undefined
      maintenance: maintenanceCodes,
      monthlyPrice: formData?.i_rent || 0, // Provide default values for `formData` properties
      advance: formData?.i_advamt || 0,
      noticePeriod: formData?.i_ntcperiod || 0,
      paymentDay: formData?.i_rentpaydate || "",
      electricBill: formData?.electricBill || 0,
      waterBill: formData?.waterBill || 0,
      societyBill: formData?.societyFees || 0,
      agreement: agreementValCode || 0,
      duration: formData?.i_rentdur || 0,
      amount: 200, // Hardcoded value
      transactionId: "EVBEVEVEV", // Hardcoded value
      agreementDate: formData.agreement_start_date,
      escalation_rate: formData.escalation_rate,
      location: formData.place,
    };

    try {
      const response = await axios.post(
        API_ENDPOINTS.agreementContractDetails,
        payload
      );
      if (response.status === 200) {
        showPopup({
          title: "Rent Agreement Successfull",
          msg: "Successfully Submitted. Please Wait while we redirect..",
          iconType: "success",
        });
        localStorage.setItem("next_step", "1");
        
  
      
      }
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  const handleNumericInput = (e) => {
    const charCode = e.charCode || e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const pCode = localStorage.getItem("propValp");
    if (pCode && pCode !== "0") {
      const fetchRate = async () => {
        const user = GetLoginInfo();
        try {
          const response = await axios.post(
            API_ENDPOINTS.PropertyRentalPriceList,
            {
              customerType: user.userType,
              customerCode: user.userKey,
              propertyCode: pCode,
            }
          );

          if (response.status === 200) {
            // Assuming response.data contains the property data you need
            const data = response.data;

            // Set the property values into the formData
            setFormData((prevData) => ({
              ...prevData,
              i_rent: data.rentAmount || "",
              i_advamt: data.advanceAmount || "",
              i_ntcperiod: data.noticePeriod || "",
              i_rentdur: data.rentDuration || "",
              i_rentpaydate: data.rentPaymentDate || null,
              // waterBill: data.waterBill || 0,
              // electricBill: data.electricBill || 0,
              // societyFees: data.societyFees || 0,
              escalation_rate: data.escalationRate || "",
              agreement_start_date: data.agreementStartDate || "",
              place: data.place || "",
            }));
          }
        } catch (error) {
          console.error("Error fetching rental price:", error);
        }
      };

      fetchRate();
    }
  }, []);

  useEffect(() => {
    const fetchAgreementPrice = async () => {
      try {
        const response = await axios.post(API_ENDPOINTS.agreementPricing, {
          transactionType: "1",
          serviceCode: 0,
        });

        if (response.status === 200) {
          const filteredOptions = response.data.filter(
            (item) => item.service_type === "Agreement"
          );
          setAgreementOptions(filteredOptions);
        }
      } catch (error) {
        console.error("Error fetching agreement options:", error);
      }
    };

    fetchAgreementPrice();
  }, []);

  const handleRadioChange = (event) => {
    console.log("Selected Agreement Value:", event.target.value);
    setAgreementAmount(event.target.value);
    setTargetPaymentLabel(event.target.dataset.label); // Use the label from data-label
    if (event.target.value > 0) {
      setAgreementValCode(1);
    }
  };

  const handleCheckout = () => {
     const agr = JSON.parse(localStorage.getItem("rg_rcd"));
     sessionStorage.setItem('agcLegalityCode',agr.agr_k);
     showPopup({titlte:'Successfull', msg:'Payment Was Successfull',iconType:'success' });
     setTimeout(() => {
      navigate(`${import.meta.env.BASE_URL}agreement/LegalityProcess/`);

     }, 3000);
     
  };

  return (
    <div>
      <h5>Rental Details</h5>
      <div >
        <Row>
          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Rent Per Month</Form.Label>
              <Form.Control
                name="i_rent"
                value={formData.i_rent}
                autoComplete="off"
                onChange={handleChange}
                onKeyUp={handleNumericInput}
                isInvalid={!!errors.i_rent}
              />
              <Form.Control.Feedback type="invalid">
                {errors.i_rent}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Advance Amount</Form.Label>
              <Form.Control
                name="i_advamt"
                value={formData.i_advamt}
                onChange={handleChange}
                autoComplete="off"
                onKeyUp={handleNumericInput}
                isInvalid={!!errors.i_advamt}
              />
              <Form.Control.Feedback type="invalid">
                {errors.i_advamt}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Notice Period (in Days)</Form.Label>
              <Form.Control
                name="i_ntcperiod"
                value={formData.i_ntcperiod}
                autoComplete="off"
                onChange={handleChange}
                onKeyUp={handleNumericInput}
                isInvalid={!!errors.i_ntcperiod}
                maxLength={3}
              />
              <Form.Control.Feedback type="invalid">
                {errors.i_ntcperiod}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Rent Duration (in Months)</Form.Label>
              <Form.Control
                name="i_rentdur"
                value={formData.i_rentdur}
                onChange={handleChange}
                autoComplete="off"
                maxLength={3}
                onKeyUp={handleNumericInput}
                isInvalid={!!errors.i_rentdur}
              />
              <Form.Control.Feedback type="invalid">
                {errors.i_rentdur}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Rent Payment Date</Form.Label>
              <Select
                options={rentPaymentDateOptions}
                onChange={handleSelectChange}
                value={rentPaymentDateOptions.find(
                  (opt) => opt.value === formData.i_rentpaydate
                )}
              />
              {errors.i_rentpaydate && (
                <div className="text-danger">{errors.i_rentpaydate}</div>
              )}
            </Form.Group>
          </Col>

          {["waterBill", "electricBill", "societyFees"].map((id) => (
            <Col xl={3} lg={3} md={4} sm={6} key={id}>
              <Form.Group>
                <div className="fancy-checkbox mt-4">
                  <input
                    type="checkbox"
                    id={id}
                    checked={formData[id]}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor={id}>
                    {id.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                </div>
              </Form.Group>
            </Col>
          ))}

          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Agreement Start From</Form.Label>
              <Form.Control
                value={formData.agreement_start_date}
                name="agreement_start_date"
                onChange={handleChange}
                isInvalid={!!errors.agreement_start_date}
                autoComplete="off"
                type="date"
              ></Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.agreement_start_date}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Escalation Rate</Form.Label>
              <Form.Control
                value={formData.escalation_rate}
                name="escalation_rate"
                onChange={handleChange}
                isInvalid={!!errors.escalation_rate}
                autoComplete="off"
                maxLength={2}
              ></Form.Control>

              <Form.Control.Feedback type="invalid">
                {errors.escalation_rate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Place</Form.Label>
              <Form.Control
                onChange={handleChange}
                name="place"
                isInvalid={!!errors.place}
                value={formData.place}
              ></Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.place}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col className="mt-4">
            <Form.Group>
              {agreementOptions.map((option, index) => (
                <Form.Check
                  key={index}
                  defaultChecked={index === 0}
                  inline
                  label={`${option.amount_desc_agr}`}
                  name="agreementValue"
                  type="radio"
                  id={`agreement-option-${index}`}
                  value={option.amount}
                  data-label={option.amount_desc_agr} // Add the label as a data attribute
                  onChange={handleRadioChange}
                  className="radio-custom"
                />
              ))}
            </Form.Group>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Button onClick={() => goToStep(5)} className=" float-start">
              Prev
            </Button>
            <Button onClick={handleShow} className=" float-end">
              Submit
            </Button>
          </Col>
        </Row>
      </div>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header className=" bg-success-gradient">
          <Modal.Title className=" text-white">Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          {!showPayment ? (
          <>
            <h6 className="fw-bold mt-2 mb-4 text-center">
              {targetPaymentLabel}
            </h6>

            <Row>
              <Col className="text-center">
                <Button onClick={handlePayment} variant="success">
                  {" "}
                  Confirm{" "}
                  {agreementAmount === "0"
                    ? ""
                    : "& Pay Now Rs. " + agreementAmount}{" "}
                </Button>
                <Button
                  variant="danger"
                  className=" ms-2"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Col>
            </Row>
          </>
          ):(
          <>
            <Row className="justify-content-center">
              <Col lg={12} md={12} sm={12}>
                <Card className="shadow border-0">
                  <Card.Body>
                    {/* Header Section */}
                    <h5 className="text-center mb-4">
                      Enter Card Details and Pay
                    </h5>

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
                        <label htmlFor="cardNumber" className="form-label">
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          className="form-control"
                          placeholder="Card Number"
                        />
                      </div>

                      {/* Expiry Date and CVV */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="expiry" className="form-label">
                            Expiry
                          </label>
                          <input
                            type="text"
                            id="expiry"
                            className="form-control"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="cvv" className="form-label">
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            className="form-control"
                            placeholder="CVV"
                          />
                        </div>
                      </div>

                      {/* Payment Button */}
                      <div className="text-center mb-4">
                        <button
                          type="submit"
                          className="btn btn-success btn-lg w-100"
                        >
                          {" "}
                          ₹ {agreementAmount}
                        </button>
                      </div>
                    </form>

                    {/* Terms & Conditions Section */}
                    <div className="text-center">
                      <a href="#" className="text-muted">
                        Terms of Service and Refund Policy
                      </a>
                    </div>

                    {/* Footer with Payment Method Logos */}
                    <div className="text-center mt-4">
                      <img
                        src="https://www.redcheckes.com/pay/mc.png"
                        height={20}
                        alt="Mastercard"
                        className="mx-2"
                      />
                      <img
                        src="https://www.redcheckes.com/pay/rp.png"
                        height={20}
                        alt="RuPay"
                        className="mx-2"
                      />
                      <img
                        src="https://www.redcheckes.com/pay/visa.png"
                        height={20}
                        alt="Visa"
                        className="mx-2"
                      />
                      <img
                        src="https://www.redcheckes.com/pay/upi.png"
                        height={20}
                        alt="UPI"
                        className="mx-2"
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
          )}
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </div>
  );
};

export default RentalDetails;
