import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { Row, Col, Button } from "react-bootstrap";

const Amenities = ({ goToStep }) => {
  const [amenities, setAmenities] = useState([]); // Store master data from API
  const [quantities, setQuantities] = useState({}); // Manage quantities for each amenity
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const propertyCode =  localStorage.getItem('propValp');

  // Fetch master and existing data from APIs and map quantities
  useEffect(() => {
    const fetchAmenitiesData = async () => {
      try {
        const [amenitiesResponse, existingItemsResponse] = await Promise.all([
          axios.post(API_ENDPOINTS.propertyAmenitiesMaster, {
            propertyitemcode: 0,
          }),
          axios.post(API_ENDPOINTS.customerPropertyItemDetail, {
            propertyCode: propertyCode,
          }),
        ]);

        const amenitiesData = amenitiesResponse.data;
        const existingItemsData = existingItemsResponse.data;

        const existingItemsMap = {};
        existingItemsData.forEach((item) => {
          existingItemsMap[item.item_code] = item.quantity;
        });

        const initialQuantities = {};
        amenitiesData.forEach((item) => {
          initialQuantities[item.item_code] =
            existingItemsMap[item.item_code] || 0;
        });

        setAmenities(amenitiesData);
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAmenitiesData();
  }, [propertyCode]);

  const handleIncrement = (itemCode) => {
    const updatedQuantities = {
      ...quantities,
      [itemCode]: quantities[itemCode] + 1,
    };
    setQuantities(updatedQuantities);

    const transactionType = quantities[itemCode] > 0 ? "U" : "I";
    sendToApi(itemCode, updatedQuantities[itemCode], transactionType);
  };

  const handleDecrement = (itemCode) => {
    if (quantities[itemCode] > 0) {
      const updatedQuantities = {
        ...quantities,
        [itemCode]: quantities[itemCode] - 1,
      };
      setQuantities(updatedQuantities);
      sendToApi(itemCode, updatedQuantities[itemCode], "U");
    }
  };

  const sendToApi = async (itemCode, quantity, transactionType) => {
    const payload = {
      transactionType: transactionType,
      propertyItemCode: 0,
      itemCode: itemCode,
      customerPropertyCode: propertyCode,
      quantity: quantity,
    };

    try {
      const response = await axios.post(
        API_ENDPOINTS.agreementAmenities,
        payload
      );
      console.log("Transaction successful:", response);
    } catch (error) {
      console.error("Error in transaction:", error);
    }
  };

  // Filter amenities based on the search term
  const filteredAmenities = amenities.filter((amenity) =>
    amenity.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <Row>
        <Col lg={6} md={8} className="mx-auto border-2 border-danger-subtle border">
          <h4 className="mb-3 text-center text-dark-emphasis">Amenities</h4>
          {/* Search box */}
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search amenities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredAmenities.map((amenity) => (
            <div
              key={amenity.item_code}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <h6 className="fw-bold">{amenity.item_name}</h6>
              </div>
              {quantities[amenity.item_code] === 0 ? (
                <button
                  className="btn btn-lg btn-primary"
                  onClick={() => handleIncrement(amenity.item_code)}
                >
                  Add
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    className="btn btn-lg btn-danger-ghost"
                    onClick={() => handleDecrement(amenity.item_code)}
                  >
                    -
                  </button>
                  <span style={{ margin: "0 10px" }}>
                    {quantities[amenity.item_code]}
                  </span>
                  <button
                    className="btn btn-lg btn-primary"
                    onClick={() => handleIncrement(amenity.item_code)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
        </Col>
      </Row>
      <Row>
        <Col>
        <Button onClick={()=>goToStep(3)} className=" float-start" >Prev</Button>
        <Button onClick={()=>goToStep(5)} className=" float-end" >Next</Button>
        </Col>
      </Row>
    </div>
  );
};

export default Amenities;
