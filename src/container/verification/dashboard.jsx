import Pageheader from "../../components/pageheader/pageheader";
import { Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Revenueanalytics } from "../dashboards/crm/crmdata"; // Assuming this is a graph component

function VerificationDashboard() {
  return (
    <>
      <Pageheader
        title="Dashboard"
        heading="Verification"
        active="Dashboard"
      />

      <Row>
        {/* First Card: Total Verifications */}
        <Col xl={9} lg={8}>
          <Row>
            <Col xxl={6} md={6} sm={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-primary">
                        <i className="ti ti-user-check fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <p className="text-muted mb-0">Total Verifications</p>
                          <h4 className="fw-semibold mt-1">38,250</h4> {/* Reasonable number */}
                        </div>
                        <div id="verification-total-customers">50</div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div>
                          <Link className="text-primary" to="#">
                            View All
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+12%</p> {/* Updated for a reasonable increment */}
                          <span className="text-muted op-7 fs-11">this month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Second Card: Pending Verifications */}
            <Col xxl={6} md={6} sm={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-warning">
                        <i className="ti ti-clock fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <p className="text-muted mb-0">Pending Verifications</p>
                          <h4 className="fw-semibold mt-1">5,300</h4> {/* Reasonable number */}
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div>
                          <Link className="text-primary" to="#">
                            View All
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-danger fw-semibold">-8%</p> {/* Updated to indicate decrease */}
                          <span className="text-muted op-7 fs-11">this month</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4">
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
                  <p className="text-muted mb-0">KYC Verifications</p>
                  <h4 className="fw-semibold mt-1">12,500</h4> {/* Reasonable number */}
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div>
                      <Link className="text-primary" to="#">
                        View Details
                        <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                      </Link>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-success fw-semibold">+18%</p>
                      <span className="text-muted op-7 fs-11">this month</span>
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
                  <span className="avatar avatar-md avatar-rounded bg-info">
                    <i className="ti ti-map-pin fs-16"></i>
                  </span>
                </div>
                <div className="flex-fill ms-3">
                  <p className="text-muted mb-0">Address Verifications</p>
                  <h4 className="fw-semibold mt-1">8,300</h4> {/* Reasonable number */}
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div>
                      <Link className="text-primary" to="#">
                        View Details
                        <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                      </Link>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-danger fw-semibold">-3%</p>
                      <span className="text-muted op-7 fs-11">this month</span>
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
                  <p className="text-muted mb-0">Email Verifications</p>
                  <h4 className="fw-semibold mt-1">15,700</h4> {/* Reasonable number */}
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div>
                      <Link className="text-primary" to="#">
                        View Details
                        <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                      </Link>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-success fw-semibold">+22%</p>
                      <span className="text-muted op-7 fs-11">this month</span>
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
                  <p className="text-muted mb-0">Phone Verifications</p>
                  <h4 className="fw-semibold mt-1">10,200</h4> {/* Reasonable number */}
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div>
                      <Link className="text-primary" to="#">
                        View Details
                        <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                      </Link>
                    </div>
                    <div className="text-end">
                      <p className="mb-0 text-success fw-semibold">+9%</p>
                      <span className="text-muted op-7 fs-11">this month</span>
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
              {/* <Revenueanalytics />  */}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Service-Wise Verification Summary */}
    
    </>
  );
}

export default VerificationDashboard;
