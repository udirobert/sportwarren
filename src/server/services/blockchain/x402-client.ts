/**
 * x402 client + 402 helpers for Kite chain.
 *
 * Single source of truth for:
 *   • outbound paid requests (we are the agent paying a service)
 *   • inbound 402 challenges (we are the service charging an agent)
 *
 * Spec:        https://docs.x402.org/introduction
 * Facilitator: https://facilitator.pieverse.io  (operated by Pieverse for Kite)
 *
 * Payment scheme: `gokite-aa` (account-abstraction style, settled via
 * EIP-3009 `transferWithAuthorization` on the asset contract).
 *
 * Design note: this module deliberately does NOT depend on the `kpass` CLI.
 * `kpass` is the user-side approval surface; on the backend we sign with the
 * server-controlled treasury wallet inside the budget enforced by a
 * `KiteSession` row. Both surfaces co-exist: a session is "approved by"
 * either a passkey-bearing user (kpass flow) or the platform (server flow).
 */

import axios, { AxiosError } from 'axios';
import { ethers } from 'ethers';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_SCHEME = 'gokite-aa';
const DEFAULT_NETWORK = 'kite-testnet';
const DEFAULT_FACILITATOR = 'https://facilitator.pieverse.io';
const DEFAULT_FACILITATOR_ADDRESS = '0x12343e649e6b2b2b77649DFAb88f103c02F3C78b';
const DEFAULT_USDC = '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';
const DEFAULT_KITE_RPC = 'https://rpc-testnet.gokite.ai';
const DEFAULT_KITE_CHAIN_ID = 2368;
const DEFAULT_X402_VERSION = 2;

type X402Version = 1 | 2;

export type X402Config = {
  facilitatorUrl: string;
  facilitatorAddress: string;
  scheme: string;
  network: string;
  assetAddress: string;
  rpcUrl: string;
  chainId: number;
  x402Version: X402Version;
};

export function readX402Config(): X402Config {
  const version = Number(process.env.KITE_X402_VERSION || DEFAULT_X402_VERSION);
  return {
    facilitatorUrl: process.env.KITE_FACILITATOR_URL || DEFAULT_FACILITATOR,
    facilitatorAddress: process.env.KITE_FACILITATOR_ADDRESS || DEFAULT_FACILITATOR_ADDRESS,
    scheme: process.env.KITE_X402_SCHEME || DEFAULT_SCHEME,
    network: process.env.KITE_X402_NETWORK || DEFAULT_NETWORK,
    assetAddress: process.env.KITE_USDC_ADDRESS || DEFAULT_USDC,
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

// ---------------------------------------------------------------------------
// Wire types
// ---------------------------------------------------------------------------

/** Body returned by a service in its HTTP 402 response. */
export interface PaymentRequirements {
  x402Version?: X402Version;
  scheme: string;
  network: string;
  maxAmountRequired: string;     // wei (as decimal string)
  amount?: string;               // v2 alias for maxAmountRequired
  asset: string;                 // ERC20 contract
  payTo: string;                 // service wallet
  maxTimeoutSeconds: number;
  resource?: string;
  description?: string;
  merchantName?: string;
  outputSchema?: unknown;
  extra?: Record<string, unknown>;
}

/** EIP-3009 transferWithAuthorization payload. */
export interface TransferAuthorization {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
}

/** What goes into the base64 X-Payment header. */
export interface PaymentEnvelope {
  x402Version?: X402Version;
  scheme: string;
  network: string;
  authorization: TransferAuthorization;
  signature: string;
  asset: string;
  facilitator: string;
}

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

// ---------------------------------------------------------------------------
// Header codec
// ---------------------------------------------------------------------------

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
      scheme: accepted.scheme ?? input.scheme,
      network: accepted.network ?? input.network,
      authorization: input.payload.authorization,
      signature: input.payload.signature,
      asset: accepted.asset ?? input.payload.asset,
      facilitator: input.facilitator ?? readX402Config().facilitatorAddress,
    };
  }

  return input as PaymentEnvelope;
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

function buildV2Accepted(requirements: PaymentRequirements) {
  const normalized = normalizeRequirements(requirements);
  return {
    scheme: normalized.scheme,
    network: normalized.network,
    asset: normalized.asset,
    amount: getRequirementAmount(normalized),
    payTo: normalized.payTo,
    maxTimeoutSeconds: normalized.maxTimeoutSeconds,
    extra: normalized.extra,
  };
}

function encodePaymentSignature(envelope: PaymentEnvelope, requirements: PaymentRequirements): string {
  const version = requirements.x402Version ?? envelope.x402Version ?? readX402Config().x402Version;
  if (version === 2) {
    return Buffer.from(JSON.stringify({
      x402Version: 2,
      accepted: buildV2Accepted(requirements),
      payload: {
        signature: envelope.signature,
        authorization: envelope.authorization,
      },
      resource: requirements.resource
        ? {
            url: requirements.resource,
            description: requirements.description,
            mimeType: 'application/json',
          }
        : undefined,
    }), 'utf-8').toString('base64');
  }

  return encodeXPayment({ ...envelope, x402Version: 1 });
}

// ---------------------------------------------------------------------------
// Outbound: agent paying a service
// ---------------------------------------------------------------------------

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
  // Standard USDC EIP-712 domain. The token contract on Kite testnet follows
  // the same shape; if it does not, override via env.
  return {
    name: process.env.KITE_USDC_DOMAIN_NAME || 'USD Coin',
    version: process.env.KITE_USDC_DOMAIN_VERSION || '2',
    chainId,
    verifyingContract: asset,
  };
}

function getServerWallet(): ethers.Wallet | null {
  const pk = process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) return null;
  const cfg = readX402Config();
  const provider = new ethers.JsonRpcProvider(cfg.rpcUrl);
  return new ethers.Wallet(pk, provider);
}

/**
 * Sign a TransferWithAuthorization for the supplied requirements.
 * Returns null if no server wallet is configured.
 */
export async function signPayment(
  requirements: PaymentRequirements,
  amountWei?: string,
): Promise<PaymentEnvelope | null> {
  const wallet = getServerWallet();
  if (!wallet) return null;

  const cfg = readX402Config();
  const normalized = normalizeRequirements(requirements);
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

  const domain = assetDomain(normalized.asset, cfg.chainId);
  const signature = await wallet.signTypedData(domain, TRANSFER_AUTH_TYPES, auth);

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

export interface PaidFetchOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  /** Ceiling for this single payment in USDC (decimal). */
  maxAmountUsdc?: number;
  /** Optional `KiteSession.id` for audit linking. */
  sessionId?: string;
}

export interface PaidFetchResult<T = unknown> {
  status: number;
  data: T;
  payment?: SettlementResult;
}

/**
 * Fetch a paid resource via x402:
 *   1) issue request, expect 402
 *   2) parse PaymentRequirements
 *   3) sign + encode X-Payment header
 *   4) re-issue, return body + settlement details
 *
 * Can return a simulated settlement only when KITE_X402_SIMULATE is explicitly
 * enabled. Otherwise missing signing configuration is a hard failure.
 */
export async function paidFetch<T = unknown>(opts: PaidFetchOptions): Promise<PaidFetchResult<T>> {
  const cfg = readX402Config();
  const method = opts.method || 'GET';

  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...opts.headers,
  };

  // Step 1: probe the resource
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
  const rawRequirements = headerBody?.accepts?.[0] ?? headerBody?.requirements ?? probe.data?.accepts?.[0] ?? probe.data?.requirements ?? probe.data;
  const requirements = normalizeRequirements(rawRequirements as PaymentRequirements);
  if (!requirements?.asset || !requirements.payTo) {
    throw new Error('[x402] 402 response missing payment requirements');
  }

  // Optional ceiling check
  if (opts.maxAmountUsdc !== undefined) {
    const amountUsdc = Number(ethers.formatUnits(getRequirementAmount(requirements) || '0', 6));
    if (amountUsdc > opts.maxAmountUsdc) {
      throw new Error(
        `[x402] service requested ${amountUsdc} USDC > session per-tx ceiling ${opts.maxAmountUsdc}`,
      );
    }
  }

  // Step 2: sign
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
        payer: '0xSIMULATED',
        payee: requirements.payTo,
        amount: getRequirementAmount(requirements),
      },
    };
  }

  // Step 3: re-issue with X-Payment
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
    const e = err as AxiosError;
    throw new Error(`[x402] paid request failed: ${e.message}`);
  }

  if (paid.status >= 400) {
    throw new Error(`[x402] service returned ${paid.status} after payment: ${JSON.stringify(paid.data)}`);
  }

  const settle = (paid.headers['x-payment-receipt'] as string | undefined) || paid.data?.payment;
  let receipt: SettlementResult = {
    success: true,
    network: requirements.network,
    facilitator: cfg.facilitatorAddress,
    payer: envelope.authorization.from,
    payee: envelope.authorization.to,
    amount: envelope.authorization.value,
  };
  if (settle && typeof settle === 'object' && 'txHash' in settle) {
    receipt = { ...receipt, ...(settle as object) } as SettlementResult;
  } else if (typeof settle === 'string') {
    receipt.txHash = settle;
  }

  return { status: paid.status, data: paid.data as T, payment: receipt };
}

// ---------------------------------------------------------------------------
// Inbound: we are the service. Helpers used by /api/x402/* routes.
// ---------------------------------------------------------------------------

/** Platform take rate — percentage of each x402 payment that goes to SportWarren. */
const DEFAULT_PLATFORM_FEE_PERCENT = 15;

export function getPlatformFeePercent(): number {
  return Number(process.env.PLATFORM_FEE_PERCENT || DEFAULT_PLATFORM_FEE_PERCENT);
}

export function getPlatformWallet(): string | null {
  const pk = process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) return null;
  return new ethers.Wallet(pk).address;
}

/**
 * Split a payment amount between service provider and platform.
 * Returns { providerAmount, platformAmount } in USDC (decimal).
 */
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
  const value = ethers.parseUnits(input.amountUsdc.toFixed(6), 6).toString();
  return {
    x402Version: cfg.x402Version,
    scheme: cfg.scheme,
    network: cfg.network,
    maxAmountRequired: value,
    amount: value,
    asset: cfg.assetAddress,
    payTo: input.payTo,
    maxTimeoutSeconds: 300,
    description: input.description,
    merchantName: input.merchantName,
    resource: input.resource,
    outputSchema: input.outputSchema,
  };
}

/**
 * Submit a received envelope to Pieverse `/v2/settle` to execute on chain.
 * Returns a simulated settlement only when KITE_X402_SIMULATE is explicitly
 * enabled. Otherwise facilitator failures fail the settlement.
 *
 * Pieverse expects the x402 canonical body shape:
 *   { x402Version, paymentPayload, paymentRequirements }
 * where `paymentPayload` wraps the signed envelope and `paymentRequirements`
 * is the same 402 challenge the service issued.
 */
export async function settleWithFacilitator(
  envelope: PaymentEnvelope,
  requirements?: PaymentRequirements,
): Promise<SettlementResult> {
  const cfg = readX402Config();
  const reqs: PaymentRequirements = normalizeRequirements(requirements ?? {
    scheme: envelope.scheme,
    network: envelope.network,
    maxAmountRequired: envelope.authorization.value,
    amount: envelope.authorization.value,
    asset: envelope.asset,
    payTo: envelope.authorization.to,
    maxTimeoutSeconds: 300,
  });
  const version = reqs.x402Version ?? envelope.x402Version ?? cfg.x402Version;
  const paymentPayload = version === 2
    ? {
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
              mimeType: 'application/json',
            }
          : undefined,
      }
    : {
        x402Version: 1,
        scheme: envelope.scheme,
        network: envelope.network,
        payload: {
          authorization: envelope.authorization,
          signature: envelope.signature,
          asset: envelope.asset,
        },
      };
  const body = {
    x402Version: version,
    paymentPayload,
    paymentRequirements: version === 2 ? buildV2Accepted(reqs) : reqs,
  };
  try {
    const res = await axios.post(
      `${cfg.facilitatorUrl}/v2/settle`,
      body,
      { timeout: 10_000, validateStatus: () => true },
    );
    if (res.status >= 200 && res.status < 300 && res.data?.success !== false) {
      return {
        success: true,
        txHash: res.data?.txHash || res.data?.transactionHash,
        network: envelope.network,
        facilitator: cfg.facilitatorAddress,
        payer: envelope.authorization.from,
        payee: envelope.authorization.to,
        amount: envelope.authorization.value,
      };
    }
    return {
      success: false,
      network: envelope.network,
      facilitator: cfg.facilitatorAddress,
      payer: envelope.authorization.from,
      payee: envelope.authorization.to,
      amount: envelope.authorization.value,
      error: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
    };
  } catch (err) {
    if (!isX402SimulationEnabled()) {
      return {
        success: false,
        network: envelope.network,
        facilitator: cfg.facilitatorAddress,
        payer: envelope.authorization.from,
        payee: envelope.authorization.to,
        amount: envelope.authorization.value,
        error: `facilitator unreachable: ${(err as Error).message}`,
      };
    }

    return {
      success: true,
      simulated: true,
      network: envelope.network,
      facilitator: cfg.facilitatorAddress,
      payer: envelope.authorization.from,
      payee: envelope.authorization.to,
      amount: envelope.authorization.value,
      error: `facilitator unreachable: ${(err as Error).message}`,
    };
  }
}

export function buildPaymentReceipt(result: SettlementResult): string {
  return JSON.stringify(result);
}
