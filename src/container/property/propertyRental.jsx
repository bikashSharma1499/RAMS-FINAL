import { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import { Form, Col, Row, Button } from "react-bootstrap";
import Select from "react-select";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { showPopup } from "../../utils/validation";
import { GetLoginInfo } from "../auth/logindata";

function PropertyRentalDetails({ goToStep }) {
      const navigate = useNavigate();
      
  const [formData, setFormData] = useState({
    i_rent: "",
    i_advamt: "",
    i_rentpaydate: null,
    waterBill: 0,
    electricBill: 0,
    societyFees: 0,
  });

  const [txnType, setTxnType] =useState("I");
  const [errors, setErrors] = useState({});
  const [agreementRate, setAgreementRate] = useState(0);
  const [agreementValCode, setAgreementValCode] = useState(0);
  // Generate options dynamically for rent payment date
  const rentPaymentDateOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: i + 1,
  }));

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        
        const user = GetLoginInfo();
        const checkProcess = localStorage.getItem("prop_process");
        const processData = JSON.parse(checkProcess);
        if (processData) {
          const response = await axios.post(API_ENDPOINTS.PropertyRentalPriceList, {
            customerType: user.userType,
            customerCode: user.userKey,
            propertyCode: processData.process_p,
          });
  
          if (response.status === 200) {
            const rentalData = response.data[0];
            setTxnType("U");
            setFormData({
              i_rent: rentalData.monthly_rent || "",
              i_advamt: rentalData.advance_price || "",
              i_rentpaydate: rentalData.payment_day || 0,
              waterBill: rentalData.water_bill === "Included" ? 1 : 0,
              electricBill: rentalData.electric_bill === "Included" ? 1 : 0,
              societyFees: rentalData.soceity_bill === "Included" ? 1 : 0,
            });
            
          }
        }
      } catch (error) {
        console.error("Error fetching rental details:", error);
      }
    };
    setLoading(false);
  
    fetchRental();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  

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
    if (!formData.i_rentpaydate)
      newErrors.i_rentpaydate = "Rent payment date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return; // Ensure the form is validated

    
    const checkProcess = localStorage.getItem("prop_process");
    const processData = JSON.parse(checkProcess);

    const payload = {
      transactionType: "I",
      propertyCode: processData.process_p,
      monthlyPayment: formData?.i_rent || 0,
      advance: formData?.i_advamt || 0,
      paymentDay: formData?.i_rentpaydate || "",
      electricBill: formData?.electricBill || 0,
      waterBill: formData?.waterBill || 0,
      societyBill: formData?.societyFees || 0,
    };
    console.log(payload);
    try {
    
      const response = await axios.post(API_ENDPOINTS.PropertyRental, payload);
      if (response.status === 200) {
        const resultArray = response.data.result.split(",");
        showPopup({
          title: resultArray[0],
          msg: resultArray[1],
          iconType: resultArray[0].toLowerCase(),
        });
        localStorage.removeItem("prop_process");
        localStorage.removeItem("next_stpro");
        setTimeout(() => {
            navigate(`${import.meta.env.BASE_URL}property/list/`);
          }, 1200);
        
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
      <h4>Rental Details</h4>

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

      <Row className="mt-4">
        <Col>
          <Button onClick={() => goToStep(3)} className=" float-start">
            Prev
          </Button>
          <Button onClick={handleSubmit} className=" float-end">
            Submit
          </Button>
        </Col>
      </Row>
    </div>
  );
}
export default PropertyRentalDetails;
