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

function ComponentAddress() {
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
  const [transactionType, setTransactionType]= useState("I");
  const [addressCode, setAddressCode] = useState(0);

  const verificationCode = localStorage.getItem('vrfCode') ; // Example verification code (can be dynamic)

  useEffect(() => {
    // Load address types from API
    const loadAddressTypes = async () => {
      try {
        const response = await axios.get(
          "https://api.4slonline.com/rams/api/Service/VerificationTypeList"
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
  }, [verificationCode]);

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

  const handleSubmit = async () => {
    //debugger;
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
        const count= localStorage.getItem('vrfCount');
        if(count){
          localStorage.setItem('vrfCount',parseInt(count)+1);
        }else{
          localStorage.setItem('vrfCount',1);
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

  const handleRemove=(addressCode)=>{
    debugger;
    setTransactionType("D");
    setAddressCode(addressCode);
    if(transactionType==="D" && addressCode!=="0"){
      handleSubmit();
      loadAddresses();
    }
  }

  return (
    <>
      <Accordion defaultActiveKey={["0"]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Address Verification</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Address Type</Form.Label>
                  <Select
                    options={addressType}
                    value={selectedAddressType}
                    onChange={(selected) => setSelectedAddressType(selected)}
                    placeholder="Select address type"
                  />
                </Form.Group>
              </Col>

              <Col md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Search Location</Form.Label>
                  <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="Enter location"
                  />
                </Form.Group>
              </Col>

              <Col md={6} sm={6}>
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
                </Form.Group>
              </Col>

              <Col md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Full Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_address}
                    disabled
                    placeholder="Full address from search"
                  />
                </Form.Group>
              </Col>

              <Col md={6} sm={6}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_city}
                    disabled
                    placeholder="Enter city"
                  />
                </Form.Group>
              </Col>

              <Col md={6} sm={6}>
                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_state}
                    disabled
                    placeholder="Enter state"
                  />
                </Form.Group>
              </Col>

              <Col md={6} sm={6}>
                <Form.Group>
                  <Form.Label>Pin Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={addressDetails.i_pin_code}
                    disabled
                    placeholder="Enter pin code"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button onClick={handleSubmit}>Submit Address</Button>
            <hr />
            <div  className=" table-responsive">
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
        {address.type_name && typeof address.type_name === "object"
          ? "Unknown"
          : address.type_name || "Unknown"}
      </td>
      <td>{address.location_name}</td>
      <td>{address.address}</td>
      <td>{address.state_name}</td>
      <td>{address.city_name}</td>
      <td>{address.pincode}</td>
      <td>
        <Button className=""
          variant="danger"
          onClick={() => {
            handleRemove(address.address_code);  // Pass addressCode as argument
          }}
        >
          Remove
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
