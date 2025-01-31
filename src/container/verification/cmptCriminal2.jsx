import React, { useEffect, useState } from "react";
import { Row, Form, Col, Accordion, Button, Image } from "react-bootstrap";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import axios from "axios";
import { showPopup } from "../../utils/validation";

function ComponentCriminal2({GetTotalPricing}) {
  const [transactionType, setTransactionType] = useState("I");
  const [criminalCode, setCriminalCode] = useState(0);
  const [kycNo, setKycNo] = useState("");
  const [kycImg, setKycImg] = useState(null);
  const [preview, setPreview] = useState(null);
    const [filePath, setFilePath] = useState("");
  const [errors, setErrors] = useState({});

    const [imageUrl, setImageUrl] = useState(null);
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
    debugger;
    const fetchData = 
    async () => {
      const code = localStorage.getItem("vrfCode");
      console.log("Verification Code:", code);
  
      if (code) {
        try {
          const response = await axios.post(API_ENDPOINTS.verificationComponentCaseList, {
            verificationCode: code,
            componentCode: 6,
          });
  debugger;
         // console.log("API Response:", response.data);
  
          const data = response.data[0];
          if (data && data.component_case_code) {
            setTransactionType("U");
            setCriminalCode(data.component_case_code);
            setKycNo(data.candidate_criminal_aadhar || "");
            setKycImg(data.case_image_url || null);
            setPreview(data.case_image_url || null);
 
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
      return;
    }

 
    let fileExtension = "";
    let fileToUpload = null;

    if (kycImg) {
      fileExtension = kycImg.name.split(".").pop();
      fileToUpload = kycImg;
   
    } else if (preview) {
      const previewExtension = preview.split(".").pop();
      fileExtension = previewExtension;
    }
    console.log(fileExtension);



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
    fileUpload(kycImg)
      showPopup({title:"Successfull", msg:result[5], iconType:"success"});
      GetTotalPricing();
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
const fileUpload = async (file) => {
  try {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];

      let expandedPath = filePath.replace('~/', '');
      const dirPath = expandedPath.substring(0, expandedPath.lastIndexOf('/'));
      const filename = expandedPath.substring(expandedPath.lastIndexOf('/') + 1);

      const payload = {
        file: base64Image,
        folderPath: dirPath,
        fileName: filename,
      };

      console.log('Sending payload:', payload);

      const uploadResponse = await axios.post('https://api.redcheckes.com/proxy/file-upload', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setImageUrl(uploadResponse.data.imageUrl);
      alert('Image uploaded successfully!');
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image.');
  }
};

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
                { transactionType=='U' &&
                <Button variant="danger"  className="ms-2">
                    Delete
                </Button>}
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      {filePath && (
        <div className="mt-3">
          <strong>File Path:</strong> {filePath}<br></br>
          <strong>Image Url:</strong> {imageUrl}
        </div>
      )}
    </>
  );
}

export default ComponentCriminal2;
