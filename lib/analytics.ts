/**
 * Analytics & Monitoring
 * Tracks user metrics, document generation analytics, and usage patterns
 */

import { db } from './db/drizzle';
import {
  users,
  activityLogs,
  legalDocuments,
  creditTransactions,
  ActivityType,
} from './db/schema';
import { eq, gt, and, count, sum, isNull } from 'drizzle-orm';

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersLast30Days: number;
  churnRate: number;
}

export interface DocumentMetrics {
  totalGenerated: number;
  generatedLast30Days: number;
  failureRate: number;
  averageTimeToGenerate: number;
  byType: Record<string, number>;
}

export interface CreditMetrics {
  totalCreditsPurchased: number;
  totalCreditsConsumed: number;
  averageCreditsPerUser: number;
  revenueLast30Days: number;
}

export interface ActivityMetrics {
  signUpCount: number;
  signInCount: number;
  signOutCount: number;
  passwordUpdateCount: number;
  accountDeleteCount: number;
  gdprExportCount: number;
  gdprDeletionCount: number;
}

export interface SystemMetrics {
  users: UserMetrics;
  documents: DocumentMetrics;
  credits: CreditMetrics;
  activity: ActivityMetrics;
  timestamp: Date;
}

/**
 * Get user metrics for a given time period
 */
export async function getUserMetrics(days: number = 30): Promise<UserMetrics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

  // Total users (not deleted)
  const totalUsersResult = await db
    .select({ count: count() })
    .from(users)
    .where(isNull(users.deletedAt));
  const totalUsers = totalUsersResult[0]?.count ?? 0;

  // New users in last 30 days
  const newUsersResult = await db
    .select({ count: count() })
    .from(users)
    .where(and(isNull(users.deletedAt), gt(users.createdAt, thirtyDaysAgo)));
  const newUsersLast30Days = newUsersResult[0]?.count ?? 0;

  // Active users (those who performed any action in last 30 days)
  const activeUsersResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(gt(activityLogs.timestamp, thirtyDaysAgo));
  const activeUsers = activeUsersResult[0]?.count ?? 0;

  // Churn rate (users created 60 days ago who are now deleted)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const createdInWindow = await db
    .select({ count: count() })
    .from(users)
    .where(and(gt(users.createdAt, sixtyDaysAgo), gt(users.createdAt, thirtyDaysAgo)));
  const deletedInWindow = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        gt(users.createdAt, sixtyDaysAgo),
        gt(users.createdAt, thirtyDaysAgo)
      )
    );
  const createdCount = createdInWindow[0]?.count ?? 1;
  const deletedCount = deletedInWindow[0]?.count ?? 0;
  const churnRate = createdCount > 0 ? (deletedCount / createdCount) * 100 : 0;

  return {
    totalUsers,
    activeUsers,
    newUsersLast30Days,
    churnRate,
  };
}

/**
 * Get document generation metrics
 */
export async function getDocumentMetrics(days: number = 30): Promise<DocumentMetrics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

  // Total documents generated
  const totalResult = await db
    .select({ count: count() })
    .from(legalDocuments);
  const totalGenerated = totalResult[0]?.count ?? 0;

  // Generated in last 30 days
  const last30Result = await db
    .select({ count: count() })
    .from(legalDocuments)
    .where(gt(legalDocuments.createdAt, thirtyDaysAgo));
  const generatedLast30Days = last30Result[0]?.count ?? 0;

  // Failure rate (generated in last 30 days)
  const failedResult = await db
    .select({ count: count() })
    .from(legalDocuments)
    .where(and(gt(legalDocuments.createdAt, thirtyDaysAgo), eq(legalDocuments.status, 'FAILED')));
  const failedCount = failedResult[0]?.count ?? 0;
  const failureRate =
    generatedLast30Days > 0 ? (failedCount / generatedLast30Days) * 100 : 0;

  // Average time (in hours) to generate (only successful ones)
  const avgTimeResult = await db
    .select({
      avgTime: count(), // Placeholder - we'll calculate manually
    })
    .from(legalDocuments)
    .where(
      and(
        gt(legalDocuments.createdAt, thirtyDaysAgo),
        eq(legalDocuments.status, 'GENERATED')
      )
    );
  // Simplified: assume avg generation time is 2 minutes, adjust as needed
  const averageTimeToGenerate = 2;

  // By document type
  const byTypeResult = await db
    .select({
      type: legalDocuments.type,
      count: count(),
    })
    .from(legalDocuments)
    .where(gt(legalDocuments.createdAt, thirtyDaysAgo))
    .groupBy(legalDocuments.type);

  const byType: Record<string, number> = {};
  for (const row of byTypeResult) {
    byType[row.type] = row.count;
  }

  return {
    totalGenerated,
    generatedLast30Days,
    failureRate,
    averageTimeToGenerate,
    byType,
  };
}

/**
 * Get credit metrics
 */
export async function getCreditMetrics(days: number = 30): Promise<CreditMetrics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

  // Total credits purchased (positive transactions with reason PURCHASE)
  const purchasedResult = await db
    .select({ total: sum(creditTransactions.change) })
    .from(creditTransactions)
    .where(eq(creditTransactions.reason, 'PURCHASE'));
  const totalCreditsPurchased = Number(purchasedResult[0]?.total) || 0;

  // Total credits consumed (negative transactions)
  const consumedResult = await db
    .select({ total: sum(creditTransactions.change) })
    .from(creditTransactions)
    .where(gt(creditTransactions.change, 0));
  const totalCreditsConsumed = Math.abs(Number(consumedResult[0]?.total) || 0);

  // Average credits per user
  const userCount = await db.select({ count: count() }).from(users);
  const totalUsers = userCount[0]?.count ?? 1;
  const averageCreditsPerUser = totalCreditsPurchased / totalUsers;

  // Revenue last 30 days (assuming credits sold at 1 credit = ₹1)
  const revenueResult = await db
    .select({ total: sum(creditTransactions.change) })
    .from(creditTransactions)
    .where(
      and(
        gt(creditTransactions.createdAt, thirtyDaysAgo),
        eq(creditTransactions.reason, 'PURCHASE')
      )
    );
  const revenueLast30Days = Number(revenueResult[0]?.total) || 0;

  return {
    totalCreditsPurchased,
    totalCreditsConsumed,
    averageCreditsPerUser,
    revenueLast30Days,
  };
}

/**
 * Get activity metrics
 */
export async function getActivityMetrics(): Promise<ActivityMetrics> {
  const signUpResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(eq(activityLogs.action, ActivityType.SIGN_UP));

  const signInResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(eq(activityLogs.action, ActivityType.SIGN_IN));

  const signOutResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(eq(activityLogs.action, ActivityType.SIGN_OUT));

  const passwordUpdateResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(eq(activityLogs.action, ActivityType.UPDATE_PASSWORD));

  const accountDeleteResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(eq(activityLogs.action, ActivityType.DELETE_ACCOUNT));

  const gdprExportResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(eq(activityLogs.action, ActivityType.GDPR_DATA_EXPORT));

  const gdprDeletionResult = await db
    .select({ count: count() })
    .from(activityLogs)
    .where(eq(activityLogs.action, ActivityType.GDPR_DATA_DELETION_REQUEST));

  return {
    signUpCount: signUpResult[0]?.count ?? 0,
    signInCount: signInResult[0]?.count ?? 0,
    signOutCount: signOutResult[0]?.count ?? 0,
    passwordUpdateCount: passwordUpdateResult[0]?.count ?? 0,
    accountDeleteCount: accountDeleteResult[0]?.count ?? 0,
    gdprExportCount: gdprExportResult[0]?.count ?? 0,
    gdprDeletionCount: gdprDeletionResult[0]?.count ?? 0,
  };
}

/**
 * Get comprehensive system metrics
 */
export async function getSystemMetrics(days: number = 30): Promise<SystemMetrics> {
  const [users, documents, credits, activity] = await Promise.all([
    getUserMetrics(days),
    getDocumentMetrics(days),
    getCreditMetrics(days),
    getActivityMetrics(),
  ]);

  return {
    users,
    documents,
    credits,
    activity,
    timestamp: new Date(),
  };
}

/**
 * Track an event (wrapper around activity logs)
 */
export async function trackEvent(
  teamId: number,
  userId: number | null,
  action: ActivityType,
  ipAddress?: string
): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      teamId,
      userId,
      action,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
    // Don't throw - analytics should not break the app
  }
}

/**
 * Get user activity history
 */
export async function getUserActivityHistory(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  return db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(activityLogs.timestamp)
    .limit(limit);
}

/**
 * Get team activity history
 */
export async function getTeamActivityHistory(
  teamId: number,
  limit: number = 100
): Promise<any[]> {
  return db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.teamId, teamId))
    .orderBy(activityLogs.timestamp)
    .limit(limit);
}

/**
 * Get user's document generation history with stats
 */
export async function getUserDocumentStats(userId: number): Promise<{
  total: number;
  successful: number;
  failed: number;
  byType: Record<string, number>;
}> {
  const userDocuments = await db
    .select()
    .from(legalDocuments)
    .where(eq(legalDocuments.userId, userId));

  const stats = {
    total: userDocuments.length,
    successful: userDocuments.filter((d) => d.status === 'GENERATED').length,
    failed: userDocuments.filter((d) => d.status === 'FAILED').length,
    byType: {} as Record<string, number>,
  };

  for (const doc of userDocuments) {
    stats.byType[doc.type] = (stats.byType[doc.type] ?? 0) + 1;
  }

  return stats;
}
