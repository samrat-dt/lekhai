'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Copy, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { generatePDF, generateNotaryPDF } from '@/lib/pdf/generator';

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Document {
  id: number;
  title: string;
  type: string;
  status: string;
  generatedContent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    async function initParams() {
      const resolvedParams = await params;
      setDocumentId(resolvedParams.id);
    }
    initParams();
  }, [params]);

  useEffect(() => {
    if (!documentId) return;

    async function fetchDocument() {
      try {
        const response = await fetch(`/api/documents/${documentId}`);

        if (response.status === 401) {
          router.push('/sign-in');
          return;
        }

        if (response.status === 404) {
          setError('Document not found');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }

        const data = await response.json();
        setDocument(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [documentId, router]);

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-red-600">{error || 'Document not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border border-border text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-muted-foreground" />
            Generating
          </span>
        );
      case 'GENERATED':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border border-foreground text-foreground">
            <span className="w-1.5 h-1.5 bg-foreground" />
            Ready
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border border-destructive text-destructive">
            <span className="w-1.5 h-1.5 bg-destructive" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-border">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm" className="mb-6 -ml-3">
              ← Documents
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{document.title}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(document.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
            {getStatusBadge(document.status)}
          </div>
        </div>

        {/* Actions */}
        {document.status === 'GENERATED' && document.generatedContent && (
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(document.generatedContent || '');
                alert('Copied to clipboard');
              }}
              variant="outline"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              onClick={() => {
                generatePDF({
                  title: document.title,
                  content: document.generatedContent || '',
                  documentType: document.type,
                  createdDate: new Date(document.createdAt)
                });
              }}
              variant="outline"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={() => {
                generateNotaryPDF({
                  title: document.title,
                  content: document.generatedContent || '',
                  documentType: document.type,
                  createdDate: new Date(document.createdAt)
                });
              }}
              variant="outline"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF (Notary)
            </Button>
            <Button
              onClick={() => {
                const blob = new Blob([document.generatedContent || ''], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = window.document.createElement('a');
                a.href = url;
                a.download = `${document.title}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Text
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="border border-border bg-background">
          {document.status === 'PENDING' && (
            <div className="p-16 text-center">
              <div className="w-12 h-12 mx-auto mb-6 border-2 border-muted-foreground animate-pulse" />
              <h3 className="text-lg font-medium text-foreground mb-2">Generating document</h3>
              <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
            </div>
          )}

          {document.status === 'FAILED' && (
            <div className="p-16 text-center">
              <div className="w-12 h-12 mx-auto mb-6 border-2 border-destructive" />
              <h3 className="text-lg font-medium text-foreground mb-2">Generation failed</h3>
              <p className="text-sm text-muted-foreground mb-6">Credit refunded</p>
              <Link href="/dashboard/documents/new">
                <Button className="bg-primary hover:bg-accent">
                  Create new document
                </Button>
              </Link>
            </div>
          )}

          {document.status === 'GENERATED' && document.generatedContent && (
            <div className="p-8 md:p-12">
              <pre className="whitespace-pre-wrap font-document text-sm leading-relaxed text-foreground">
                {document.generatedContent}
              </pre>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Type</div>
              <div className="font-medium text-foreground">{document.type.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Status</div>
              <div className="font-medium text-foreground">{document.status}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Created</div>
              <div className="font-medium text-foreground">
                {new Date(document.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Updated</div>
              <div className="font-medium text-foreground">
                {new Date(document.updatedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
