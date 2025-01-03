import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-responsive-dt"; // Responsive extension JS
import "datatables.net-dt/css/dataTables.dataTables.css"; // DataTables CSS
import "datatables.net-responsive-dt/css/responsive.dataTables.min.css"; // Responsive CSS
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import axios from "axios";

DataTable.use(DT);

function Customerdata() {
    const [data, setData] = useState([]); // State for table data
    const [loading, setLoading] = useState(false); // State for loading status
    const [loadTable, setLoadTable]=useState(0);
    const navigate = useNavigate();
    // Function to handle edit button click
    const handleEditClick = (customerCode, cType) => {
         const data = {
            custType:cType,
            custCode:customerCode,
            trnType:"U"
         };
        localStorage.setItem('custEdit', JSON.stringify(data));
        navigate(`${import.meta.env.BASE_URL}customer/registration/`);
          
    };

    // Function to handle close button click
   const handleCloseClick = async (customerCode) => {
    const confirmMessage = "Are you sure you want to close this person?";
    const confirmClose = window.confirm(confirmMessage);

    if (confirmClose) {
        try {
            const response = await axios.post(API_ENDPOINTS.UpdateCustomerStatus, {
                status: "Close",
                code: customerCode,
            });

            if (response.status === 200) {
                alert("Status updated to Closed successfully!");

                // Update the table data dynamically
                 setData((prevData) => {
                    const updatedData = prevData.map((customer) =>
                        customer.customer_code === customerCode
                            ? { ...customer, display_status: "Closed" }
                            : customer
                    );
                    console.log("Updated data:", updatedData); // Log updated data
                    return updatedData;
                });

                // Optionally refresh the DataTable
                setLoadTable((prevLoadTable) => prevLoadTable + 1);
            } else {
                alert("Failed to update status!");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred while updating the status.");
        }
    }
};

    
    //Function to handle status button click
    const handleStatusClick = async (customerCode, currentStatus) => {
     //debugger;

        const newStatus = currentStatus;
        const confirmMessage =
            currentStatus === "Active"
                ? "Are you sure you want to mark this person as Inactive?"
                : "Are you sure you want to mark this person as Active?";
    
        const confirmStatusChange = window.confirm(confirmMessage);
    
        if (confirmStatusChange) {
            try {
                const response = await axios.post(API_ENDPOINTS.UpdateCustomerStatus, {
                    status: newStatus,
                    code: customerCode,
                });
    
                if (response.status === 200) {
                    alert(`Status updated to ${newStatus} successfully!`);
                    setLoadTable((prevLoadTable) => prevLoadTable + 1);
    
                    // Update the button text and style dynamically
                    setData((prevData) =>
                        prevData.map((customer) =>
                            customer.customer_code === customerCode
                                ? { ...customer, display_status: newStatus }
                                : customer
                        )
                    );
                } else {
                    alert("Failed to update status!");
                }
            } catch (error) {
                console.error("Error updating status:", error);
                alert("An error occurred while updating the status.");
            }
        }
        setLoadTable(1);
    };
    

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const user = await GetLoginInfo();
                const response = await axios.post(API_ENDPOINTS.Customerdata, {
                    customerCode: user.userKey,
                });
                console.log("Fetched data:", response.data); // Debug API response
                setData(
                    (response.data || []).map((customer) => ({
                        ...customer,
                        status: customer.display_status || "Active", // Map display_status to status
                    }))
                );
            } catch (error) {
                console.error("Error fetching data:", error);
                setData([]); // Fallback to empty array on error
            }
            setLoading(false);
        };
    
        fetchData();
    }, [loadTable]);

    // DataTable columns definition
    const columns = [
        {
            title: "S No",
            data: null,
            responsivePriority: 1,
            render: (data, type, row, meta) => meta.row + 1, // Serial number
            className: "text-start",
        },
        { title: "Type", data: "customer_type", responsivePriority: 2 },
        { title: "Title", data: "Title", responsivePriority: 3 },
        { title: "First Name", data: "first_name" },
        { title: "Last Name", data: "last_name" },
        { title: "Phone No", data: "mobile_no" },
        {
            title: "Actions",
            data: "customer_code",
            orderable: false,
            render: (data, type, row) =>
                row.display_status === "Closed"
                    ? ``
                    : `
                    <button class="btn btn-primary btn-sm edit-btn" data-status="${row.customer_type}" data-code="${data}">Edit</button>
                    <button class="btn btn-danger btn-sm close-btn ms-1" data-code="${data}">Close</button>
                `,
        },

        {
            title: "Status",
            data: "customer_code",
            orderable: false,
            render: (data, type, row) =>
                row.display_status === "Closed"
                    ? `<button class="btn btn-danger btn-sm status-btn" data-code="${data}" disabled>Closed</button>`
                    : `<button class="btn btn-${
                          row.display_status === "Active" ? "success" : "secondary"
                      } btn-sm status-btn" data-code="${data}" data-status="${row.display_status}">
                    ${row.display_status}
                </button>`,
        },
    ];

    // Attach click listeners to dynamically created buttons
   const handleRowCallbacks = (row, rowData) => {
    const editBtn = row.querySelector(".edit-btn");
    const closeBtn = row.querySelector(".close-btn");
    const statusBtn = row.querySelector(".status-btn");

    if (rowData.display_status === "Closed") {
        row.classList.add("text-muted", "bg-light");
    }

    if (editBtn) {
        const code = editBtn.getAttribute("data-code");
        const type = editBtn.getAttribute("data-status");
        
  
        editBtn.addEventListener("click", () => handleEditClick(code, type));
    }

    if (closeBtn) {
        const code = closeBtn.getAttribute("data-code");
        closeBtn.addEventListener("click", () => handleCloseClick(code));
    }

    if (statusBtn) {
        const code = statusBtn.getAttribute("data-code");
        const status = statusBtn.getAttribute("data-status");
        statusBtn.addEventListener("click", () => handleStatusClick(code, status));
    }
};


    // Render component
    return (
        <Card>
            <Card.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <DataTable
                        data={data}
                        columns={columns}
                        className="display nowrap"
                        options={{
                            responsive: {
                                details: {
                                    type: "inline",
                                },
                            },
                            paging: true,
                            ordering: true,
                            createdRow: (row, rowData) => {
                                handleRowCallbacks(row, rowData); // Add listeners for each row
                            },
                        }}
                    />
                )}
            </Card.Body>
        </Card>
    );
}

export default Customerdata;
