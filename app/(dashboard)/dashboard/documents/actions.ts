'use server';

import { db } from '@/lib/db/drizzle';
import { legalDocuments, userCredits, creditTransactions, activityLogs, ActivityType } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { rateLimitDocument } from '@/lib/rate-limit';
import { sanitizePayloadForLLM, validateNoExcessiveRepetition } from '@/lib/llm-sanitize';
import { generateWithPerplexity, buildDocumentPrompt, LEGAL_DOCUMENT_SYSTEM_PROMPT, PERPLEXITY_MODELS } from '@/lib/ai/perplexity';
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

// Perplexity API configuration (migrated from OpenRouter)
// Using Perplexity's chat models for high-quality document generation
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

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

// Note: System prompts and user prompts have been migrated to lib/ai/perplexity.ts
// The buildDocumentPrompt function in perplexity.ts now handles all document-specific prompt generation

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

    // Step 1.5: Rate limit document generation (10 per hour per user)
    const rateLimitResult = await rateLimitDocument(`user:${user.id}`);
    if (!rateLimitResult.success) {
      const resetTime = rateLimitResult.reset
        ? new Date(rateLimitResult.reset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : 'soon';
      return {
        success: false,
        error: `Rate limit exceeded. You can generate more documents at ${resetTime}. Limit: ${rateLimitResult.limit}/hour.`,
      };
    }

    // Step 1.6: Sanitize payload to prevent prompt injection
    const sanitizedPayload = sanitizePayloadForLLM(params.payload);

    // Validate no excessive repetition (token exhaustion attack)
    const payloadString = JSON.stringify(sanitizedPayload);
    if (!validateNoExcessiveRepetition(payloadString)) {
      return {
        success: false,
        error: 'Invalid input detected. Please check your input and try again.',
      };
    }

    // Step 2: Create document record in PENDING state
    const title = params.title || generateTitle(params.type, params.payload);

    const [document] = await db
      .insert(legalDocuments)
      .values({
        userId: user.id,
        type: params.type,
        title,
        inputPayload: JSON.stringify(sanitizedPayload),
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

      // Step 5: Generate document using Perplexity API
      if (!PERPLEXITY_API_KEY) {
        throw new Error('PERPLEXITY_API_KEY is not configured');
      }

      // Use the new Perplexity integration
      const userPrompt = buildDocumentPrompt(params.type, sanitizedPayload);
      const perplexityResult = await generateWithPerplexity(
        LEGAL_DOCUMENT_SYSTEM_PROMPT,
        userPrompt,
        {
          model: PERPLEXITY_MODELS.SONAR_PRO, // Best quality model for legal documents
          temperature: 0.2, // Low temperature for consistent legal language
          maxTokens: 4096,
        }
      );

      if (perplexityResult.error) {
        throw new Error(`Perplexity API error: ${perplexityResult.error}`);
      }

      const generatedContent = perplexityResult.content;

      if (!generatedContent || generatedContent.trim() === '') {
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
