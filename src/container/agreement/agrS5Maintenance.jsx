import { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col,Button  } from "react-bootstrap";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { showPopup } from "../../utils/validation";

const Maintenance = ({ goToStep }) => {
  const [items, setItems] = useState([]); // For storing API data
  const [selectedValues, setSelectedValues] = useState(""); // Comma-separated selected maintenance_code values
  const propertyCode =  localStorage.getItem('propValp');
  // Fetch data from API
  useEffect(() => {
    axios
      .post(API_ENDPOINTS.customerPropertyMaintenanceList, {
        propertyCode:propertyCode
      })
      .then((response) => {
        const data = response.data;
        console.log("Fetched Data:", data); // Debugging API response
        setItems(data);

        // Extract initial selected items (maintenance = 1)
        const initiallySelected = data
          .filter((item) => item.maintenance === 1)
          .map((item) => item.maintenance_code);
        setSelectedValues(initiallySelected.join(",")); // Store as comma-separated string
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    const currentSelected = selectedValues.split(",").filter(Boolean); // Convert to array
    if (checked) {
      // Add the selected value
      setSelectedValues([...currentSelected, value].join(","));
    } else {
      // Remove the unchecked value
      setSelectedValues(currentSelected.filter((code) => code !== value).join(","));
    }
  };

  // Update selected values via API
  const updateMaintenance = async () => {
 debugger;
  await  axios
      .post(API_ENDPOINTS.customerPropertyUpdateMaintenance, {
        propertyCode:propertyCode,
        maintenanceCode: selectedValues,
      })
      .then((response) => {
        console.log("Update response:", response.data);
        showPopup({title:"successfull", msg:"Maintenance Updated Scuccessfully", iconType:"success"});
      //  alert("Maintenance updated successfully!");
        localStorage.setItem("maintenanceCodes", JSON.stringify(selectedValues));
          goToStep(6);
      })
      .catch((error) => console.error("Error updating maintenance:", error));
  };

  return (
    <div>
       <h3 className="fw-bolder  text-secondary-emphasis">Maintenance {"(Tenant)"} </h3>
      <p><span className=" text-danger fw-bold"> Note:</span> Check those boxes which will be maintained by Tenant</p>
      <Row>
        <Col md={12}>
          {items.length === 0 ? (
            <p>Loading...</p>
          ) : (
            items
              .filter((item) => item.maintenance_name && item.maintenance_code) // Ensure valid properties
              .map((item) => (
                <div className="fancy-checkbox my-2" key={item.maintenance_code}>
                  <input
                    type="checkbox"
                    id={`checkbox-${item.maintenance_code}`}
                    value={item.maintenance_code}
                    onChange={handleCheckboxChange}
                    checked={selectedValues.split(",").includes(String(item.maintenance_code))} // Check based on state
                  />
                  <label htmlFor={`checkbox-${item.maintenance_code}`}>{item.maintenance_name}</label>
                </div>
              ))
          )}
        </Col>
       
      </Row>

      <Row>
        <Col>
        <Button onClick={()=>goToStep(4)} className=" float-start" >Prev</Button>
        <Button onClick={updateMaintenance} className=" float-end" >Next</Button>
        </Col>
      </Row>
      <Col className="d-none" md={6}>
          <h5>Selected Maintenance Codes:</h5>
          <p>{selectedValues || "None selected"}</p>
       
        </Col>
    </div>
  );
};

export default Maintenance;
