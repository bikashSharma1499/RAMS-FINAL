import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { FaSearch, FaDownload } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";

function RentAgreementTenantList() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const agr = JSON.parse(localStorage.getItem("rg_rcd"));
      const response = await axios.post(API_ENDPOINTS.agreementSecondPartyList, {
        agreementCode: agr?.agr_k,
      });

      // Sort data by agreement_code DESC
      const sortedData = response.data.sort((a, b) =>
        b.agreement_code.localeCompare(a.agreement_code)
      );

      setData(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [search, data]);

  const getBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-success";
      case "Pending":
        return "bg-warning text-dark";
      case "Close":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const columns = [
  
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Age",
      selector: (row) => row.age,
    },
    {
      name: "Father's Name",
      selector: (row) => row.father_name,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.mail,
    },
    {
      name: "Address",
      selector: (row) => row.address,
    },
   

  ];

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="mb-4 p-3 d-flex align-items-center justify-content-between border border-1">
        <h3 className="text-primary d-flex align-items-center">
          <IoIosPeople className="me-2" /> Tenant List
        </h3>
        <div className="search-box">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text">
              <FaSearch />
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        progressPending={loading}
        pagination
        responsive
        fixedHeader
        highlightOnHover
        striped
        defaultSortField="agreement_code"
        defaultSortAsc={false} // Default sort descending
      />
    </div>
  );
}

export default RentAgreementTenantList;
