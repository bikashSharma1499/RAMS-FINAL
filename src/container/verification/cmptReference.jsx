import axios from "axios";
import React, { useState, useEffect } from "react";
import { Row, Col, Form, Accordion, Button } from "react-bootstrap";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { showPopup } from "../../utils/validation";
import { FaRecycle } from "react-icons/fa";
import DataTable from "react-data-table-component";

const ComponentReference = ({ GetTotalPricing }) => {
  const [transactionType, setTransactionType] = useState("I");
  const [referCode, setReferCode] = useState(0);
  const [referName, setReferName] = useState("");
  const [referMob, setReferMob] = useState("");
  const [referMail, setReferMail] = useState("");
  const [errors, setErrors] = useState({});
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [fetch, setFetch] = useState(0);

  // Mobile and Email Validation Regex
  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(API_ENDPOINTS.verificationComponentCaseList, {
          verificationCode: localStorage.getItem("vrfCode"),
          componentCode: 2,
        });
        setData(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [fetch]);

  const validateField = (name, value) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (name === "referName") {
        newErrors.referName = value.trim() ? "" : "Name is required.";
      }
      if (name === "referMob") {
        if (!value.trim()) {
          newErrors.referMob = "Mobile number is required.";
        } else if (!mobileRegex.test(value)) {
          newErrors.referMob = "Invalid mobile number (Must start with 6-9 and be 10 digits).";
        } else {
          newErrors.referMob = "";
        }
      }
      if (name === "referMail") {
        if (!value.trim()) {
          newErrors.referMail = "Email is required.";
        } else if (!emailRegex.test(value)) {
          newErrors.referMail = "Invalid email address.";
        } else {
          newErrors.referMail = "";
        }
      }

      return newErrors;
    });
  };

  const handleRemove = async (refCode) => {
    try {
      await axios.post(API_ENDPOINTS.serviceReference, {
        transactionType: "D",
        referalCode: refCode,
        verificationCode: localStorage.getItem("vrfCode"),
        candidateName: "vrfData.candidateName",
      mobileNumber: "vrfData.mobileNumber",
      emailID: "vrfData.emailID",
      referalName: "referName",
      referalMobile: "referMob",
      referalMail: "referMail",
      });
      setFetch(fetch + 1);
      GetTotalPricing();
      setReferName("");
        setReferMob("");
        setReferMail("");
      showPopup({ title: "Reference Removed Successfully", msg: "", iconType: "success" });
    } catch (error) {
      showPopup({ title: "Error", msg: "Failed to remove reference.", iconType: "error" });
    }
  };

  const handleSubmit = async () => {
    validateField("referName", referName);
    validateField("referMob", referMob);
    validateField("referMail", referMail);

    const hasErrors = Object.values(errors).some((err) => err);
    if (hasErrors || !referName || !referMob || !referMail) return;

    const vrfData = JSON.parse(localStorage.getItem("vrfCandidate"));
    const payload = {
      transactionType,
      referalCode: referCode,
      verificationCode: localStorage.getItem("vrfCode"),
      candidateName: vrfData.candidateName,
      mobileNumber: vrfData.mobileNumber,
      emailID: vrfData.emailID,
      referalName: referName,
      referalMobile: referMob,
      referalMail: referMail,
    };

    try {
      const response = await axios.post(API_ENDPOINTS.serviceReference, payload);
      if (response.status === 200 && response.data) {
        showPopup({
          title: "Success",
          msg: "Reference added successfully!",
          iconType: "success",
        });
        setFetch(fetch + 1);
        GetTotalPricing();
        setReferName("");
        setReferMob("");
        setReferMail("");
      } else {
        showPopup({ title: "Submission Failed", msg: "Please try again.", iconType: "error" });
      }
    } catch (error) {
      showPopup({ title: "Error", msg: error.message, iconType: "error" });
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.component_case_id, sortable: true },
    { name: "Name", selector: (row) => row.reference_person_name },
    { name: "Mobile No", selector: (row) => row.reference_person_mobile },
    { name: "Email", selector: (row) => row.reference_person_email },
    {
      name: "Remove",
      cell: (row) => (
        <button
          onClick={() => handleRemove(row.component_case_code)}
          className="btn btn-danger rounded-2 btn-sm"
          title="Remove"
        >
          <FaRecycle />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div>
      <Accordion defaultActiveKey={["0"]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Fill reference details</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col lg={4} md={6} sm={6}>
                <Form.Group>
                  <label>Referal Name</label>
                  <Form.Control
                    type="text"
                    value={referName}
                    onChange={(e) => {
                      setReferName(e.target.value);
                      validateField("referName", e.target.value);
                    }}
                    placeholder="Enter name"
                  />
                  {errors.referName && <span className="text-danger">{errors.referName}</span>}
                </Form.Group>
              </Col>

              <Col lg={4} md={6} sm={6}>
                <Form.Group>
                  <label>Referal Mobile</label>
                  <Form.Control
                    type="text"
                    value={referMob}
                    maxLength={10}
                    onChange={(e) => {
                      setReferMob(e.target.value);
                      validateField("referMob", e.target.value);
                    }}
                    placeholder="Enter mobile number"
                  />
                  {errors.referMob && <span className="text-danger">{errors.referMob}</span>}
                </Form.Group>
              </Col>

              <Col lg={4} md={6} sm={6}>
                <Form.Group>
                  <label>Refer Mail</label>
                  <Form.Control
                    type="text"
                    value={referMail}
                    onChange={(e) => {
                      setReferMail(e.target.value);
                      validateField("referMail", e.target.value);
                    }}
                    placeholder="Enter email"
                  />
                  {errors.referMail && <span className="text-danger">{errors.referMail}</span>}
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" className="mt-3" onClick={handleSubmit}>
              {transactionType === "U" ? "Update" : "Submit"}
            </Button>

            <DataTable columns={columns} data={data} pagination paginationPerPage={pageSize} />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default ComponentReference;
