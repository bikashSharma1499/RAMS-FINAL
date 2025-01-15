import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import { useNavigate } from "react-router-dom";

const AgreementPendingList = () => {
  const [dataList, setDataList] = useState([]); // Complete data list
  const [filteredDataList, setFilteredDataList] = useState([]); // Filtered data list
  const [loading, setLoading] = useState(false); // Loading state
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = GetLoginInfo();
      if (!user || !user.userKey) {
        throw new Error("User information is missing. Please log in again.");
      }

      const response = await axios.post(API_ENDPOINTS.agreementListDisplay, {
        customerCode: user.userKey,
      });

      const data = Array.isArray(response.data) ? response.data : [];
      const pendingData = data.filter((item) => item.agreement_status === "Pending");

      setDataList(data);
      setFilteredDataList(pendingData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data. Please try again.");
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter data when the search term changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = dataList.filter(
        (item) =>
          item.agreement_status === "Pending" &&
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(lowercasedSearch)
          )
      );
      setFilteredDataList(filtered);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, dataList]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle navigation to agreement details
  const handleContinue = (agreementId) => {
    if (!agreementId) {
      console.error("Invalid agreement ID:", agreementId);
      return;
    }
    navigate(`/agreement/details/${agreementId}`);
  };

  // Define table columns
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
      name: "Agreement Status",
      selector: (row) => row.agreement_status || "N/A",
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          className="btn btn-warning btn-sm"
          onClick={() => handleContinue(row.agreement_id)}
        >
          Continue
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* Error message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search box */}
      <div className="d-flex justify-content-between">
        <div className="search-box" style={{ marginBottom: "20px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "300px", margin: "0 auto" }}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredDataList}
        progressPending={loading}
        pagination
        fixedHeader
        highlightOnHover
        striped
        className="table-responsive"
      />
    </div>
  );
};

export default AgreementPendingList;
