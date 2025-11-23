import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { legalDocuments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const documentId = parseInt(resolvedParams.id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    // Fetch document - ensure it belongs to the authenticated user
    const [document] = await db
      .select()
      .from(legalDocuments)
      .where(
        and(
          eq(legalDocuments.id, documentId),
          eq(legalDocuments.userId, user.id)
        )
      );

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
