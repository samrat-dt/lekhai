/**
 * Document Type Constants
 * Centralized configuration for all legal document types
 */

export const DOCUMENT_TYPES = {
  // Implemented (9)
  PAYMENT_DEFAULT: {
    id: 'PAYMENT_DEFAULT',
    title: 'Payment Default Notice',
    description: 'Money not returned by friend, freelancer, contractor, or tenant',
    category: 'payment',
    urgency: 'high',
    isImplemented: true,
  },
  RENT_DEFAULT: {
    id: 'RENT_DEFAULT',
    title: 'Rent Default Notice',
    description: 'Tenant rent payment overdue',
    category: 'property',
    urgency: 'high',
    isImplemented: true,
  },
  RENT_RECEIPT: {
    id: 'RENT_RECEIPT',
    title: 'Rent Receipt',
    description: 'Receipt for monthly rent payment',
    category: 'property',
    urgency: 'medium',
    isImplemented: true,
  },
  LOST_DOCUMENT_AFFIDAVIT: {
    id: 'LOST_DOCUMENT_AFFIDAVIT',
    title: 'Lost Document Affidavit',
    description: 'Affidavit for lost important documents',
    category: 'affidavit',
    urgency: 'medium',
    isImplemented: true,
  },
  NAME_CORRECTION_AFFIDAVIT: {
    id: 'NAME_CORRECTION_AFFIDAVIT',
    title: 'Name Correction Affidavit',
    description: 'Affidavit to correct name in official documents',
    category: 'affidavit',
    urgency: 'medium',
    isImplemented: true,
  },
  ADDRESS_PROOF_AFFIDAVIT: {
    id: 'ADDRESS_PROOF_AFFIDAVIT',
    title: 'Address Proof Affidavit',
    description: 'Affidavit as proof of residence',
    category: 'affidavit',
    urgency: 'low',
    isImplemented: true,
  },
  BANK_REQUEST_LETTER: {
    id: 'BANK_REQUEST_LETTER',
    title: 'Bank Request Letter',
    description: 'Letter to bank for account related requests',
    category: 'letter',
    urgency: 'medium',
    isImplemented: true,
  },
  FNF_NOT_PAID: {
    id: 'FNF_NOT_PAID',
    title: 'Full & Final Settlement Notice',
    description: 'Notice for pending final payment from employer',
    category: 'payment',
    urgency: 'high',
    isImplemented: true,
  },
  WORK_COMPLETION_DELAY: {
    id: 'WORK_COMPLETION_DELAY',
    title: 'Work Completion Delay Notice',
    description: 'Notice for delayed project/work completion',
    category: 'payment',
    urgency: 'high',
    isImplemented: true,
  },

  // Coming Soon (31)
  TENANT_EVICTION: {
    id: 'TENANT_EVICTION',
    title: 'Tenant Eviction Notice',
    description: 'Notice to evict tenant from property',
    category: 'property',
    urgency: 'high',
    isImplemented: false,
  },
  LANDLORD_HARASSMENT: {
    id: 'LANDLORD_HARASSMENT',
    title: 'Landlord Harassment Notice',
    description: 'Notice for landlord harassment or rent dispute',
    category: 'property',
    urgency: 'high',
    isImplemented: false,
  },
  CHEQUE_BOUNCE: {
    id: 'CHEQUE_BOUNCE',
    title: 'Cheque Bounce Notice',
    description: 'Legal notice for bounced cheque (Sec 138 NI Act)',
    category: 'payment',
    urgency: 'high',
    isImplemented: false,
  },
  CONSUMER_COMPLAINT: {
    id: 'CONSUMER_COMPLAINT',
    title: 'Consumer Complaint',
    description: 'Legal notice for consumer grievance',
    category: 'consumer',
    urgency: 'medium',
    isImplemented: false,
  },
  POSSESSION_DELAY: {
    id: 'POSSESSION_DELAY',
    title: 'Property Possession Delay Notice',
    description: 'Notice for delayed property possession',
    category: 'property',
    urgency: 'high',
    isImplemented: false,
  },
  DEFAMATION: {
    id: 'DEFAMATION',
    title: 'Defamation/Harassment Notice',
    description: 'Legal notice for defamation or harassment',
    category: 'personal',
    urgency: 'medium',
    isImplemented: false,
  },
  INCOME_DECLARATION: {
    id: 'INCOME_DECLARATION',
    title: 'Income Declaration Affidavit',
    description: 'Self-employment income declaration',
    category: 'affidavit',
    urgency: 'low',
    isImplemented: false,
  },
  SELF_DECLARATION: {
    id: 'SELF_DECLARATION',
    title: 'Self Declaration Affidavit',
    description: 'General self declaration',
    category: 'affidavit',
    urgency: 'low',
    isImplemented: false,
  },
  SIGNATURE_CHANGE_AFFIDAVIT: {
    id: 'SIGNATURE_CHANGE_AFFIDAVIT',
    title: 'Signature Change Affidavit',
    description: 'Affidavit for signature change',
    category: 'affidavit',
    urgency: 'low',
    isImplemented: false,
  },
  NOC_GENERAL: {
    id: 'NOC_GENERAL',
    title: 'No Objection Certificate',
    description: 'General NOC for various purposes',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  BONAFIDE_REQUEST: {
    id: 'BONAFIDE_REQUEST',
    title: 'Bonafide Certificate Request',
    description: 'Letter requesting bonafide certificate',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  TRAVEL_CONSENT: {
    id: 'TRAVEL_CONSENT',
    title: 'Travel Consent Letter',
    description: 'Consent letter for minor travel',
    category: 'letter',
    urgency: 'medium',
    isImplemented: false,
  },
  LEAVE_APPLICATION: {
    id: 'LEAVE_APPLICATION',
    title: 'Leave Application',
    description: 'Formal leave application template',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  EXPERIENCE_LETTER: {
    id: 'EXPERIENCE_LETTER',
    title: 'Experience Letter Template',
    description: 'Work experience letter template',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  SALARY_CERTIFICATE: {
    id: 'SALARY_CERTIFICATE',
    title: 'Salary Certificate',
    description: 'Employee salary certificate',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  SIMPLE_RENTAL_AGREEMENT: {
    id: 'SIMPLE_RENTAL_AGREEMENT',
    title: 'Simple Rental Agreement',
    description: 'Basic rental agreement template',
    category: 'agreement',
    urgency: 'medium',
    isImplemented: false,
  },
  ROOMMATE_AGREEMENT: {
    id: 'ROOMMATE_AGREEMENT',
    title: 'Roommate Agreement',
    description: 'Agreement between roommates',
    category: 'agreement',
    urgency: 'low',
    isImplemented: false,
  },
  GIFT_DEED: {
    id: 'GIFT_DEED',
    title: 'Gift Deed',
    description: 'Deed for gift of property/items',
    category: 'agreement',
    urgency: 'low',
    isImplemented: false,
  },
  GPA_ROUTINE: {
    id: 'GPA_ROUTINE',
    title: 'General Power of Attorney',
    description: 'General power of attorney template',
    category: 'agreement',
    urgency: 'medium',
    isImplemented: false,
  },
  NOTICE_TO_VACATE: {
    id: 'NOTICE_TO_VACATE',
    title: 'Notice to Vacate',
    description: 'Notice to vacate property',
    category: 'property',
    urgency: 'high',
    isImplemented: false,
  },
  MEETING_MINUTES: {
    id: 'MEETING_MINUTES',
    title: 'Minutes of Meeting',
    description: 'Meeting minutes template',
    category: 'agreement',
    urgency: 'low',
    isImplemented: false,
  },
} as const;

export type DocumentTypeKey = keyof typeof DOCUMENT_TYPES;
export type DocumentType = typeof DOCUMENT_TYPES[DocumentTypeKey];

export const IMPLEMENTED_DOCUMENTS = Object.values(DOCUMENT_TYPES).filter(doc => doc.isImplemented);
export const COMING_SOON_DOCUMENTS = Object.values(DOCUMENT_TYPES).filter(doc => !doc.isImplemented);

export const DOCUMENT_CATEGORIES = [
  { id: 'payment', label: 'Payment Issues', icon: '💰' },
  { id: 'property', label: 'Property & Rental', icon: '🏠' },
  { id: 'affidavit', label: 'Affidavits', icon: '📋' },
  { id: 'letter', label: 'Letters & Certificates', icon: '📄' },
  { id: 'agreement', label: 'Agreements', icon: '📝' },
  { id: 'consumer', label: 'Consumer Issues', icon: '🛡️' },
  { id: 'personal', label: 'Personal', icon: '👤' },
  { id: 'employment', label: 'Employment', icon: '💼' },
];

export const URGENCY_LEVELS = {
  high: { label: 'Urgent', color: 'red', priority: 1 },
  medium: { label: 'Important', color: 'yellow', priority: 2 },
  low: { label: 'Standard', color: 'green', priority: 3 },
};

// Credit cost (1 credit = 1 document for all types)
export const CREDIT_PER_DOCUMENT = 1;

// Document generation limits
export const RATE_LIMITS = {
  DOCUMENTS_PER_HOUR: 10,
  DOCUMENTS_PER_DAY: 100,
};
