import React from "react";
import { Button, Badge } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import DataTable from "react-data-table-component";

// Sample data for the payment history table
const paymentData = [
  {
    verification_id: "V1234",
    payment_date: "2024-12-01",
    payment_amount: 1500,
    payment_status: "Success",
    receipt_url: "https://www.redcheckes.com/pay/receipt_1234.pdf",
  },
  {
    verification_id: "V1234",
    payment_date: "2024-12-02",
    payment_amount: 1500,
    payment_status: "Failed",
    receipt_url: "",
  },
  {
    verification_id: "V1235",
    payment_date: "2024-12-02",
    payment_amount: 2000,
    payment_status: "Success",
    receipt_url: "https://www.redcheckes.com/pay/receipt_1235.pdf",
  },
  {
    verification_id: "V1236",
    payment_date: "2024-12-03",
    payment_amount: 1000,
    payment_status: "Failed",
    receipt_url: "",
  },
  {
    verification_id: "V1237",
    payment_date: "2024-12-04",
    payment_amount: 2500,
    payment_status: "Success",
    receipt_url: "https://www.redcheckes.com/pay/receipt_1237.pdf",
  },
];

// Function to render badges based on payment status
const getPaymentStatusBadge = (status) => {
  switch (status) {
    case "Success":
      return <Badge pill bg="success">Success</Badge>;
    case "Failed":
      return <Badge pill bg="danger">Failed</Badge>;
    default:
      return <Badge pill bg="secondary">{status}</Badge>;
  }
};

// Define columns for Payment History DataTable
const paymentColumns = [
  {
    name: "Verification ID",
    selector: row => row.verification_id,
    sortable: true,
  },
  {
    name: "Payment Date",
    selector: row => row.payment_date,
    sortable: true,
  },
  {
    name: "Payment Amount",
    selector: row => `₹${row.payment_amount}`,
    sortable: true,
  },
  {
    name: "Payment Status",
    selector: row => getPaymentStatusBadge(row.payment_status),
    sortable: true,
    cell: (row) => getPaymentStatusBadge(row.payment_status),
  },
  {
    name: "Receipt",
    cell: (row) => (
      row.payment_status === "Success" && row.receipt_url ? (
        <a target="_blank" href={row.receipt_url} download="Receipt.pdf">
          <Button variant="primary">Download Receipt</Button>
        </a>
      ) : (
        <span>No Receipt</span>
      )
    ),
  },
];

function PaymentHistory() {
  return (
    <>
      <Pageheader title="Payment History" heading="Payments" active="Payment History" />
      
      <div className="container mt-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <DataTable
                columns={paymentColumns}
                data={paymentData}
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

export default PaymentHistory;
