import React, { useState, useEffect } from "react";
import { Row, Col, Form, Accordion, Button, Image } from "react-bootstrap";
import axios from "axios";
import download from "downloadjs"; // Import Download.js
import { API_ENDPOINTS } from "../../utils/apiConfig";

const ComponentKYC = ({ onUpdate }) => {
  const [ttype, setTtype] = useState("");
  const [kycNo, setKycNo] = useState("");
  const [kycImg, setKycImg] = useState(null); // File object
  const [preview, setPreview] = useState(null); // File preview
  const [filePath, setFilePath] = useState("");
  const [errors, setErrors] = useState({});
  const [imageUrl, setImageUrl] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/tiff"]; // Add other valid types here
      if (validTypes.includes(file.type)) {
        setKycImg(file);
        setPreview(URL.createObjectURL(file)); // Generate a preview
        setErrors((prev) => ({ ...prev, kycImg: null })); // Clear file error
      } else {
        setErrors((prev) => ({ ...prev, kycImg: "Invalid file type. Please upload an image." }));
      }
    }
  };

  // Save file using Download.js
  const handleSaveFile = () => {
    const fileExtension = kycImg?.name.split(".").pop();
    const fileBlob = new Blob([kycImg], { type: `image/${fileExtension}` }); // Adjust type as needed
    download(fileBlob, kycImg?.name || "downloaded_file"); // Download using Download.js
  };

  const handleClick = async () => {
    const newErrors = {};

    if (!kycNo) {
      newErrors.kycNo = "ID Number is required.";
    }
    if (!kycImg && !preview) {
      newErrors.kycImg = "Please choose a file to upload.";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
  
    try {
      const vrfCandidate = JSON.parse(localStorage.getItem('vrfCandidate'));
      const response = await axios.post(API_ENDPOINTS.serviceKYC, {
        transactionType: "I",
        kycCode: 0,
        verificationCode: localStorage.getItem("vrfCode"),
        candidateName: vrfCandidate.candidateName,
        mobileNumber: vrfCandidate.mobileNumber,
        emailID: vrfCandidate.emailID,
        kycName: ttype,
        kycNumber: kycNo,
        kycImage: "." + fileExtension,
      });
      console.log(response);
  
      const uploadedFilePath = response.data.result.split(",");
      setFilePath(uploadedFilePath[4]);
  
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  
  useEffect(() => {
    if (filePath) { 
      if (kycImg) {
        fileUpload(kycImg);
      }
    }
  }, [filePath]);
  
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
    <div>
      <Accordion defaultActiveKey="0" alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Upload KYC Data</Accordion.Header>
          <Accordion.Body>
            <p>
              <span className="text-danger">NB:</span> Upload any one of the
              following documents.
            </p>
            <Row>
              <Col lg={4} md={6} sm={12}>
                <Form.Group>
                  <Form.Label>ID Type</Form.Label>
                  <Form.Select
                    className="form-select"
                    value={ttype}
                    onChange={(e) => setTtype(e.target.value)}
                  >
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="PAN">PAN</option>
                    <option value="Voter ID">Voter ID</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col lg={4} md={6} sm={12}>
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
              <Col lg={4} md={6} sm={12}>
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
                  Submit
                </Button>
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
    </div>
  );
};

export default ComponentKYC;
