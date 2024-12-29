import React, { useEffect, useState } from "react";
import { Row, Form, Col, Accordion, Button, Image } from "react-bootstrap";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { showPopup } from "../../utils/validation";

function ComponentCriminal() {
  const [transactionType, setTransactionType] = useState("I");
  const [criminalCode, setCriminalCode] = useState(0);
  const [kycNo, setKycNo] = useState("");
  const [kycImg, setKycImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKycImg(file);
      setPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, kycImg: null })); // Clear file error
    }
  };

  //#region Load Data
  useEffect(() => {
    const fetchData = async () => {
      const code = localStorage.getItem("vrfCode");
      console.log("Verification Code:", code);
  
      if (code) {
        try {
          const response = await axios.post(API_ENDPOINTS.serviceCrimialList, {
            verificationCode: code,
          });
  
         // console.log("API Response:", response.data);
  
          const data = response.data[0];
          if (data && data.ciminal_code) {
            setTransactionType("U");
            setCriminalCode(data.ciminal_code);
            setKycNo(data.adhaar_no || "");
            setKycImg(data.adhaar_image || null);
     //       setPreview(data.adhaar_image ? `https://yourserverpath/${data.adhaar_image}` : null);
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

  //#region Validation and submission
  // Validation logic
  const validateFields = () => {
    const newErrors = {};

    if (!kycNo.trim()) {
      newErrors.kycNo = "ID number is required.";
    } else if (kycNo.length < 8) {
      newErrors.kycNo = "ID number must be at least 8 characters.";
    }

    if (!kycImg) {
      newErrors.kycImg = "File is required.";
    } else if (!kycImg.type.startsWith("image/")) {
      newErrors.kycImg = "Only image files are allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleClick = async () => {
    if (!validateFields()) {
      alert("Please correct the errors before submitting.");
      return;
    }

    let fileExtension = "";
    if (kycImg) {
      fileExtension = kycImg.name.split(".").pop(); // Extension from selected file
    } else if (preview) {
      const previewExtension = preview.split(".").pop(); // Extension from preview
      fileExtension = previewExtension;
    }
    const vrfData = JSON.parse(localStorage.getItem('vrfCandidate'));
   const response = await axios.post(API_ENDPOINTS.serviceCriminal,
    {
      transactionType:transactionType,
      kycCode:criminalCode,
      verificationCode:localStorage.getItem('vrfCode'),
      candidateName:vrfData.candidateName, 
      mobileNumber:vrfData.mobileNumber,
      emailID:vrfData.emailID,
      adhaarNumber:kycNo,
      adhaarImage:fileExtension
    }
   );
   if(response.status==200 && response.data){
    const result  = response.data.result.split(',');
      showPopup({title:"Successfull", msg:result[5], iconType:"success"});
      const count= localStorage.getItem('vrfCount');
      if(count){
        localStorage.setItem('vrfCount',parseInt(count)+1);
      }else{
        localStorage.setItem('vrfCount',1);
      }
   }else{
    showPopup({title:"Error", msg:"Failed to submit", iconType:"error"});
   }
  };
//#endregion
  return (
    <>
      <Accordion className="" defaultActiveKey={["0"]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header className="">Upload Identity</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col lg={6} md={6} sm={12}>
                <Form.Group>
                  <Form.Label>ID Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter ID Number"
                    value={kycNo}
                    onChange={(e) => {
                      setKycNo(e.target.value);
                      setErrors((prev) => ({ ...prev, kycNo: null })); // Clear ID error
                    }}
                  />
                  {errors.kycNo && (
                    <span className="text-danger">{errors.kycNo}</span>
                  )}
                </Form.Group>
              </Col>
              <Col lg={6} md={6} sm={12}>
                <Form.Group>
                  <Form.Label>Choose File</Form.Label>
                  <Form.Control type="file" onChange={handleFileChange} />
                  {errors.kycImg && (
                    <span className="text-danger">{errors.kycImg}</span>
                  )}
                </Form.Group>
              </Col>
            </Row>
            {preview && (
              <Row className="mt-3">
                <Col>
                  <h5>File Preview:</h5>
                  {kycImg?.type?.startsWith("image/") ? (
                    <Image
                      src={preview}
                      alt="Selected File"
                      thumbnail
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  ) : (
                    <p>{kycImg?.name || "Preview available"}</p>
                  )}
                </Col>
              </Row>
            )}
            <Row className="mt-3">
              <Col>
                <Button variant="primary" onClick={handleClick}>
                  { transactionType=='U' ?
                  ("Update"):("Submit")
                  }
                  
                </Button>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default ComponentCriminal;
