import React, { useState, useEffect, Fragment } from "react";
import Firstpartyvalidation from "./agrS1FirstParty";
import Maintenance from "./agrS5maintenance";
import PropertyDetails from "./agrS3PropertyDetails";
import SecondPartyValidation from "./agrS2SecondParty";
import RentalDetails from "./agrS6Rental";
import Amenities from "./agrS4Amenities";
import { Card } from "react-bootstrap";

const MultistepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Load the current step and other state from sessionStorage on component mount
  useEffect(() => {
    const savedStep = parseInt(localStorage.getItem("next_step"), 10);
    if (savedStep > 0 && savedStep <= totalSteps) {
      setCurrentStep(savedStep);
    }
  }, []);

  // Function to navigate to a specific step
  const goToStep = (targetStep) => {
    if (targetStep >= 1 && targetStep <= totalSteps) {
      setCurrentStep(targetStep);
      localStorage.setItem("next_step", targetStep); // Persist step in sessionStorage
    }
  };

  // Render the content of the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Firstpartyvalidation goToStep={goToStep} />;
      case 2:
        return <SecondPartyValidation goToStep={goToStep} />;
      case 3:
        return <PropertyDetails goToStep={goToStep} />;
      case 4:
        return <Amenities goToStep={goToStep} />;
      case 5:
        return <Maintenance goToStep={goToStep} />;
      case 6:
        return <RentalDetails goToStep={goToStep} />;
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <Card>
        <Card.Header>
          <div className="progress-container">
            {/* Step Number Indicators */}
            <div className="step-indicator-container">
              {[...Array(totalSteps)].map((_, index) => {
                const stepNumber = index + 1;
                return (
                  <div
                    key={stepNumber}
                    className={`step-indicator ${
                      stepNumber < currentStep
                        ? "done"
                        : stepNumber === currentStep
                        ? "current"
                        : ""
                    }`}
                  >
                    <span className="step-number">{stepNumber}</span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Step Content */}
          <div className="step-content">{renderStep()}</div>
        </Card.Body>
      </Card>
    </Fragment>
  );
};

export default MultistepForm;
