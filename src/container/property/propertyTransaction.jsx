import { Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillAlt, FaClipboardCheck, FaUsers, FaFileSignature, FaListAlt } from "react-icons/fa";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { GetLoginInfo } from "../auth/logindata";
import { showPopup } from "../../utils/validation";
import DataTable from "react-data-table-component";
import Pageheader from "../../components/pageheader/pageheader";

function PropertyListData() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRentCollection = (property_code) => {
        showPopup({ title: "Rent Collection", msg: `Collect rent for property with Code: ${property_code}`, iconType: "success" });
    };

    const handleVerification = (property_code) => {
        showPopup({ title: "Verification", msg: `Verify property with Code: ${property_code}`, iconType: "info" });
    };

    const handleTenantList = (property_code) => {
        showPopup({ title: "Tenant List", msg: `View tenant list for property with Code: ${property_code}`, iconType: "info" });
    };

    const handleNewAgreement = (property_code) => {
        showPopup({ title: "New Agreement", msg: `Create a new agreement for property with Code: ${property_code}`, iconType: "info" });
    };

    const handleActions = (property_code) => {
        showPopup({ title: "Actions", msg: `Perform actions for property with Code: ${property_code}`, iconType: "info" });
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
            name: "SL No.",
            selector: (row, index) => index + 1,
            center: true,
            width: "50px",
        },
        {
            name: "Listing Date",
            selector: row => row.listing_date_format,
            sortable: true,
            width: "120px"
        },
        {
            name: "Property ID",
            selector: row => row.property_id,
            sortable: true,
            width: "120px"
        },
        {
            name: "Property Name",
            selector: row => row.property_name,
            sortable: true,
        },
        {
            name: "Collect Rent",
            button: true,
            cell: row => (
                <button className="btn btn-primary btn-sm" onClick={() => handleRentCollection(row.property_code)}>
                    <FaMoneyBillAlt /> Collect Rent
                </button>
            ),
            width: "130px",
        },
        {
            name: "Verification",
            button: true,
            cell: row => (
                <button className="btn btn-secondary btn-sm" onClick={() => handleVerification(row.property_code)}>
                    <FaClipboardCheck /> Verification
                </button>
            ),
            width: "130px",
        },
        {
            name: "Tenant List",
            button: true,
            cell: row => (
                <button className="btn btn-info btn-sm" onClick={() => handleTenantList(row.property_code)}>
                    <FaUsers /> Tenant List
                </button>
            ),
            width: "130px",
        },
        {
            name: "New Agreement",
            button: true,
            cell: row => (
                <button className="btn btn-success btn-sm" onClick={() => handleNewAgreement(row.property_code)}>
                    <FaFileSignature /> New Agreement
                </button>
            ),
            width: "130px",
        },
    ];

    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "14px",
            },
        },
        cells: {
            style: {
                fontSize: "13px",
            },
        },
    };

    return (
        <>
            <Pageheader title="Payment History" heading="Payments" active="Payment History" />

            <Card className="property-card">
                <Card.Body>
                    <h4 className="mb-3">Property Transaction</h4>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            customStyles={customStyles}
                            pagination
                            responsive
                            highlightOnHover
                            striped
                            fixedHeader
                            fixedHeaderScrollHeight="400px"
                            subHeader
                            subHeaderComponent={
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="form-control"
                                    onChange={(e) => e.target.value}
                                    style={{ width: "250px", marginLeft: "auto", display: "block" }}
                                />
                            }
                        />
                    )}
                </Card.Body>
            </Card>
        </>
    );
}

export default PropertyListData;
