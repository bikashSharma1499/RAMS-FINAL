import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from "../../utils/apiConfig";
import { useLocation } from 'react-router-dom';
import { numberToWordsWithCurrency } from '../../utils/currencytoword';
import { numberToWords } from '../../utils/numbertoword';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import "../../assets/css/agreement.css";

const LeaseDeed = () => {
  const [agreementData, setAgreementData] = useState(null);
  const [leaseData, setLeaseData] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [agreementCode, setAgreementCode]= useState(null);
  const legalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
        const code = sessionStorage.getItem('agcCode');
        if (code) {
            setAgreementCode(code); // Pass the retrieved code to setAgreementCode
        }
    };

    fetchData(); 
}, [])

  const fetchAgreementData = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.agreementList, {
        agreementCode: agreementCode,
      });
      console.log("API Response:", response.data);
      setAgreementData(response.data);
    }
    catch (error) {
      console.error('Error fetching Agreement data:', error);
    }
  }
  useEffect(() => {
    setTimeout(() => {
        if (agreementCode) {
            fetchAgreementData();
          }
    }, 1200);
  
  }, [agreementCode]);

  const fetchLeaseData = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.agreementSecondPartyList, {
        agreementCode: agreementCode,
      });
      console.log("API Response:", response.data);
      setLeaseData(response.data);
    } catch (error) {
      console.error('Error fetching lease deed data:', error);
    }
  };

  useEffect(() => {
    if (agreementCode) {
      fetchLeaseData();
    }
  }, [agreementCode]);

  const generatePDF = async () => {
    const inputElement = legalRef.current;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pages = Array.from(inputElement.querySelectorAll('.p1, .pg'));

    let pageIndex = 0;

    const capturePage = (pageElement) => {
      return new Promise((resolve) => {
        html2canvas(pageElement, { scale: 3 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const pageHeight = 297;
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          const pagesRequired = Math.ceil(imgHeight / pageHeight);

          if (pageIndex === 0) {
            doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          } else {
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          }

          for (let i = 2; i < pagesRequired; i++) {
            doc.addPage();
            const offset = -i * pageHeight;
            doc.addImage(imgData, 'JPEG', 0, offset, imgWidth, imgHeight, 'FAST');
          }

          pageIndex++;
          resolve();
        });
      });
    };

    for (const page of pages) {
      await capturePage(page);
    }

    doc.save('lease_deed.pdf');

    const base64PDF = doc.output('datauristring');
  };


  if (!agreementData || agreementData.length === 0) {
    return <div>Loading...</div>;
  }

  const agrmnt = agreementData[0];
  const lease = leaseData[0];

  return (
    <div className='legal'>
      <div ref={legalRef}>
        <div className='p1'>
          <div className='stmp'>
            <h2>LEASE DEED</h2>
            <ol><li><strong>Property Address : {agrmnt.property_address}</strong></li>
              <li><strong>Rent: INR. {agrmnt.monthly_rent} /- per month from {agrmnt.agreement_date_format} .</strong></li>
              <li><strong>Period of Lease : {numberToWords(agrmnt.agreement_duration_month)} ( {agrmnt.agreement_duration_month} ) months ( {agrmnt.agreement_date_format} to {agrmnt.expired_date_format} ).</strong></li>
              <li><strong>Security Amount: Rs. {agrmnt.advance_amount} /- ({numberToWordsWithCurrency(agrmnt.advance_amount)}).</strong></li>
              <li><strong>Electricity/Water Charges: As per Meters payable as per the billing cycle paid by Lessee before due dates.</strong></li>
              <li><strong>Escalation after expiry: {agrmnt.escalation_rate}</strong></li>
            </ol>

            <p><strong>The Lease Deed dated {agrmnt.agreement_date_format} is executed at {agrmnt.location} between {agrmnt.first_party_name} <span>and {lease.name} </span> on the Stamp Paper bearing Certificate/Serial number as mentioned on the top right corner of this page.</strong></p></div>
        </div>
        <div className='pg row align-content-center'>
          <p><strong>This Lease Deed/Rent Agreement is executed at ({agrmnt.location}) on {agrmnt.agreement_date_format} .</strong></p>
          <p><strong>BETWEEN</strong></p>
          <h5>{agrmnt.first_party}.</h5>
          <p><strong>AND</strong></p>
          <h5>{lease.second_party}.</h5>
          <p><strong>Whereas</strong> the Lessor(s), being the rightful and joint owners of the property situated at {agrmnt.property_address} (Floor Number - 0, House Type - {agrmnt.property_type}) (hereafter referred to as the 'leased premises'), and the term Lessor(s) and Lessee to include their heirs, executors, administrators, and assigns.</p>
          <p><strong>Whereas</strong> at the request of the Lessee, the Lessor(s) have consented to rent out the aforementioned leased premises to the LESSEE, who has agreed to occupy them starting {agrmnt.agreement_date_format} for legitimate residential purposes. Furthermore, the Lessor(s) affirm that the leased premises are devoid of any encumbrances, asserting their unimpeded ownership thereof. Both the Lessor(s) and the Lessee affirm their legal capacity to execute this Lease Agreement under the stipulated terms and conditions.</p>
        </div>
        <div className='pg row align-content-center'>
          <ol>
            <li><strong>Payment of Rent</strong>: The LESSEE shall remit a monthly rent of Rs. {agrmnt.monthly_rent}/- ({numberToWordsWithCurrency(agrmnt.monthly_rent)}) for the leased premises, payable in advance on or before the {agrmnt.payment_day} day of each calendar month directly to the Lessor(s) as per the agreed proportions among the Lessor(s). Should there be any tax deducted at source, the Lessee is to provide the Lessor(s) with the TDS certificate quarterly, ensuring timely tax filing by the Lessor(s). Both parties are responsible for any tax liabilities arising from non-compliance.</li>
            <li><strong>Security Deposit</strong>: The LESSEE has provided Rs. {agrmnt.advance_amount}/- ({numberToWordsWithCurrency(agrmnt.advance_amount)}) as a security deposit without interest, refundable upon termination of the lease minus any dues such as unpaid rent, utilities, and maintenance costs that are the responsibility of the Lessee at the time of vacating. The Lessor(s) reserve the right to apply this deposit towards any liabilities incurred during the notice period, excluding any utilities paid for by the Lessor(s).</li>
            <li><strong>Utilities</strong>: The LESSEE agrees to pay for electricity and water charges based on actual monthly consumption as billed by the service providers. Receipts of these payments shall be provided to the Lessor(s) upon request.</li>
            <li><strong>Condition of Premises</strong>: Upon commencement of the lease, the Lessor(s) will ensure that the premises are in a habitable condition. A detailed inventory of the premises contents will be provided as ANNEXURE 1 of this Agreement.</li>
            <li><strong>Damage to Premises</strong>: Should the LESSEE cause damage to the premises or its fixtures and fittings (beyond normal wear and tear), they must repair the damages to restore the property to its original condition at the time of lease commencement, unless modifications were made with the Lessor(s) consent. Failure to repair the damages will entitle the Lessor(s) to deduct the necessary costs from the security deposit.</li>
            <li><strong>Rent Escalation</strong>: Upon the expiration of this lease, the monthly rent shall be subject to an increase of {agrmnt.escalation_rate} annually or to an amount mutually agreed upon by all parties during renewal discussions, taking into account the prevailing market rates.</li>
            <li><strong>Alterations and Furnishings</strong>: The Lessee shall not make any structural changes or alterations to the leased premises. Only furnishings may be added at the Lessee's expense, for which the Lessor(s) shall bear no cost obligations.</li>
            <li><strong>Subletting Prohibition and Inspection Rights</strong>: The Lessee is expressly prohibited from subletting any portion of the leased premises, either in whole or in part, to any third party. The Lessor(s) or their authorized representatives retain the right to inspect the premises during normal business hours, provided that prior permission is obtained from the Lessee.</li>
          </ol>
        </div>
        <div className='pg row align-content-center'>
          <ol>
            <li><strong>Use of Premises</strong>: The Lessee agrees to occupy the leased premises in a manner that is respectful and considerate to neighboring occupants. The premises shall be used solely for legitimate, legal purposes, and the Lessee shall ensure that no illegal, immoral, or disruptive activities occur therein. Furthermore, the Lessee is responsible for maintaining a peaceful environment and preventing any nuisance to the neighborhood.</li>
            <li><strong>Maintenance and Repairs</strong>: Routine maintenance tasks such as repairing fuses, fixing leaky faucets, replacing defective MCBs, bulbs, tube lights, and their fittings, as well as attending to malfunctioning sanitary pipes, doors, and door locks, are the responsibility of the Lessee and shall be handled at their expense. However, significant repairs, including those related to structural issues like wall or ceiling leaks, will be addressed by the Lessor(s) upon notification from the Lessee.</li>
            <li><strong>Breach of Agreement and Recourse</strong>: Should the Lessee fail to pay the rent on time for any given month, or breach any other term of this agreement, the Lessor(s) reserve the right to reclaim possession of the leased premises. The Lessee will be provided with reasonable notice by the Lessor(s) prior to such action.</li>
            <li><strong>Compliance with Regulations</strong>: The Lessee is responsible for adhering to all relevant regulations and for making timely payments for all services provided by utilities and governmental bodies related to the leased premises. The Lessee remains accountable for any outstanding dues related to their period of occupancy, even after vacating the premises.</li>
            <li><strong>Security Deposit and Termination</strong>: In the event of unsettled rental or maintenance dues by the Lessee, the Lessor(s) may deduct such amounts from the Lessee's security deposit of Rs. {agrmnt.advance_amount}/-. The termination of this lease by either party requires a two-month notice period. Termination can occur without cause, provided that two months advance notice is given to the other party, with written notices exchanged using the addresses specified in the lease.</li>
            <li><strong>Pre-Lease Obligations of the Lessor(s)</strong>: The Lessor(s) commit to clearing all outstanding utilities and incidental bills related to electricity and water before the commencement of the lease on {agrmnt.expired_date_format}. The Lessor(s) are responsible for any debts accrued before this date. Should services be disconnected due to the Lessee's negligence, the Lessee will bear the cost of reconnection, which may be deducted from the security deposit if unpaid.</li>
          </ol>
        </div>
        <div className='pg row align-content-center'>
          <ol>
            <li><strong>Lease Expiration and Possession</strong>: Upon the conclusion of this lease, should the Lessor(s) opt not to renew or extend the agreement, the Lessee is obligated to vacate the premises immediately at the lease's expiration. Failure to vacate on time will result in the Lessee incurring a penalty of double the monthly rental rate for each month they remain in possession beyond the lease term.</li>
            <li><strong>Modification of Agreement</strong>: Any amendments or modifications to this Lease Agreement must be made in writing and signed by both the Lessor(s) and the Lessee. Oral modifications will not be considered valid or binding under any circumstances.</li>
            <li><strong>Dispute Resolution</strong>: In the event of a dispute arising from or related to this agreement, the parties agree to first seek resolution through mediation. If mediation fails, disputes will be resolved through binding arbitration in accordance with the laws of the jurisdiction where the demised premises are located.</li>
            <li><strong>Entire Agreement</strong>: This document contains the full and entire agreement between the parties regarding the lease of the demised premises. It supersedes all prior discussions, agreements, or representations, whether oral or written.</li>
            <li><strong>Inspection Rights</strong>: The Lessor(s) reserve the right to conduct inspections of the leased premises at reasonable intervals to ensure proper maintenance and adherence to lease terms, provided such inspections are conducted at reasonable times and with prior notice to the Lessee to ensure minimal disruption.</li>
            <li><strong>Insurance Requirement</strong>: The Lessee shall obtain and maintain, at their own expense, a renters insurance policy that covers personal property damage and liability sufficient to protect the Lessee against liabilities for property damage and injuries to persons occurring within the leased premises. Proof of such insurance must be provided to the Lessor(s) upon request.</li>
            <li><strong>Renewal Terms</strong>: This Lease may be renewed upon mutual agreement between the Lessor(s) and the Lessee under the terms to be agreed upon at the time of renewal. Intent to renew must be communicated in writing by the Lessee no later than three months prior to the expiry of the current term.</li>
            <li><strong>No Waiver</strong>: The failure or delay of either party to enforce any provision of this Lease shall not be construed as a waiver of such provision or of the right to enforce such provision at a later time.</li>
          </ol>
        </div>
        <div className='pg row align-content-center'>
          <ol>
            <li><strong>Notices</strong>: All notices under this agreement shall be in writing and sent by registered mail, courier, or electronic mail to the addresses specified in the lease. Such notices shall be deemed received on the date of delivery or, if electronically sent, on the date the email is sent.</li>
            <li><strong>Amendment of Agreement</strong>: No amendment or variation of the terms of this Agreement shall be valid unless it is in writing and signed by both the Lessor(s) and the Lessee. Such amendments shall be attached to the original deed as annexures.</li>
            <li><strong>Severability</strong>: If any term or provision of this Lease is found to be invalid, unlawful, or unenforceable to any extent, such term or provision shall be severed from the remaining terms, which shall continue to be valid and enforceable to the fullest extent permitted by law.</li>
            <li><strong>Quiet Enjoyment</strong>: The Lessor(s) guarantee that the Lessee will have quiet and peaceful enjoyment of the leased premises without disturbance from anyone claiming through or under the Lessor(s).</li>
            <li><strong>Return of Premises</strong>: Upon termination or expiry of this Lease, the Lessee agrees to return the leased premises in the same condition as it was at the beginning of the lease term, subject to normal wear and tear. Failure to do so may result in deductions from the security deposit to cover repair costs.</li>
            <li><strong>Binding Effect</strong>: This Lease shall be binding upon and inure to the benefit of the parties hereto and their respective heirs, executors, administrators, successors, and assigns.</li>
          </ol>
          <p><strong>Subsequent Agreements</strong>: Any agreements or promises made subsequent to this Lease Agreement will be considered valid only if documented in writing and signed by both parties.</p>
          <p><strong>Dispute Resolution</strong>: In the event of any disputes, controversies, or claims arising out of or relating to this agreement, the parties agree to engage in good faith negotiations to attempt to resolve the dispute amicably before resorting to litigation.</p>
          <p><strong>Compliance with Laws</strong>: Both parties agree to comply with all applicable laws and regulations in their use, maintenance, and operation of the leased premises.</p>
          <p><strong>Assignment and Subleasing</strong>: The Lessee shall not assign or sublease any portion of the leased premises without the prior written consent of the Lessor(s). Any attempt to do so without such consent will be void and will constitute a breach of this lease.</p>
          <p><strong>Right of First Refusal</strong>: If the Lessor(s) decide to sell the leased premises, the Lessee shall have the first right of refusal to purchase the property under the same terms and conditions as offered to any third party.</p>
        </div>
        <div className='pg row align-content-center'>
          <p><strong>Pets and Animals</strong>: The Lessee is not permitted to keep pets or animals on the leased premises without the prior written consent of the Lessor(s). If consent is given, it may be subject to conditions and additional security deposits.</p>
          <p><strong>Decorations and Alterations</strong>: The Lessee may decorate the interior of the leased premises to their taste, provided that any alterations or permanent changes require the written consent of the Lessor(s). Upon the termination of the lease, the Lessee may be required to restore the premises to their original condition, at their expense.</p>
          <p><strong>Early Termination</strong>: Either party may terminate the lease before the expiration of the term by providing three months written notice to the other party. In such cases, the Lessee may be subject to an early termination fee, which will be stipulated in the lease agreement.</p>
          <p><strong>Security Measures</strong>: The Lessee agrees to take reasonable security measures to protect the leased premises and its contents from theft, damage, and unauthorized access.</p>
          <p><strong>Indemnification</strong>: The Lessee agrees to indemnify, defend, and hold harmless the Lessor(s) from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorney fees) arising out of or relating to the Lessee's use of the leased premises or breach of this lease agreement.</p>
          <p><strong>Confidentiality</strong>: Both parties agree to keep the terms of this lease and any information obtained about the other party in connection with the lease confidential, except as required by law or necessary to enforce the terms of this agreement.</p>
          <p><strong>Renovation and Restoration</strong>: In the event that the Lessee undertakes any renovation works with the prior consent of the Lessor(s), the Lessee agrees to restore the premises to their original state upon the termination of the lease, unless the Lessor(s) agree in writing to accept the alterations.</p>
          <p><strong>Environmental Compliance</strong>: The Lessee shall ensure that their use of the leased premises complies with all environmental laws and regulations. The Lessee shall not store any hazardous materials on the premises without the express written consent of the Lessor(s).</p>
          <p><strong>Insurance Obligations</strong>: The Lessee shall maintain adequate insurance to cover liability and property damage as well as loss or damage to the Lessee's own property. Proof of such insurance must be provided to the Lessor(s) upon request.</p>
          <p><strong>Keys and Security Devices</strong>: Upon the commencement of the lease, the Lessor(s) shall provide the Lessee with a set number of keys or security devices for access to the leased premises. The Lessee agrees to return all such items upon the termination of the lease. If any keys or security devices are lost or not returned, the Lessee will be responsible for the costs of replacing them and changing locks if deemed necessary by the Lessor(s).</p>
          <p><strong>Quiet Hours</strong>: The Lessee agrees to observe quiet hours from 10:00 PM to 7:00 AM daily. During these hours, noise levels must be kept to a minimum to not disturb the tranquility of the neighborhood.</p>
        </div>
        <div className='pg row align-content-center'>
          <p><strong>Governing Law</strong>: This Agreement shall be governed by and construed in accordance with the laws of the state or country where the leased premises are located, without giving effect to any principles of conflicts of law.</p>
          <p><strong>Entire Agreement</strong>: This document and any attachments represent the entire agreement between the parties regarding the rental of the leased premises and supersede all prior discussions, agreements, or representations, either written or oral. No amendment to this agreement shall be effective unless it is in writing and signed by both parties.</p>
          <p><strong>Special Provisions</strong>: Any special provisions to this lease must be attached as an addendum and signed by both parties. These provisions may stipulate additional rules, responsibilities, or restrictions that are specific to the leased premises.</p>
          <p><strong>Execution and Delivery</strong>: The execution and delivery of this Agreement by electronic means, including the use of digital signatures and electronic records on platforms such as Redcheckes.com, shall have the same legal effect as the use of traditional signatures and paper records.</p>
          <p><strong>ANNEXURE 1</strong></p>
          <p><strong>Additional Furnishings and Appliances Included</strong>:</p>
          <ul>
            <li><strong>Curtains</strong>: 4 sets of curtains for living room and bedroom windows.</li><li><strong>Kitchen Appliances</strong>: Microwave oven - 1, Refrigerator - 1.</li><li><strong>Living Room Furniture</strong>: Sofa set (3-seater) - 1, Coffee table - 1.</li><li><strong>Bathroom Fixtures</strong>: Shower curtain - 1, Bathroom mirror - 1.</li><li><strong>Lighting</strong>: Table lamps - 2, Standing lamp - 1.</li><li><strong>Air Conditioning Units</strong>: Air conditioners - 1 in the bedroom.</li><li><strong>Entertainment</strong>: Television - 1 (32 inches LED).</li><li><strong>Utilities</strong>: Water heater - 1, Washing machine - 1.</li></ul><p><strong>Condition and Maintenance</strong>:</p><ul><li>Each item is in good working condition and free from any significant damage at the time of lease commencement.</li><li>The LESSEE agrees to maintain the items in good working order and will notify the LESSOR(S) immediately of any malfunction or needed repairs.</li><li>Any damage or loss of these items, other than normal wear and tear, will be the responsibility of the LESSEE to repair or replace, subject to approval by the LESSOR(S).</li></ul><p><strong>Inventory Check and Verification</strong>:</p><ul><li>Upon taking possession of the leased premises, the LESSEE shall conduct a thorough inspection of all listed items together with the LESSOR(S) or their designated representative.</li><li>An inventory checklist will be signed by both the LESSEE and the LESSOR(S) as acknowledgment of the condition and quantity of items provided.</li><li>At the termination of the lease, a final inventory check will be conducted. Any discrepancies in the condition or number of items from the initial inventory may result in charges or deductions from the security deposit.</li></ul>
        </div>
      </div>
      <div className='text-center mt-2'>
      <button  className="btn btn-success btn-sm" onClick={generatePDF}>Download Lease Deed as PDF</button>
      </div>
    </div>
  );
};

export default LeaseDeed;