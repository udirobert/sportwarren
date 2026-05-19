import axios from 'axios';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as path from 'path';
import { isKitePassportConfigured } from '../src/server/services/blockchain/kite-passport.js';
import { buildPaymentRequirements, readX402Config } from '../src/server/services/blockchain/x402-client.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

type Check = {
  label: string;
  ok: boolean;
  detail?: string;
  required?: boolean;
};

function print(check: Check) {
  const marker = check.ok ? 'OK  ' : check.required === false ? 'WARN' : 'FAIL';
  console.log(`${marker} ${check.label}${check.detail ? ` - ${check.detail}` : ''}`);
}

async function main() {
  const cfg = readX402Config();
  const provider = new ethers.JsonRpcProvider(cfg.rpcUrl);
  const checks: Check[] = [];

  console.log('Kite Passport x402 preflight');
  console.log(`network=${cfg.network} chainId=${cfg.chainId} scheme=${cfg.scheme} version=${cfg.x402Version}`);
  console.log(`asset=${cfg.assetAddress}`);

  const network = await provider.getNetwork();
  checks.push({
    label: 'RPC chain id matches config',
    ok: Number(network.chainId) === cfg.chainId,
    detail: `rpc=${network.chainId.toString()}`,
  });
  checks.push({
    label: 'official Kite Passport scheme configured',
    ok: cfg.x402Version === 1 && cfg.scheme === 'gokite-aa' && cfg.network === 'kite-testnet',
    detail: 'expected x402Version=1 scheme=gokite-aa network=kite-testnet',
  });

  const code = await provider.getCode(cfg.assetAddress);
  checks.push({
    label: 'asset contract is deployed',
    ok: code !== '0x',
  });

  const token = new ethers.Contract(cfg.assetAddress, ERC20_ABI, provider);
  const [name, symbol, decimals] = await Promise.all([
    token.name().catch(() => null),
    token.symbol().catch(() => null),
    token.decimals().catch(() => null),
  ]);
  checks.push({
    label: 'asset metadata',
    ok: Boolean(name && symbol && decimals !== null),
    detail: `${name ?? 'unknown'} ${symbol ?? ''} decimals=${decimals?.toString?.() ?? 'unknown'}`,
  });
  checks.push({
    label: 'asset decimals match config',
    ok: decimals !== null && Number(decimals) === cfg.assetDecimals,
    detail: `config=${cfg.assetDecimals}`,
  });

  const requirements = buildPaymentRequirements({
    payTo: process.env.KITE_X402_PAY_TO_ADDRESS || '0x4A50DCA63d541372ad36E5A36F1D542d51164F19',
    amountUsdc: Number(process.env.KITE_X402_SMOKE_PRICE_USDC || '0.001'),
    description: 'SportWarren Kite Passport preflight',
    merchantName: 'SportWarren',
    resource: 'scripts/kite-x402-preflight.ts',
  });
  checks.push({
    label: '402 requirements match Kite service-provider shape',
    ok: requirements.x402Version === 1 &&
      requirements.scheme === 'gokite-aa' &&
      requirements.network === 'kite-testnet' &&
      requirements.extra === null,
    detail: `${requirements.scheme}/${requirements.network}`,
  });

  checks.push({
    label: 'Kite MCP auth token configured',
    ok: isKitePassportConfigured(),
    detail: 'KITE_MCP_AUTH_TOKEN is required for real approve_payment calls',
  });

  if (process.env.KITE_MCP_URL) {
    const res = await axios.request({
      url: process.env.KITE_MCP_URL,
      method: 'POST',
      headers: { Accept: 'application/json, text/event-stream' },
      timeout: 10_000,
      validateStatus: () => true,
    }).catch((error) => ({ status: 0, data: error instanceof Error ? error.message : String(error) }));
    checks.push({
      label: 'Kite MCP endpoint reachable',
      ok: res.status > 0 && res.status < 500,
      required: false,
      detail: `status=${res.status}`,
    });
  }

  for (const check of checks) print(check);

  const hardFailures = checks.filter((check) => check.required !== false && !check.ok);
  if (hardFailures.length > 0) {
    console.error('\nPreflight failed. Fix Kite Passport configuration before deploying paid scouting.');
    process.exit(1);
  }

  console.log('\nPreflight passed. Run a real scout request to exercise approve_payment + facilitator settlement.');
}

main().catch((error) => {
  console.error('FAIL preflight crashed');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
