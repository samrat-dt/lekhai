import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { legalDocuments, userCredits } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { DOCUMENT_TYPE_INFO } from '@/lib/document-types';

export default async function DocumentsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get user's documents
  const documents = await db
    .select()
    .from(legalDocuments)
    .where(eq(legalDocuments.userId, user.id))
    .orderBy(desc(legalDocuments.createdAt));

  // Get user's credit balance
  const [credits] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, user.id));

  const creditBalance = credits?.credits || 0;

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Documents</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {creditBalance} {creditBalance === 1 ? 'credit' : 'credits'} remaining
            </p>
          </div>
          <Link href="/dashboard/documents/new">
            <Button className="bg-primary hover:bg-accent transition-colors">
              New document
            </Button>
          </Link>
        </div>

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="text-center py-20 border border-border bg-muted/20">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-muted-foreground/20" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first document to get started</p>
            <Link href="/dashboard/documents/new">
              <Button className="bg-primary hover:bg-accent">
                Create document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-3">Title</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Urgency</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            <div className="divide-y divide-border">
              {documents.map((doc) => {
                const docInfo = DOCUMENT_TYPE_INFO[doc.type as keyof typeof DOCUMENT_TYPE_INFO];
                const urgency = docInfo?.urgency || 'low';

                return (
                  <Link
                    key={doc.id}
                    href={`/dashboard/documents/${doc.id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="col-span-3">
                      <div className="text-sm font-medium text-foreground">{doc.title}</div>
                    </div>
                    <div className="col-span-3">
                      <div className="text-sm text-muted-foreground">
                        {doc.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={doc.status} />
                    </div>
                    <div className="col-span-1">
                      <UrgencyBadge urgency={urgency} />
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium text-foreground">
                      →
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Credit Warning */}
        {creditBalance === 0 && (
          <div className="mt-8 p-4 border-l-2 border-destructive bg-destructive/5">
            <p className="text-sm text-foreground">
              No credits remaining. <Link href="/pricing" className="underline font-medium">Purchase credits</Link> to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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
}

function UrgencyBadge({ urgency }: { urgency: 'high' | 'medium' | 'low' }) {
  switch (urgency) {
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-destructive text-destructive">
          <AlertCircle className="w-3 h-3" />
          High
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-foreground/50 text-foreground">
          <AlertTriangle className="w-3 h-3" />
          Med
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-muted-foreground/30 text-muted-foreground">
          <Info className="w-3 h-3" />
          Low
        </span>
      );
    default:
      return null;
  }
}
