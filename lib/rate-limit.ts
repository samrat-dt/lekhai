import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiters (null if Redis not configured)
let authRateLimiter: Ratelimit | null = null;
let apiRateLimiter: Ratelimit | null = null;
let documentRateLimiter: Ratelimit | null = null;

// Initialize Redis only if environment variables are set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

if (redis) {
  // Auth endpoints: 5 requests per 15 minutes per IP
  authRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: '@ratelimit/auth',
  });

  // General API: 100 requests per 1 minute per IP
  apiRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: '@ratelimit/api',
  });

  // Document generation: 10 per hour per user
  documentRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: '@ratelimit/document',
  });
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}

/**
 * Rate limit authentication endpoints (sign-in, sign-up)
 * Prevents brute force attacks
 */
export async function rateLimitAuth(identifier: string): Promise<RateLimitResult> {
  if (!authRateLimiter) {
    // Graceful degradation - allow request if Redis not configured
    console.warn('Rate limiting not configured - Redis credentials missing');
    return { success: true };
  }

  try {
    const { success, limit, remaining, reset } = await authRateLimiter.limit(identifier);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow request but log the issue
    return { success: true };
  }
}

/**
 * Rate limit general API endpoints
 * Prevents API abuse
 */
export async function rateLimitApi(identifier: string): Promise<RateLimitResult> {
  if (!apiRateLimiter) {
    return { success: true };
  }

  try {
    const { success, limit, remaining, reset } = await apiRateLimiter.limit(identifier);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { success: true };
  }
}

/**
 * Rate limit document generation
 * Prevents spam and abuse
 */
export async function rateLimitDocument(identifier: string): Promise<RateLimitResult> {
  if (!documentRateLimiter) {
    return { success: true };
  }

  try {
    const { success, limit, remaining, reset } = await documentRateLimiter.limit(identifier);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { success: true };
  }
}

/**
 * Get client IP from request headers
 * Handles proxies and load balancers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}
