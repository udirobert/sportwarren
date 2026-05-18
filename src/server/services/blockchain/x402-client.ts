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

export type X402Config = {
  facilitatorUrl: string;
  facilitatorAddress: string;
  scheme: string;
  network: string;
  assetAddress: string;
  rpcUrl: string;
  chainId: number;
};

export function readX402Config(): X402Config {
  return {
    facilitatorUrl: process.env.KITE_FACILITATOR_URL || DEFAULT_FACILITATOR,
    facilitatorAddress: process.env.KITE_FACILITATOR_ADDRESS || DEFAULT_FACILITATOR_ADDRESS,
    scheme: process.env.KITE_X402_SCHEME || DEFAULT_SCHEME,
    network: process.env.KITE_X402_NETWORK || DEFAULT_NETWORK,
    assetAddress: process.env.KITE_USDC_ADDRESS || DEFAULT_USDC,
    rpcUrl: process.env.KITE_RPC_URL || process.env.NEXT_PUBLIC_KITE_RPC_URL || DEFAULT_KITE_RPC,
    chainId: Number(process.env.KITE_CHAIN_ID || DEFAULT_KITE_CHAIN_ID),
  };
}

// ---------------------------------------------------------------------------
// Wire types
// ---------------------------------------------------------------------------

/** Body returned by a service in its HTTP 402 response. */
export interface PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string;     // wei (as decimal string)
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
  return JSON.parse(Buffer.from(header, 'base64').toString('utf-8')) as PaymentEnvelope;
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
  const value = amountWei ?? requirements.maxAmountRequired;

  const now = Math.floor(Date.now() / 1000);
  const auth: TransferAuthorization = {
    from: await wallet.getAddress(),
    to: requirements.payTo,
    value,
    validAfter: String(now - 60),
    validBefore: String(now + Math.max(60, requirements.maxTimeoutSeconds || 300)),
    nonce: ethers.hexlify(ethers.randomBytes(32)),
  };

  const domain = assetDomain(requirements.asset, cfg.chainId);
  const signature = await wallet.signTypedData(domain, TRANSFER_AUTH_TYPES, auth);

  return {
    scheme: requirements.scheme,
    network: requirements.network,
    authorization: auth,
    signature,
    asset: requirements.asset,
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
 * Falls back to a simulated settlement if no server wallet is configured —
 * the response is clearly flagged with `simulated: true`.
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

  const requirements = (probe.data?.requirements ?? probe.data) as PaymentRequirements;
  if (!requirements?.asset || !requirements.payTo) {
    throw new Error('[x402] 402 response missing payment requirements');
  }

  // Optional ceiling check
  if (opts.maxAmountUsdc !== undefined) {
    const amountUsdc = Number(ethers.formatUnits(requirements.maxAmountRequired || '0', 6));
    if (amountUsdc > opts.maxAmountUsdc) {
      throw new Error(
        `[x402] service requested ${amountUsdc} USDC > session per-tx ceiling ${opts.maxAmountUsdc}`,
      );
    }
  }

  // Step 2: sign
  const envelope = await signPayment(requirements);
  if (!envelope) {
    // Graceful demo mode: no wallet → simulated settlement
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
        amount: requirements.maxAmountRequired,
      },
    };
  }

  // Step 3: re-issue with X-Payment
  let paid;
  try {
    paid = await axios.request({
      url: opts.url,
      method,
      headers: { ...baseHeaders, 'X-PAYMENT': encodeXPayment(envelope) },
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
    scheme: cfg.scheme,
    network: cfg.network,
    maxAmountRequired: value,
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
 * Returns null txHash + simulated flag if facilitator is unreachable.
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
  const reqs: PaymentRequirements = requirements ?? {
    scheme: envelope.scheme,
    network: envelope.network,
    maxAmountRequired: envelope.authorization.value,
    asset: envelope.asset,
    payTo: envelope.authorization.to,
    maxTimeoutSeconds: 300,
  };
  const body = {
    x402Version: 1,
    paymentPayload: {
      x402Version: 1,
      scheme: envelope.scheme,
      network: envelope.network,
      payload: {
        authorization: envelope.authorization,
        signature: envelope.signature,
        asset: envelope.asset,
      },
    },
    paymentRequirements: reqs,
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
