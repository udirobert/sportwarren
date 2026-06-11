import { describe, it, expect, afterEach } from 'vitest';
import { resolveX402Config, readX402Config, readGoatX402Config } from '@/server/services/blockchain/x402-client';

const ENV_KEYS = [
  'GOAT_CHAIN_ID',
  'GOAT_FACILITATOR_URL',
  'GOAT_USDC_ADDRESS',
  'GOAT_RPC_URL',
  'GOAT_X402_SCHEME',
  'GOAT_USDC_DECIMALS',
] as const;

afterEach(() => {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
});

describe('x402 config routing', () => {
  describe('resolveX402Config', () => {
    it('returns Kite config for eip155:2368 (default Kite network)', () => {
      const config = resolveX402Config('eip155:2368');
      expect(config.network).toBe('eip155:2368');
      expect(config.chainId).toBe(2368);
    });

    it('returns Kite config when targetNetwork is undefined', () => {
      const config = resolveX402Config(undefined);
      expect(config.network).toBe('eip155:2368');
    });

    it('returns GOAT testnet config for eip155:48816', () => {
      const config = resolveX402Config('eip155:48816');
      expect(config.network).toBe('eip155:48816');
      expect(config.chainId).toBe(48816);
      expect(config.facilitatorUrl).toContain('testnet3.goat.network');
    });

    it('returns GOAT mainnet config for eip155:2345', () => {
      process.env.GOAT_CHAIN_ID = '2345';
      const config = resolveX402Config('eip155:2345');
      expect(config.network).toBe('eip155:2345');
      expect(config.chainId).toBe(2345);
      expect(config.facilitatorUrl).toContain('goat.network');
    });

    it('returns Kite config for unrecognized network strings', () => {
      const config = resolveX402Config('eip155:8453');
      expect(config.network).toBe('eip155:2368');
    });
  });

  describe('readGoatX402Config', () => {
    it('defaults to testnet when GOAT_CHAIN_ID is not set', () => {
      const config = readGoatX402Config();
      expect(config.chainId).toBe(48816);
      expect(config.network).toBe('eip155:48816');
    });

    it('honors GOAT_FACILITATOR_URL env override', () => {
      process.env.GOAT_FACILITATOR_URL = 'https://custom-facilitator.example.com';
      const config = readGoatX402Config();
      expect(config.facilitatorUrl).toBe('https://custom-facilitator.example.com');
    });

    it('honors GOAT_USDC_ADDRESS env override', () => {
      process.env.GOAT_USDC_ADDRESS = '0xCustomUSDC';
      const config = readGoatX402Config();
      expect(config.assetAddress).toBe('0xCustomUSDC');
    });

    it('uses mainnet RPC when GOAT_CHAIN_ID is 2345', () => {
      process.env.GOAT_CHAIN_ID = '2345';
      const config = readGoatX402Config();
      expect(config.rpcUrl).toBe('https://rpc.goat.network');
      expect(config.chainId).toBe(2345);
    });

    it('always uses x402 v2', () => {
      const config = readGoatX402Config();
      expect(config.x402Version).toBe(2);
    });
  });

  describe('readX402Config', () => {
    it('returns Kite testnet defaults', () => {
      const config = readX402Config();
      expect(config.network).toBe('eip155:2368');
      expect(config.chainId).toBe(2368);
      expect(config.facilitatorUrl).toBe('https://facilitator.pieverse.io');
    });
  });
});
