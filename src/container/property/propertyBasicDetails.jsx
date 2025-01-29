import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import Select from "react-select";
import {
  property,
  propertyHousingType,
  propertyType,
} from "./propertyTypeMaster";
import { GetLoginInfo } from "../auth/logindata";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { showPopup } from "../../utils/validation";

function PropertyBasicDetails({ goToStep }) {
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
  const inputRef = useRef(null);
  const [selectedHousingCode, setSelectedHousingCode] = useState("");
  const [isLoading, SetIsLoading]= useState(false);
 useEffect(() => {
  const fetchPropertyData = async () => {
    try {
      const checkProcess = localStorage.getItem("prop_process");
      if (!checkProcess) {
        console.warn("No process data found in localStorage.");
        return;
      }

      const processData = JSON.parse(checkProcess);
      console.log("Parsed processData:", processData);

      if (processData && processData.process_p !== "0") {
        const propertyData = await property();
        console.log("Fetched propertyData:", propertyData);

        if (!Array.isArray(propertyData)) {
          throw new Error("property() did not return an array.");
        }

        const selectedProperty = propertyData.find(
          (item) => String(item.property_code) === String(processData.process_p)
        );
        console.log("Selected property:", selectedProperty);

        if (selectedProperty) {
          const housingTypes = await propertyHousingType(selectedProperty.property_type_code);
          console.log("Fetched housingTypes:", housingTypes);

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
            i_longitude: selectedProperty.longitude,
          }));

          setLatLong(`${selectedProperty.latitude}, ${selectedProperty.longitude}`);
          setPropertyHousing([
            { value: 0, label: "Select" },
            ...housingTypes.map(({ housing_code, house_name }) => ({
              value: housing_code,
              label: house_name,
            })),
          ]);
        } else {
          console.warn(`No property found with property_code: ${processData.process_p}`);
        }
      } else {
        console.warn("Invalid or missing process_p value in processData.");
      }
    } catch (error) {
      console.error("Failed to fetch property details:", error);
    }
  };

  fetchPropertyData();
}, []);


  
  

  //#region Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        initAutocomplete();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDaqeMVzzWsG2gdnoO8PhMN7VXVCAMG0Ts&libraries=places`;
      script.async = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

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

      setAddressDetails((prevState) => {
        const updatedAddress = {
          ...prevState,
          i_main_address: parsedData.mainAddress,
          i_address: fullAddress,
          i_latitude: geometry.location.lat(),
          i_longitude: geometry.location.lng(),
        };

        // Dynamically update `location` based on address and main address
        updatedAddress.i_location = constructLocation(
          updatedAddress.i_main_address,
          updatedAddress.i_address
        );

        return updatedAddress;
      });
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

  const constructLocation = (mainAddress, address) => {
    const formattedMainAddress = mainAddress?.trim();
    const formattedAddress = address?.trim();

    if (formattedMainAddress && formattedAddress) {
      return `${formattedMainAddress}, ${formattedAddress}`;
    } else if (formattedMainAddress) {
      return formattedMainAddress;
    } else if (formattedAddress) {
      return formattedAddress;
    }
    return "";
  };

  //#endregion

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

  const handleHousingTypeChange = (selectedOption) => {
    setSelectedHousingCode(selectedOption.value);
    setAddressDetails((prevDetails) => ({
      ...prevDetails,
      i_housing_code: selectedOption.value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAddressDetails((prevState) => {
      const updatedDetails = {
        ...prevState,
        [name]: value,
      };

      // Update `location` dynamically when `main address` changes
      if (name === "i_main_address") {
        updatedDetails.i_location = constructLocation(
          value,
          prevState.i_address
        );
      }

      return updatedDetails;
    });
  };


  const handleSubmit = async () => {
    
    SetIsLoading(true);

    if (!addressDetails.property_name==="" || !addressDetails.i_main_address==="") {
      alert("Please fill in all fields");
      return;
    }
    try {
      const user = GetLoginInfo();
      if (!user) {
        alert("User data not found.");
        return;
      }
     

      const checkProcess = localStorage.getItem("prop_process");
      const processData = JSON.parse(checkProcess);
      const payload = {
        transactionType: processData.actual_p,
        PropertyCode: processData.process_p,
        CustomerCode: user?.userKey || "",
        HouseCode: selectedHousingCode || "0",
        PropertyName:
        addressDetails?.i_property_name || "Default Property Name",
        mainaddress: addressDetails?.i_main_address || "Default Main Address",
        address: addressDetails?.i_address || "Default Address",
        location: addressDetails?.i_location || "Default Location",
        longitude: addressDetails?.i_longitude?.toString() || "0",
        latitude: addressDetails?.i_latitude?.toString() || "0",
        entryby: "Customer",
        entrybycode: user?.userKey || "",
      };

      console.log("Submitting payload:", payload);
      
      const response = await axios.post(API_ENDPOINTS.ManageProperty, payload);

      if (response.status === 200) {
        const resultString = response.data.result;
        const resultArray = resultString.split(",");
        const checkProcess = localStorage.getItem("prop_process");

        if (checkProcess) {
          // Parse the string into an object
          const processData = JSON.parse(checkProcess);
        
          // Check the value of inital_p
          if (processData.inital_p === "I") {
            const data = {
              inital_p: "I",
              actual_p: "U",
              process_p: resultArray[1],
            };
        
            // Store the updated data as a JSON string
            localStorage.setItem("prop_process", JSON.stringify(data));
          }
        }
        
        showPopup({
          title: resultArray[0],
          msg: resultArray[2],
          iconType: resultArray[0].toLowerCase(),
        });
          goToStep(2);
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
      if (error.response) {
        console.log("Response Data:", error.response.data);
        console.log("Validation Errors:", error.response.data.errors);
        alert(
          `Validation error: ${JSON.stringify(error.response.data.errors)}`
        );
      } else {
        console.error("Unexpected Error:", error.message);
      }
    }
    SetIsLoading(false);
  };
  return (
    <div>
      <div className="panel-content my-4">
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
                onChange={handleHousingTypeChange}
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
                autoComplete="off"
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col xl={3}>
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
                autoComplete="off"
                value={addressDetails.i_main_address}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
          <Col xl={6}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="i_location"
                value={addressDetails.i_location}
                disabled
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Button className=" float-end mt-4" onClick={handleSubmit}>
            {isLoading ? (
              "Processing"
            ): (
             "Save"
            ) }   
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default PropertyBasicDetails;
