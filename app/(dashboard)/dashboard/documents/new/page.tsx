'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DOCUMENT_TYPE_INFO, DOCUMENT_CATEGORIES, DocumentType } from '@/lib/document-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { generateDocument, DocumentType as ActionDocumentType } from '../actions';
import { useToast } from '@/hooks/use-toast';

// Import all form components
import LostDocumentAffidavitForm from '@/components/documents/LostDocumentAffidavitForm';
import NameCorrectionAffidavitForm from '@/components/documents/NameCorrectionAffidavitForm';
import AddressProofAffidavitForm from '@/components/documents/AddressProofAffidavitForm';
import BankRequestLetterForm from '@/components/documents/BankRequestLetterForm';
import RentReceiptForm from '@/components/documents/RentReceiptForm';
import PaymentDefaultForm from '@/components/documents/PaymentDefaultForm';
import WorkCompletionDelayForm from '@/components/documents/WorkCompletionDelayForm';
import FnfNotPaidForm from '@/components/documents/FnfNotPaidForm';
import RentDefaultForm from '@/components/documents/RentDefaultForm';

export default function NewDocumentPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const documentTypes = Object.values(DOCUMENT_TYPE_INFO);
  const filteredTypes = selectedCategory === 'all'
    ? documentTypes
    : documentTypes.filter(doc => doc.category === selectedCategory);

  if (selectedType) {
    return <DocumentForm documentType={selectedType} />;
  }

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12 pb-6 border-b border-border">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="mb-6 -ml-3">
              ← Documents
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">New document</h1>
          <p className="text-muted-foreground mt-2 text-sm">Select document type</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DOCUMENT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium transition-all border ${
                selectedCategory === category.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Document Type Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map((docType) => (
            <button
              key={docType.id}
              className={`p-6 border transition-all text-left group ${
                docType.isImplemented
                  ? 'border-border hover:border-foreground cursor-pointer'
                  : 'border-border cursor-not-allowed opacity-50'
              }`}
              onClick={() => docType.isImplemented && setSelectedType(docType.id)}
              disabled={!docType.isImplemented}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {docType.category}
                </span>
                <div className="flex gap-2">
                  {!docType.isImplemented && (
                    <span className="text-xs px-2 py-0.5 border border-muted-foreground text-muted-foreground">
                      COMING SOON
                    </span>
                  )}
                  {docType.urgency === 'high' && docType.isImplemented && (
                    <span className="text-xs px-2 py-0.5 border border-destructive text-destructive">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
              <h3 className={`font-semibold mb-2 ${docType.isImplemented ? 'text-foreground group-hover:underline' : 'text-muted-foreground'}`}>
                {docType.title}
              </h3>
              <p className="text-sm text-muted-foreground">{docType.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentForm({ documentType }: { documentType: DocumentType }) {
  const docInfo = DOCUMENT_TYPE_INFO[documentType];
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map document types from UI to action types
  const mapDocumentType = (type: DocumentType): ActionDocumentType | null => {
    const mapping: Record<string, ActionDocumentType> = {
      'LOST_DOCUMENT_AFFIDAVIT': 'LOST_DOCUMENT_AFFIDAVIT',
      'NAME_CORRECTION_AFFIDAVIT': 'NAME_CORRECTION_AFFIDAVIT',
      'ADDRESS_PROOF_AFFIDAVIT': 'ADDRESS_PROOF_AFFIDAVIT',
      'BANK_REQUEST_LETTER': 'BANK_REQUEST_LETTER',
      'RENT_RECEIPT': 'RENT_RECEIPT',
      'PAYMENT_DEFAULT': 'PAYMENT_DEFAULT',
      'WORK_COMPLETION_DELAY': 'WORK_COMPLETION_DELAY',
      'FNF_NOT_PAID': 'FNF_NOT_PAID',
      'RENT_DEFAULT': 'RENT_DEFAULT',
    };
    return mapping[type] || null;
  };

  const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedDocumentId, setGeneratedDocumentId] = useState<number | null>(null);

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    setGenerationStatus('loading');
    setGenerationError(null);

    try {
      const actionType = mapDocumentType(documentType);
      if (!actionType) {
        setGenerationError('This document type is not yet supported');
        setGenerationStatus('error');
        setIsSubmitting(false);
        return;
      }

      const result = await generateDocument({
        type: actionType,
        payload,
      });

      if (result.success && result.documentId) {
        setGenerationStatus('success');
        setGeneratedDocumentId(result.documentId);
        // Auto-redirect after showing success state for 1 second
        setTimeout(() => {
          router.push(`/dashboard/documents/${result.documentId}`);
        }, 1000);
      } else {
        setGenerationError(result.error || 'Failed to generate document');
        setGenerationStatus('error');
        setIsSubmitting(false);
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setGenerationStatus('error');
      setIsSubmitting(false);
    }
  };

  // Render the appropriate form based on document type
  const renderForm = () => {
    switch (documentType) {
      case 'LOST_DOCUMENT_AFFIDAVIT':
        return <LostDocumentAffidavitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'NAME_CORRECTION_AFFIDAVIT':
        return <NameCorrectionAffidavitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'ADDRESS_PROOF_AFFIDAVIT':
        return <AddressProofAffidavitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'BANK_REQUEST_LETTER':
        return <BankRequestLetterForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'RENT_RECEIPT':
        return <RentReceiptForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'PAYMENT_DEFAULT':
        return <PaymentDefaultForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'WORK_COMPLETION_DELAY':
        return <WorkCompletionDelayForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'FNF_NOT_PAID':
        return <FnfNotPaidForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 'RENT_DEFAULT':
        return <RentDefaultForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Form for {docInfo.title} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/dashboard/documents/new">
          <Button variant="ghost" size="sm" className="mb-6 -ml-3">
            ← Change type
          </Button>
        </Link>

        <div className="border border-border p-8">
          <div className="mb-8 pb-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground mb-2">{docInfo.title}</h1>
            <p className="text-sm text-muted-foreground">{docInfo.description}</p>
          </div>

          {renderForm()}
        </div>
      </div>

      {/* Loading Modal */}
      {generationStatus === 'loading' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border p-8 rounded-lg shadow-lg max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-foreground animate-spin" />
              <div className="text-center">
                <p className="text-foreground font-medium">Generating your document...</p>
                <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {generationStatus === 'success' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border p-8 rounded-lg shadow-lg max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="w-10 h-10 text-foreground" />
              <div className="text-center">
                <p className="text-foreground font-medium">Document generated successfully!</p>
                <p className="text-sm text-muted-foreground mt-1">Redirecting...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {generationStatus === 'error' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border border-destructive/30 p-8 rounded-lg shadow-lg max-w-sm mx-auto">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Generation Failed</h3>
                <p className="text-sm text-muted-foreground">{generationError}</p>
              </div>
              <button
                onClick={() => {
                  setGenerationStatus('idle');
                  setGenerationError(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setGenerationStatus('idle');
                  setGenerationError(null);
                }}
              >
                Try Again
              </Button>
              <Link href="/dashboard/documents" className="flex-1">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-primary hover:bg-accent"
                >
                  Go to Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
