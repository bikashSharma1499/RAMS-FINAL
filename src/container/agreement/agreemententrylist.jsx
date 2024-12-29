import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import { useNavigate } from "react-router-dom";

const AgreementEntryList = () => {
  const [dataList, setDataList] = useState([]);
  const [filteredDataList, setFilteredDataList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchList, setSearchList] = useState("");
  const navigate = useNavigate(); // For navigation when Continue button is clicked

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
      // Initially filter data where agreement_status is "Pending"
      setFilteredDataList(fetchedData.filter((item) => item.agreement_status === "Pending"));
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

  // Filter data based on search input and agreement_status
  useEffect(() => {
    const lowercasedSearch = searchList.toLowerCase();
    const filtered = dataList
      .filter((item) => item.agreement_status === "Pending") // Only include rows with agreement_status = "Pending"
      .filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowercasedSearch)
        )
      );
    setFilteredDataList(filtered);
  }, [searchList, dataList]);

  // Handle Continue button click
  const handleContinue = (agreementId) => {
    // Navigate to a new page or perform some action using the agreementId
    console.log("Continue clicked for agreement ID:", agreementId);
    navigate(`/agreement/details/${agreementId}`);
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
    <div style={{ padding: "20px" }}>
      <div className="d-flex justify-content-between">
         <div className="search-box" style={{ marginBottom: "20px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchList}
            onChange={(e) => setSearchList(e.target.value)}
            style={{ maxWidth: "300px", margin: "0 auto" }}
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
      />
    </div>
  );
};

export default AgreementEntryList;
