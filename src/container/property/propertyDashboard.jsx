import Pageheader from "../../components/pageheader/pageheader";
import { Card, Row, Col, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Revenueanalytics } from "../dashboards/crm/crmdata";
function PropertyDashboard() {
  return (
    <>
      <Pageheader
        title="Property Dashboard"
        heading="Property"
        active="Property Dashboard"
      />

      <Row>
        <Col xl={9} lg={8}>
          <Row>
            <Col xxl={6} md={6} sm={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-primary">
                        <i className="ti ti-users fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <p className="text-muted mb-0">Total Properties</p>
                          <h4 className="fw-semibold mt-1">1,02,890</h4>
                        </div>
                        <div id="crm-total-customers">40</div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div>
                          <Link className="text-primary" to="#">
                            View All
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+40%</p>
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

            <Col xxl={6} md={6} sm={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-primary">
                        <i className="ti ti-users fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <p className="text-muted mb-0">Occupied Properties</p>
                          <h4 className="fw-semibold mt-1">1,02,890</h4>
                        </div>
                        <div id="crm-total-customers">40</div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div>
                          <Link className="text-primary" to="#">
                            View All
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+40%</p>
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
            <Col xxl={6} md={6} sm={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-primary">
                        <i className="ti ti-users fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <p className="text-muted mb-0">Closed Properties</p>
                          <h4 className="fw-semibold mt-1">1,02,890</h4>
                        </div>
                        <div id="crm-total-customers">40</div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div>
                          <Link className="text-primary" to="#">
                            View All
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+40%</p>
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

            <Col xxl={6} md={6} sm={6}>
              <Card className="custom-card overflow-hidden">
                <Card.Body>
                  <div className="d-flex align-items-top justify-content-between">
                    <div>
                      <span className="avatar avatar-md avatar-rounded bg-primary">
                        <i className="ti ti-users fs-16"></i>
                      </span>
                    </div>
                    <div className="flex-fill ms-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <div>
                          <p className="text-muted mb-0">Total Tenant</p>
                          <h4 className="fw-semibold mt-1">1,02,890</h4>
                        </div>
                        <div id="crm-total-customers">40</div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div>
                          <Link className="text-primary" to="#">
                            View All
                            <i className="ti ti-arrow-narrow-right ms-2 fw-semibold d-inline-block"></i>
                          </Link>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 text-success fw-semibold">+40%</p>
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
          <Row>
      <Col>
          <Card className="custom-card">
            <Card.Header className=" justify-content-between">
              <Card.Title>Revenue Analytics</Card.Title>
              <Dropdown>
                <Dropdown.Toggle
                  variant=""
                  className="p-2 fs-12 text-muted no-caret"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  View All
                  <i className="ri-arrow-down-s-line align-middle ms-1 d-inline-block"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu role="menu">
                  <Dropdown.Item>Today</Dropdown.Item>
                  <Dropdown.Item>This Week</Dropdown.Item>
                  <Dropdown.Item>Last Week</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body>
              <div id="crm-revenue-analytics">
                <Revenueanalytics />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
        </Col>

        <Col xl={3} lg={4}>
          <Card className="custom-card">
            <Card.Header className=" justify-content-between">
              <Card.Title>Recent Activity</Card.Title>
              <Dropdown>
                <Dropdown.Toggle
                  variant=""
                  className="p-2 fs-12 text-muted no-caret"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  View All
                  <i className="ri-arrow-down-s-line align-middle ms-1 d-inline-block"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu role="menu">
                  <Dropdown.Item>Today</Dropdown.Item>
                  <Dropdown.Item>This Week</Dropdown.Item>
                  <Dropdown.Item>Last Week</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body>
              <div>
                <ul className="list-unstyled mb-0 crm-recent-activity">
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-primary-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span className="fw-semibold">
                          Update of calendar events &amp;
                        </span>
                        <span>
                          <Link to="#" className="text-primary fw-semibold">
                            {" "}
                            Added new events in next week.
                          </Link>
                        </span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          4:45PM
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-secondary-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span>
                          New theme for{" "}
                          <span className="fw-semibold">Spruko Website</span>{" "}
                          completed
                        </span>
                        <span className="d-block fs-12 text-muted">
                          Lorem ipsum, dolor sit amet.
                        </span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          3 hrs
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-success-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span>
                          Created a{" "}
                          <span className="text-success fw-semibold">
                            New Task
                          </span>{" "}
                          today{" "}
                          <span className="avatar avatar-xs bg-purple-transparent avatar-rounded ms-1">
                            <i className="ri-add-fill text-purple fs-12"></i>
                          </span>
                        </span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          22 hrs
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-pink-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span>
                          New member{" "}
                          <span className="badge bg-pink-transparent">
                            @andreas gurrero
                          </span>{" "}
                          added today to AI Summit.
                        </span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          Today
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-warning-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span>32 New people joined summit.</span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          22 hrs
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-info-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span>
                          Neon Tarly added{" "}
                          <span className="text-info fw-semibold">
                            Robert Bright
                          </span>{" "}
                          to AI summit project.
                        </span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          12 hrs
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-dark-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span>
                          Replied to new support request{" "}
                          <i className="ri-checkbox-circle-line text-success fs-16 align-middle"></i>
                        </span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          4 hrs
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="crm-recent-activity-content">
                    <div className="d-flex align-items-top">
                      <div className="me-3">
                        <span className="avatar avatar-xs bg-purple-transparent avatar-rounded">
                          <i className="bi bi-circle-fill fs-8"></i>
                        </span>
                      </div>
                      <div className="crm-timeline-content">
                        <span>
                          Completed documentation of{" "}
                          <Link
                            to="#"
                            className="text-purple text-decoration-underline fw-semibold"
                          >
                            AI Summit.
                          </Link>
                        </span>
                      </div>
                      <div className="flex-fill text-end">
                        <span className="d-block text-muted fs-11 op-7">
                          4 hrs
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default PropertyDashboard;
