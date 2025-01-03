import React from "react";
import { Button, Badge } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import DataTable from "react-data-table-component";
import ErrorBoundary from "./ErrorBoundary"; // Import the ErrorBoundary

// Sample data for the table
const data = [
  {
    verification_id: "24-25/RCV000001",
    entry_date: "2024-12-30",
    verification_amount: 1500,
    service_name: "MAID VERIFICATION",
    verification_status: "Pending",
  },
  {
    verification_id: "24-25/RCV000002",
    entry_date: "2024-12-30",
    verification_amount: 2000,
    service_name: "TENANT VERIFICATION",
    verification_status: "Process",
  },
  {
    verification_id: "24-25/RCV000003",
    entry_date: "2024-12-30",
    verification_amount: 1000,
    service_name: "MAID VERIFIACTION",
    verification_status: "VERIFY",
  },
  {
    verification_id: "24-25/RCV000004",
    entry_date: "2024-12-30",
    verification_amount: 2500,
    service_name: "DRIVER VERIFICATION",
    verification_status: "Cancel",
  },
];

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
    selector: row => row.verification_id,
    sortable: true,
  },
  {
    name: "Entry Date",
    selector: row => row.entry_date,
    sortable: true,
  },
  {
    name: "Verification Amount",
    selector: row => `₹${row.verification_amount}`, // Display amount with Rupees symbol
    sortable: true,
  },
  {
    name: "Service Name",
    selector: row => row.service_name,
    sortable: true,
  },
  {
    name: "Verification Status",
    selector: row => getStatusBadge(row.verification_status),
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
  // You can integrate the withdrawal action logic here
};

function VerificationListData() {
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
                      backgroundColor: '#f1f1f1',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: '#495057',
                    },
                  },
                  cells: {
                    style: {
                      fontSize: '14px',
                      padding: '10px',
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
