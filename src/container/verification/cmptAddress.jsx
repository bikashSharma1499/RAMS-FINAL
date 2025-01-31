import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import {
  Row,
  Col,
  Card,
  Form,
  Accordion,
  Button,
  Table,
} from "react-bootstrap";
import axios from "axios";
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { showPopup } from "../../utils/validation";
import { set } from "date-fns";
import { FaRecycle } from "react-icons/fa";

function ComponentAddress({GetTotalPricing}) {
  const [addressType, setAddressType] = useState([]);
  const [selectedAddressType, setSelectedAddressType] = useState(null);
  const [addressDetails, setAddressDetails] = useState({
    i_main_address: "",
    i_address: "",
    i_latitude: "",
    i_longitude: "",
    i_state: "",
    i_city: "",
    i_pin_code: "",
    i_location: "",
  });
  const [addresses, setAddresses] = useState([]);
  const inputRef = useRef(null); // Ref for Search Location input
  const [transactionType, setTransactionType] = useState("I");
  const [addressCode, setAddressCode] = useState(0);
  const [fetch, setFetch] = useState(0);
  const [errors, setErrors] = useState({});

  const verificationCode = localStorage.getItem("vrfCode"); // Example verification code (can be dynamic)

  useEffect(() => {
    const loadAddressTypes = async () => {
      try {
        const response = await axios.post(
          "https://api.4slonline.com/rams/api/Service/VerificationTypeList",
          { typeName: "ADDRESS",typeCode:0 }
          );
        setAddressType(
          response.data.map((type) => ({
            value: type.type_code,
            label: type.type_name,
          }))
        );
      } catch (error) {
        console.error("Error fetching address types:", error);
      }
    };

    // Fetch existing addresses on component mount
    const loadAddresses = async () => {
      try {
        const response = await axios.post(
          "https://api.4slonline.com/rams/api/Service/VerificationAddressDisplay",
          { verificationCode: verificationCode }
        );
        setAddresses(response.data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    loadAddressTypes();
    loadAddresses();

    // Initialize Google Maps script for location search
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
  }, [fetch]);

  const initAutocomplete = () => {
    if (!window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
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
          i_state: parsedData.state,
          i_city: parsedData.city,
          i_pin_code: parsedData.pinCode,
        };

      

        updatedAddress.i_location = constructLocation(
          updatedAddress.i_main_address,
          updatedAddress.i_address
        );
        return updatedAddress;
      });
    });
  };

  const parseAddressComponents = (components) => {
    let mainAddress = "";
    let city = "";
    let state = "";
    let pinCode = "";

    components.forEach((component) => {
      const types = component.types;

      if (types.includes("route")) {
        mainAddress = component.long_name;
      } else if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (types.includes("postal_code")) {
        pinCode = component.long_name;
      }
    });

    return { mainAddress, city, state, pinCode };
  };

  const constructLocation = (mainAddress, fullAddress) => {
    return `${mainAddress}, ${fullAddress}`;
  };


  //Validation logic
  const validateFields = () => {
    const newErrors = {};
    if (!selectedAddressType) {
      newErrors.selectedAddressType = "Address type is required.";
    } 
    if (!addressDetails.i_main_address.trim()) {
      newErrors.i_main_address = "Main address is required.";
    }
    if (!addressDetails.i_location.trim()) {
      newErrors.i_location = "Location is required.";
    } 
    if(!addressDetails.i_city.trim()){
      newErrors.i_city = "City is required.";
    }
    if(!addressDetails.i_state.trim()){
      newErrors.i_state = "State is required.";
    }
    if(!addressDetails.i_pin_code.trim()){
      newErrors.i_pin_code = "Pin code is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; 
  };

  const handleSubmit = async () => {
    if(transactionType!=="D"){
   if(!validateFields()){ return; }
    }
    try {
      const vrf = JSON.parse(localStorage.getItem("vrfCandidate"));
      const response = await axios.post(API_ENDPOINTS.serviceAddress, {
        transactionType: transactionType,
        addressCode: addressCode,
        verificationCode: vrf.verificationCode,
        candidateName: vrf.candidateName,
        mobileNumber: vrf.mobileNumber,
        emailID: vrf.emailID,
        addressTypeCode: selectedAddressType?.value, // Pass type_code here
        address: addressDetails.i_main_address,
        location: addressDetails.i_location,
        cityName: addressDetails.i_city,
        stateName: addressDetails.i_state,
        pinCode: addressDetails.i_pin_code,
      });

      if (response.status === 200 && response.data) {
        showPopup({
          title: "Success",
          msg: "Address Added Successfully",
          iconType: "success",
        });
        setFetch(fetch + 1);
        GetTotalPricing();
        resetForm();
        const count = localStorage.getItem("vrfCount");
        if (count) {
          localStorage.setItem("vrfCount", parseInt(count) + 1);
        } else {
          localStorage.setItem("vrfCount", 1);
        }
      } else {
        alert("Error adding address");
      }
    } catch (error) {
      console.error("Error submitting address:", error);
    }
  };

  const handleEdit = (address) => {
    setAddressDetails(address);
    setSelectedAddressType({
      value: address.type_code,
      label: address.type_name,
    });
  };

  const resetForm = () => {
    setAddressDetails({
      i_main_address: "",
      i_address: "",
      i_latitude: "",
      i_longitude: "",
      i_state: "",
      i_city: "",
      i_pin_code: "",
      i_location: "",
    });
    setSelectedAddressType(null);
  };

  const handleRemove = (addressCode) => {
    //debugger;
    setTransactionType("D");
    setAddressCode(addressCode);
    if (transactionType === "D" && addressCode !== "0") {
      handleSubmit();
      setFetch(fetch + 1);
    }
  };

  return (
    <>
      <Accordion defaultActiveKey={["0"]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Address Verification</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col xl={3} lg={4} md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Address Type</Form.Label>
                  <Select
                    options={addressType}
                    value={selectedAddressType}
                    onChange={(selected) => setSelectedAddressType(selected)}
                    placeholder="Select address type"
                  />
                  {errors.selectedAddressType && ( <span className="text-danger" > {errors.selectedAddressType}</span>)}
                </Form.Group>
              </Col>

              <Col xl={3} lg={4} md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Search Location</Form.Label>
                  <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="Enter location"
                  />
                  {errors.i_location && ( <span className="text-danger" > {errors.i_location}</span>)}
                </Form.Group>
              </Col>

              <Col xl={3} lg={4} md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Main Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_main_address}
                    onChange={(e) =>
                      setAddressDetails((prevState) => ({
                        ...prevState,
                        i_main_address: e.target.value,
                      }))
                    }
                    placeholder="Enter main address"
                  />
                  {errors.i_main_address && ( <span className="text-danger" > {errors.i_main_address}</span>)}
                </Form.Group>
              </Col>

              <Col xl={3} lg={4} md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Full Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_address}
                    disabled
                    placeholder="Full address from search"
                  />
                  {errors.i_address && ( <span className="text-danger" > {errors.i_address}</span>)}
                </Form.Group>
              </Col>

              <Col xl={3} lg={4} md={6} sm={6}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_city}
                    disabled
                    placeholder="Enter city"
                  />
                  {errors.i_city && ( <span className="text-danger" > {errors.i_city}</span>)}
                </Form.Group>
              </Col>

              <Col xl={3} lg={4} md={6} sm={6}>
                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_state}
                    disabled
                    placeholder="Enter state"
                  />
                  {errors.i_state && ( <span className="text-danger" > {errors.i_state}</span>)}
                </Form.Group>
              </Col>

              <Col xl={3} lg={4} md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Pin Code</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={7}
                    value={addressDetails.i_pin_code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numeric values
                      setAddressDetails((prevState) => ({
                        ...prevState,
                        i_pin_code: value,
                      }));
                    }}
                    
                    placeholder="Enter pin code"
                  />
                  {errors.i_pin_code && ( <span className="text-danger" > {errors.i_pin_code}</span>)}
                </Form.Group>
              </Col>
            </Row>
            <br />
            <Button onClick={handleSubmit}>Submit Address</Button>
            <hr />
            <div className=" table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Address Type</th>
                    <th>Location</th>
                    <th>Address</th>
                    <th>State</th>
                    <th>City</th>
                    <th>Pincode</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addresses.map((address, idx) => (
                    <tr key={idx}>
                      {/* Check if type_name is an object, if so stringify it, else display as string */}
                      <td>
                        {address.type_name &&
                        typeof address.type_name === "object"
                          ? "Unknown"
                          : address.type_name || "Unknown"}
                      </td>
                      <td>{address.location_name}</td>
                      <td>{address.address}</td>
                      <td>{address.state_name}</td>
                      <td>{address.city_name}</td>
                      <td>{address.pincode}</td>
                      <td>
                        <Button
                          className=""
                          variant="danger"
                          onClick={() => {
                            handleRemove(address.address_code); // Pass addressCode as argument
                          }}
                        >
                          <FaRecycle />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default ComponentAddress;
