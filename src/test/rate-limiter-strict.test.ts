import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock redisService before importing rate-limiter
vi.mock('@/server/services/redis', () => ({
  redisService: {
    incr: vi.fn(),
    incrbyfloat: vi.fn(),
    get: vi.fn(),
    ping: vi.fn(),
  },
}));

import { checkRateLimit } from '@/server/services/security/rate-limiter';
import { redisService } from '@/server/services/redis';

const mockRedis = vi.mocked(redisService);

describe('Rate Limiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('strict mode', () => {
    it('allows request when Redis is healthy', async () => {
      mockRedis.incr.mockResolvedValue(1);

      const result = await checkRateLimit('test-user', {
        windowMs: 60_000,
        max: 10,
        strict: true,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('denies request when Redis is down and strict is true', async () => {
      mockRedis.incr.mockResolvedValue(null);

      const result = await checkRateLimit('test-user', {
        windowMs: 60_000,
        max: 10,
        strict: true,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows request when Redis is down and strict is false (default)', async () => {
      mockRedis.incr.mockResolvedValue(null);

      const result = await checkRateLimit('test-user', {
        windowMs: 60_000,
        max: 10,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(10);
    });

    it('denies request when count exceeds max', async () => {
      mockRedis.incr.mockResolvedValue(11);

      const result = await checkRateLimit('test-user', {
        windowMs: 60_000,
        max: 10,
        strict: true,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows request at exactly the max count', async () => {
      mockRedis.incr.mockResolvedValue(10);

      const result = await checkRateLimit('test-user', {
        windowMs: 60_000,
        max: 10,
        strict: true,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe('key prefix', () => {
    it('uses custom key prefix', async () => {
      mockRedis.incr.mockResolvedValue(1);

      await checkRateLimit('test-user', {
        windowMs: 60_000,
        max: 10,
        keyPrefix: 'prediction',
      });

      expect(mockRedis.incr).toHaveBeenCalledWith(
        expect.stringContaining('prediction:test-user'),
        expect.any(Number)
      );
    });

    it('uses default key prefix "rl"', async () => {
      mockRedis.incr.mockResolvedValue(1);

      await checkRateLimit('test-user', {
        windowMs: 60_000,
        max: 10,
      });

      expect(mockRedis.incr).toHaveBeenCalledWith(
        expect.stringContaining('rl:test-user'),
        expect.any(Number)
      );
    });
  });
});
