import { Card, Container, Row, Col, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropertyPricingHistory from "./propertyPricingHistory";
import {
  FaMoneyBillAlt,
  FaClipboardCheck,
  FaUsers,
  FaFileSignature,
} from "react-icons/fa";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import { showPopup } from "../../utils/validation";
import DataTable from "react-data-table-component";
import Pageheader from "../../components/pageheader/pageheader";

function PropertyListData() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const handleRentCollection = (property_code) => {
    showPopup({
      title: "Rent Collection",
      msg: `Collect rent for property with Code: ${property_code}`,
      iconType: "success",
    });
  };

  const handleVerification = (property_code) => {
    showPopup({
      title: "Verification",
      msg: `Verify property with Code: ${property_code}`,
      iconType: "info",
    });
  };

  const handleTenantList = (property_code) => {
    showPopup({
      title: "Tenant List",
      msg: `View tenant list for property with Code: ${property_code}`,
      iconType: "info",
    });
  };

  const handleNewAgreement = (property_code) => {
    showPopup({
      title: "Agreement List",
      msg: `Create a new agreement for property with Code: ${property_code}`,
      iconType: "info",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await GetLoginInfo();
        const response = await axios.post(API_ENDPOINTS.propertyList, {
          transactionType: user.userType,
          customerCode: user.userKey,
        });
        const filterData = response.data.filter(
          (item) => item.display_status === "Occupied"
        );
        setData(filterData);
        setFilteredData(filterData);
      } catch (error) {
        console.error("Error fetching data:", error);
    
    
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const lowercasedSearch = searchTerm.toLowerCase();
    const results = data.filter(
      (item) =>
        item.property_name.toLowerCase().includes(lowercasedSearch) ||
        item.property_id.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  const columns = [
    {
      name: "SL No.",
      selector: (row, index) => index + 1,
      center: true,
      width: "50px",
    },
    {
      name: "Listing Date",
      selector: (row) => row.listing_date_format,
      sortable: true,
      width: "120px",
    },
    {
      name: "Property ID",
      selector: (row) => row.property_id,
      sortable: true,
      width: "120px",
    },
    {
      name: "Property Name",
      selector: (row) => row.property_name,
      sortable: true,
    },
    {
      name: "Rent Collection",
      button: true,
      cell: (row) => (
        <button
          className="btn btn-primary rounded-5 btn-sm"
          onClick={() => handleRentCollection(row.property_code)}
        >
          <FaMoneyBillAlt /> Collect Now
        </button>
      ),
      width: "130px",
    },
    {
      name: "Pricing History",
      button: true,
      cell: (row) => (
        <button
          className="btn btn-secondary rounded-4 btn-sm"
          onClick={() => handleVerification(row.property_code)}
        >
          <FaClipboardCheck /> View
        </button>
      ),
      width: "130px",
    },
    {
      name: "Tenant List",
      button: true,
      cell: (row) => (
        <button
          className="btn btn-info rounded-4 btn-sm"
          onClick={() => handleTenantList(row.property_code)}
        >
          <FaUsers /> View
        </button>
      ),
      width: "130px",
    },
    {
      name: "Agreement List",
      button: true,
      cell: (row) => (
        <button
          className="btn btn-success rounded-4 btn-sm"
          onClick={() => handleNewAgreement(row.property_code)}
        >
          <FaFileSignature /> View
        </button>
      ),
      width: "130px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#f8f9fa",
        color: "#333",
      },
    },
    cells: {
      style: {
        fontSize: "13px",
      },
    },
  };

  return (
    <Container fluid>
      <Pageheader title="Transaction" heading="Property" active="Transaction" />
      <Card className="mt-4 shadow-sm">
        <Card.Body>
          <h4 className=" text-danger-emphasis">Property Transaction</h4>
          <Row className="mb-3">
            <Col md={6} className=" float-end">
              <Form.Control
                type="text"
                placeholder="Search by Property Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              customStyles={customStyles}
              pagination
              responsive
              highlightOnHover
              striped
              fixedHeader
              fixedHeaderScrollHeight="400px"
            />
          )}
        </Card.Body>
      </Card>

    </Container>
    
  );
}

export default PropertyListData;
