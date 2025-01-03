import { useState } from "react";
import { Card, Row, Col, Button } from 'react-bootstrap';

import Customerdata from "./customerdata";
import Pageheader from "../../components/pageheader/pageheader";
import CustomerNewRegistration from "./customerregistration";

function Customerlist() {
  const [showList, setShowList] = useState(true);

  const handleNewReg = () => {

    setShowList(false);
  }


  return (
    <div>
      <Pageheader title="Customer List" heading="Registration" active="Customer List" />
      <Card>
        <Card.Body>
          {showList ? (
            <>
              <Row>
                <Col xs={12}>
                  <Button onClick={handleNewReg} className=" btn btn-primary  float-end" > <i className=" bi bi-plus"></i> New Customer  </Button>
                </Col>

                <Col>
                  <Customerdata />
                </Col>
              </Row>
            </>
          ) : (
            <>
              <CustomerNewRegistration />

              <Button onClick={() => setShowList(true)} className="btn btn-danger mt-5" > Cancel</Button>
            </>

          )}

        </Card.Body>
      </Card>
    </div>

  )
};


export default Customerlist;