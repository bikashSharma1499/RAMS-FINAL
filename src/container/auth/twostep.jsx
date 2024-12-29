import { Fragment, useRef, useCallback, useState } from 'react';
import { Card, Button, Col, Form, Row } from 'react-bootstrap';
import desktoplogo from "../../assets/images/brand-logos/desktop-logo.png";
import desktopdarklogo from "../../assets/images/brand-logos/desktop-dark.png";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { decryptKeyWithExpiry, showPopup } from '../../utils/validation';
import SetLoginInfo from './logindata';

const Twostep = () => {
    const inputRefs = {
        one: useRef(null),
        two: useRef(null),
        three: useRef(null),
        four: useRef(null),
    };
    const [finalValue, setFinalValue] = useState('');
    
    const navigate = useNavigate();
     
    const handleNavigate = () => {
        navigate(
            `${import.meta.env.BASE_URL}dashboard`,{ state: { fetchData: true } }
        );
      //  window.location.href = `${import.meta.env.BASE_URL}dashboard`;

    }
    const handleInputChange = useCallback((currentId, nextId) => {
        const currentInput = inputRefs[currentId].current;

        if (currentInput && currentInput.value.length === 1) {
            const nextInput = inputRefs[nextId] ? inputRefs[nextId].current : null;

            if (nextInput) {
                nextInput.focus();
            }
        }
    }, [inputRefs]);

    const handleKeyDown = (e) => {
        const currentInput = inputRefs.four.current;
        if (currentInput && currentInput.value.length === 1) {
            handleVerify();
        }
    };

    const handleVerify = () => {
        const currentInput = inputRefs.four.current;
        const enteredCode = `${inputRefs.one.current.value}${inputRefs.two.current.value}${inputRefs.three.current.value}${inputRefs.four.current.value}`;
        const correctCode = decryptKeyWithExpiry(localStorage.getItem('otpUser'));  
        if(correctCode.valid){
            if (enteredCode === correctCode.data) {
                const userKey= decryptKeyWithExpiry(localStorage.getItem('userKey')).data;
                const userType= decryptKeyWithExpiry(localStorage.getItem('userType')).data;
                console.log(userKey);
                //debugger;
                SetLoginInfo(userType,userKey);
                handleNavigate();
            } else {
                Object.keys(inputRefs).forEach(refKey => {
                    inputRefs[refKey].current.value = '';
                });
                const data ={title:"Invalid OTP", text:"The entered code is incorrect. Please try again",iconType:"error"} 
                showPopup(data);
            }
        }else{
            const data ={title:"OTP Expired", text:"OTP has expired. Please try resend the OTP",iconType:"error"} 
            showPopup(data);
            Object.keys(inputRefs).forEach(refKey => {
                inputRefs[refKey].current.value = '';
            });
        }
    };

    return (
        <Fragment>
            <div className="container-lg">
                <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
                    <Col xxl={4} xl={5} lg={5} md={6} sm={8} className="col-12">
                        <div className="my-5 d-flex justify-content-center">
                            <Link to={`${import.meta.env.BASE_URL}dashboards/crm/`}>
                                <img src={desktoplogo} alt="logo" className="desktop-logo" />
                                <img src={desktopdarklogo} alt="logo" className="desktop-dark" />
                            </Link>
                        </div>
                        <Card className="custom-card">
                            <Card.Body className="p-5">
                                <p className="h5 fw-semibold mb-2 text-center">Verify Your Account</p>
                                <p className="mb-4 text-muted op-7 fw-normal text-center">Enter the 4 digit code sent to the registered email Id.</p>
                                <div className="row gy-3">
                                    <Col xl={12} className="mb-2">
                                        <Row>
                                            <div className="col-3">
                                                <Form.Control
                                                    type="text"
                                                    className="form-control-lg text-center"
                                                    id="one"
                                                    maxLength={1}
                                                    autoComplete="off"
                                                    onChange={() => handleInputChange("one", "two")}
                                                    ref={inputRefs.one}
                                                />
                                            </div>
                                            <div className="col-3">
                                                <Form.Control
                                                    type="text"
                                                    className="form-control-lg text-center"
                                                    id="two"
                                                    maxLength={1}
                                                    autoComplete="off"
                                                    onChange={() => handleInputChange("two", "three")}
                                                    ref={inputRefs.two}
                                                />
                                            </div>
                                            <div className="col-3">
                                                <Form.Control
                                                    type="text"
                                                    className="form-control-lg text-center"
                                                    id="three"
                                                    maxLength={1}
                                                    autoComplete="off"
                                                    onChange={() => handleInputChange("three", "four")}
                                                    ref={inputRefs.three}
                                                />
                                            </div>
                                            <div className="col-3">
                                                <Form.Control
                                                    type="text"
                                                    className="form-control-lg text-center"
                                                    id="four"
                                                    maxLength={1}
                                                    autoComplete="off"
                                                    onKeyDown={()=>handleKeyDown}  // Handle keydown for verification
                                                    ref={inputRefs.four}
                                                />
                                            </div>
                                        </Row>
                                        <div className="form-check mt-2">
                                            <Form.Check className="" type="checkbox" value="" id="defaultCheck1" />
                                            <Form.Label className="form-check-label" htmlFor="defaultCheck1">
                                                Did not receive a code? <Link to={`${import.meta.env.BASE_URL}pages/email/mailapp/`} className="text-primary ms-2 d-inline-block">Resend</Link>
                                            </Form.Label>
                                        </div>
                                    </Col>
                                    <Col xl={12} className="d-grid mt-2">
                                       <Button onClick={handleVerify} >Verify</Button>
                                    </Col>
                                </div>
                                <div className="text-center">
                                    <p className="fs-12 text-danger mt-3 mb-0"><sup><i className="ri-asterisk"></i></sup>Don't share the verification code with anyone!</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </div>
            </div>
        </Fragment>
    );
};

export default Twostep;
