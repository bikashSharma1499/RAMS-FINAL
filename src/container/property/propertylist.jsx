import { useState, useEffect } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import axios from "axios";
import { GetLoginInfo } from "../auth/logindata"; // Assuming this is your utility function
import { API_ENDPOINTS } from "../../utils/apiConfig";
import PropertyListData from "./propertyListData";
import Pageheader from "../../components/pageheader/pageheader";
import DataTableComponent from "./propertyListData";
DataTable.use(DT);

function PropertyList() {

  return (
 <>
   <Pageheader
                title="My Property"
                heading="Property"
                active="Property List"
              />
 {/* <PropertyListData/> */}
 <DataTableComponent/>
 </>
  )
}

export default PropertyList;
