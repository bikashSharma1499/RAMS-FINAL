import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Row, Col, Form, Button, Badge, Spinner, Container, Table } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import ComponentKYC from "./cmptKYC";
import ComponentReference from "./cmptReference";
import ComponentAddress from "./cmptAddress";
import ComponentCriminal from "./cmptCriminal";
import { GetLoginInfo } from "../auth/logindata";
import { showPopup } from "../../utils/validation";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

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

  const [componentCount, setComponentCount] = useState(0);
  const [totalGross, setTotalGross] = useState(0);
  const [totalGstAmt, setTotalGstAmt] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentPage, setPaymentPage] = useState(false);
  const [showList, setShowList] = useState(true);
  const [data, setData] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(false);

  const [billingData, setBillingData] = useState([]);
  const [billinfo, setBillinfo] = useState({});

  const [gstAmount, setGstAmount] = useState(0);

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

    // First API call
    axios
      .post(API_ENDPOINTS.serviceComponentList, {
        transactionType: "1",
        serviceCode: service.service_code,
        componentCcode: "0",
      })
      .then((response) => {
        setComponents(response.data);

        const user = GetLoginInfo();
        const payload = {
          customerCode: user.userKey,
          serviceCode: service.service_code,
        };

        // Second API call
        return axios.post(API_ENDPOINTS.serviceNewRequest, payload);
      })
      .then((response) => {
        if (response.data && response.status === 200 && response.data.result) {
          const resultArray = response.data.result.split(",");

          const verificationCode = resultArray[1];
          if (resultArray[0] === "Old") {
            setCandidateDetails((prevDetails) => ({
              ...prevDetails,
              cndName: resultArray[2],
              cndMobile: resultArray[3],
              cndMail: resultArray[4],
            }));
            if (resultArray[2] != '' && resultArray[3] != '') {
              setDeleteStatus(true);
            }
          }

          console.log("Service request successful:", verificationCode);
          console.log(resultArray);
          localStorage.setItem("vrfCode", verificationCode);
        } else {
          console.error("Invalid response structure:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };


  const handleComponentSelect = (comp) => {
    //debugger;
    // alert(comp);
    setSelectedComponents((prevComponents) => {
      const isComponentSelected = prevComponents.includes(comp);

      // Update the selected components array
      const newComponents = isComponentSelected
        ? prevComponents.filter((c) => c !== comp)
        : [...prevComponents, comp];

      // Safely calculate gross amount (sum of prices)
      const newTotalGross = newComponents.reduce(
        (sum, c) => sum + (c.amount || 0),
        0
      );

      // Calculate GST (18% of gross), rounded to 2 decimal places
      const newTotalGstAmt = Math.round(newTotalGross * 0.18 * 100) / 100;

      // Calculate total amount (gross + GST), rounded up to the nearest whole number
      const newTotalAmount = Math.ceil(newTotalGross + newTotalGstAmt);

      // Update related states
      setComponentCount(newComponents.length);
      setTotalGross(newTotalGross);
      setTotalGstAmt(newTotalGstAmt);
      setTotalAmount(newTotalAmount);
      console.log(newComponents);
      return newComponents;
    });
  };

  const renderFormComponent = (component) => {
    switch (component.component_code) {
      case 1:
        return <ComponentKYC GetTotalPricing={GetTotalPricing} key={component.component_code} />;
      case 2:
        return <ComponentReference GetTotalPricing={GetTotalPricing} key={component.component_code} />;
      case 3:
        return <ComponentAddress GetTotalPricing={GetTotalPricing} key={component.component_code} />;
      case 6:
        return <ComponentCriminal GetTotalPricing={GetTotalPricing} key={component.component_code} />;
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
    } else {
      newErrors.cndMobile = "Mobile Number is required.";
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
    //  debugger;
    if (validate()) {
      setSubmitLoading(true);
      try {
        const user = GetLoginInfo();

        if (!user || !user.userKey) {
          alert("User not logged in. Please log in and try again.");
          return;
        }

        const verificationCode = localStorage.getItem("vrfCode");

        if (candidateDetails && candidateDetails.cndName) {
          const candidatePayload = {
            verificationCode: verificationCode,
            candidateName: candidateDetails.cndName,
            mobileNumber: candidateDetails.cndMobile,
            emailID: candidateDetails.cndMail,
          };

          console.log("Candidate Payload:", candidatePayload);

          try {
            const responseCandidate = await axios.post(
              API_ENDPOINTS.seriveCandidateDetailsAdd,
              candidatePayload
            );

            if (responseCandidate.data && responseCandidate.status === 200) {
              console.log("API Response:", responseCandidate.data);
              showPopup({
                title: "Saved",
                msg: "Candidate Details Saved Successfully",
                iconType: "success",
              });

              localStorage.setItem(
                "vrfCandidate",
                JSON.stringify(candidatePayload)
              );
              const count = localStorage.getItem("vrfCount");
              localStorage.setItem("vrfCount", count ? parseInt(count) + 1 : 1);

              setTimeout(() => {
                setBasicDetailsFilled(true);
              }, 1200);
              setDeleteStatus(false);
              await GetTotalPricing();
            } else {
              console.error("API Response Error:", responseCandidate);
              throw new Error("Failed to save candidate details.");
            }
          } catch (error) {
            console.error("API Error:", error.message || error);
            alert("Failed to save candidate details. Please try again later.");
          }
        } else {
          alert("Candidate details are incomplete. Please check the form.");
        }
      } catch (error) {
        console.error("Error submitting service request:", error.message || error);
        alert("Failed to submit details. Please try again later.");
      }
      setSubmitLoading(false);
    } else {
      alert("Please fill in all required fields correctly before submitting.");
    }
  };

  const handlePayment = () => {
    if (tprice > 0) {

      showPopup({
        title: "Components Saved",
        msg: "Redirecting you to payment page ",
        iconType: "success",
      });
      finalBilling();
      setTimeout(() => {
        setPaymentPage(true);

      }, 1200);

    } else {
      showPopup({
        title: "No Components",
        msg: "No components Selected",
        iconType: "error",
      });
    }
  };

  const handleCheckout = async () => {
    event.preventDefault();
    const vcode = localStorage.getItem('vrfCode');
    const response = await axios.post(API_ENDPOINTS.verificationPaymentUpdate,
      {
        verificationCode: vcode,
        amount: totalAmount,
        transactionID: "TXN1230"
      }
    )
    showPopup({
      title: "Successfull",
      msg: response.data,
      iconType: "success",
    });
    setTimeout(() => {
      setPaymentPage(false);
      navigate(`${import.meta.env.BASE_URL}verification/list/`);
    }, 2000);
  };
  //#endregion

  //#region  Pending List
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await GetLoginInfo();
        const response = await axios.post(API_ENDPOINTS.verificationList, {
          clientCode: user.userKey,
        });
        // Sort data by descending order (e.g., by `entry_date`)
        const sortedData = response.data.sort(
          (a, b) => new Date(b.entry_date) - new Date(a.entry_date)
        );
        const filteredData = sortedData.filter((item) => {
          if (item.verification_status === "Pending") {
            return item;
          }
        });
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Function to render badges based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge pill bg="warning">
            Pending
          </Badge>
        );
      case "Process":
        return (
          <Badge pill bg="info">
            Process
          </Badge>
        );
      case "VERIFY":
        return (
          <Badge pill bg="success">
            Verified
          </Badge>
        );
      case "Cancel":
        return (
          <Badge pill bg="danger">
            Cancel
          </Badge>
        );
      default:
        return (
          <Badge pill bg="secondary">
            {status}
          </Badge>
        );
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      name: "Verification ID",
      selector: (row) => row.verification_id,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.entry_date,
      sortable: true,
    },
    {
      name: "Verification Amount",
      selector: (row) => `₹${row.veriification_amount}`,
      sortable: true,
    },
    {
      name: "Service Name",
      selector: (row) => row.service_name,
      sortable: true,
    },
    {
      name: "Verification Status",
      selector: (row) => getStatusBadge(row.verification_status),
      sortable: true,
      cell: (row) => getStatusBadge(row.verification_status),
    },
    {
      name: "Actions",
      selector: (row) => row.verification_code,
      cell: (row) => (
        <>
          <Button
            variant="info"
            onClick={() => handleWithdraw(row.verification_code)}
          >
            Continue
          </Button>
        </>
      ),
    },
  ];

  // Function to handle Withdraw action
  const handleWithdraw = (verificationCode) => {
    alert(`Withdraw request for ${verificationCode} has been initiated.`);
    // Add withdrawal logic here
  };
  //#endregion

  const handleDeleteVerification = async () => {
    const vcode = localStorage.getItem('vrfCode');
    try {
      const response = await axios.post(API_ENDPOINTS.verificationDelete, {
        transactionType: "CASE",
        verificationCode: vcode
      });
      if (response.status === 200) {
        const resultArray = response.data.result.split(',');
        setCandidateDetails((prevDetails) => ({
          ...prevDetails,
          cndName: "",
          cndMobile: "",
          cndMail: "",
        }));
        setDeleteStatus(false);
        localStorage.setItem('vrfCode', resultArray[1]);
        showPopup({ title: "", msg: resultArray[2], iconType: "success" });
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const changeService = () => {
    setSelectedService(false)
    setDeleteStatus(false)
  };

  const GetTotalPricing = async () => {
    try {
      const billingRespone = await axios.post(API_ENDPOINTS.verificationBilling, {
        verificationCode: localStorage.getItem("vrfCode"),
        componentCode: 0,
      });

      if (billingRespone.status === 200) {
        setBillingData(billingRespone.data);
      }

      const response = await axios.post(API_ENDPOINTS.verificationTotalPrice, {
        verificationCode: localStorage.getItem("vrfCode"),
      });

      if (response.status === 200) {
        setBillinfo(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
    }
  };




  return (
    <>
      <Pageheader
        title="New Verification"
        heading="Verification"
        active="New Verification"
      />

      <>
        <Card>
          <Card.Body>
            {!selectedService ? (
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
            ) : (
              <div>
                <h5>
                  {selectedService.service_name}{" "}
                  {basicDetailsFilled ? (
                    ""
                  ) : (
                    <>
                      <button
                        className=" btn-link text-danger border-0 bg-transparent rounded-3"
                        onClick={changeService}
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

                    </div>
                  </Card.Header>

                  <Card.Body>
                    {deleteStatus && <div className="alert alert-danger">Pending record found. Click Continue to proceed or Delete.</div>}
                    <Row>
                      <Col md={4} sm={6}>
                        <Form.Group>
                          <Form.Label>Candidate Name</Form.Label>
                          <Form.Control
                            name="cndName"
                            value={candidateDetails.cndName}
                            autoComplete="off"
                            onChange={handleChange}
                            placeholder="Enter candidate name"
                            isInvalid={!!errors.cndName}
                            disabled={basicDetailsFilled}
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
                            autoComplete="off"
                            maxLength={10}
                            disabled={basicDetailsFilled}
                            onChange={handleChange}
                            onInput={(e) => {
                              // Restrict non-numeric input
                              e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}
                            placeholder="Enter mobile number"
                            isInvalid={!!errors.cndMobile}
                          />
                          {errors.cndMobile && (
                            <Form.Control.Feedback type="invalid">
                              {errors.cndMobile}
                            </Form.Control.Feedback>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4} sm={6}>
                        <Form.Group>
                          <Form.Label>Mail ID</Form.Label>
                          <Form.Control
                            name="cndMail"
                            value={candidateDetails.cndMail}
                            autoComplete="off"
                            maxLength={200}
                            disabled={basicDetailsFilled}
                            onChange={handleChange}
                            placeholder="Enter email"
                            isInvalid={!!errors.cndMail}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.cndMail}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col
                        lg={3}
                        md={4}
                        sm={6}
                        className="d-flex align-items-end"
                      >
                        {!basicDetailsFilled && (
                          <>
                            <button
                              disabled={submitLoading}
                              className={`mt-2 ${basicDetailsFilled ? "btn-update" : "btn-save"
                                }`}
                              onClick={handleBasicDetailsSubmit}
                            >
                              {!submitLoading ? (<>
                                {deleteStatus ? ("Continue") : ("Submit")} </>
                              ) : (
                                <>
                                  <Spinner
                                    animation="border"
                                    role="status"
                                  ></Spinner>
                                  Processing...
                                </>
                              )}
                            </button>

                            {deleteStatus &&

                              <><button className="btn btn-danger ms-2" onClick={handleDeleteVerification} >Delete Current Data</button></>
                            }
                          </>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {basicDetailsFilled && !paymentPage ? (
                  <>
                    <Row>
                      <Col lg={8}>
                        <Card className="shadow border-0">
                          <Card.Body>
                            {components.map((comp) => (
                              <div
                                key={comp.srv_component_code}
                                className="mb-4"
                              >
                                <div
                                  className={`p-3 rounded d-flex justify-content-between align-items-center ${selectedComponents.includes(comp)
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
                      <Col lg={4} >

                        <Card className="shadow border-0">
                          <Card.Header className="bg-dark text-white text-center fw-bold">
                            Your Billing
                          </Card.Header>
                          <Card.Body>
                          <div className="row">
                          <div className="col-12 ">
                            <Table striped hover>
                              <thead >
                                <tr >
                                  <th className=" bg-info text-white">Service</th>
                                  <th className=" text-center bg-info text-white">Qty</th>
                                  <th className=" bg-info text-white">Rate</th>
                                  <th className=" bg-info text-white text-end">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {billingData.map((item) => (
                                  <tr key={item.component_name}>
                                    <td>{item.component_name}</td>
                                    <td className="text-center" >{item.qnty}</td>
                                    <td>₹ {item.rate}</td>
                                    <td className="text-end">₹ {item.amount}</td>
                                  </tr>

                                ))}
                              </tbody>
                            </Table>
                            </div>
                            </div>
                            <div className="row">
                            <div className="offset-sm-4  col-sm-8 offset-md-5 col-md-7 offset-lg-5 col-lg-7">
                              <Table className="table-billing">
                                <tbody>
                                  <tr>
                                    <th>Gross Total</th>
                                    <td className=" text-end" > ₹ {billinfo.amount}</td>
                                  </tr>
                                  <tr>
                                    <th>{billinfo.tax_name} {billinfo.tax_rate}</th>
                                    <td className=" text-end"> ₹ {billinfo.tax}</td>
                                  </tr>
                                  <tr>
                                    <th> Net Amount</th>
                                    <td className=" text-end"> ₹ {billinfo.net}</td>
                                  </tr>
                                  <tr>
                                    <th>Round</th>
                                    <td className=" text-end"> ₹ {billinfo.roundup}</td>
                                  </tr>
                                  <tr>
                                    <th>Final</th>
                                    <td className=" text-end fw-bolder text-danger"> ₹ {billinfo.total}</td>
                                  </tr>
                                </tbody>
                              </Table>
                           
                            </div>
                            
                            </div>
                          </Card.Body>
                        </Card>
                        <div className="d-flex justify-content-between mt-3">
                          <button

                            className="btn-cancel  w-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePayment}
                            className="btn-save w-50 ms-2"
                          >
                            Proceed
                          </button>
                        </div>

                      </Col>
                    </Row>
                  </>
                ) : (
                  ""
                )}
              </div>
            )}

            {/* <Row>
                <Col sm={6}>Pending Verification List</Col>
                <Col sm={6} className=" text-end">
                  <button
                    onClick={() => setShowList(false)}
                    className="btn-save "
                  >
                    {" "}
                    New Verification{" "}
                  </button>
                </Col>
              </Row>
              <Row className=" mt-4">
                <Col>
                  <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    highlightOnHover
                    striped
                    customStyles={{
                      headCells: {
                        style: {
                          backgroundColor: "#f1f1f1",
                          fontWeight: "bold",
                          fontSize: "12px",
                          color: "#495057",
                        },
                      },
                      cells: {
                        style: {
                          fontSize: "14px",
                          padding: "10px",
                        },
                      },
                    }}
                  />
                </Col>
              </Row> */}
          </Card.Body>
        </Card>
      </>

      <>
        {paymentPage && (
          <Container>
            <Row className="justify-content-center">
              {/* Billing Summary */}
              <Col lg={6} md={12} className="mb-4">
                <Card className="shadow border-0">

                </Card>
              </Col>

              {/* Payment Section */}
              <Col lg={6} md={12}>
                <Card className="shadow border-0">
                  <Card.Body>
                    <h5 className="text-center mb-4">Enter Card Details and Pay</h5>
                    <form onSubmit={handleCheckout}>
                      <div className="mb-3">
                        <label htmlFor="cardNumber" className="form-label">Card Number</label>
                        <input type="text" id="cardNumber" className="form-control" placeholder="Card Number" />
                      </div>
                      <Row>
                        <Col md={6} className="mb-3">
                          <label htmlFor="expiry" className="form-label">Expiry</label>
                          <input type="text" id="expiry" className="form-control" placeholder="MM/YY" />
                        </Col>
                        <Col md={6} className="mb-3">
                          <label htmlFor="cvv" className="form-label">CVV</label>
                          <input type="text" id="cvv" className="form-control" placeholder="CVV" />
                        </Col>
                      </Row>
                      <button type="submit" className="btn btn-success btn-lg w-100">Pay ₹ {totalAmount.toFixed(2)}</button>
                    </form>
                    <div className="text-center mt-3">
                      <a href="#" className="text-muted">Terms of Service and Refund Policy</a>
                    </div>
                    <div className="text-center mt-4">
                      <img src="https://www.redcheckes.com/pay/mc.png" height={20} alt="Mastercard" className="mx-2" />
                      <img src="https://www.redcheckes.com/pay/rp.png" height={20} alt="RuPay" className="mx-2" />
                      <img src="https://www.redcheckes.com/pay/visa.png" height={20} alt="Visa" className="mx-2" />
                      <img src="https://www.redcheckes.com/pay/upi.png" height={20} alt="UPI" className="mx-2" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        )}
      </>
    </>
  );
};

export default VerificationForm;
