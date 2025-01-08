import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import Select from "react-select";
import {
  property,
  propertyHousingType,
  propertyType,
} from "./agreementAuthData";
import { GetLoginInfo } from "../auth/logindata";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { showPopup } from "../../utils/validation";

const PropertyDetails = ({ goToStep }) => {
  const initialState = {
    i_propertyID: "NA",
    i_housing_code: "",
    i_property_name: "",
    i_main_address: "",
    i_address: "",
    i_location: "",
    i_longitude: "",
    i_latitude: "",
    i_property_type_code: "",
  };

  const [propertyList, setPropertyList] = useState([]);
  const [propertyTypeList, setPropertyTypeList] = useState([]);
  const [propertyHousing, setPropertyHousing] = useState([]);
  const [addressDetails, setAddressDetails] = useState(initialState);
  const [latLong, setLatLong] = useState("");
  const inputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [showNewButton, setShowNewButton] = useState(true);
  const [showPropertyDropDown, setShowPropertyDropDown] = useState(true);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        initAutocomplete();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [showForm]);

  const initAutocomplete = () => {
    if (!window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["establishment"],
        componentRestrictions: { country: "in" },
        fields: ["geometry", "formatted_address", "address_components"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place || !place.geometry) return;

      const {
        formatted_address: fullAddress,
        geometry,
        address_components: components,
      } = place;
      const parsedData = parseAddressComponents(components);

      setAddressDetails((prevState) => ({
        ...prevState,
        i_main_address: parsedData.mainAddress,
        i_address: fullAddress,
        i_latitude: geometry.location.lat(),
        i_longitude: geometry.location.lng(),
      }));

      setLatLong(`${geometry.location.lat()}, ${geometry.location.lng()}`);
    });
  };

  const parseAddressComponents = (components) => {
    const parsedData = {
      mainAddress: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
      area: "",
    };

    components.forEach((component) => {
      const { types, long_name } = component;
      if (types.includes("street_number")) parsedData.mainAddress = long_name;
      if (types.includes("locality")) parsedData.city = long_name;
      if (types.includes("administrative_area_level_1"))
        parsedData.state = long_name;
      if (types.includes("country")) parsedData.country = long_name;
      if (types.includes("postal_code")) parsedData.pinCode = long_name;
      if (types.includes("sublocality")) parsedData.area = long_name;
    });

    return parsedData;
  };

  useEffect(() => {
    const savedPropertyValue = localStorage.getItem("propValp");
    if (savedPropertyValue && savedPropertyValue !== "0") {
      handlePropertySelection(savedPropertyValue);
    }
  }, []);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const data = await property();
  
        const filteredData = data.filter(
          ({ property_status }) => property_status !== "Occupied"
        );
  
        setPropertyList([
          { value: 0, label: "Select" },
          ...filteredData.map(({ property_code, property_name }) => ({
            value: property_code,
            label: property_name,
          })),
        ]);
  
        const pCode = localStorage.getItem("propValp");
        if (pCode && pCode !== "0") {
          // Use `find` instead of `filter` to get a single object
          const fetchedProperty = data.find(
            ({ property_code }) => property_code === parseInt(pCode, 10) // Ensure type matching
          );
          
          if (fetchedProperty) {
            console.log(fetchedProperty);
            debugger;
            const housingTypes = await propertyHousingType(
              fetchedProperty.property_type_code
            );
            setAddressDetails((prevState) => ({
              ...prevState,
              i_address: fetchedProperty.google_api_address,
              i_main_address: fetchedProperty.actual_address,
              i_location: fetchedProperty.location,
              i_propertyID: fetchedProperty.property_id,
              i_property_name: fetchedProperty.property_name,
              i_property_type_code: fetchedProperty.property_type_code,
              i_housing_code: housingTypes[0]?.housing_code || "",
              i_latitude: fetchedProperty.latitude,
              i_longitude: fetchedProperty.logitude,
            }));
  
            setLatLong(
              `${fetchedProperty.latitude}, ${fetchedProperty.logitude}`
            );
            setPropertyHousing([
              { value: 0, label: "Select" },
              ...housingTypes.map(({ housing_code, house_name }) => ({
                value: housing_code,
                label: house_name,
              })),
            ]);
          } else {
            console.warn("Property not found for the given property_code:", pCode);
          }
        }
      } catch (error) {
        console.error("Failed to fetch property data:", error);
      }
    };
  
    fetchPropertyData();
  }, []);
  

  const handlePropertySelection = async (selectedOption) => {
    try {
      const propertyData = await property();
      const selectedProperty = propertyData.find(
        (item) => item.property_code === selectedOption.value
      );

      setShowForm(true);
      setShowNewButton(false);

      if (selectedProperty) {
        const housingTypes = await propertyHousingType(
          selectedProperty.property_type_code
        );
        setAddressDetails((prevState) => ({
          ...prevState,
          i_address: selectedProperty.google_api_address,
          i_main_address: selectedProperty.actual_address,
          i_location: selectedProperty.location,
          i_propertyID: selectedProperty.property_id,
          i_property_name: selectedProperty.property_name,
          i_property_type_code: selectedProperty.property_type_code,
          i_housing_code: housingTypes[0]?.housing_code || "",
          i_latitude: selectedProperty.latitude,
          i_longitude: selectedProperty.logitude,
        }));

        setLatLong(
          `${selectedProperty.latitude}, ${selectedProperty.logitude}`
        );
        setPropertyHousing([
          { value: 0, label: "Select" },
          ...housingTypes.map(({ housing_code, house_name }) => ({
            value: housing_code,
            label: house_name,
          })),
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch property details:", error);
    }
  };

  useEffect(() => {
    const fetchPropertyTypeData = async () => {
      try {
        const data = await propertyType();
        setPropertyTypeList([
          { value: 0, label: "Select" },
          ...data.map(({ propertyTypeCode, propertyTypeName }) => ({
            value: propertyTypeCode,
            label: propertyTypeName,
          })),
        ]);
      } catch (error) {
        console.error("Failed to fetch property types:", error);
      }
    };

    fetchPropertyTypeData();
  }, []);

  const handlePropertyTypeChange = async (selectedOption) => {
    const selectedPropertyTypeCode = selectedOption.value;
    const housingTypes = await propertyHousingType(selectedPropertyTypeCode);

    setPropertyHousing([
      { value: 0, label: "Select" },
      ...housingTypes.map(({ housing_code, house_name }) => ({
        value: housing_code,
        label: house_name,
      })),
    ]);

    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      i_property_type_code: selectedPropertyTypeCode,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddNew = () => {
    setShowForm(true);
    setShowPropertyDropDown(false);
    setShowNewButton(false);
    setAddressDetails(initialState);
    setLatLong("");
    setPropertyHousing([]);
  };

  const handleChangeProperty = () => {
    setShowForm(false);
    setShowPropertyDropDown(true);
    setShowNewButton(true);
    setAddressDetails(initialState);
    setLatLong("");
    setPropertyHousing([]);
  };

  const handleSubmit = async () => {
    //  debugger;
    if (!addressDetails) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const agr = JSON.parse(localStorage.getItem("rg_rcd"));
      if (!agr) {
        alert("Agreement data not found.");
        return;
      }

      const user = GetLoginInfo();
      if (!user) {
        alert("User data not found.");
        return;
      }

      // Construct payload
      const payload = {
        agreementCode: agr?.agr_k || "",
        propetyID: addressDetails?.i_propertyID || "0",
        firstPartyCode: user?.userKey || "",
        housingCode: 1, // Use a valid default ID
        propertyName:
          addressDetails?.i_property_name || "Default Property Name",
        mainAddress: addressDetails?.i_main_address || "Default Main Address",
        address: addressDetails?.i_address || "Default Address", // Fallback to default value
        location: addressDetails?.i_location || "Default Location",
        longitude: addressDetails?.i_longitude?.toString() || "0",
        latitude: addressDetails?.i_latitude?.toString() || "0",
        loginMobileNumber: user?.userMobile || "",
        loginPersonType: user?.userType || "",
      };

      // Log payload for debugging
      console.log("Submitting payload:", payload);

      // Perform the API request
      const response = await axios.post(
        API_ENDPOINTS.agreementProperty,
        payload
      );

      // Handle successful response
      console.log("Response data:", response.data);

      // Parse response if it's a string
      if (response.status === 200) {
        const resultString = response.data.result; // Access the 'result' field
        const resultArray = resultString.split(","); // Split the string into an array

        if (resultArray.length > 1) {
          localStorage.setItem("propValp", resultArray[1]); // Store the second value in localStorage
          setShowForm(true); // Perform your action
        }
        showPopup({
          title: "Successfull",
          msg: "Submitted Successfully",
          iconType: "success",
        });
        goToStep(4);
        console.log("Result Array:", resultArray); // Log the array to verify
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
      if (error.response) {
        console.log("Response Data:", error.response.data);
        console.log("Validation Errors:", error.response.data.errors); // Log specific errors
        alert(
          `Validation error: ${JSON.stringify(error.response.data.errors)}`
        );
      } else {
        console.error("Unexpected Error:", error.message);
      }
    }
  };

  return (
    <div>
      <h3>
        Property Details{" "}
        {showForm ? (
          <Button onClick={handleChangeProperty} className="btn btn-danger">
            Change Property
          </Button>
        ) : (
          ""
        )}
      </h3>

      <div className="panel-content my-4">
        {!showForm ? (
          <Row>
            <Col xl={3}>
              {showPropertyDropDown ? (
                <Form.Group>
                  <Form.Label>Property</Form.Label>
                  <Select
                    options={propertyList}
                    placeholder="Select a property..."
                    onChange={handlePropertySelection}
                  />
                </Form.Group>
              ) : (
                ""
              )}
            </Col>
            <Col xl={2}>
              {showNewButton && GetLoginInfo().userType === "Landlord" ? (
                <Button
                  variant="success"
                  className="mt-4"
                  onClick={handleAddNew}
                >
                  <i className="bi-plus-square"></i> Add New
                </Button>
              ) : (
                ""
              )}
            </Col>
          </Row>
        ) : (
          <Row>
            <Col xl={3}>
              <Form.Group>
                <Form.Label>Property Type</Form.Label>
                <Select
                  options={propertyTypeList}
                  placeholder="Select property type..."
                  value={propertyTypeList.find(
                    (option) =>
                      option.value === addressDetails.i_property_type_code
                  )}
                  onChange={handlePropertyTypeChange}
                />
              </Form.Group>
            </Col>
            <Col xl={3}>
              <Form.Group>
                <Form.Label>Housing Type</Form.Label>
                <Select
                  options={propertyHousing}
                  placeholder="Select housing type..."
                  value={propertyHousing.find(
                    (option) => option.value === addressDetails.i_housing_code
                  )}
                  onChange={(selectedOption) =>
                    setAddressDetails((prevState) => ({
                      ...prevState,
                      i_housing_code: selectedOption.value,
                    }))
                   
                  }
                />
              </Form.Group>
            </Col>

            <Col xl={3}>
              <Form.Group>
                <Form.Label>Property Name</Form.Label>
                <Form.Control
                  type="text"
                  name="i_property_name"
                  value={addressDetails.i_property_name}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col xl={6}>
              <Form.Group>
                <Form.Label>Address (Google API Autocomplete)</Form.Label>
                <Form.Control
                  type="text"
                  ref={inputRef}
                  placeholder="Start typing an address..."
                />
              </Form.Group>
            </Col>
            <Col xl={3}>
              <Form.Group>
                <Form.Label>Main Address</Form.Label>
                <Form.Control
                  type="text"
                  name="i_main_address"
                  value={addressDetails.i_main_address}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col xl={3}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="i_location"
                  value={addressDetails.i_location}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            <Col xl={3}>
              <Form.Group>
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="text"
                  name="i_longitude"
                  value={addressDetails.i_longitude}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col xl={3}>
              <Form.Group>
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="text"
                  name="i_latitude"
                  value={addressDetails.i_latitude}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
        )}
      </div>

      <div className="w-100">
        <Button variant="secondary" onClick={() => goToStep(2)}>
          Previous
        </Button>

        <Button variant="success" onClick={handleSubmit} className=" float-end">
          Save & Next
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetails;
