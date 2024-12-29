import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";

const AgreementEntryList = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredDataList, setFilteredDataList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchList, setSearchList] = useState("");

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
      setDataList(fetchedData);
      setFilteredDataList(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoadingList(false);
    }
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
      name: "Download",
      cell: (row) =>
        row.agreement_status?.toLowerCase() === "active" ||
        row.agreement_status?.toLowerCase() === "close" ? (
          <a
            href={`${API_ENDPOINTS.agreementDownload}/${row.agreement_id}`}
            className="btn btn-primary btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
        ) : (
          <span className="text-muted">N/A</span>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-black-50">Agreement List</h4>
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
        fixedHeader
        highlightOnHover
        striped
        customStyles={{
          rows: {
            style: {
              minHeight: "60px", // Override the row height
            },
          },
        }}
      />
    </div>
  );
};

export default AgreementEntryList;
