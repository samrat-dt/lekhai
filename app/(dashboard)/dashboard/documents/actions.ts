'use server';

import { db } from '@/lib/db/drizzle';
import { legalDocuments, userCredits, creditTransactions } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
// Document type union
export type DocumentType =
  | 'LOST_DOCUMENT_AFFIDAVIT'
  | 'NAME_CORRECTION_AFFIDAVIT'
  | 'ADDRESS_PROOF_AFFIDAVIT'
  | 'BANK_REQUEST_LETTER'
  | 'RENT_RECEIPT'
  | 'PAYMENT_DEFAULT'
  | 'WORK_COMPLETION_DELAY'
  | 'FNF_NOT_PAID'
  | 'RENT_DEFAULT'
  | 'TENANT_EVICTION'
  | 'LANDLORD_HARASSMENT'
  | 'CHEQUE_BOUNCE'
  | 'CONSUMER_COMPLAINT'
  | 'POSSESSION_DELAY'
  | 'DEFAMATION';

export interface GenerateDocumentParams {
  type: DocumentType;
  title?: string;
  payload: any;
}

export interface GenerateDocumentResult {
  success: boolean;
  documentId?: number;
  error?: string;
  message?: string;
}

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Free models available on OpenRouter:
// - meta-llama/llama-3.1-8b-instruct:free
// - google/gemma-2-9b-it:free
// - microsoft/phi-3-mini-128k-instruct:free
// - nousresearch/hermes-3-llama-3.1-405b:free (best quality, free tier)
const FREE_MODEL = 'nousresearch/hermes-3-llama-3.1-405b:free';

// Generate title if not provided
const generateTitle = (type: DocumentType, payload: any): string => {
  const date = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  switch (type) {
    case 'LOST_DOCUMENT_AFFIDAVIT':
      return `Lost ${payload.documentType || 'Document'} Affidavit – ${date}`;
    case 'NAME_CORRECTION_AFFIDAVIT':
      return `Name Correction Affidavit – ${date}`;
    case 'ADDRESS_PROOF_AFFIDAVIT':
      return `Address Proof Affidavit – ${date}`;
    case 'BANK_REQUEST_LETTER':
      return `Bank ${payload.requestType?.replace('_', ' ') || 'Request'} Letter – ${date}`;
    case 'RENT_RECEIPT':
      return `Rent Receipt – ${payload.rentPeriod || date}`;
    case 'PAYMENT_DEFAULT':
      return `Payment Default Notice – ₹${payload.amountOwed || '0'}`;
    case 'WORK_COMPLETION_DELAY':
      return `Work Delay Notice – ${payload.recipientName || 'Contractor'}`;
    case 'FNF_NOT_PAID':
      return `F&F Settlement Notice – ${payload.companyName || 'Company'}`;
    case 'RENT_DEFAULT':
      return `Rent Default Notice – ${payload.tenantName || 'Tenant'}`;
    case 'TENANT_EVICTION':
      return `Eviction Notice – ${date}`;
    case 'LANDLORD_HARASSMENT':
      return `Landlord Dispute Notice – ${date}`;
    case 'CHEQUE_BOUNCE':
      return `Cheque Bounce Notice – ${date}`;
    case 'CONSUMER_COMPLAINT':
      return `Consumer Complaint – ${date}`;
    case 'POSSESSION_DELAY':
      return `Possession Delay Notice – ${date}`;
    case 'DEFAMATION':
      return `Defamation Notice – ${date}`;
    default:
      return `Legal Document – ${date}`;
  }
};

// Get document-specific system prompt
const getSystemPrompt = (type: DocumentType): string => {
  const baseInstructions = `You are a legal document drafting assistant for India. Generate professional, legally sound documents in Indian English.

CRITICAL FORMATTING RULES:
- Use clear section headings
- Use proper legal language but keep it accessible
- Include all relevant clauses and details from the provided information
- Use Indian date format (DD/MM/YYYY)
- Use ₹ for currency
- Be precise and factual
- Do not use em dashes, use hyphens or commas
- Do not use AI fluff words like "delve", "meticulously", "tapestry", etc.
- Keep the tone ${type.includes('AFFIDAVIT') ? 'formal and declarative' : 'professional and direct'}`;

  switch (type) {
    case 'LOST_DOCUMENT_AFFIDAVIT':
      return `${baseInstructions}

Format as a sworn affidavit with:
- Title: AFFIDAVIT
- Deponent details (I, [name], son/daughter/wife of [father/husband name], aged [age] years, residing at...)
- Numbered paragraphs stating facts
- Declaration of truth
- Verification clause
- Deponent signature line
- Place and date of execution`;

    case 'NAME_CORRECTION_AFFIDAVIT':
      return `${baseInstructions}

Format as a sworn affidavit with:
- Title: AFFIDAVIT FOR NAME CORRECTION
- Deponent details
- Clear statement of incorrect name vs correct name
- Reason for discrepancy
- Declaration that both names refer to the same person
- Purpose of affidavit
- Verification clause`;

    case 'ADDRESS_PROOF_AFFIDAVIT':
      return `${baseInstructions}

Format as a sworn affidavit with:
- Title: AFFIDAVIT FOR ADDRESS PROOF
- Deponent details
- Statement of current residential address
- Duration of residence
- Purpose of affidavit
- Supporting documents mentioned
- Verification clause`;

    case 'BANK_REQUEST_LETTER':
      return `${baseInstructions}

Format as a formal business letter with:
- Date (top right)
- Recipient (Branch Manager, [Bank Name])
- Subject line
- Salutation (Dear Sir/Madam)
- Body with account details and clear request
- Closing (Yours faithfully/sincerely)
- Signature line with name`;

    case 'RENT_RECEIPT':
      return `${baseInstructions}

Format as a rent receipt with:
- Title: RENT RECEIPT
- Receipt number and date
- Landlord details
- Tenant details
- Property address
- Amount received (in figures and words)
- Period for which rent is paid
- Payment mode and details
- Landlord signature line`;

    case 'PAYMENT_DEFAULT':
    case 'WORK_COMPLETION_DELAY':
    case 'FNF_NOT_PAID':
    case 'RENT_DEFAULT':
    case 'TENANT_EVICTION':
    case 'LANDLORD_HARASSMENT':
    case 'CHEQUE_BOUNCE':
    case 'CONSUMER_COMPLAINT':
    case 'POSSESSION_DELAY':
    case 'DEFAMATION':
      return `${baseInstructions}

Format as a legal notice with:
- Title: LEGAL NOTICE
- Date
- TO: [Recipient details]
- FROM: [Sender details]
- SUBJECT: [Brief description]
- Body with:
  1. Reference to facts and relationship
  2. Statement of the grievance/default
  3. Legal position and rights
  4. Clear demand with deadline
  5. Consequences if demand not met
- Closing statement
- Signature line for sender`;

    default:
      return baseInstructions;
  }
};

// Get user prompt based on document type and payload
const getUserPrompt = (type: DocumentType, payload: any): string => {
  return `Generate a ${type.toLowerCase().replace(/_/g, ' ')} based on the following information:

${JSON.stringify(payload, null, 2)}

Important:
- Use all provided details accurately
- Do not add fictional information
- If optional fields are empty, omit them gracefully
- Follow Indian legal formatting conventions
- Be concise but complete`;
};

/**
 * Main function to generate a legal document
 * This handles:
 * 1. User authentication
 * 2. Credit check and deduction
 * 3. Database record creation
 * 4. LLM generation via Claude API
 * 5. Result storage and transaction logging
 */
export async function generateDocument(
  params: GenerateDocumentParams
): Promise<GenerateDocumentResult> {
  try {
    // Step 1: Get authenticated user
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // Step 2: Create document record in PENDING state
    const title = params.title || generateTitle(params.type, params.payload);

    const [document] = await db
      .insert(legalDocuments)
      .values({
        userId: user.id,
        type: params.type,
        title,
        inputPayload: JSON.stringify(params.payload),
        status: 'PENDING',
      })
      .returning();

    try {
      // Step 3: Atomically deduct credit with check (prevents race condition)
      const result = await db
        .update(userCredits)
        .set({
          credits: sql`${userCredits.credits} - 1`,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userCredits.userId, user.id),
            sql`${userCredits.credits} >= 1`
          )
        )
        .returning();

      // If no rows updated, user had insufficient credits
      if (result.length === 0) {
        // Delete the pending document
        await db
          .delete(legalDocuments)
          .where(eq(legalDocuments.id, document.id));

        return {
          success: false,
          error: 'Insufficient credits. Please purchase credits to continue.',
        };
      }

      // Log credit transaction
      await db.insert(creditTransactions).values({
        userId: user.id,
        change: -1,
        reason: 'DOCUMENT_GENERATION',
        metadata: JSON.stringify({ documentType: params.type }),
        documentId: document.id,
      });

      // Step 5: Generate document using OpenRouter API
      if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.BASE_URL || 'http://localhost:3003',
          'X-Title': 'Lekhai - Legal Document Generator',
        },
        body: JSON.stringify({
          model: FREE_MODEL,
          messages: [
            {
              role: 'system',
              content: getSystemPrompt(params.type),
            },
            {
              role: 'user',
              content: getUserPrompt(params.type, params.payload),
            },
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${error}`);
      }

      const data = await response.json();
      const generatedContent = data.choices?.[0]?.message?.content;

      if (!generatedContent) {
        throw new Error('No content generated from LLM');
      }

      // Step 6: Update document with generated content
      await db
        .update(legalDocuments)
        .set({
          generatedContent,
          status: 'GENERATED',
          updatedAt: new Date(),
        })
        .where(eq(legalDocuments.id, document.id));

      // Revalidate documents page
      revalidatePath('/dashboard/documents');

      return {
        success: true,
        documentId: document.id,
        message: 'Document generated successfully',
      };
    } catch (error) {
      // On failure, mark document as FAILED and refund credit
      await db
        .update(legalDocuments)
        .set({
          status: 'FAILED',
          updatedAt: new Date(),
        })
        .where(eq(legalDocuments.id, document.id));

      // Refund credit atomically
      await db
        .update(userCredits)
        .set({
          credits: sql`${userCredits.credits} + 1`,
          updatedAt: new Date()
        })
        .where(eq(userCredits.userId, user.id));

      // Log refund transaction
      await db.insert(creditTransactions).values({
        userId: user.id,
        change: 1,
        reason: 'DOCUMENT_GENERATION',
        metadata: JSON.stringify({
          documentType: params.type,
          refund: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        }),
        documentId: document.id,
      });

      console.error('Document generation error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate document',
        message: 'Your credit has been refunded',
      };
    }
  } catch (error) {
    console.error('Document generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
