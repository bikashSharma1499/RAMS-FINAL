import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap"; // Import Spinner for loading state
import Swal from 'sweetalert2'; // For confirmation modals

const DataTableComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(10); // Page size control
  const navigate = useNavigate();
  const [buttonText, setButtonText] = useState("default"); // Declare buttonText here

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = GetLoginInfo();
        const response = await axios.post(API_ENDPOINTS.propertyList, {
          transactionType: user.userType,
          customerCode: user.userKey,
        });
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [buttonText]);

  const handleEdit = (id) => {
    const data = {
      inital_p: "U",
      actual_p: "U",
      process_p: id,
      process_r: "0",
    };
    localStorage.setItem("prop_process", JSON.stringify(data));
    navigate(`${import.meta.env.BASE_URL}property/listing/`);
  };

  const handleClose = (id, action) => {
    
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${action}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'No, cancel!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(API_ENDPOINTS.propertyStatus, {
            propertyCode: id,
            propertyStatus: action, // Pass the action name as the status
          });
          Swal.fire('Success', `Property has been ${action.toLowerCase()} successfully!`, 'success');
          // Re-fetch the data
          // const user = GetLoginInfo();
          // const response = await axios.post(API_ENDPOINTS.propertyList, {
          //   transactionType: user.userType,
          //   customerCode: user.userKey,
          // });
          // setData(response.data);
          setButtonText(action);
        } catch (err) {
          Swal.fire('Error', `Failed to ${action.toLowerCase()} the property. Please try again.`, 'error');
        }
      }
    });
  };
  
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = data.filter(
    (item) =>
      (item.property_id &&
        item.property_id.toString().toLowerCase().includes(searchText.toLowerCase())) ||
      (item.property_name && item.property_name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    let badgeColor;
    switch (status) {
      case "Occupied":
        badgeColor = "badge-success";
        break;
      case "Active":
        badgeColor = "badge-secondary";
        break;
      case "Published":
        badgeColor = "badge-secondary";
        break;
      case "Temporary Hold":
        badgeColor = "badge-warning";
        break;
      case "Close":
        badgeColor = "badge-danger";
        break;
      default:
        badgeColor = "badge-light";
        break;
    }

    return <span className={`badge ${badgeColor}`}>{status}</span>;
  };

  const columns = [
    { name: "Property ID", selector: (row) => row.property_id, sortable: true },
    { name: "Entry Date", selector: (row) => row.listing_date_format },
    { name: "Name", selector: (row) => row.property_name },
    { name: "Location", selector: (row) => row.location },
    {
      name: "Status",
      selector: (row) => row.display_status,
      cell: (row) => getStatusBadge(row.display_status),
    },
    {
      name: "Edit",
      cell: (row) => (
        <div>
          {row.display_status !== "Close" && (
           
            <button onClick={() => handleEdit(row.property_code)} className="btn btn-success rounded-2 btn-sm" title="Edit Property">
            Edit
          </button>)}
          
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {row.display_status === "Active" && (
  <>
    <button
      onClick={() => handleClose(row.property_code, "Close")}
      className="btn btn-danger rounded-2 btn-sm"
      title="Close Property"
    >
      Close
    </button>
    <button
      onClick={() => handleClose(row.property_code, "Suspend")}
      className="btn btn-warning rounded-2 btn-sm"
      title="Suspend Property"
    >
      Suspend
    </button>
    <button
      onClick={() => handleClose(row.property_code, "Publish")}
      className="btn btn-success rounded-2 btn-sm"
      title="Publish Property"
    >
      Publish
    </button>
  </>
)}
{row.display_status === "Occupied" && (
  <button
    onClick={() => handleClose(row.property_code, "Vacant Now")}
    className="btn btn-danger rounded-2 btn-sm"
    title="Withdraw Property"
  >
    Vacant Now
  </button>
)}
{row.display_status === "Published" && (
  <button
    onClick={() => handleClose(row.property_code, "Withdraw")}
    className="btn btn-danger rounded-2 btn-sm"
    title="Withdraw Property"
  >
    Withdraw
  </button>
)}
{row.display_status === "Temporary Hold" && (
  <button
    onClick={() => handleClose(row.property_code, "Activate")}
    className="btn btn-success rounded-2 btn-sm"
    title="Activate Property"
  >
    Activate
  </button>
)}

        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "300px",
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-2">
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationPerPage={pageSize} // Set the page size
        onChangeRowsPerPage={(newPerPage) => setPageSize(newPerPage)} // Allow user to change page size
        highlightOnHover
        responsive
        fixedHeader
        striped
        dense
        pointerOnHover
        noDataComponent="No Property Found for you"
        subHeader
        subHeaderComponent={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
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
                width: "100%",
                maxWidth: "300px",
              }}
            />
          </div>
        }
      />
    </div>
  );
};

export default DataTableComponent;
