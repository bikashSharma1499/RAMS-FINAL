import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Col, Row, Button } from "react-bootstrap";
import Select from "react-select";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { showPopup } from "../../utils/validation";

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
  });


  const [errors, setErrors] = useState({});
 const[agreementRate, setAgreementRate]=useState(0);
 const[agreementValCode, setAgreementValCode]=useState(0);
  // Generate options dynamically for rent payment date
  const rentPaymentDateOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: i + 1,
  }));

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

  const handleSubmit = async () => {
    if (!validateForm()) return; // Ensure the form is validated
    const agr = JSON.parse(localStorage.getItem("rg_rcd"));
    // Retrieve maintenanceCodes from localStorage and handle null case
    const maintenanceCodes = JSON.parse(localStorage.getItem("maintenanceCodes")) || [];
     debugger; // For debugging during development
    // Prepare API payload
    const payload = {
      agreementCode: agr.agr_k || null, // Ensure fallback if `agr` or `agr_k` is undefined
      maintenance: maintenanceCodes,
      monthlyPrice: formData?.i_rent || 0, // Provide default values for `formData` properties
      advance: formData?.i_advamt || 0,
      noticePeriod: formData?.i_ntcperiod || 0,
      paymentDay: formData?.i_rentpaydate || '',
      electricBill: formData?.electricBill || 0,
      waterBill: formData?.waterBill || 0,
      societyBill: formData?.societyFees || 0,
      agreement: agreementValCode || 0,
      duration: formData?.i_rentdur || 0,
      amount: 200, // Hardcoded value
      transactionId: "EVBEVEVEV", // Hardcoded value
    };
  
    try {
      const response = await axios.post(API_ENDPOINTS.agreementContractDetails, payload);
      if(response.status===200){
        showPopup({title:"Rent Agreement Successfull", msg:"Successfully Submitted. Please Wait while we redirect..",iconType:"success" })
        localStorage.setItem('next_step',"1");
    

        navigate(`${import.meta.env.BASE_URL}dashboard/`);
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

  const handleChangeAgreementValCode = (event) => {
    if (event.target.checked) {
      setAgreementValCode(1);
    } else {
      setAgreementValCode(0);
    }
  };
  

  return (
    <div>
      <h2>Rental Details</h2>
      <div className="container">
        <Row>
          <Col xl={3} lg={3} md={4} sm={6}>
            <Form.Group>
              <Form.Label>Rent Per Month</Form.Label>
              <Form.Control
                name="i_rent"
                value={formData.i_rent}
                onChange={handleChange}
                onKeyPress={handleNumericInput}
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
                onKeyDown={handleNumericInput}
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
                onChange={handleChange}
                onKeyPress={handleNumericInput}
                isInvalid={!!errors.i_ntcperiod}
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
                onKeyPress={handleNumericInput}
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
        </Row>
        <Row>
          <Col className="mt-4">
            <Form.Check
              inline
              label="Proceed with agreement with 250"
              name="agreementValue"
              type="checkbox"
              id="role-tenant"
              onChange={handleChangeAgreementValCode}
            />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Button onClick={() => goToStep(5)} className=" float-start">
              Prev
            </Button>
            <Button onClick={handleSubmit} className=" float-end">
              Submit
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RentalDetails;
