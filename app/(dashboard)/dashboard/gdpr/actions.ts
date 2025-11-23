'use server';

import { db } from '@/lib/db/drizzle';
import {
  users,
  legalDocuments,
  userCredits,
  creditTransactions,
  teamMembers,
  activityLogs,
} from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

/**
 * GDPR Article 15 - Right to Access
 * Export all user data in a machine-readable format (JSON)
 */
export async function exportUserData() {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    // Gather all user data from all tables
    const [userInfo] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const documents = await db
      .select()
      .from(legalDocuments)
      .where(eq(legalDocuments.userId, user.id));

    const [credits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, user.id))
      .limit(1);

    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, user.id));

    const memberships = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id));

    const activities = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, user.id));

    // Remove sensitive data before export
    const sanitizedUser = {
      ...userInfo,
      passwordHash: undefined, // Never export password hash
    };

    const exportData = {
      exportDate: new Date().toISOString(),
      exportReason: 'GDPR Article 15 - Right to Access',
      userData: {
        profile: sanitizedUser,
        credits: credits,
        documents: documents.map(doc => ({
          ...doc,
          // Keep all document data for user's records
        })),
        creditTransactions: transactions,
        teamMemberships: memberships,
        activityLog: activities,
      },
      statistics: {
        totalDocuments: documents.length,
        totalCreditsSpent: transactions
          .filter(t => t.change < 0)
          .reduce((sum, t) => sum + Math.abs(t.change), 0),
        totalCreditsPurchased: transactions
          .filter(t => t.change > 0)
          .reduce((sum, t) => sum + t.change, 0),
        accountCreated: userInfo.createdAt,
        lastActivity: activities.length > 0
          ? activities[activities.length - 1].timestamp
          : userInfo.createdAt,
      },
    };

    return {
      success: true,
      data: exportData,
      message: 'User data exported successfully',
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export data',
    };
  }
}

/**
 * GDPR Article 17 - Right to Erasure (Right to be Forgotten)
 * Permanently delete all user data
 */
export async function deleteUserData(password: string) {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    // Verify password for security
    const { comparePasswords } = await import('@/lib/auth/session');
    const isPasswordValid = await comparePasswords(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Incorrect password. Data deletion failed.',
      };
    }

    // Log the deletion request
    await db.insert(activityLogs).values({
      teamId: 0, // System action
      userId: user.id,
      action: 'GDPR_DATA_DELETION_REQUEST',
      ipAddress: '',
    });

    // Delete all user data (cascading deletes)
    // Order matters - delete child records first

    // 1. Delete credit transactions
    await db
      .delete(creditTransactions)
      .where(eq(creditTransactions.userId, user.id));

    // 2. Delete legal documents
    await db
      .delete(legalDocuments)
      .where(eq(legalDocuments.userId, user.id));

    // 3. Delete user credits
    await db
      .delete(userCredits)
      .where(eq(userCredits.userId, user.id));

    // 4. Delete team memberships
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, user.id));

    // 5. Anonymize activity logs (keep for audit but remove PII)
    await db
      .update(activityLogs)
      .set({
        userId: null,
        ipAddress: 'REDACTED',
      })
      .where(eq(activityLogs.userId, user.id));

    // 6. Finally, delete user account (hard delete, not soft delete)
    await db
      .delete(users)
      .where(eq(users.id, user.id));

    // Clear session cookie
    const { cookies } = await import('next/headers');
    (await cookies()).delete('session');

    return {
      success: true,
      message: 'All user data has been permanently deleted as per GDPR Article 17',
    };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete data',
    };
  }
}

/**
 * Get user data deletion confirmation
 * Shows what will be deleted
 */
export async function getUserDataSummary() {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        error: 'Unauthorized. Please sign in.',
      };
    }

    const documentsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(legalDocuments)
      .where(eq(legalDocuments.userId, user.id));

    const transactionsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, user.id));

    const [credits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, user.id))
      .limit(1);

    const membershipsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id));

    return {
      success: true,
      summary: {
        email: user.email,
        documentsCount: Number(documentsCount[0]?.count || 0),
        creditsRemaining: credits?.credits || 0,
        transactionsCount: Number(transactionsCount[0]?.count || 0),
        teamMembershipsCount: Number(membershipsCount[0]?.count || 0),
        accountCreated: user.createdAt,
      },
    };
  } catch (error) {
    console.error('Error getting user data summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get summary',
    };
  }
}
