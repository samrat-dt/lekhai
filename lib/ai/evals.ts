/**
 * Document Quality Evaluation Suite for Lekhai
 *
 * This module provides automated evaluation tools to ensure consistent,
 * high-quality legal document generation using Perplexity API.
 */

import { DocumentType } from '@/app/(dashboard)/dashboard/documents/actions';

/**
 * Evaluation criteria for legal documents
 */
export interface EvaluationCriteria {
  // Structure checks
  hasProperTitle: boolean;
  hasRequiredSections: boolean;
  hasProperFormatting: boolean;

  // Content checks
  includesAllInputData: boolean;
  noFabricatedInformation: boolean;
  properLegalLanguage: boolean;

  // Indian legal context
  usesIndianDateFormat: boolean;
  usesIndianCurrency: boolean;
  followsIndianLegalConventions: boolean;

  // Quality checks
  noAIFluffWords: boolean;
  professionalTone: boolean;
  noTyposOrErrors: boolean;
}

export interface EvaluationResult {
  passed: boolean;
  score: number; // 0-100
  criteria: EvaluationCriteria;
  issues: string[];
  suggestions: string[];
}

/**
 * AI fluff words that should not appear in professional legal documents
 */
const AI_FLUFF_WORDS = [
  'delve',
  'meticulously',
  'tapestry',
  'realm',
  'landscape',
  'navigate',
  'robust',
  'leverage',
  'cutting-edge',
  'game-changing',
  'synergy',
  'paradigm',
  'holistic',
  'utilize' // prefer "use"
];

/**
 * Required sections for each document type
 */
const REQUIRED_SECTIONS: Record<string, string[]> = {
  LOST_DOCUMENT_AFFIDAVIT: [
    'AFFIDAVIT',
    'deponent',
    'verification',
    'signature'
  ],
  NAME_CORRECTION_AFFIDAVIT: [
    'AFFIDAVIT',
    'incorrect name',
    'correct name',
    'verification',
    'signature'
  ],
  ADDRESS_PROOF_AFFIDAVIT: [
    'AFFIDAVIT',
    'address',
    'verification',
    'signature'
  ],
  BANK_REQUEST_LETTER: [
    'Date',
    'Subject',
    'Dear Sir/Madam',
    'Account',
    'Yours'
  ],
  RENT_RECEIPT: [
    'RENT RECEIPT',
    'Receipt',
    'Landlord',
    'Tenant',
    'Amount',
    'Period'
  ],
  PAYMENT_DEFAULT: [
    'LEGAL NOTICE',
    'TO:',
    'FROM:',
    'SUBJECT',
    'demand',
    'deadline'
  ],
  WORK_COMPLETION_DELAY: [
    'LEGAL NOTICE',
    'TO:',
    'FROM:',
    'SUBJECT',
    'completion',
    'deadline'
  ],
  FNF_NOT_PAID: [
    'LEGAL NOTICE',
    'TO:',
    'FROM:',
    'SUBJECT',
    'settlement',
    'payment'
  ],
  RENT_DEFAULT: [
    'LEGAL NOTICE',
    'TO:',
    'FROM:',
    'SUBJECT',
    'rent',
    'eviction'
  ],
};

/**
 * Evaluate a generated legal document
 */
export function evaluateDocument(
  documentType: DocumentType,
  generatedContent: string,
  inputPayload: any
): EvaluationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Initialize criteria
  const criteria: EvaluationCriteria = {
    hasProperTitle: false,
    hasRequiredSections: false,
    hasProperFormatting: false,
    includesAllInputData: false,
    noFabricatedInformation: true, // Assume true, mark false if found
    properLegalLanguage: false,
    usesIndianDateFormat: false,
    usesIndianCurrency: false,
    followsIndianLegalConventions: false,
    noAIFluffWords: true, // Assume true, mark false if found
    professionalTone: true, // Assume true, mark false if found
    noTyposOrErrors: true, // Assume true, mark false if found
  };

  const contentLower = generatedContent.toLowerCase();

  // 1. Check for proper title
  const requiredSections = REQUIRED_SECTIONS[documentType] || [];
  if (requiredSections.length > 0 && contentLower.includes(requiredSections[0].toLowerCase())) {
    criteria.hasProperTitle = true;
  } else {
    issues.push(`Missing document title: ${requiredSections[0]}`);
  }

  // 2. Check for required sections
  const missingSections = requiredSections.filter(
    section => !contentLower.includes(section.toLowerCase())
  );
  if (missingSections.length === 0) {
    criteria.hasRequiredSections = true;
  } else {
    issues.push(`Missing sections: ${missingSections.join(', ')}`);
  }

  // 3. Check formatting
  const hasLineBreaks = generatedContent.includes('\n');
  const hasProperSpacing = /\n\n/.test(generatedContent);
  if (hasLineBreaks && hasProperSpacing) {
    criteria.hasProperFormatting = true;
  } else {
    issues.push('Poor formatting: needs better paragraph spacing');
  }

  // 4. Check if input data is included
  const inputValues = extractInputValues(inputPayload);
  const missingValues = inputValues.filter(
    value => !generatedContent.includes(value)
  );
  if (missingValues.length === 0) {
    criteria.includesAllInputData = true;
  } else {
    issues.push(`Missing input data: ${missingValues.slice(0, 3).join(', ')}`);
  }

  // 5. Check for AI fluff words
  const foundFluffWords = AI_FLUFF_WORDS.filter(
    word => contentLower.includes(word)
  );
  if (foundFluffWords.length > 0) {
    criteria.noAIFluffWords = false;
    issues.push(`Found AI fluff words: ${foundFluffWords.join(', ')}`);
    suggestions.push('Remove AI fluff words and use simpler, more direct language');
  }

  // 6. Check for Indian date format (DD/MM/YYYY or DD-MM-YYYY)
  const hasIndianDate = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(generatedContent);
  if (hasIndianDate) {
    criteria.usesIndianDateFormat = true;
  } else {
    suggestions.push('Ensure dates are in Indian format (DD/MM/YYYY)');
  }

  // 7. Check for Indian currency (₹ or Rs.)
  const hasIndianCurrency = /₹|Rs\.?/.test(generatedContent);
  if (hasIndianCurrency) {
    criteria.usesIndianCurrency = true;
  } else {
    if (inputPayload.amount || inputPayload.rentAmount || inputPayload.workValue) {
      issues.push('Missing Indian currency symbol (₹ or Rs.)');
    }
  }

  // 8. Check for proper legal language
  const hasLegalTerms = /hereby|whereof|whereas|aforementioned|undersigned|affidavit|notice|subject to/i.test(generatedContent);
  if (hasLegalTerms) {
    criteria.properLegalLanguage = true;
  } else {
    suggestions.push('Include appropriate legal terminology');
  }

  // 9. Check for Indian legal conventions
  const hasIndianContext = /india|indian|delhi|mumbai|bangalore|section \d+|act|code|supreme court|high court/i.test(generatedContent);
  if (hasIndianContext) {
    criteria.followsIndianLegalConventions = true;
  }

  // 10. Check professional tone (no casual language)
  const casualWords = ['gonna', 'wanna', 'yeah', 'nope', 'cool', 'awesome', 'guys'];
  const foundCasualWords = casualWords.filter(
    word => contentLower.includes(word)
  );
  if (foundCasualWords.length > 0) {
    criteria.professionalTone = false;
    issues.push(`Unprofessional language: ${foundCasualWords.join(', ')}`);
  }

  // 11. Check for common typos
  const commonTypos = ['recieve', 'occured', 'seperate', 'definitly', 'accomodate'];
  const foundTypos = commonTypos.filter(
    typo => contentLower.includes(typo)
  );
  if (foundTypos.length > 0) {
    criteria.noTyposOrErrors = false;
    issues.push(`Found typos: ${foundTypos.join(', ')}`);
  }

  // Calculate score
  const score = calculateScore(criteria);
  const passed = score >= 70; // 70% is passing

  return {
    passed,
    score,
    criteria,
    issues,
    suggestions,
  };
}

/**
 * Calculate score based on criteria (0-100)
 */
function calculateScore(criteria: EvaluationCriteria): number {
  const weights = {
    hasProperTitle: 10,
    hasRequiredSections: 15,
    hasProperFormatting: 5,
    includesAllInputData: 20,
    noFabricatedInformation: 15,
    properLegalLanguage: 10,
    usesIndianDateFormat: 5,
    usesIndianCurrency: 5,
    followsIndianLegalConventions: 5,
    noAIFluffWords: 5,
    professionalTone: 3,
    noTyposOrErrors: 2,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (criteria[key as keyof EvaluationCriteria]) {
      score += weight;
    }
  }

  return score;
}

/**
 * Extract significant values from input payload
 */
function extractInputValues(payload: any): string[] {
  const values: string[] = [];

  function extract(obj: any) {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string' && value.length > 2) {
        // Skip common placeholder values
        if (value === 'N/A' || value === 'Not specified' || value === 'Not available') {
          continue;
        }
        values.push(value);
      } else if (typeof value === 'number') {
        values.push(value.toString());
      } else if (typeof value === 'object' && value !== null) {
        extract(value);
      }
    }
  }

  extract(payload);
  return values;
}

/**
 * Test cases for document evaluation
 */
export const EVALUATION_TEST_CASES = [
  {
    name: 'Payment Default Notice - Valid',
    documentType: 'PAYMENT_DEFAULT' as DocumentType,
    payload: {
      creditorName: 'John Doe',
      creditorAddress: '123 Main Street, Mumbai',
      debtorName: 'Jane Smith',
      debtorAddress: '456 Park Avenue, Delhi',
      amount: '50000',
      paymentDate: '15/01/2024',
      transactionNature: 'Freelance work payment',
      reminderDates: '20/01/2024, 25/01/2024',
    },
    expectedScore: 80,
  },
  {
    name: 'Lost Document Affidavit - Valid',
    documentType: 'LOST_DOCUMENT_AFFIDAVIT' as DocumentType,
    payload: {
      fullName: 'Rajesh Kumar',
      parentName: 'Ram Kumar',
      dateOfBirth: '10/05/1990',
      address: 'Plot 45, Sector 12, Bangalore',
      documentType: 'PAN Card',
      documentNumber: 'ABCDE1234F',
      issueDate: '01/01/2020',
      issuingAuthority: 'Income Tax Department',
      lossDate: '15/02/2024',
      lossPlace: 'Local market, Bangalore',
      lossCircumstances: 'Lost wallet containing documents',
      policeComplaint: 'Filed at City Police Station',
    },
    expectedScore: 85,
  },
  {
    name: 'Rent Receipt - Valid',
    documentType: 'RENT_RECEIPT' as DocumentType,
    payload: {
      receiptNumber: 'RR-2024-001',
      receiptDate: '01/02/2024',
      landlordName: 'Priya Sharma',
      landlordAddress: 'A-101, Green Park, Delhi',
      landlordPAN: 'ABCDE1234F',
      tenantName: 'Amit Verma',
      propertyAddress: 'B-202, Blue Apartments, Delhi',
      rentPeriod: 'February 2024',
      rentAmount: '25000',
      paymentMode: 'Bank Transfer',
      paymentDate: '01/02/2024',
    },
    expectedScore: 90,
  },
];

/**
 * Run evaluation test suite
 */
export async function runEvaluationTests(): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    testName: string;
    passed: boolean;
    score: number;
    expectedScore: number;
    issues: string[];
  }>;
}> {
  const results: Array<{
    testName: string;
    passed: boolean;
    score: number;
    expectedScore: number;
    issues: string[];
  }> = [];

  let passed = 0;
  let failed = 0;

  // Note: This would require actual document generation to test
  // For now, this is a framework for testing

  console.log('Evaluation framework ready. Run tests by generating documents and calling evaluateDocument()');

  return {
    passed,
    failed,
    results,
  };
}

/**
 * Generate evaluation report
 */
export function generateEvaluationReport(result: EvaluationResult): string {
  const statusEmoji = result.passed ? '✓' : '✗';
  const status = result.passed ? 'PASSED' : 'FAILED';

  let report = `${statusEmoji} Document Evaluation: ${status} (Score: ${result.score}/100)\n\n`;

  report += 'Criteria Breakdown:\n';
  for (const [key, value] of Object.entries(result.criteria)) {
    const checkMark = value ? '✓' : '✗';
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    report += `  ${checkMark} ${label}\n`;
  }

  if (result.issues.length > 0) {
    report += '\nIssues Found:\n';
    result.issues.forEach((issue, index) => {
      report += `  ${index + 1}. ${issue}\n`;
    });
  }

  if (result.suggestions.length > 0) {
    report += '\nSuggestions:\n';
    result.suggestions.forEach((suggestion, index) => {
      report += `  ${index + 1}. ${suggestion}\n`;
    });
  }

  return report;
}
