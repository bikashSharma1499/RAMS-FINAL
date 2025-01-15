import React, { useState, useEffect } from "react";
import axios from "axios";
import { Badge, Button } from "react-bootstrap";
import Pageheader from "../../components/pageheader/pageheader";
import { GetLoginInfo } from "../auth/logindata";

function VerificationListData() {
  const [data, setData] = useState([]); // State to hold API data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling


  useEffect(() => {
    const fetchData = async () => {
      const user =await GetLoginInfo();
      try {
        const response = await axios.post(
          "https://api.4slonline.com/rams/api/Service/VerificationList",
          {
            clientCode: user.userKey,
          }
        );
        const sortedData = (response.data || []).sort(
          (a, b) => new Date(b.entry_date) - new Date(a.entry_date)
        );
        const filteredData = sortedData.filter(
          (item) => item.verification_status !== "Cancel"
        );
        setData(filteredData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <>
      <Pageheader
        title="New Verification"
        heading="Verification"
        active="New Verification"
      />
      <div className="mt-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            {loading && <p>Loading data...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && data.length === 0 && <p>No records found.</p>}
            {!loading && !error && data.length > 0 && (
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Entry Date</th>
                    <th>Verification Amount</th>
                    <th>Service Name</th>
                    <th>Verification Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      <td>{row.entry_date}</td>
                      <td>₹{row.veriification_amount}</td>
                      <td>{row.service_name}</td>
                      <td>{getStatusBadge(row.verification_status)}</td>
                      <td>
                        {row.verification_status === "Verify" && (
                          <a
                            target="_blank"
                            href="https://www.redcheckes.com/pay/report.pdf"
                            download="Verification_Report.pdf"
                            rel="noopener noreferrer"
                          >
                            <Button variant="success">Download</Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default VerificationListData;
