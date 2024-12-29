import Pageheader from "../../../components/pageheader/pageheader";
import { Card, Row, Col, Button } from "react-bootstrap";
import { useNavigate,Link } from "react-router-dom";
import { Revenueanalytics } from "./crmdata";
import { GetLoginInfo } from "../../auth/logindata";
import { useEffect, useState } from "react";
// Assuming this is a graph component

function Crm() {

  const navigate = useNavigate();
  const [userData, setUserData] = useState("");
  useEffect( async ()=>{
    const user= await GetLoginInfo();
    if(user){
      setUserData(user);
    }
  },[])

  const handleNavigate=(type)=>{
    switch(type){
      case "Property":
        navigate(`${import.meta.env.BASE_URL}auth/signin/`);
        break;
      case "Verification":
        navigate(`${import.meta.env.BASE_URL}verification/new/`);
        break;
      case "Agreement":
        navigate(`${import.meta.env.BASE_URL}newagreement/`);
        break;
    }

  }
 
  return (
    <>
      <Pageheader title="Dashboard" heading="Verification" active="Dashboard" />

      <div className="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb">
        <div>
          <p className="fw-semibold fs-18 mb-0">Welcome back, {userData.userName} !</p>
          <span className="fs-semibold text-muted">
            Track your activity, leads and deals here.
          </span>
        </div>
        <div className="btn-list mt-md-0 mt-2">
          <Button onClick={()=>handleNavigate("Agreement")} variant="" type="button" className="btn-save btn-wave">
            <i className="ri-filter-3-fill me-2 align-middle d-inline-block"></i>
            Agreement
          </Button>
          <Button  onClick={()=>handleNavigate("Property")} variant="" type="button" className="btn-new btn-wave">
            <i className="ri-upload-cloud-line me-2 align-middle d-inline-block"></i>
            Property
          </Button>
          <Button onClick={()=>handleNavigate("Verification")} variant="" type="button" className="btn-update btn-wave">
            <i className="ri-upload-cloud-line me-2 align-middle d-inline-block"></i>
            Verification
          </Button>
        </div>
      </div>

      <Row>
        {/* First Card: Total Verifications */}
        <Col xl={9} lg={8}>
          <Row className="">
            {/* Service 1: KYC Verification */}
            <Col xl={4} lg={4} md={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-success">
                        <i className="ti ti-id fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <p className="text-muted mb-0">Total Properties</p>
                      <h4 className="fw-semibold mt-1">12,500</h4>{" "}
                      {/* Reasonable number */}
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div>
                          <Link className="text-primary" to="#">
                            View Details
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+18%</p>
                          <span className="text-muted op-7 fs-11">
                            this month
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Service 2: Address Verification */}
            <Col xl={4} lg={4} md={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-secondary">
                        <i className="ti ti-wallet fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <p className="text-muted mb-0">Total Agreements</p>
                          <h4 className="fw-semibold mt-1">$56,562</h4>
                        </div>
                        <div id="crm-total-revenue"></div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div>
                          <Link className="text-secondary" to="#">
                            View All
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+25%</p>
                          <span className="text-muted op-7 fs-11">
                            this month
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Service 3: Email Verification */}
            <Col xl={4} lg={4} md={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-warning">
                        <i className="ti ti-mail fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <p className="text-muted mb-0">Total Verifications</p>
                      <h4 className="fw-semibold mt-1">15,700</h4>{" "}
                      {/* Reasonable number */}
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div>
                          <Link className="text-primary" to="#">
                            View Details
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+22%</p>
                          <span className="text-muted op-7 fs-11">
                            this month
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Service 4: Phone Number Verification */}
            <Col xl={4} lg={4} md={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-danger">
                        <i className="ti ti-phone fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <p className="text-muted mb-0">Tenants</p>
                      <h4 className="fw-semibold mt-1">10,200</h4>{" "}
                      {/* Reasonable number */}
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div>
                          <Link className="text-primary" to="#">
                            View Details
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+9%</p>
                          <span className="text-muted op-7 fs-11">
                            this month
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4} lg={4} md={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-danger">
                        <i className="ti ti-phone fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <p className="text-muted mb-0">Today Collections</p>
                      <h4 className="fw-semibold mt-1">10,200</h4>{" "}
                      {/* Reasonable number */}
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div>
                          <Link className="text-primary" to="#">
                            View Details
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+9%</p>
                          <span className="text-muted op-7 fs-11">
                            this month
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl={4} lg={4} md={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-danger">
                        <i className="ti ti-phone fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <p className="text-muted mb-0">Expring Agreements</p>
                      <h4 className="fw-semibold mt-1">10,200</h4>{" "}
                      {/* Reasonable number */}
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div>
                          <Link className="text-primary" to="#">
                            View Details
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+9%</p>
                          <span className="text-muted op-7 fs-11">
                            this month
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Graph Section */}
        <Col xl={3} lg={4}>
          <Card className="custom-card">
            <Card.Body>
              <h6 className="fw-semibold">Verification Statistics</h6>
              <Revenueanalytics /> {/* Placeholder for the actual graph */}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Service-Wise Verification Summary */}
    </>
  );
}

export default Crm;
