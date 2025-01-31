
export const BASE_URL = "https://api.4slonline.com/rams/api/";

export const API_ENDPOINTS = {
  otpAuthentication: BASE_URL+"User/otpAuth",
  customerRegistrationMin:BASE_URL+"User/CustomerRegistration",
  customerList:BASE_URL+"User/CustomerList",
  propertyListPost:BASE_URL+"Customer/CustomerPropertyList",
  propertyType:BASE_URL+"Property/PropertyType",
  propertyHousingType:BASE_URL+"Property/PropertyHouseList",
  propertyMaintenanceMaster:BASE_URL+"Property/PropertyMaintenance",
  propertyAmenitiesMaster:BASE_URL+"Property/PropertyItemList",
  newAgreementRecord: BASE_URL+"Customer/RentAgreement",
  agreementFirstParty: BASE_URL+"Customer/RentAgreementFirstParty",
  agreementSecondParty: BASE_URL+"Customer/RentAgreementSecondParty",
  agreementSecondPartyList: BASE_URL+"Customer/RentAgreementSecondPartyList",
  agreementProperty:BASE_URL+"Customer/RentAgreementProperty",
  agreementAmenities:BASE_URL+"Customer/CustomerPropertyItem",
  customerPropertyItemDetail:BASE_URL+"Customer/CustomerPropertyItemDetail",
  customerPropertyMaintenanceList:BASE_URL+"Customer/CustomerPropertyMaintenanceList",
  customerPropertyUpdateMaintenance: BASE_URL+"Customer/CustomerPropertyMaintenance",
  agreementContractDetails: BASE_URL+"Customer/RentContract", 
  agreementListDisplay: BASE_URL+"Customer/RentAgreementEntryList",
  agreementPricing : BASE_URL +"Service/ComponentPriceList",
  agreementList:BASE_URL+"Customer/RentAgreementList",

  propertyList:BASE_URL+"Customer/CustomerPropertyList",
  ManageProperty:BASE_URL+"Customer/CustomerProperty",
  propertyStatus:BASE_URL+"Property/PropertyStatus",
  PropertyRental:BASE_URL+"Customer/CustomerPropertyRate",
  PropertyRentalPriceList:BASE_URL+"Customer/CustomerPropertyRateList",

  PropertyPricingHistory:BASE_URL+"Property/PropertyPriceList",
  
  serviceList:BASE_URL+"Service/ServiceList",
  serviceComponentList : BASE_URL+"Service/ComponentPriceList",
  serviceNewRequest :BASE_URL+"Service/Verification",
  seriveCandidateDetailsAdd : BASE_URL+"Service/VerificationCandidate",
  serviceKYC : BASE_URL+"Service/VerificationKyc",
  serviceReference:BASE_URL+"Service/VerificationReferal",
  serviceReferenceList:BASE_URL+"Service/VerificationReferalDisplay",
  serviceAddress: BASE_URL+"Service/VerificationAddress",
  serviceAddressDisplay: BASE_URL+"Service/VerificationAddressDisplay",
  serviceCriminal :BASE_URL+"Service/VerificationCriminal",
  serviceCrimialList:BASE_URL+"Service/VerificationCriminalDisplay",
  verificationList:BASE_URL+"Service/VerificationList",
  verificationDelete:BASE_URL+"Service/VerificationDelete",
  verificationTotalPrice: BASE_URL+"Service/VerificationPricingTotal",

  verificationComponentCaseList: BASE_URL+"Service/VerificationComponentCaseList",


  CustomerNewRegistration:BASE_URL+"User/CustomerRegistration",
  Customerdata:BASE_URL+"User/CustomerSelfList",
  UpdateCustomerStatus:BASE_URL+"User/CustomerAuthentication",
};
