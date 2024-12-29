import React, { useState } from "react";
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
  const [errors, setErrors] = useState({}); // Validation errors

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setKycImg(file);
      setPreview(URL.createObjectURL(file)); // Generate a preview
      setErrors((prev) => ({ ...prev, kycImg: null })); // Clear file error
    }
  };

  // Save file using Download.js
  const handleSaveFile = () => {
    const fileExtension = kycImg?.name.split(".").pop();
    const fileBlob = new Blob([kycImg], { type: `image/${fileExtension}` }); // Adjust type as needed
    download(fileBlob, kycImg?.name || "downloaded_file"); // Download using Download.js
  };

  const handleClick = async () => {
    debugger;
    const newErrors = {};

    // Validations
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

    // Determine file extension
    let fileExtension = "";
    if (kycImg) {
      fileExtension = kycImg.name.split(".").pop(); // Extension from selected file
    } else if (preview) {
      const previewExtension = preview.split(".").pop(); // Extension from preview
      fileExtension = previewExtension;
    }

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
        kycImage: ".",fileExtension,
      });
      console.log(response);
      const uploadedFilePath = response.data.result.split(","); // API returns the file path
      setFilePath(uploadedFilePath[4]);

      // Manually save the file to the target folder (using Download.js)
      if (kycImg) {
        const fileBlob = new Blob([kycImg], { type: "image/" + fileExtension }); // You can adjust the type here
        download(fileBlob, uploadedFilePath[4]); // Save file with path from API response
      }

      // Notify parent component via onUpdate
      // onUpdate({
      //   ttype,
      //   kycNo,
      //   kycImg: uploadedFilePath,
      // });

      setErrors({}); // Clear errors on successful submission
      alert("File processed successfully!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Accordion defaultActiveKey={["0"]} alwaysOpen>
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
                <Button variant="primary"  onClick={handleClick}>
                  Submit
                </Button>
              </Col>
            </Row>
       
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      {filePath && (
        <div className="mt-3">
          <strong>File Path:</strong> {filePath}
        </div>
      )}
    </div>
  );
};

export default ComponentKYC;
