/**
 * Perplexity API Integration for Legal Document Generation
 *
 * This module provides a clean interface to interact with Perplexity's API
 * for generating high-quality legal documents with Indian legal context.
 */

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';

// Perplexity models available
export const PERPLEXITY_MODELS = {
  // Sonar models - optimized for reasoning and factual accuracy
  SONAR_SMALL: 'sonar-small-32k',
  SONAR_LARGE: 'sonar-large-32k',
  SONAR_PRO: 'sonar-pro',

  // Compact models - faster responses
  COMPACT: 'sonar-1-mini',
} as const;

export type PerplexityModel = typeof PERPLEXITY_MODELS[keyof typeof PERPLEXITY_MODELS];

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: PerplexityModel;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  return_citations?: boolean;
  return_images?: boolean;
  return_related_questions?: boolean;
  search_domain_filter?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  images?: string[];
  related_questions?: string[];
}

/**
 * Generate a legal document using Perplexity API
 */
export async function generateWithPerplexity(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: PerplexityModel;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{ content: string; usage: any; error?: string }> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const {
    model = PERPLEXITY_MODELS.SONAR_PRO, // Use sonar-pro model for high-quality document generation
    temperature = 0.2, // Low temperature for consistent legal language
    maxTokens = 4000, // Sufficient for most legal documents
  } = options;

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const requestBody: PerplexityRequest = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: 0.9,
    return_citations: false, // We don't need citations for document generation
    return_images: false,
    return_related_questions: false,
  };

  try {
    const response = await fetch(`${PERPLEXITY_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error:', response.status, errorText);

      return {
        content: '',
        usage: {},
        error: `Perplexity API error: ${response.status} - ${errorText}`,
      };
    }

    const data: PerplexityResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return {
        content: '',
        usage: data.usage || {},
        error: 'No response generated from Perplexity',
      };
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    return {
      content: '',
      usage: {},
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Base system prompt for Indian legal document generation
 * This is the foundation for all document types
 */
export const LEGAL_DOCUMENT_SYSTEM_PROMPT = `You are an expert legal document drafting assistant specialized in Indian law and legal procedures.

Your role is to generate professionally formatted legal documents that comply with Indian legal standards and conventions.

FUNDAMENTAL RULES (ALWAYS APPLY TO ALL DOCUMENTS):

1. INDIAN LEGAL STANDARDS:
   - All documents must follow Indian legal formats and conventions
   - Use Indian date format (DD/MM/YYYY)
   - Use Indian currency (₹ or Rs.)
   - Reference relevant Indian laws (IPC, CPC, ICA, Labour Laws, Consumer Protection Act, etc.) when applicable
   - Use proper legal terminology as used in Indian courts and official documents

2. UNIVERSAL FORMATTING REQUIREMENTS:
   - Return ONLY the final document text
   - Do not include any explanations, notes, or meta-commentary
   - Do not include phrases like "Here is the document" or "I've generated"
   - Start directly with the document content
   - Use plain text formatting (no markdown or HTML)
   - Maintain professional spacing and alignment throughout
   - Use ALL CAPS for major section headings only
   - Use numbered paragraphs (1., 2., 3., etc.) for sequential points
   - Use proper indentation for nested content

3. DOCUMENT-SPECIFIC INSTRUCTIONS WILL BE PROVIDED:
   - The user will provide detailed requirements for each document type
   - Follow those instructions precisely
   - Include all information provided by the user
   - Do not fabricate any facts, dates, names, or amounts
   - Ensure all required legal elements are present

4. TONE AND STYLE:
   - Professional and formal tone throughout
   - Clear and unambiguous language
   - Authoritative but respectful
   - Avoid flowery or excessive language
   - Be direct and precise
   - Appropriate urgency level based on document type

Remember: These documents may be used in legal proceedings. Accuracy, professionalism, and adherence to Indian legal standards are paramount.`;

/**
 * Generate user prompt from document type and payload
 */
export function buildDocumentPrompt(documentType: string, payload: any): string {
  // Each document type has its own specific prompt structure
  // This ensures the AI generates exactly what's needed

  const prompts: Record<string, (p: any) => string> = {
    PAYMENT_DEFAULT: (p) => `DOCUMENT TYPE: LEGAL NOTICE FOR NON-PAYMENT/PAYMENT DEFAULT

USER PROVIDED DETAILS:
Creditor (Sender): ${p.senderName} / ${p.creditorName || 'N/A'}
Creditor Address: ${p.senderAddress || p.creditorAddress || 'N/A'}
Creditor Phone: ${p.senderPhone || 'N/A'}
Creditor Email: ${p.senderEmail || 'N/A'}

Debtor (Recipient): ${p.recipientName || p.debtorName || 'N/A'}
Debtor Address: ${p.recipientAddress || p.debtorAddress || 'N/A'}
Debtor Phone: ${p.recipientPhone || 'N/A'}
Debtor Email: ${p.recipientEmail || 'N/A'}

TRANSACTION DETAILS:
- Amount Owed: ₹${p.amountOwed || p.amount || '0'}
- Original Payment Due Date: ${p.paymentDueDate || p.paymentDate || 'N/A'}
- Reason for Payment: ${p.purposeOfPayment || p.transactionNature || p.relationshipContext || 'Money lent'}
- Payment Method: ${p.paymentMethod || 'N/A'}
- Reference Number: ${p.transactionReference || 'N/A'}

RELATIONSHIP & CONTEXT:
- Relationship: ${p.relationshipContext || 'Friend/Creditor'}
- Agreement Type: ${p.agreementDetails || 'Verbal agreement'}
- Additional Details: ${p.additionalContext || 'N/A'}

COMMUNICATION HISTORY:
- Reminders Sent: ${p.remindersSent || 'Multiple'}
- Last Reminder Date: ${p.lastReminderDate || 'Recent'}

DEMAND & LEGAL BASIS:
- Payment Deadline from Notice: ${p.paymentDeadline || '15 days'}
- Additional Demands: ${p.additionalDemands || 'None'}
- Tone: ${p.tone || 'Firm'}

SPECIFIC FORMATTING INSTRUCTIONS FOR THIS LEGAL NOTICE:
1. Start with centered heading: "LEGAL NOTICE"
2. Include TO/FROM sections with full names and addresses
3. Subject line: Make it specific to non-payment (e.g., "Re: Legal Notice for Payment Default of ₹[amount]")
4. Chronologically describe the transaction (when money was lent/due, terms agreed)
5. Describe communication attempts (dates when reminders were sent)
6. State the outstanding amount clearly
7. Reference applicable laws: Civil Procedure Code, 1908 (Section 80), Indian Contract Act, 1872
8. Set clear payment deadline (usually 15 days from receipt)
9. Warn of legal action under CPC Section 80 if not complied
10. Include separate "DEMAND" section with exact amount
11. End with signature block with date and notarization space
12. Use professional, firm tone (not abusive)

CRITICAL: Include ALL specific details provided. Do NOT fabricate dates or amounts.`,

    RENT_DEFAULT: (p) => `DOCUMENT TYPE: LEGAL NOTICE FOR RENT DEFAULT / EVICTION

USER PROVIDED DETAILS:
Landlord (Sender): ${p.landlordName || 'N/A'}
Landlord Address: ${p.landlordAddress || 'N/A'}
Landlord Phone: ${p.landlordPhone || 'N/A'}
Landlord Email: ${p.landlordEmail || 'N/A'}

Tenant (Recipient): ${p.tenantName || 'N/A'}
Tenant Address: ${p.propertyAddress || p.tenantAddress || 'N/A'}
Tenant Phone: ${p.tenantPhone || 'N/A'}
Tenant Email: ${p.tenantEmail || 'N/A'}

RENTAL PROPERTY DETAILS:
- Property Address: ${p.propertyAddress || 'N/A'}
- Monthly Rent: ₹${p.monthlyRent || '0'}
- Months Pending: ${p.pendingMonths || 'N/A'}
- Total Amount Due: ₹${p.totalDue || '0'}
- Last Payment Date: ${p.lastPaymentDate || 'N/A'}
- Lease Agreement Period: ${p.leaseAgreementPeriod || 'N/A'}

VIOLATIONS & ADDITIONAL ISSUES:
- Primary Issue: Non-payment of rent
- Other Violations: ${p.otherViolations || 'None'}
- Property Condition Issues: ${p.propertyConditionIssues || 'None'}

COMMUNICATION HISTORY:
- Reminders Sent: ${p.remindersSent || 'Multiple'}
- Last Reminder Date: ${p.lastReminderDate || 'Recent'}
- Tenant Response: ${p.tenantResponse || 'No response'}

DEMAND:
- Payment Deadline from Notice: ${p.paymentDeadline || '15 days'}
- Threat of Eviction: Yes (if rent not paid)

SPECIFIC FORMATTING INSTRUCTIONS FOR THIS RENT DEFAULT NOTICE:
1. Start with centered heading: "LEGAL NOTICE"
2. Include separate TO (Tenant) and FROM (Landlord) sections with full addresses
3. Subject Line: "Re: Legal Notice for Non-Payment of Rent and Eviction"
4. Describe the tenancy (start date, lease period, rent amount)
5. Detail all rent payment defaults (which months are pending, when they became due)
6. Describe communication attempts and tenant's non-response
7. State total outstanding rent amount clearly
8. Reference applicable laws: Transfer of Property Act, 1882; CPC (eviction procedures); IPC
9. Give 15 days notice from receipt to pay outstanding rent
10. Warn of eviction proceedings under CPC if rent not paid
11. Include separate "DEMAND" section with exact rent breakdown
12. Add notice about legal action and eviction proceedings
13. End with signature block, date, and notarization space
14. Use professional but serious tone (landlord is enforcing legal rights)

CRITICAL: Include ALL specific rental amounts and pending months provided. Do NOT fabricate dates.`,

    WORK_COMPLETION_DELAY: (p) => `DOCUMENT TYPE: LEGAL NOTICE FOR WORK COMPLETION DELAY / BREACH OF CONTRACT

USER PROVIDED DETAILS:
Client (Sender): ${p.clientName || 'N/A'}
Client Address: ${p.clientAddress || 'N/A'}
Client Phone: ${p.clientPhone || 'N/A'}
Client Email: ${p.clientEmail || 'N/A'}

Contractor/Service Provider (Recipient): ${p.recipientName || p.contractorName || 'N/A'}
Contractor Address: ${p.recipientAddress || p.contractorAddress || 'N/A'}
Contractor Phone: ${p.recipientPhone || 'N/A'}
Contractor Email: ${p.recipientEmail || 'N/A'}

WORK/CONTRACT DETAILS:
- Nature of Work: ${p.workNature || 'N/A'}
- Agreement/Contract Date: ${p.agreementDate || p.contractDate || 'N/A'}
- Agreed Completion Date: ${p.agreedCompletionDate || 'N/A'}
- Total Work Value: ₹${p.workValue || '0'}
- Amount Paid So Far: ₹${p.amountPaid || '0'}
- Outstanding Payment: ₹${(p.workValue - p.amountPaid) || '0'}

DELAY & IMPACT DETAILS:
- Current Delay Duration: ${p.delayDuration || 'N/A'}
- Days Overdue: ${p.daysOverdue || 'N/A'}
- Reason for Delay (if stated): ${p.delayReason || 'No valid reason provided'}
- Impact on Client: ${p.delayImpact || 'Inconvenience and loss'}
- Any Additional Damage: ${p.additionalDamage || 'None'}

COMMUNICATION & EVIDENCE:
- Reminders Sent: ${p.remindersSent || 'Multiple'}
- Last Reminder Date: ${p.lastReminderDate || 'Recent'}
- Contractor Response: ${p.contractorResponse || 'No response/Excuses'}

DEMAND:
- New Completion Deadline: ${p.demandedCompletionDate || '7 days from notice'}
- Penalty/Compensation: ${p.penaltyAmount || 'As per contract / TBD'}

SPECIFIC FORMATTING INSTRUCTIONS FOR WORK DELAY NOTICE:
1. Start with centered heading: "LEGAL NOTICE"
2. Include TO (Contractor) and FROM (Client) sections with full addresses
3. Subject Line: "Re: Legal Notice for Non-Completion of Work and Breach of Contract"
4. Describe the contract/agreement (date, nature of work, agreed timeline, payment terms)
5. Describe work progress to date and what remains incomplete
6. Detail the delay (how many days overdue, reason for delay if stated)
7. Describe impact: delays in client's operations, financial loss, etc.
8. State previous reminders and contractor's non-compliance
9. Reference applicable laws: Indian Contract Act, 1872 (Breach of Contract); CPC (recovery)
10. Give new completion deadline (typically 7 days from receipt)
11. Warn of legal action for breach of contract, recovery of damages
12. Mention penalty clauses if any in the original contract
13. Include separate "DEMAND" section with new deadline and compensation claim
14. End with signature block, date, and notarization space
15. Use firm but professional tone (business context - enforce contract terms)

CRITICAL: Use ALL specific dates, amounts, and work details provided. Do NOT fabricate information.`,

    FNF_NOT_PAID: (p) => `DOCUMENT TYPE: LEGAL NOTICE FOR NON-PAYMENT OF FULL & FINAL (F&F) SETTLEMENT

USER PROVIDED DETAILS:
Employee (Sender): ${p.employeeName || 'N/A'}
Employee Address: ${p.employeeAddress || 'N/A'}
Employee Phone: ${p.employeePhone || 'N/A'}
Employee Email: ${p.employeeEmail || 'N/A'}
Employee ID: ${p.employeeId || 'N/A'}

Employer (Recipient): ${p.companyName || 'N/A'}
Employer Address: ${p.companyAddress || 'N/A'}
Employer Phone: ${p.employerPhone || 'N/A'}
HR Contact: ${p.hrContact || 'N/A'}

EMPLOYMENT DETAILS:
- Employee Designation: ${p.designation || 'N/A'}
- Date of Joining: ${p.dateOfJoining || 'N/A'}
- Last Working Date: ${p.lastWorkingDate || 'N/A'}
- Resignation/Termination Date: ${p.resignationDate || 'N/A'}
- Total Service Period: ${p.servicePeriod || 'N/A'}
- Employment Type: ${p.employmentType || 'Full-time'}

FULL & FINAL SETTLEMENT DETAILS:
- Total F&F Amount Due: ₹${p.settlementAmount || '0'}
- Salary Component: ₹${p.salaryComponent || '0'}
- Leave Encashment (${p.leaveDays || '0'} days): ₹${p.leaveEncashment || '0'}
- Gratuity/Bonus: ₹${p.gratuity || '0'}
- Other Components: ${p.otherComponents || 'None'}

PAYMENT HISTORY:
- When F&F Was Due: ${p.fnfDueDate || 'Upon resignation'}
- Days Since It Should Have Been Paid: ${p.daysSinceDue || 'N/A'}
- Reminders Sent: ${p.remindersSent || 'Multiple'}
- Last Reminder Date: ${p.lastReminderDate || 'Recent'}
- Employer's Response: ${p.employerResponse || 'No response / Excuses'}

DEMAND:
- Payment Deadline: ${p.paymentDeadline || '15 days from notice'}
- Account Details for Payment: ${p.paymentAccount || 'TBD'}

SPECIFIC FORMATTING INSTRUCTIONS FOR F&F NOTICE:
1. Start with centered heading: "LEGAL NOTICE"
2. Include TO (Company/Employer) and FROM (Employee) sections with full addresses
3. Subject Line: "Re: Legal Notice for Non-Payment of Full & Final Settlement"
4. Detail the employment (joining date, resignation date, tenure)
5. Specify all F&F components (salary, leaves, gratuity, bonuses)
6. Show calculation breakdown for each component
7. State when F&F should have been paid and how many days it's overdue
8. Describe previous reminders sent and company's non-compliance
9. Reference applicable laws:
   - Payment of Wages Act, 1936
   - Industrial Disputes Act, 1947
   - Labour Code, 2020
   - Employment contract terms
10. Warn of complaint to Labour Commissioner / Industrial Tribunal
11. Mention legal action for recovery with interest
12. Include separate "DEMAND" section with itemized settlement breakdown and payment deadline
13. Provide bank account details for payment
14. End with signature block, date, and notarization space
15. Use formal, professional tone (employee asserting legal rights)

CRITICAL: Include ALL employment dates, amounts, and leave details exactly as provided. Do NOT fabricate information.`,

    LOST_DOCUMENT_AFFIDAVIT: (p) => `DOCUMENT TYPE: AFFIDAVIT FOR LOSS OF DOCUMENT

DEPONENT INFORMATION:
- Full Name: ${p.fullName || 'N/A'}
- Father's/Husband's Name: ${p.parentName || 'N/A'}
- Date of Birth: ${p.dateOfBirth || 'N/A'}
- Age: ${p.age || 'N/A'}
- Nationality: ${p.nationality || 'Indian'}
- Occupation: ${p.occupation || 'N/A'}
- Address: ${p.address || p.residentialAddress || 'N/A'}

LOST DOCUMENT DETAILS:
- Type of Document: ${p.documentType || 'N/A'} (PAN, Aadhaar, RC Book, Certificate, etc.)
- Document Number/ID: ${p.documentNumber || 'N/A'}
- Issue Date: ${p.issueDate || 'N/A'}
- Issuing Authority: ${p.issuingAuthority || 'Government Authority'}
- Any Reference Number: ${p.referenceNumber || 'N/A'}

LOSS DETAILS:
- Date of Loss: ${p.lossDate || 'N/A'}
- Place of Loss: ${p.lossPlace || 'N/A'}
- Circumstances of Loss: ${p.lossCircumstances || 'Lost/Misplaced'}
- Steps Taken to Find: ${p.stepsToFind || 'Searched everywhere'}

ACTION TAKEN:
- FIR/Police Report: ${p.policeComplaint || 'Not filed yet'} (FIR No. if available: ${p.firNumber || 'N/A'})
- Police Station: ${p.policeStation || 'N/A'}
- Date of Report: ${p.reportDate || 'N/A'}

PURPOSE OF AFFIDAVIT:
- Reason for Affidavit: ${p.purpose || 'To obtain duplicate document'}
- Authority/Entity Requiring This: ${p.requiredBy || 'Government/Bank/School'}

SPECIFIC FORMATTING INSTRUCTIONS FOR LOST DOCUMENT AFFIDAVIT:
1. Start with centered heading: "AFFIDAVIT"
2. Include line: "Before the [Notary/Magistrate/Court]"
3. Begin with: "I, [Full Name], Son/Daughter of [Parent Name], aged [Age], Nationality [Nationality], Occupation [Occupation], residing at [Full Address] do hereby solemnly affirm and state as follows:"
4. Declaration 1: State identity and residential address
5. Declaration 2: Describe the lost/misplaced document (type, number, issuing authority)
6. Declaration 3: Describe when and where it was lost
7. Declaration 4: Explain circumstances of loss
8. Declaration 5: State that it has been lost and all search efforts have failed
9. Declaration 6: Confirm it has not been recovered
10. Declaration 7: State FIR/Police complaint details if filed
11. Declaration 8: Declare purpose of affidavit (obtaining duplicate/replacement)
12. Declaration 9: Declare that statements are true to best of knowledge
13. Include separate section: "VERIFICATION" (or "JURAT")
14. Verification states: "Verified at [Place] on [Date] that the above statements are true and correct"
15. Signature of deponent (with date and place)
16. Space for notary/magistrate seal and signature
17. Use formal, solemn affidavit language
18. Use "I declare" or "I state" language for each point

CRITICAL: Include ALL details exactly as provided. Affidavits must be truthful and accurate as they are sworn statements.`,

    NAME_CORRECTION_AFFIDAVIT: (p) => `DOCUMENT TYPE: AFFIDAVIT FOR NAME CORRECTION / RECTIFICATION

DEPONENT INFORMATION:
- Name (Currently In Records): ${p.incorrectName || 'N/A'}
- Correct/Actual Name: ${p.correctName || 'N/A'}
- Father's/Husband's Name: ${p.parentName || 'N/A'}
- Date of Birth: ${p.dateOfBirth || 'N/A'}
- Age: ${p.age || 'N/A'}
- Nationality: ${p.nationality || 'Indian'}
- Address: ${p.address || 'N/A'}

NAME ERROR DETAILS:
- Document Containing Error: ${p.documentType || 'N/A'} (e.g., School Certificate, Aadhaar, Pan Card, Bank Account, etc.)
- Document Number/Reference: ${p.documentNumber || 'N/A'}
- Issuing Authority: ${p.issuingAuthority || 'N/A'}
- Type of Error: ${p.errorType || 'Spelling variation / Name mismatch'}
- Nature of Difference: ${p.errorNature || 'Spelling differences'}
- How Error Occurred: ${p.errorReason || 'N/A'}
- Date Error Was Discovered: ${p.errorDiscoveredDate || 'N/A'}

IMPACT & REASON:
- Impact of Name Difference: ${p.impact || 'Difficulties in official transactions'}
- Reason for Correction Request: ${p.correctionReason || 'Clarity and official records update'}

DOCUMENTS AVAILABLE:
- Supporting Documents: ${p.supportingDocuments || 'School records, Birth certificate, etc.'}
- Other Identification Proof: ${p.otherProof || 'Aadhaar, Pan Card, Passport (if available)'}

SPECIFIC FORMATTING INSTRUCTIONS FOR NAME CORRECTION AFFIDAVIT:
1. Start with centered heading: "AFFIDAVIT"
2. Include line: "Before the [Notary/Magistrate]"
3. Begin with: "I, [Current Name], Son/Daughter of [Parent Name], aged [Age], Nationality [Nationality], residing at [Address] do hereby solemnly affirm as follows:"
4. Declaration 1: State your identity with both names
5. Declaration 2: State the full correct name
6. Declaration 3: Describe the document where name appears incorrectly
7. Declaration 4: Explain the difference between names (spelling, format, etc.)
8. Declaration 5: CRITICAL: Declare that "[Incorrect Name] and [Correct Name] are one and the same person"
9. Declaration 6: State how the error occurred
10. Declaration 7: Confirm both names refer to only one person (you)
11. Declaration 8: List documents proving identity under both names
12. Declaration 9: State purpose: correction of official records
13. Declaration 10: Declare that statements are true to best of knowledge
14. Include separate section: "VERIFICATION"
15. Verification: "Verified at [Place] on [Date] that the above statements are true and correct"
16. Signature of deponent with date and place
17. Space for notary/magistrate seal and signature
18. Use formal affidavit language throughout
19. CRITICAL: "Both names are of ONE PERSON ONLY" statement must be clear and prominent

CRITICAL: This is a sworn statement. All details must be factually accurate. Emphasize that both names refer to the SAME SINGLE PERSON.`,

    ADDRESS_PROOF_AFFIDAVIT: (p) => `DOCUMENT TYPE: AFFIDAVIT FOR ADDRESS PROOF / RESIDENTIAL PROOF

DEPONENT INFORMATION:
- Full Name: ${p.fullName || 'N/A'}
- Father's/Husband's Name: ${p.parentName || 'N/A'}
- Date of Birth: ${p.dateOfBirth || 'N/A'}
- Age: ${p.age || 'N/A'}
- Nationality: ${p.nationality || 'Indian'}
- Occupation: ${p.occupation || 'N/A'}

RESIDENTIAL ADDRESS (To Be Proved):
- Full Address: ${p.currentAddress || p.address || 'N/A'}
- Street/Colony: ${p.street || 'N/A'}
- City/Town: ${p.city || 'N/A'}
- District: ${p.district || 'N/A'}
- State: ${p.state || 'N/A'}
- Pin Code: ${p.pinCode || 'N/A'}

RESIDENCE DETAILS:
- Residing At This Address Since: ${p.residingSince || 'N/A'}
- Type of Residence: ${p.residenceType || 'Rented/Owned'}
- Property Owner/Landlord Name: ${p.landlordName || 'N/A'} (if rented)
- Monthly Rent (if applicable): ₹${p.monthlyRent || 'N/A'}

PURPOSE OF AFFIDAVIT:
- Reason for Address Proof: ${p.purpose || 'Bank / SIM card / School admission / Government benefits'}
- Authority/Entity Requiring This: ${p.requiredBy || 'N/A'}

SUPPORTING DOCUMENTS AVAILABLE:
- Documents Mentioned: ${p.supportingDocuments || 'Utility bills, Rent agreement, Lease deed, etc.'}
- Other Proof: ${p.otherProof || 'ID proof, Ration card, etc.'}

SPECIFIC FORMATTING INSTRUCTIONS FOR ADDRESS PROOF AFFIDAVIT:
1. Start with centered heading: "AFFIDAVIT"
2. Include line: "Before the [Notary/Magistrate]"
3. Begin with: "I, [Full Name], Son/Daughter of [Parent Name], aged [Age], Nationality [Nationality], Occupation [Occupation], residing at [Full Address] do hereby solemnly affirm and state as follows:"
4. Declaration 1: State full name and identity
5. Declaration 2: State complete residential address (street, area, city, district, state, PIN)
6. Declaration 3: State duration of residence at this address
7. Declaration 4: State type of residence (owned/rented)
8. Declaration 5: If rented, mention landlord name and rent amount
9. Declaration 6: State purpose of address proof (which entity/authority requires it)
10. Declaration 7: Declare that address is current and correct
11. Declaration 8: Mention supporting documents available (utility bills, rent receipt, etc.)
12. Declaration 9: State that statements are true to best of knowledge
13. Include separate section: "VERIFICATION"
14. Verification: "Verified at [Place] on [Date] that the above statements are true and correct"
15. Signature of deponent (with date and place)
16. Space for notary/magistrate seal and signature
17. Use formal affidavit language
18. Keep layout clear and professional

CRITICAL: Address must be complete with all details. This is a sworn statement certifying current residential proof.`,

    BANK_REQUEST_LETTER: (p) => `DOCUMENT TYPE: FORMAL REQUEST LETTER TO BANK

SENDER (CUSTOMER) DETAILS:
- Full Name: ${p.customerName || p.senderName || 'N/A'}
- Account Number: ${p.accountNumber || 'N/A'}
- Account Type: ${p.accountType || 'Savings/Current'}
- Mobile Number: ${p.contactNumber || p.customerPhone || 'N/A'}
- Email: ${p.customerEmail || 'N/A'}
- Full Address: ${p.customerAddress || p.senderAddress || 'N/A'}

BANK DETAILS:
- Bank Name: ${p.bankName || 'N/A'}
- Branch Name: ${p.branchName || 'N/A'}
- Branch Address: ${p.branchAddress || 'As per bank records'}
- Branch Code/IFSC: ${p.ifscCode || 'N/A'}

REQUEST DETAILS:
- Request Type: ${p.requestType || 'N/A'} (Account closure, Address change, Cheque book, Statement request, etc.)
- Specific Requirements: ${p.requestDetails || 'N/A'}
- Urgency: ${p.urgency || 'Standard'}
- Additional Information: ${p.additionalInfo || 'None'}

SUPPORTING DOCUMENTS:
- Documents Enclosed: ${p.supportingDocuments || 'Cheque book (if applicable), ID proof, etc.'}

SPECIFIC FORMATTING INSTRUCTIONS FOR BANK LETTER:
1. Top Left: Customer's full address
2. Top Right: Date in DD/MM/YYYY format
3. Addressee: The Branch Manager, [Bank Name], [Branch Address]
4. Salutation: "Dear Sir/Madam" or "Respected Sir/Madam"
5. Subject Line: Clear statement of request (e.g., "Re: Request for Account Closure", "Re: Request for Address Modification", etc.)
6. Body Paragraphs:
   - Paragraph 1: State purpose of letter clearly
   - Paragraph 2: Provide account details (account number, account type, name)
   - Paragraph 3: Specify exact request and requirements
   - Paragraph 4: If applicable, mention enclosures or supporting documents
   - Paragraph 5: Request for confirmation/acknowledgment and timeline
7. Closing: "Yours faithfully" or "Yours sincerely" (for formal letters)
8. Signature: Customer's full name (with account number)
9. Enclosures: List any documents attached
10. Tone: Professional, courteous, clear
11. Format: Professional business letter format
12. Ensure it mentions: Account number, full name, date clearly

CRITICAL: Letter should be formal, clear about what is being requested, and suitable for bank submission.`,

    RENT_RECEIPT: (p) => `DOCUMENT TYPE: RENT RECEIPT / RENT PAYMENT RECEIPT

RECEIPT IDENTIFICATION:
- Receipt Number: ${p.receiptNumber || 'Auto-generated'}
- Receipt Date: ${p.receiptDate || 'N/A'}
- Financial Year (if applicable): ${p.financialYear || 'Current'}

LANDLORD DETAILS (Rent Receiver):
- Full Name: ${p.landlordName || 'N/A'}
- Father's/Husband's Name: ${p.landlordFathersName || 'N/A'}
- Full Address: ${p.landlordAddress || 'N/A'}
- Contact Number: ${p.landlordPhone || 'N/A'}
- PAN Number: ${p.landlordPAN || 'N/A'}
- Aadhaar Number: ${p.landlordAadhaar || 'Not provided'}

TENANT DETAILS (Rent Payer):
- Full Name: ${p.tenantName || 'N/A'}
- Father's/Husband's Name: ${p.tenantFathersName || 'N/A'}
- Contact Number: ${p.tenantPhone || 'N/A'}
- Full Rental Property Address: ${p.propertyAddress || 'N/A'}

RENT PAYMENT DETAILS:
- Rent Period (Month/Year): ${p.rentPeriod || 'N/A'}
- Monthly Rent Amount: ₹${p.rentAmount || '0'}
- Number of Months: ${p.numberOfMonths || '1'}
- Total Amount Paid: ₹${p.totalAmount || p.rentAmount || '0'}
- Payment Mode: ${p.paymentMode || 'Cash/Cheque/Transfer'}
- Payment Date: ${p.paymentDate || 'N/A'}
- Cheque Number (if applicable): ${p.chequeNumber || 'N/A'}
- Reference Number: ${p.transactionReference || 'N/A'}

ADDITIONAL INFORMATION:
- Property Type: ${p.propertyType || 'Apartment/House'}
- Lease Period: ${p.leasePeriod || 'N/A'}
- Outstanding Balance: ₹${p.outstandingBalance || '0'} (if any)

SPECIFIC FORMATTING INSTRUCTIONS FOR RENT RECEIPT:
1. Top Center: Bold heading "RENT RECEIPT" or "RENT PAYMENT RECEIPT"
2. Receipt Number and Date prominently displayed at top
3. Landlord Details Section:
   - Full name, father's/husband's name
   - Complete address
   - PAN and Aadhaar (if applicable, for income tax/legal purposes)
4. Tenant Details Section:
   - Full name, father's/husband's name
   - Contact number
   - Full property address being rented
5. Rent Details Section (tabular or clear format):
   - Rent Period (Month and Year)
   - Monthly Rent Amount with ₹ symbol (CLEARLY VISIBLE)
   - Number of months (if multiple)
   - Total rent amount received
6. Payment Details:
   - How paid (Cash/Cheque/NEFT/RTGS)
   - Payment date
   - Cheque/Reference number if applicable
7. Certification: Simple statement like "Received ₹[Amount] towards rent for [Period] for the above property"
8. Signature Section:
   - Landlord signature with date
   - Landlord printed name
   - Space for landlord's seal/stamp (if business entity)
9. Footer: "For HRA Claims and Income Tax Purposes" (optional but recommended)
10. Format: Clean, professional, easy to read
11. Suitable for: HRA claims, income tax deduction, lease agreement evidence
12. Paper Quality: Should look official (can be on letterhead if landlord has one)

CRITICAL: Receipt must clearly show:
- Rent amount in clear format with ₹ symbol
- Receipt/lease period clearly
- Both parties' complete details
- Landlord's signature and date
- Use for HRA claims and tax purposes`,
  };

  const promptBuilder = prompts[documentType];
  if (!promptBuilder) {
    throw new Error(`No prompt template found for document type: ${documentType}`);
  }

  return promptBuilder(payload);
}
