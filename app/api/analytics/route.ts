import { NextResponse } from 'next/server';
import { getSystemMetrics } from '@/lib/analytics';
import { getSession } from '@/lib/auth/session';
import { getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/analytics - Get comprehensive system metrics
 * Requires authenticated user with admin role
 * Query params: days (7, 30, 90, etc.)
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userList = await db.select().from(users).where(eq(users.id, session.user.id));
    const user = userList[0];
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const days = Number(url.searchParams.get('days')) || 30;
    const metrics = await getSystemMetrics(days);

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
