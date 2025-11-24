export const DOCUMENT_TYPES = {
  // Legal Notices
  PAYMENT_DEFAULT: 'PAYMENT_DEFAULT',
  WORK_COMPLETION_DELAY: 'WORK_COMPLETION_DELAY',
  FNF_NOT_PAID: 'FNF_NOT_PAID',
  RENT_DEFAULT: 'RENT_DEFAULT',
  TENANT_EVICTION: 'TENANT_EVICTION',
  LANDLORD_HARASSMENT: 'LANDLORD_HARASSMENT',
  CHEQUE_BOUNCE: 'CHEQUE_BOUNCE',
  CONSUMER_COMPLAINT: 'CONSUMER_COMPLAINT',
  POSSESSION_DELAY: 'POSSESSION_DELAY',
  DEFAMATION: 'DEFAMATION',

  // Affidavits
  LOST_DOCUMENT_AFFIDAVIT: 'LOST_DOCUMENT_AFFIDAVIT',
  NAME_CORRECTION_AFFIDAVIT: 'NAME_CORRECTION_AFFIDAVIT',
  ADDRESS_PROOF_AFFIDAVIT: 'ADDRESS_PROOF_AFFIDAVIT',
  INCOME_DECLARATION: 'INCOME_DECLARATION',
  SELF_DECLARATION: 'SELF_DECLARATION',
  SIGNATURE_CHANGE_AFFIDAVIT: 'SIGNATURE_CHANGE_AFFIDAVIT',

  // Letters & Templates
  BANK_REQUEST_LETTER: 'BANK_REQUEST_LETTER',
  NOC_GENERAL: 'NOC_GENERAL',
  BONAFIDE_REQUEST: 'BONAFIDE_REQUEST',
  TRAVEL_CONSENT: 'TRAVEL_CONSENT',
  LEAVE_APPLICATION: 'LEAVE_APPLICATION',
  EXPERIENCE_LETTER: 'EXPERIENCE_LETTER',
  SALARY_CERTIFICATE: 'SALARY_CERTIFICATE',

  // Agreements & Receipts
  RENT_RECEIPT: 'RENT_RECEIPT',
  SIMPLE_RENTAL_AGREEMENT: 'SIMPLE_RENTAL_AGREEMENT',
  ROOMMATE_AGREEMENT: 'ROOMMATE_AGREEMENT',
  GIFT_DEED: 'GIFT_DEED',
  GPA_ROUTINE: 'GPA_ROUTINE',

  // Others
  NOTICE_TO_VACATE: 'NOTICE_TO_VACATE',
  MEETING_MINUTES: 'MEETING_MINUTES',
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

export interface DocumentTypeInfo {
  id: DocumentType;
  title: string;
  description: string;
  category: 'payment' | 'property' | 'employment' | 'consumer' | 'personal' | 'affidavit' | 'letter' | 'agreement';
  urgency: 'high' | 'medium' | 'low';
  isImplemented: boolean;
}

export const DOCUMENT_TYPE_INFO: Record<DocumentType, DocumentTypeInfo> = {
  [DOCUMENT_TYPES.PAYMENT_DEFAULT]: {
    id: DOCUMENT_TYPES.PAYMENT_DEFAULT,
    title: 'Payment Default Notice',
    description: 'Money not returned by friend, freelancer, contractor, or tenant',
    category: 'payment',
    urgency: 'high',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.WORK_COMPLETION_DELAY]: {
    id: DOCUMENT_TYPES.WORK_COMPLETION_DELAY,
    title: 'Work Completion / Contractor Delay Notice',
    description: 'For delayed work by painters, contractors, carpenters, plumbers',
    category: 'property',
    urgency: 'medium',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.FNF_NOT_PAID]: {
    id: DOCUMENT_TYPES.FNF_NOT_PAID,
    title: 'Full & Final Settlement Notice',
    description: 'F&F not paid after leaving a job',
    category: 'employment',
    urgency: 'high',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.RENT_DEFAULT]: {
    id: DOCUMENT_TYPES.RENT_DEFAULT,
    title: 'Tenant Rent Default Notice',
    description: 'Rent unpaid, tenant unresponsive (for landlords)',
    category: 'property',
    urgency: 'high',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.TENANT_EVICTION]: {
    id: DOCUMENT_TYPES.TENANT_EVICTION,
    title: 'Tenant Eviction Notice',
    description: 'Non-payment or property misuse (for landlords)',
    category: 'property',
    urgency: 'high',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.LANDLORD_HARASSMENT]: {
    id: DOCUMENT_TYPES.LANDLORD_HARASSMENT,
    title: 'Landlord Harassment / Rent Dispute Notice',
    description: 'Harassment or unfair rent increase (for tenants)',
    category: 'property',
    urgency: 'medium',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.CHEQUE_BOUNCE]: {
    id: DOCUMENT_TYPES.CHEQUE_BOUNCE,
    title: 'Cheque Bounce Notice (Sec 138 NI Act)',
    description: 'Time-sensitive legal notice for dishonored cheque',
    category: 'payment',
    urgency: 'high',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.CONSUMER_COMPLAINT]: {
    id: DOCUMENT_TYPES.CONSUMER_COMPLAINT,
    title: 'Consumer Complaint Legal Notice',
    description: 'Defective product, bad service, non-refund',
    category: 'consumer',
    urgency: 'medium',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.POSSESSION_DELAY]: {
    id: DOCUMENT_TYPES.POSSESSION_DELAY,
    title: 'Property Possession Delay Notice',
    description: 'Builder not delivering flat on time',
    category: 'property',
    urgency: 'high',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.DEFAMATION]: {
    id: DOCUMENT_TYPES.DEFAMATION,
    title: 'Defamation / Harassment Notice',
    description: 'Online or offline defamation, rumors, harassment',
    category: 'personal',
    urgency: 'high',
    isImplemented: false,
  },

  // Affidavits
  [DOCUMENT_TYPES.LOST_DOCUMENT_AFFIDAVIT]: {
    id: DOCUMENT_TYPES.LOST_DOCUMENT_AFFIDAVIT,
    title: 'Lost Document Affidavit',
    description: 'For lost PAN, Aadhaar, marksheets, RC book, certificates',
    category: 'affidavit',
    urgency: 'medium',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.NAME_CORRECTION_AFFIDAVIT]: {
    id: DOCUMENT_TYPES.NAME_CORRECTION_AFFIDAVIT,
    title: 'Name Correction Affidavit',
    description: 'Spelling errors in certificates, IDs, bank records',
    category: 'affidavit',
    urgency: 'medium',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.ADDRESS_PROOF_AFFIDAVIT]: {
    id: DOCUMENT_TYPES.ADDRESS_PROOF_AFFIDAVIT,
    title: 'Address Proof Affidavit',
    description: 'For banks, SIM cards, rental applications, school admissions',
    category: 'affidavit',
    urgency: 'low',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.INCOME_DECLARATION]: {
    id: DOCUMENT_TYPES.INCOME_DECLARATION,
    title: 'Income Declaration (Self-Employed)',
    description: 'For scholarships, schools, banks, visa applications',
    category: 'affidavit',
    urgency: 'medium',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.SELF_DECLARATION]: {
    id: DOCUMENT_TYPES.SELF_DECLARATION,
    title: 'Self-Declaration',
    description: 'For address, identity, relationship verification',
    category: 'affidavit',
    urgency: 'low',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.SIGNATURE_CHANGE_AFFIDAVIT]: {
    id: DOCUMENT_TYPES.SIGNATURE_CHANGE_AFFIDAVIT,
    title: 'Signature Change Affidavit',
    description: 'Required for banks and financial institutions',
    category: 'affidavit',
    urgency: 'medium',
    isImplemented: false,
  },

  // Letters & Templates
  [DOCUMENT_TYPES.BANK_REQUEST_LETTER]: {
    id: DOCUMENT_TYPES.BANK_REQUEST_LETTER,
    title: 'Bank Request Letter',
    description: 'Account closure, address change, cheque book, statement request',
    category: 'letter',
    urgency: 'low',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.NOC_GENERAL]: {
    id: DOCUMENT_TYPES.NOC_GENERAL,
    title: 'No Objection Certificate (NOC)',
    description: 'For property, job, school, bank, employer',
    category: 'letter',
    urgency: 'medium',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.BONAFIDE_REQUEST]: {
    id: DOCUMENT_TYPES.BONAFIDE_REQUEST,
    title: 'Bonafide Certificate Request',
    description: 'For visa, education, or employment',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.TRAVEL_CONSENT]: {
    id: DOCUMENT_TYPES.TRAVEL_CONSENT,
    title: 'Travel Consent for Minors',
    description: 'For flights, school trips, visa applications',
    category: 'letter',
    urgency: 'medium',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.LEAVE_APPLICATION]: {
    id: DOCUMENT_TYPES.LEAVE_APPLICATION,
    title: 'Leave Application',
    description: 'Medical, personal, emergency leave formats',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.EXPERIENCE_LETTER]: {
    id: DOCUMENT_TYPES.EXPERIENCE_LETTER,
    title: 'Experience Letter Template',
    description: 'Employer experience certificate format',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.SALARY_CERTIFICATE]: {
    id: DOCUMENT_TYPES.SALARY_CERTIFICATE,
    title: 'Salary Certificate',
    description: 'Income proof letter from employer',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },

  // Agreements & Receipts
  [DOCUMENT_TYPES.RENT_RECEIPT]: {
    id: DOCUMENT_TYPES.RENT_RECEIPT,
    title: 'Rent Receipt Generator',
    description: 'Monthly rent receipts for HRA claims',
    category: 'agreement',
    urgency: 'low',
    isImplemented: true,
  },
  [DOCUMENT_TYPES.SIMPLE_RENTAL_AGREEMENT]: {
    id: DOCUMENT_TYPES.SIMPLE_RENTAL_AGREEMENT,
    title: 'Simple Rental Agreement',
    description: 'Non-registration format for short-term rentals',
    category: 'agreement',
    urgency: 'medium',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.ROOMMATE_AGREEMENT]: {
    id: DOCUMENT_TYPES.ROOMMATE_AGREEMENT,
    title: 'Roommate Agreement',
    description: 'Simple format for sharing clarity',
    category: 'agreement',
    urgency: 'low',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.GIFT_DEED]: {
    id: DOCUMENT_TYPES.GIFT_DEED,
    title: 'Gift Deed (Movable Property)',
    description: 'For money, laptop, jewellery gifts',
    category: 'agreement',
    urgency: 'low',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.GPA_ROUTINE]: {
    id: DOCUMENT_TYPES.GPA_ROUTINE,
    title: 'General Power of Attorney',
    description: 'For routine matters (not property)',
    category: 'agreement',
    urgency: 'medium',
    isImplemented: false,
  },

  // Others
  [DOCUMENT_TYPES.NOTICE_TO_VACATE]: {
    id: DOCUMENT_TYPES.NOTICE_TO_VACATE,
    title: 'Notice to Vacate',
    description: '30-day or 60-day notice for tenants/landlords',
    category: 'property',
    urgency: 'medium',
    isImplemented: false,
  },
  [DOCUMENT_TYPES.MEETING_MINUTES]: {
    id: DOCUMENT_TYPES.MEETING_MINUTES,
    title: 'Minutes of Meeting (MOM)',
    description: 'For housing societies, clubs, small businesses',
    category: 'letter',
    urgency: 'low',
    isImplemented: false,
  },
};

export const DOCUMENT_CATEGORIES = [
  { id: 'all', label: 'All Documents' },
  { id: 'affidavit', label: 'Affidavits' },
  { id: 'letter', label: 'Letters & NOCs' },
  { id: 'agreement', label: 'Agreements & Receipts' },
  { id: 'payment', label: 'Payment Disputes' },
  { id: 'property', label: 'Property & Tenancy' },
  { id: 'employment', label: 'Employment' },
  { id: 'consumer', label: 'Consumer Rights' },
  { id: 'personal', label: 'Personal Disputes' },
] as const;
