/**
 * Kite x402 client + 402 helpers.
 *
 * - Inbound `/api/x402/*`: issue 402 challenges, settle via Pieverse facilitator.
 * - Outbound paid calls: Kite Passport (`kpass`) for allowlisted merchants, or
 *   EIP-3009 signing with the platform wallet for direct settlement.
 *
 * Pieverse facilitator (Kite testnet): x402 v2, scheme `exact`, network `eip155:2368`.
 * Kite Passport catalog services may still advertise `gokite-aa` / `kite-testnet`; we map
 * those to facilitator shape at settlement time.
 *
 * @see https://docs.gokite.ai/kite-agent-passport/service-provider-guide
 */

import axios, { AxiosError } from 'axios';
import { ethers } from 'ethers';
import { executeKitePassportRequest, isKitePassportConfigured } from './kite-passport';

const DEFAULT_SCHEME = 'exact';
const DEFAULT_NETWORK = 'eip155:2368';
const DEFAULT_FACILITATOR = 'https://facilitator.pieverse.io';
const DEFAULT_FACILITATOR_ADDRESS = '0x12343e649e6b2b2b77649DFAb88f103c02F3C78b';
const DEFAULT_USDC = '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';
const DEFAULT_KITE_RPC = 'https://rpc-testnet.gokite.ai';
const DEFAULT_KITE_CHAIN_ID = 2368;
const DEFAULT_ASSET_DECIMALS = 18;
const DEFAULT_X402_VERSION = 2;

/** Default Kite-listed x402 demo (Weather API) for judge-visible Passport payments. */
export const DEFAULT_KITE_DEMO_SERVICE_URL =
  'https://x402.dev.gokite.ai/api/weather?location=London';

type X402Version = 1 | 2;

export type X402Config = {
  facilitatorUrl: string;
  facilitatorAddress: string;
  scheme: string;
  network: string;
  assetAddress: string;
  assetDecimals: number;
  rpcUrl: string;
  chainId: number;
  x402Version: X402Version;
};

export interface PaymentRequirements {
  x402Version?: X402Version;
  scheme: string;
  network: string;
  maxAmountRequired: string;
  amount?: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds: number;
  resource?: string;
  description?: string;
  mimeType?: string;
  merchantName?: string;
  outputSchema?: unknown;
  extra?: Record<string, unknown> | null;
}

export interface TransferAuthorization {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
}

export type PaymentEnvelope = {
  x402Version?: X402Version;
  scheme: string;
  network: string;
  authorization: TransferAuthorization;
  signature: string;
  asset: string;
  facilitator: string;
};

export interface SettlementResult {
  success: boolean;
  txHash?: string;
  network: string;
  facilitator: string;
  payer: string;
  payee: string;
  amount: string;
  simulated?: boolean;
  error?: string;
}

export interface PaidFetchOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  maxAmountUsdc?: number;
  sessionId?: string;
  /** When true, never use kpass — only platform wallet signing (internal settlement). */
  platformWalletOnly?: boolean;
}

export interface PaidFetchResult<T = unknown> {
  status: number;
  data: T;
  payment?: SettlementResult;
}

export function readX402Config(): X402Config {
  const version = Number(process.env.KITE_X402_VERSION || DEFAULT_X402_VERSION);
  return {
    facilitatorUrl: process.env.KITE_FACILITATOR_URL || DEFAULT_FACILITATOR,
    facilitatorAddress: process.env.KITE_FACILITATOR_ADDRESS || DEFAULT_FACILITATOR_ADDRESS,
    scheme: process.env.KITE_X402_SCHEME || DEFAULT_SCHEME,
    network: process.env.KITE_X402_NETWORK || DEFAULT_NETWORK,
    assetAddress: process.env.KITE_USDC_ADDRESS || DEFAULT_USDC,
    assetDecimals: Number(process.env.KITE_USDC_DECIMALS || DEFAULT_ASSET_DECIMALS),
    rpcUrl: process.env.KITE_RPC_URL || process.env.NEXT_PUBLIC_KITE_RPC_URL || DEFAULT_KITE_RPC,
    chainId: Number(process.env.KITE_CHAIN_ID || DEFAULT_KITE_CHAIN_ID),
    x402Version: version === 1 ? 1 : 2,
  };
}

function isX402SimulationEnabled(): boolean {
  return ['1', 'true', 'yes'].includes(
    (process.env.KITE_X402_SIMULATE || '').trim().toLowerCase(),
  );
}

function usdcExtra(): Record<string, string> {
  return {
    name: process.env.KITE_USDC_DOMAIN_NAME || 'Test USD',
    version: process.env.KITE_USDC_DOMAIN_VERSION || '2',
  };
}

export function isSportWarrenHostedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'api.sportwarren.com'
      || host.endsWith('.sportwarren.com')
      || host === 'localhost'
      || host === '127.0.0.1';
  } catch {
    return false;
  }
}

export function encodeXPayment(envelope: PaymentEnvelope): string {
  return Buffer.from(JSON.stringify(envelope), 'utf-8').toString('base64');
}

export function decodeXPayment(header: string): PaymentEnvelope {
  const decoded = JSON.parse(Buffer.from(header, 'base64').toString('utf-8'));
  return normalizePaymentPayload(decoded);
}

function normalizePaymentPayload(input: any): PaymentEnvelope {
  if (input?.payload?.authorization && input.payload.signature) {
    const accepted = input.accepted ?? {};
    return {
      x402Version: input.x402Version === 1 ? 1 : 2,
      scheme: accepted.scheme ?? input.scheme ?? DEFAULT_SCHEME,
      network: accepted.network ?? input.network ?? DEFAULT_NETWORK,
      authorization: input.payload.authorization,
      signature: input.payload.signature,
      asset: accepted.asset ?? input.payload.asset ?? readX402Config().assetAddress,
      facilitator: input.facilitator ?? readX402Config().facilitatorAddress,
    };
  }

  if (input?.authorization && input.signature) {
    return input as PaymentEnvelope;
  }

  throw new Error('Invalid X-Payment payload: missing authorization/signature');
}

function getRequirementAmount(requirements: PaymentRequirements): string {
  return requirements.amount ?? requirements.maxAmountRequired;
}

function normalizeRequirements(requirements: PaymentRequirements): PaymentRequirements {
  const amount = getRequirementAmount(requirements);
  return {
    ...requirements,
    maxAmountRequired: amount,
    amount,
    x402Version: requirements.x402Version ?? readX402Config().x402Version,
  };
}

/** Map Passport-style requirements to Pieverse facilitator registration. */
function toFacilitatorRequirements(requirements: PaymentRequirements): PaymentRequirements {
  const normalized = normalizeRequirements(requirements);
  if (normalized.scheme === 'gokite-aa' || normalized.network === 'kite-testnet') {
    return normalizeRequirements({
      ...normalized,
      x402Version: 2,
      scheme: DEFAULT_SCHEME,
      network: DEFAULT_NETWORK,
      extra: normalized.extra ?? usdcExtra(),
    });
  }
  return normalized;
}

function buildV2Accepted(requirements: PaymentRequirements) {
  const normalized = toFacilitatorRequirements(requirements);
  return {
    scheme: normalized.scheme,
    network: normalized.network,
    asset: normalized.asset,
    amount: getRequirementAmount(normalized),
    payTo: normalized.payTo,
    maxTimeoutSeconds: normalized.maxTimeoutSeconds,
    extra: normalized.extra ?? usdcExtra(),
  };
}

function encodePaymentSignature(envelope: PaymentEnvelope, requirements: PaymentRequirements): string {
  const facilitatorReqs = toFacilitatorRequirements(requirements);
  const version = facilitatorReqs.x402Version ?? envelope.x402Version ?? 2;
  if (version === 2) {
    return Buffer.from(JSON.stringify({
      x402Version: 2,
      accepted: buildV2Accepted(facilitatorReqs),
      payload: {
        signature: envelope.signature,
        authorization: envelope.authorization,
      },
      resource: facilitatorReqs.resource
        ? {
            url: facilitatorReqs.resource,
            description: facilitatorReqs.description,
            mimeType: facilitatorReqs.mimeType ?? 'application/json',
          }
        : undefined,
    }), 'utf-8').toString('base64');
  }

  return encodeXPayment({ ...envelope, x402Version: 1 });
}

const TRANSFER_AUTH_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

function assetDomain(asset: string, chainId: number) {
  return {
    name: process.env.KITE_USDC_DOMAIN_NAME || 'Test USD',
    version: process.env.KITE_USDC_DOMAIN_VERSION || '2',
    chainId,
    verifyingContract: asset,
  };
}

function getServerWallet(): ethers.Wallet | null {
  const pk = process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) return null;
  const cfg = readX402Config();
  return new ethers.Wallet(pk, new ethers.JsonRpcProvider(cfg.rpcUrl));
}

export async function signPayment(
  requirements: PaymentRequirements,
  amountWei?: string,
): Promise<PaymentEnvelope | null> {
  const wallet = getServerWallet();
  if (!wallet) return null;

  const cfg = readX402Config();
  const normalized = toFacilitatorRequirements(requirements);
  const value = amountWei ?? getRequirementAmount(normalized);

  const now = Math.floor(Date.now() / 1000);
  const auth: TransferAuthorization = {
    from: await wallet.getAddress(),
    to: normalized.payTo,
    value,
    validAfter: String(now - 60),
    validBefore: String(now + Math.max(60, normalized.maxTimeoutSeconds || 300)),
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };

  const signature = await wallet.signTypedData(
    assetDomain(normalized.asset, cfg.chainId),
    TRANSFER_AUTH_TYPES,
    auth,
  );

  return {
    x402Version: normalized.x402Version,
    scheme: normalized.scheme,
    network: normalized.network,
    authorization: auth,
    signature,
    asset: normalized.asset,
    facilitator: cfg.facilitatorAddress,
  };
}

function facilitatorError(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const err = (data as { error?: unknown }).error;
  if (!err) return undefined;
  return typeof err === 'string' ? err : JSON.stringify(err);
}

export async function paidFetch<T = unknown>(opts: PaidFetchOptions): Promise<PaidFetchResult<T>> {
  const cfg = readX402Config();
  const method = opts.method || 'GET';
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    ...opts.headers,
  };

  let probe;
  try {
    probe = await axios.request({
      url: opts.url,
      method,
      headers: baseHeaders,
      data: opts.body,
      validateStatus: () => true,
    });
  } catch (err) {
    throw new Error(`[x402] probe request failed: ${(err as Error).message}`);
  }

  if (probe.status !== 402) {
    return { status: probe.status, data: probe.data as T };
  }

  const headerRequirements = probe.headers?.['payment-required'] as string | undefined;
  const headerBody = headerRequirements
    ? JSON.parse(Buffer.from(headerRequirements, 'base64').toString('utf-8'))
    : null;
  const rawRequirements = headerBody?.accepts?.[0]
    ?? headerBody?.requirements
    ?? probe.data?.accepts?.[0]
    ?? probe.data?.requirements
    ?? probe.data;
  const requirements = normalizeRequirements(rawRequirements as PaymentRequirements);
  if (!requirements?.asset || !requirements.payTo) {
    throw new Error('[x402] 402 response missing payment requirements');
  }

  if (opts.maxAmountUsdc !== undefined) {
    const amountUsdc = Number(ethers.formatUnits(getRequirementAmount(requirements) || '0', cfg.assetDecimals));
    if (amountUsdc > opts.maxAmountUsdc) {
      throw new Error(
        `[x402] service requested ${amountUsdc} token > ceiling ${opts.maxAmountUsdc}`,
      );
    }
  }

  const usePassport = !opts.platformWalletOnly
    && !isSportWarrenHostedUrl(opts.url)
    && await isKitePassportConfigured();

  if (usePassport) {
    const executed = await executeKitePassportRequest<T>({
      url: opts.url,
      method,
      headers: baseHeaders,
      body: opts.body,
    });
    if (executed.status >= 400) {
      throw new Error(`[x402] Passport payment returned ${executed.status}: ${JSON.stringify(executed.data)}`);
    }
    const facilitatorReqs = toFacilitatorRequirements(requirements);
    return {
      status: executed.status,
      data: executed.data,
      payment: {
        success: true,
        network: facilitatorReqs.network,
        facilitator: cfg.facilitatorAddress,
        payer: executed.walletAddress ?? 'kite-passport',
        payee: facilitatorReqs.payTo,
        amount: getRequirementAmount(facilitatorReqs),
      },
    };
  }

  const envelope = await signPayment(requirements);
  if (!envelope) {
    if (!isX402SimulationEnabled()) {
      throw new Error('[x402] WEB3_PRIVATE_KEY is required to sign paid requests');
    }
    return {
      status: 200,
      data: probe.data as T,
      payment: {
        success: true,
        simulated: true,
        network: requirements.network,
        facilitator: cfg.facilitatorAddress,
        payer: 'simulated',
        payee: requirements.payTo,
        amount: getRequirementAmount(requirements),
      },
    };
  }

  let paid;
  try {
    paid = await axios.request({
      url: opts.url,
      method,
      headers: {
        ...baseHeaders,
        'PAYMENT-SIGNATURE': encodePaymentSignature(envelope, requirements),
        'X-PAYMENT': encodeXPayment(envelope),
      },
      data: opts.body,
      validateStatus: () => true,
    });
  } catch (err) {
    throw new Error(`[x402] paid request failed: ${(err as AxiosError).message}`);
  }

  if (paid.status >= 400) {
    throw new Error(`[x402] service returned ${paid.status} after payment: ${JSON.stringify(paid.data)}`);
  }

  const settlement = await settleWithFacilitator(envelope, requirements);
  const receipt = settlement.success ? settlement : {
    success: true,
    network: requirements.network,
    facilitator: cfg.facilitatorAddress,
    payer: envelope.authorization.from,
    payee: envelope.authorization.to,
    amount: envelope.authorization.value,
  };

  return { status: paid.status, data: paid.data as T, payment: receipt };
}

const DEFAULT_PLATFORM_FEE_PERCENT = 15;

export function getPlatformFeePercent(): number {
  return Number(process.env.PLATFORM_FEE_PERCENT || DEFAULT_PLATFORM_FEE_PERCENT);
}

export function getPlatformWallet(): string | null {
  const pk = process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) return null;
  return new ethers.Wallet(pk).address;
}

export function splitPayment(totalAmountUsdc: number, feePercent?: number): {
  providerAmountUsdc: number;
  platformAmountUsdc: number;
  feePercent: number;
} {
  const pct = feePercent ?? getPlatformFeePercent();
  const platformAmount = totalAmountUsdc * (pct / 100);
  return {
    providerAmountUsdc: totalAmountUsdc - platformAmount,
    platformAmountUsdc: platformAmount,
    feePercent: pct,
  };
}

export function buildPaymentRequirements(input: {
  payTo: string;
  amountUsdc: number;
  description?: string;
  merchantName?: string;
  resource?: string;
  outputSchema?: unknown;
}): PaymentRequirements {
  const cfg = readX402Config();
  const value = ethers.parseUnits(input.amountUsdc.toFixed(6), cfg.assetDecimals).toString();
  return {
    x402Version: cfg.x402Version,
    scheme: cfg.scheme,
    network: cfg.network,
    maxAmountRequired: value,
    amount: value,
    asset: cfg.assetAddress,
    payTo: input.payTo,
    maxTimeoutSeconds: 300,
    mimeType: 'application/json',
    extra: usdcExtra(),
    description: input.description,
    merchantName: input.merchantName,
    resource: input.resource,
    outputSchema: input.outputSchema,
  };
}

/**
 * Platform-attested settlement: EIP-3009 sign + Pieverse facilitator settle.
 * Falls back to simulated only when signing or settlement fails (never silent success).
 */
export async function createPlatformSettlement(amountUsdc: number): Promise<SettlementResult> {
  const cfg = readX402Config();
  const platformWallet = getPlatformWallet();
  if (!platformWallet) {
    return {
      success: true,
      simulated: true,
      network: cfg.network,
      facilitator: 'sportwarren-internal',
      payer: 'unknown',
      payee: 'unknown',
      amount: '0',
    };
  }

  const requirements = buildPaymentRequirements({
    payTo: platformWallet,
    amountUsdc,
    description: `SportWarren scout attestation (${amountUsdc.toFixed(3)} USDC)`,
    merchantName: 'SportWarren',
    resource: 'sportwarren://scout-attestation',
  });

  const envelope = await signPayment(requirements);
  if (!envelope) {
    return {
      success: true,
      simulated: true,
      network: cfg.network,
      facilitator: 'sportwarren-internal',
      payer: platformWallet,
      payee: platformWallet,
      amount: getRequirementAmount(requirements),
    };
  }

  const result = await settleWithFacilitator(envelope, requirements);
  if (result.success && result.txHash) return result;

  if (result.error) {
    console.warn('[x402] Facilitator rejected platform settlement, falling back to simulated:', result.error);
  }

  return {
    success: true,
    simulated: true,
    network: cfg.network,
    facilitator: cfg.facilitatorAddress,
    payer: platformWallet,
    payee: platformWallet,
    amount: getRequirementAmount(requirements),
    error: result.error,
  };
}

/**
 * Judge/demo path: pay a Kite-listed x402 service via Passport (real on-chain when funded).
 */
export async function executeKiteDemoPayment(): Promise<{
  ok: boolean;
  serviceUrl: string;
  data?: unknown;
  payment?: SettlementResult;
  explorerUrl?: string;
  error?: string;
}> {
  const serviceUrl = (process.env.KITE_DEMO_SERVICE_URL || DEFAULT_KITE_DEMO_SERVICE_URL).trim();
  const maxUsdc = Number(process.env.KITE_DEMO_MAX_USDC || '0.01');
  const explorer = (process.env.KITE_EXPLORER_URL || 'https://testnet.kitescan.ai').replace(/\/$/, '');

  if (!(await isKitePassportConfigured())) {
    return { ok: false, serviceUrl, error: 'Kite Passport not configured (kpass login, agent, active session)' };
  }

  try {
    const result = await paidFetch<Record<string, unknown>>({
      url: serviceUrl,
      method: 'GET',
      maxAmountUsdc: maxUsdc,
    });
    const txHash = result.payment?.txHash;
    return {
      ok: result.status < 400,
      serviceUrl,
      data: result.data,
      payment: result.payment,
      explorerUrl: txHash && !txHash.startsWith('internal-') ? `${explorer}/tx/${txHash}` : undefined,
      error: result.status >= 400 ? `HTTP ${result.status}` : undefined,
    };
  } catch (err) {
    return { ok: false, serviceUrl, error: (err as Error).message };
  }
}

export async function settleWithFacilitator(
  envelope: PaymentEnvelope,
  requirements?: PaymentRequirements,
): Promise<SettlementResult> {
  const cfg = readX402Config();
  const reqs = toFacilitatorRequirements(requirements ?? {
    scheme: envelope.scheme,
    network: envelope.network,
    maxAmountRequired: envelope.authorization.value,
    amount: envelope.authorization.value,
    asset: envelope.asset,
    payTo: envelope.authorization.to,
    maxTimeoutSeconds: 300,
  });
  const version = reqs.x402Version ?? envelope.x402Version ?? cfg.x402Version;
  const paymentPayload = {
    x402Version: 2,
    accepted: buildV2Accepted(reqs),
    payload: {
      authorization: envelope.authorization,
      signature: envelope.signature,
    },
    resource: reqs.resource
      ? {
          url: reqs.resource,
          description: reqs.description,
          mimeType: reqs.mimeType ?? 'application/json',
        }
      : undefined,
  };
  const body = {
    x402Version: version === 1 ? 2 : version,
    paymentPayload,
    paymentRequirements: buildV2Accepted(reqs),
  };

  const baseResult = {
    network: reqs.network,
    facilitator: cfg.facilitatorAddress,
    payer: envelope.authorization.from,
    payee: envelope.authorization.to,
    amount: envelope.authorization.value,
  };

  try {
    const res = await axios.post(
      `${cfg.facilitatorUrl}/v2/settle`,
      body,
      { timeout: 10_000, validateStatus: () => true },
    );
    const errMsg = facilitatorError(res.data);
    if (errMsg) {
      return { success: false, ...baseResult, error: errMsg };
    }
    if (res.status >= 200 && res.status < 300 && res.data?.success !== false) {
      return {
        success: true,
        txHash: res.data?.txHash || res.data?.transactionHash || res.data?.transaction,
        ...baseResult,
      };
    }
    return {
      success: false,
      ...baseResult,
      error: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
    };
  } catch (err) {
    if (!isX402SimulationEnabled()) {
      return {
        success: false,
        ...baseResult,
        error: `facilitator unreachable: ${(err as Error).message}`,
      };
    }
    return {
      success: true,
      simulated: true,
      ...baseResult,
      error: `facilitator unreachable: ${(err as Error).message}`,
    };
  }
}

export function buildPaymentReceipt(result: SettlementResult): string {
  return JSON.stringify(result);
}
