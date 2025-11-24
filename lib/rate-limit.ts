import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limit configuration
export const RATE_LIMIT_CONFIG = {
  auth: {
    requests: 5,
    window: '15 m',
    windowMs: 15 * 60 * 1000,
  },
  api: {
    requests: 100,
    window: '1 m',
    windowMs: 60 * 1000,
  },
  document: {
    requests: 10,
    window: '1 h',
    windowMs: 60 * 60 * 1000,
  },
};

// In-memory rate limiter for local fallback (simple sliding window)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    // Clean up old entries every minute
    this.startCleanup();
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async limit(key: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const entry = this.store.get(key) || { count: 0, resetAt: now + this.windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + this.windowMs;
    }

    const success = entry.count < this.maxRequests;
    entry.count++;

    this.store.set(key, entry);

    return {
      success,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      reset: entry.resetAt,
    };
  }
}

// Rate limiters (null if Redis not configured)
let authRateLimiter: Ratelimit | null = null;
let apiRateLimiter: Ratelimit | null = null;
let documentRateLimiter: Ratelimit | null = null;

// In-memory fallback limiters
const inMemoryAuthLimiter = new InMemoryRateLimiter(
  RATE_LIMIT_CONFIG.auth.requests,
  RATE_LIMIT_CONFIG.auth.windowMs
);
const inMemoryApiLimiter = new InMemoryRateLimiter(
  RATE_LIMIT_CONFIG.api.requests,
  RATE_LIMIT_CONFIG.api.windowMs
);
const inMemoryDocumentLimiter = new InMemoryRateLimiter(
  RATE_LIMIT_CONFIG.document.requests,
  RATE_LIMIT_CONFIG.document.windowMs
);

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
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIG.auth.requests, '15 m'),
    analytics: true,
    prefix: '@ratelimit/auth',
  });

  // General API: 100 requests per 1 minute per IP
  apiRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIG.api.requests, '1 m'),
    analytics: true,
    prefix: '@ratelimit/api',
  });

  // Document generation: 10 per hour per user
  documentRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_CONFIG.document.requests, '1 h'),
    analytics: true,
    prefix: '@ratelimit/document',
  });
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
  usingFallback?: boolean;
}

/**
 * Rate limit authentication endpoints (sign-in, sign-up)
 * Prevents brute force attacks
 * Uses Redis if available, falls back to in-memory limiter
 */
export async function rateLimitAuth(identifier: string): Promise<RateLimitResult> {
  try {
    if (authRateLimiter) {
      const { success, limit, remaining, reset } = await authRateLimiter.limit(identifier);
      return { success, limit, remaining, reset, usingFallback: false };
    }

    // Use in-memory fallback
    const result = await inMemoryAuthLimiter.limit(identifier);
    return { ...result, usingFallback: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, use in-memory fallback
    const result = await inMemoryAuthLimiter.limit(identifier);
    return { ...result, usingFallback: true };
  }
}

/**
 * Rate limit general API endpoints
 * Prevents API abuse
 * Uses Redis if available, falls back to in-memory limiter
 */
export async function rateLimitApi(identifier: string): Promise<RateLimitResult> {
  try {
    if (apiRateLimiter) {
      const { success, limit, remaining, reset } = await apiRateLimiter.limit(identifier);
      return { success, limit, remaining, reset, usingFallback: false };
    }

    // Use in-memory fallback
    const result = await inMemoryApiLimiter.limit(identifier);
    return { ...result, usingFallback: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, use in-memory fallback
    const result = await inMemoryApiLimiter.limit(identifier);
    return { ...result, usingFallback: true };
  }
}

/**
 * Rate limit document generation
 * Prevents spam and abuse
 * Uses Redis if available, falls back to in-memory limiter
 */
export async function rateLimitDocument(identifier: string): Promise<RateLimitResult> {
  try {
    if (documentRateLimiter) {
      const { success, limit, remaining, reset } = await documentRateLimiter.limit(identifier);
      return { success, limit, remaining, reset, usingFallback: false };
    }

    // Use in-memory fallback
    const result = await inMemoryDocumentLimiter.limit(identifier);
    return { ...result, usingFallback: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, use in-memory fallback
    const result = await inMemoryDocumentLimiter.limit(identifier);
    return { ...result, usingFallback: true };
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
