import React, { useState, useEffect, Fragment } from "react";
import { Card } from "react-bootstrap";
import PropertyBasicDetails from "./propertyBasicDetails";
import PropertyMaintenance from "./propertyMaintenance";
import PropertyAmenities from "./propertyAmenities";
import PropertyRentalDetails from "./propertyRental.jsx";

const PropertyMultistepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Load the current step and other state from sessionStorage on component mount
  useEffect(() => {
    const savedStep = parseInt(localStorage.getItem("next_stpro"), 10);
    if (savedStep > 0 && savedStep <= totalSteps) {
      setCurrentStep(savedStep);
    }
  }, []);

  // Function to navigate to a specific step
  const goToStep = (targetStep) => {
    if (targetStep >= 1 && targetStep <= totalSteps) {
      setCurrentStep(targetStep);
      localStorage.setItem("next_stpro", targetStep); // Persist step in sessionStorage
    }
  };

  // Render the content of the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PropertyBasicDetails goToStep={goToStep} />;
      case 2:
        return <PropertyAmenities goToStep={goToStep} />;
      case 3:
        return < PropertyMaintenance goToStep={goToStep} />;
      case 4:
        return <PropertyRentalDetails goToStep={goToStep} />;
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

export default PropertyMultistepForm;
