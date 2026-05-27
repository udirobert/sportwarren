import { describe, it, expect, afterEach } from 'vitest';
import {
  isSportWarrenHostedUrl,
  getPlatformFeePercent,
  splitPayment,
} from '@/server/services/blockchain/x402-client';

describe('x402 Pure Utility Functions', () => {
  afterEach(() => {
    delete process.env.PLATFORM_FEE_PERCENT;
  });

  describe('isSportWarrenHostedUrl', () => {
    it('returns true for api.sportwarren.com', () => {
      expect(isSportWarrenHostedUrl('https://api.sportwarren.com/api/x402/scout')).toBe(true);
    });

    it('returns true for subdomains of sportwarren.com', () => {
      expect(isSportWarrenHostedUrl('https://app.sportwarren.com/something')).toBe(true);
    });

    it('returns true for localhost', () => {
      expect(isSportWarrenHostedUrl('http://localhost:3000/api/test')).toBe(true);
    });

    it('returns true for 127.0.0.1', () => {
      expect(isSportWarrenHostedUrl('http://127.0.0.1:3000/api/test')).toBe(true);
    });

    it('returns false for external URLs', () => {
      expect(isSportWarrenHostedUrl('https://weather.hugen.tokyo/weather')).toBe(false);
    });

    it('returns false for other domains', () => {
      expect(isSportWarrenHostedUrl('https://example.com/api')).toBe(false);
    });

    it('returns false for malformed URLs', () => {
      expect(isSportWarrenHostedUrl('not-a-url')).toBe(false);
    });
  });

  describe('getPlatformFeePercent', () => {
    it('returns 15 by default', () => {
      expect(getPlatformFeePercent()).toBe(15);
    });

    it('uses PLATFORM_FEE_PERCENT env var when set', () => {
      process.env.PLATFORM_FEE_PERCENT = '20';
      expect(getPlatformFeePercent()).toBe(20);
    });
  });

  describe('splitPayment', () => {
    it('splits with default 15% fee', () => {
      const result = splitPayment(1.0);
      expect(result.feePercent).toBe(15);
      expect(result.platformAmountUsdc).toBeCloseTo(0.15);
      expect(result.providerAmountUsdc).toBeCloseTo(0.85);
    });

    it('splits with custom fee percent', () => {
      const result = splitPayment(10.0, 20);
      expect(result.feePercent).toBe(20);
      expect(result.platformAmountUsdc).toBeCloseTo(2.0);
      expect(result.providerAmountUsdc).toBeCloseTo(8.0);
    });

    it('handles zero amount', () => {
      const result = splitPayment(0);
      expect(result.platformAmountUsdc).toBe(0);
      expect(result.providerAmountUsdc).toBe(0);
    });

    it('provider + platform = total', () => {
      const result = splitPayment(5.55);
      expect(result.providerAmountUsdc + result.platformAmountUsdc).toBeCloseTo(5.55);
    });
  });
});
