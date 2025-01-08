import React, { useState, useEffect } from "react";
import { Button, Badge } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import DataTable from "react-data-table-component";
import ErrorBoundary from "./ErrorBoundary";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";

function VerificationListData() {
  const [data, setData] = useState([]); // Initialize state for data

  // Fetch data from API and sort by descending order
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await GetLoginInfo();
        const response = await axios.post(API_ENDPOINTS.verificationList, {
          clientCode: user.userKey,
        });
        // Sort data by descending order (e.g., by `entry_date`)
        const sortedData = response.data.sort(
          (a, b) => new Date(b.entry_date) - new Date(a.entry_date)
        );
        const filteredData=sortedData.filter((item)=>{
            if(item.verification_status!=='Pending'){
              return item;
            }
        })
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Function to render badges based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge pill bg="warning">Pending</Badge>;
      case "Process":
        return <Badge pill bg="info">Process</Badge>;
      case "VERIFY":
        return <Badge pill bg="success">Verified</Badge>;
      case "Cancel":
        return <Badge pill bg="danger">Cancel</Badge>;
      default:
        return <Badge pill bg="secondary">{status}</Badge>;
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      name: "Verification ID",
      selector: (row) => row.verification_id,
      sortable: true,
    },
    {
      name: "Entry Date",
      selector: (row) => row.entry_date,
      sortable: true,
    },
    {
      name: "Verification Amount",
      selector: (row) => `₹${row.veriification_amount}`,
      sortable: true,
    },
    {
      name: "Service Name",
      selector: (row) => row.service_name,
      sortable: true,
    },
    {
      name: "Verification Status",
      selector: (row) => getStatusBadge(row.verification_status),
      sortable: true,
      cell: (row) => getStatusBadge(row.verification_status),
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          {row.verification_status === "VERIFY" && (
            <a target="_blank" href="https://www.redcheckes.com/pay/report.pdf" download="Verification_Report.pdf">
              <Button variant="success">Download</Button>
            </a>
          )}
          {row.verification_status === "Pending" && (
            <Button variant="danger" onClick={() => handleWithdraw(row.verification_id)}>
              Withdraw
            </Button>
          )}
        </>
      ),
    },
  ];

  // Function to handle Withdraw action
  const handleWithdraw = (verificationId) => {
    alert(`Withdraw request for ${verificationId} has been initiated.`);
    // Add withdrawal logic here
  };

  return (
    <>
      <Pageheader title="New Verification" heading="Verification" active="New Verification" />
      <div className="container mt-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={data}
              pagination
              highlightOnHover
              striped
              customStyles={{
                headCells: {
                  style: {
                    backgroundColor: "#f1f1f1",
                    fontWeight: "bold",
                    fontSize: "12px",
                    color: "#495057",
                  },
                },
                cells: {
                  style: {
                    fontSize: "14px",
                    padding: "10px",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Wrap the VerificationListReport component inside the ErrorBoundary
function VerificationListReport() {
  return (
    <ErrorBoundary>
      <VerificationListData />
    </ErrorBoundary>
  );
}

export default VerificationListReport;
