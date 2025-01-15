import { Card, Container, Row, Col, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

function PropertyPricingHistory( p_code ) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(API_ENDPOINTS.PropertyPricingHistory, {
         propertyCode:p_code,
        });
       
        setData(response.data);
        setFilteredData(response.data);
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
        item.monthly_rent.toLowerCase().includes(lowercasedSearch) ||
        item.water_bill.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredData(results);
  }, [searchTerm, data]);

  const columns = [
    {
      name: "Sl.No",
      selector: (row, index) => index + 1,
      center: true,
      width: "50px",
    },
    {
      name: "Monthly Rent.",
      selector: (row, index) =>row.monthly_rent,
      center: true,
      width: "50px",
    },
    {
      name: "Advance Amount",
      selector: (row) => row.advance_amount,
      sortable: true,
      width: "120px",
    },
    {
      name: "Notice Period",
      selector: (row) => row.notice_period,
      sortable: true,
      width: "120px",
    },
    {
      name: "Agreement Duration",
      selector: (row) => row.agreement_duration_month,
      sortable: true,
    },
    {
      name: "Payment Date",
      selector: (row) => row.payment_day,
      sortable: true,
    },
    {
      name: "Electic Bill",
      selector: (row) => row.electric_bill,
      sortable: true,
    },
    {
      name: "Water Bill",
      selector: (row) => row.water_bill,
      sortable: true,
    },
    {
      name: "Society Fees",
      selector: (row) => row.society_bill,
      sortable: true,
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
          <h5 className=" text-primary">Pricing History</h5>
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

export default PropertyPricingHistory;
