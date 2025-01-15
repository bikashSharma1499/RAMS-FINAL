import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component"; // Import the DataTable component
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import axios from "axios";

const DataTableComponent = () => {
  const [data, setData] = useState([]);  // State to store fetched data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null);  // State to manage errors
  const [searchText, setSearchText] = useState(""); // State to handle search input

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await GetLoginInfo();
        const response = await axios.post(API_ENDPOINTS.propertyList, {
          transactionType: user.userType,
          customerCode: user.userKey,
        });
        console.log(response.data);
        setData(response.data);
      } catch (err) {
        setError(err.message);  // Handle any errors
      } finally {
        setLoading(false);  // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, []); // Empty dependency array makes sure this runs once on mount

  const handleEdit = (id) => {
    alert(`Edit record with ID: ${id}`);
  };

  const handleClose = (id) => {
    alert(`Close record with ID: ${id}`);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value); // Update the search text state on input change
  };

  const filteredData = data.filter(
    (item) =>
      (item.property_id &&
        item.property_id.toString().toLowerCase().includes(searchText.toLowerCase())) ||
      (item.property_name && item.property_name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { name: "ID", selector: (row) => row.property_id, sortable: true },
    { name: "Date Format", selector: (row) => row.listing_date_format },
    { name: "Name", selector: (row) => row.property_name },
    { name: "Location", selector: (row) => row.location },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button onClick={() => handleEdit(row.property_code)} className="btn btn-warning btn-sm">
            Edit
          </button>
          <button
            onClick={() => handleClose(row.property_code)}
            className="btn btn-danger btn-sm"
            style={{ marginLeft: "10px" }}
          >
            Close
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <DataTable
        title="Property Data"
        columns={columns}
        data={filteredData}
        pagination
        highlightOnHover
        responsive
        fixedHeader={true}
   
        subHeader
        subHeaderComponent={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",  // Ensuring it's full width
              paddingRight: "10px",
              marginBottom: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
              style={{
                padding: "5px",
                borderRadius: "4px",
                width: "100%",  // Ensure it takes full width of its container
                maxWidth: "300px",  // Limit the max width to avoid overflowing
              }}
            />
          </div>
        }
      />
    </div>
  );
};

export default DataTableComponent;
