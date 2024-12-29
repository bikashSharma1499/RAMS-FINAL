import  { FC, Fragment } from 'react';
import { Row } from 'react-bootstrap';
import Pageheader from '../../../components/pageheader/pageheader';

const Empty = () =>{
  return (
  <Fragment>
                <Pageheader title="Empty" heading="Pages" active="Empty" />

                <Row>
                    
                </Row>
  </Fragment>
);
};

export default Empty;
