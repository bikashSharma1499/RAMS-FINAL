import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App.jsx';
import './index.scss';
import { BrowserRouter,  Route, Routes  } from 'react-router-dom';
import Authenticationlayout from './pages/authenticationlayout.jsx';
import Auth from './firebase/auth.jsx';
import Crm from './container/dashboards/crm/crm.jsx';
import Loader from './components/common/loader/loader.jsx';

/*Login Loop*/
import LoginCheck from './container/auth/logincheck.jsx';
import Signin from './container/auth/signin.jsx';
import Twostep from './container/auth/twostep.jsx';
import Signup from './container/auth/signup.jsx';
/*Rent Agreement*/
import Rentagreement  from './container/agreement/agreement.jsx';
import RentAgreementListAll from './container/agreement/agreemententrylistAll.jsx';
import NewAgreement from './container/agreement/newagreement.jsx';

/*Property*/
import PropertyList from './container/property/propertylist.jsx';
import PropertyListing from './container/property/propertyListing.jsx';
import PropertyDashboard from './container/property/propertyDashboard.jsx'
import PropertyTransaction from './container/property/propertyTransaction.jsx';

/*Customer */

import Customerlist from './container/customer/customerlist.jsx';
import CustomerNewRegistration from './container/customer/customerregistration.jsx';
/**/
import VerificationForm from './container/verification/newrequest.jsx';
import VerificationDashboard from './container/verification/dashboard.jsx';
import VerificationListReport from './container/verification/listReport.jsx';
import PaymentHistory from './container/verification/paymentHistory.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
  <BrowserRouter>
    <React.Suspense fallback={<Loader/>}>
      <Routes> 
      <Route path={`${import.meta.env.BASE_URL}`} element={<Auth />}>
          <Route index element={<LoginCheck />} />
          <Route path={`${import.meta.env.BASE_URL}auth/signin/`} element={<Signin />} />
          <Route path={`${import.meta.env.BASE_URL}auth/signup/`} element={<Signup />}/>
          <Route path={`${import.meta.env.BASE_URL}auth/twostep/`} element={<Twostep />}/>
          <Route path={`${import.meta.env.BASE_URL}auth/logincheck/`} element={<LoginCheck />}/>
       </Route>
          <Route path={`${import.meta.env.BASE_URL}`} element={<App/>}>
          <Route path={`${import.meta.env.BASE_URL}dashboard`} element={<Crm/>} />
          <Route path={`${import.meta.env.BASE_URL}agreement/list`} element={<RentAgreementListAll/>} />
          <Route path={`${import.meta.env.BASE_URL}newagreement/`} element={<NewAgreement/>} />
          <Route path={`${import.meta.env.BASE_URL}customer/list/`} element={<Customerlist/>} />
          <Route path={`${import.meta.env.BASE_URL}customer/registration/`} element={<CustomerNewRegistration/>} />

          {/*Property Listing*/}
          <Route path={`${import.meta.env.BASE_URL}property/dashboard/`} element= {<PropertyDashboard/>}/>
          <Route path={`${import.meta.env.BASE_URL}property/listing/`} element= {<PropertyListing/>}/>
          <Route path={`${import.meta.env.BASE_URL}property/list/`} element= {<PropertyList/>}/>
          <Route path={`${import.meta.env.BASE_URL}property/transaction/`} element= {<PropertyTransaction/>}/>
          
          {/**Verification*/}
          <Route path={`${import.meta.env.BASE_URL}verification/new/`} element= {<VerificationForm/>}/>
          <Route path={`${import.meta.env.BASE_URL}verification/dashboard/`} element= {<VerificationDashboard/>}/>
          <Route path={`${import.meta.env.BASE_URL}verification/list`} element= {<VerificationListReport/>}/>
          <Route path={`${import.meta.env.BASE_URL}verification/payment-history`} element= {<PaymentHistory/>}/>
        
           </Route>

          <Route path={`${import.meta.env.BASE_URL}`} element={<Authenticationlayout />}>
         
          </Route>
       

      </Routes>
    </React.Suspense>
  </BrowserRouter>
</React.Fragment>
);
