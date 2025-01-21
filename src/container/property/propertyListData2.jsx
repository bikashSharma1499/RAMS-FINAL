import { Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-responsive-dt"; // Responsive extension JS
import "datatables.net-dt/css/dataTables.dataTables.css"; // DataTables CSS
import "datatables.net-responsive-dt/css/responsive.dataTables.min.css"; // Responsive CSS
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import { showPopup } from "../../utils/validation";

DataTable.use(DT);

function PropertyListData() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

   const navigate = useNavigate();
    const handleEdit = (property_code) => {
        console.log("Edit clicked for property_code:", property_code);
        showPopup({title:"Edit", msg:`Edit property with Code: ${property_code}`, iconType:"success"});
    };

    const handleClose = (property_code) => {
        console.log("Close clicked for property_code:", property_code);
        showPopup({title:"Close", msg:`Cancel property with Code: ${property_code}`, iconType:"info"});
    };

    useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            try {
                const user = await GetLoginInfo();
                const response = await axios.post(API_ENDPOINTS.propertyList, {
                    transactionType: user.userType,
                    customerCode: user.userKey
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const columns = [
           {
        title: "SL No.",
        data: null,
        className: "text-center",
        orderable: false,
        render: (data, type, row, meta) => {
            return meta.row + 1; 
        }
    },
        {
            title: "Listing Date",
            data: "listing_date_format",
            responsivePriority: 1,
            className: "text-start"
        },
        {
            title: "Property ID",
            data: "property_id",
            responsivePriority: 2,
            
        },
        {
            title: "Property Name",
            data: "property_name",
      
        },
        {
            title: "House Name",
            data: "house_name",
           
        },
        {
            title: "Address",
            data: "actual_address",
         
        },
        {
    
            title: "Actions",
            data: "property_code", 
            orderable: false,
            render: (data) => {
                return `
                    <button class="btn btn-primary btn-sm edit-btn" data-code="${data}">Edit</button>
                   
                `;
            }
        },
        {
            data: null,
            className: "dtr-control",
            defaultContent: "",
            orderable: false
        }
    ];

    const handleRowCallbacks = (row) => {
        const editBtn = row.querySelector(".edit-btn");
        const closeBtn = row.querySelector(".close-btn");
    
        if (editBtn) {
            
            const propertyCode = editBtn.getAttribute("data-code");
            editBtn.addEventListener("click", () => {
                  
                const data = {
                    inital_p: "U",
                    actual_p: "U",
                    process_p: propertyCode,
                    process_r: propertyCode
                };
                  localStorage.setItem('prop_process', JSON.stringify(data)); // Convert object to JSON string
              
             navigate(`${import.meta.env.BASE_URL}property/listing`);
                
            });
        }
    
        if (closeBtn) {
            const propertyCode = closeBtn.getAttribute("data-code");
            closeBtn.addEventListener("click", () => handleClose(propertyCode));
        }
    };
    

    return (
        <>
        
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
                                        type: "inline"
                                    }
                                },
                                paging: true,
                                ordering: true,
                                createdRow: (row) => {
                                    handleRowCallbacks(row);
                                }
                            }}
                        />
                    )}
                </Card.Body>
            </Card>
        </>
    );
}

export default PropertyListData;
