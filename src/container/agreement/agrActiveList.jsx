import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import LeaseDeed from "./printagreement";
import Pageheader from "../../components/pageheader/pageheader";

const RentAgreementActive = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredDataList, setFilteredDataList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchList, setSearchList] = useState("");
  const [showAgreementPrint, setShowAgreementPrint] = useState(false);

  // Fetch data from the API
  const fetchData = async () => {
    setLoadingList(true);
    try {
      const user = GetLoginInfo();
      if (!user || !user.userKey) {
        throw new Error("User information is not available");
      }
      const response = await axios.post(API_ENDPOINTS.agreementListDisplay, {
        customerCode: user.userKey,
      });

      const fetchedData = response.data || [];

      const activeData = fetchedData.filter((item) => item.agreement_status !== "Pending");

      setDataList(activeData);
      setFilteredDataList(activeData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoadingList(false);
    }
  };

  const handleAgreementAction = (code, type) => {

    if (type.toLowerCase() === "stamp agreement") {
      sessionStorage.setItem("signStatus", "True");
    }
    sessionStorage.setItem("agcCode", code);
    setShowAgreementPrint(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on search input
  useEffect(() => {
    if (!searchList.trim()) {
      setFilteredDataList(dataList);
    } else {
      const lowercasedSearch = searchList.toLowerCase();
      const filtered = dataList.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowercasedSearch)
        )
      );
      setFilteredDataList(filtered);
    }
  }, [searchList, dataList]);

  // Badge Color for Status
  const getAgmtStatusBadge = (type) => {
    switch (type.toLowerCase()) {
      case "stamp agreement":
        return <span className="badge bg-primary">Stamp Agreement</span>;
      case "draft agreement":
        return <span className="badge bg-warning text-dark">Draft Agreement</span>;
      default:
        return <span className="badge bg-secondary">{type || "Unknown"}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return <span className="badge bg-success">Active</span>;
      case "close":
        return <span className="badge bg-danger">Close</span>;
      default:
        return <span className="badge bg-secondary">{status || "Unknown"}</span>;
    }
  };

  // Table columns
  const columns = [
    {
      name: "Agreement ID",
      selector: (row) => row.agreement_id || "N/A",
      sortable: true,
    },
    {
      name: "Agreement Date",
      selector: (row) => row.entry_date_format || "N/A",
      sortable: true,
    },
    {
      name: "Property",
      selector: (row) => row.property_name || "N/A",
      sortable: true,
    },
    {
      name: "Property Address",
      selector: (row) => row.property_address || "N/A",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => getStatusBadge(row.agreement_status),
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => getAgmtStatusBadge(row.agreement_type),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) =>
        row.agreement_status.toLowerCase() !== "close" ? (
          <Button
            variant={
              row.agreement_type?.toLowerCase() === "stamp agreement"
                ? "primary"
                : row.agreement_type?.toLowerCase() === "draft agreement"
                ? "warning"
                : "secondary"
            }
            className="btn-sm text-white"
            onClick={() => handleAgreementAction(row.agreement_code, row.agreement_type)}
          >
            {row.agreement_type?.toLowerCase() === "stamp agreement"
              ? "Proceed to Sign"
              : row.agreement_type?.toLowerCase() === "draft agreement"
              ? "Download Now"
              : "N/A"}
          </Button>
        ) : null,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div>
      {!showAgreementPrint ? (
        <>
          <Pageheader title="Agreement List" heading="Agreement" active="Agreement List" />
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={searchList}
                onChange={(e) => setSearchList(e.target.value)}
                style={{ maxWidth: "300px" }}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredDataList}
            progressPending={loadingList}
            pagination
            responsive
            highlightOnHover
            striped
            customStyles={{
              rows: {
                style: {
                  minHeight: "50px",
                },
              },
            }}
          />
        </>
      ) : (
        <Card>
          <Card.Header className="d-flex justify-content-between">
            <Card.Title className="fw-bolder">Download Your Agreement</Card.Title>
            <button
              onClick={() => setShowAgreementPrint(false)}
              className="btn btn-danger"
            >
              Go Back
            </button>
          </Card.Header>
          <Card.Body className="bg-body-secondary">
            <LeaseDeed />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RentAgreementActive;
