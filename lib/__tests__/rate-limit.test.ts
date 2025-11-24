import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  rateLimitAuth,
  rateLimitDocument,
  rateLimitApi,
  RATE_LIMIT_CONFIG,
} from '../rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth Rate Limit', () => {
    it('should allow requests within limit', async () => {
      for (let i = 0; i < RATE_LIMIT_CONFIG.auth.requests; i++) {
        const result = await rateLimitAuth('test-ip');
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(RATE_LIMIT_CONFIG.auth.requests - i - 1);
      }
    });

    it('should reject requests exceeding limit', async () => {
      // Use up all requests
      for (let i = 0; i < RATE_LIMIT_CONFIG.auth.requests; i++) {
        await rateLimitAuth('test-ip-2');
      }

      // Next request should fail
      const result = await rateLimitAuth('test-ip-2');
      expect(result.success).toBe(false);
    });

    it('should return limit information', async () => {
      const result = await rateLimitAuth('test-ip-3');
      expect(result.limit).toBe(RATE_LIMIT_CONFIG.auth.requests);
      expect(result.remaining).toBeDefined();
      expect(result.reset).toBeDefined();
    });

    it('should fallback to in-memory limiter', async () => {
      const result = await rateLimitAuth('test-ip-4');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
    });
  });

  describe('Document Rate Limit', () => {
    it('should allow document generation within limit', async () => {
      for (let i = 0; i < RATE_LIMIT_CONFIG.document.requests; i++) {
        const result = await rateLimitDocument('user:1');
        expect(result.success).toBe(true);
      }
    });

    it('should reject excessive document generation', async () => {
      // Use up all requests
      for (let i = 0; i < RATE_LIMIT_CONFIG.document.requests; i++) {
        await rateLimitDocument('user:2');
      }

      // Next request should fail
      const result = await rateLimitDocument('user:2');
      expect(result.success).toBe(false);
    });

    it('should track remaining requests', async () => {
      const result1 = await rateLimitDocument('user:3');
      expect(result1.remaining).toBe(RATE_LIMIT_CONFIG.document.requests - 1);

      const result2 = await rateLimitDocument('user:3');
      expect(result2.remaining).toBe(RATE_LIMIT_CONFIG.document.requests - 2);
    });
  });

  describe('API Rate Limit', () => {
    it('should allow API requests within limit', async () => {
      for (let i = 0; i < 5; i++) {
        const result = await rateLimitApi('api-user-1');
        expect(result.success).toBe(true);
      }
    });

    it('should isolate limits by identifier', async () => {
      // First identifier
      await rateLimitApi('id-1');
      const result1 = await rateLimitApi('id-1');

      // Second identifier (should be independent)
      const result2 = await rateLimitApi('id-2');
      expect(result2.remaining).not.toBe(result1.remaining);
    });
  });

  describe('Rate Limit Configuration', () => {
    it('should have correct auth limit config', () => {
      expect(RATE_LIMIT_CONFIG.auth.requests).toBe(5);
      expect(RATE_LIMIT_CONFIG.auth.window).toBe('15 m');
      expect(RATE_LIMIT_CONFIG.auth.windowMs).toBe(15 * 60 * 1000);
    });

    it('should have correct document limit config', () => {
      expect(RATE_LIMIT_CONFIG.document.requests).toBe(10);
      expect(RATE_LIMIT_CONFIG.document.window).toBe('1 h');
      expect(RATE_LIMIT_CONFIG.document.windowMs).toBe(60 * 60 * 1000);
    });

    it('should have correct API limit config', () => {
      expect(RATE_LIMIT_CONFIG.api.requests).toBe(100);
      expect(RATE_LIMIT_CONFIG.api.window).toBe('1 m');
      expect(RATE_LIMIT_CONFIG.api.windowMs).toBe(60 * 1000);
    });
  });
});
