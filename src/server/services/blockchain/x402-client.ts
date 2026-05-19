/**
 * Kite x402 client + 402 helpers.
 *
 * SportWarren now follows Kite's supported Passport flow:
 *   - services advertise `gokite-aa` / `kite-testnet` payment requirements
 *   - outbound payments execute through the official `kpass` Passport CLI
 *   - inbound services forward the received X-PAYMENT payload to the
 *     facilitator for settlement before doing work
 */

import axios from 'axios';
import { ethers } from 'ethers';
import { executeKitePassportRequest } from './kite-passport.js';

const DEFAULT_SCHEME = 'gokite-aa';
const DEFAULT_NETWORK = 'kite-testnet';
const DEFAULT_FACILITATOR = 'https://facilitator.pieverse.io';
const DEFAULT_FACILITATOR_ADDRESS = '0x12343e649e6b2b2b77649DFAb88f103c02F3C78b';
const DEFAULT_USDC = '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';
const DEFAULT_KITE_RPC = 'https://rpc-testnet.gokite.ai';
const DEFAULT_KITE_CHAIN_ID = 2368;
const DEFAULT_ASSET_DECIMALS = 18;
const DEFAULT_X402_VERSION = 1;

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

export type PaymentEnvelope = Record<string, any>;

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
    x402Version: version === 2 ? 2 : 1,
  };
}

function isX402SimulationEnabled(): boolean {
  return ['1', 'true', 'yes'].includes(
    (process.env.KITE_X402_SIMULATE || '').trim().toLowerCase(),
  );
}

export function encodeXPayment(envelope: PaymentEnvelope): string {
  return Buffer.from(JSON.stringify(envelope), 'utf-8').toString('base64');
}

export function decodeXPayment(header: string): PaymentEnvelope {
  return JSON.parse(Buffer.from(header, 'base64').toString('utf-8')) as PaymentEnvelope;
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

function getPayer(payload: PaymentEnvelope): string {
  return payload?.payload?.authorization?.from ??
    payload?.authorization?.from ??
    payload?.payer ??
    payload?.payer_addr ??
    'unknown';
}

function getPaymentPayloadAmount(payload: PaymentEnvelope, requirements: PaymentRequirements): string {
  return payload?.payload?.authorization?.value ??
    payload?.authorization?.value ??
    getRequirementAmount(requirements);
}

function readRequirementsFrom402(headers: any, data: any): PaymentRequirements {
  const headerRequirements = headers?.['payment-required'] as string | undefined;
  const headerBody = headerRequirements
    ? JSON.parse(Buffer.from(headerRequirements, 'base64').toString('utf-8'))
    : null;
  const raw = headerBody?.accepts?.[0] ??
    headerBody?.requirements ??
    data?.accepts?.[0] ??
    data?.requirements ??
    data;
  return normalizeRequirements(raw as PaymentRequirements);
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
    extra: normalized.extra ?? null,
  };
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

  const requirements = readRequirementsFrom402(probe.headers, probe.data);
  if (!requirements?.asset || !requirements.payTo) {
    throw new Error('[x402] 402 response missing payment requirements');
  }

  if (opts.maxAmountUsdc !== undefined) {
    const amountUsdc = Number(ethers.formatUnits(getRequirementAmount(requirements) || '0', cfg.assetDecimals));
    if (amountUsdc > opts.maxAmountUsdc) {
      throw new Error(
        `[x402] service requested ${amountUsdc} token > session per-tx ceiling ${opts.maxAmountUsdc}`,
      );
    }
  }

  try {
    const executed = await executeKitePassportRequest<T>({
      url: opts.url,
      method,
      headers: baseHeaders,
      body: opts.body,
    });
    if (executed.status >= 400) {
      throw new Error(`[x402] service returned ${executed.status} after Passport payment: ${JSON.stringify(executed.data)}`);
    }
    return {
      status: executed.status,
      data: executed.data,
      payment: {
        success: true,
        network: requirements.network,
        facilitator: cfg.facilitatorAddress,
        payer: executed.walletAddress ?? 'kite-passport',
        payee: requirements.payTo,
        amount: getRequirementAmount(requirements),
      },
    };
  } catch (err) {
    if (!isX402SimulationEnabled()) {
      throw err;
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
    extra: null,
    description: input.description,
    merchantName: input.merchantName,
    resource: input.resource,
    outputSchema: input.outputSchema,
  };
}

export async function settleWithFacilitator(
  envelope: PaymentEnvelope,
  requirements?: PaymentRequirements,
): Promise<SettlementResult> {
  const cfg = readX402Config();
  const reqs = normalizeRequirements(requirements ?? {
    scheme: envelope.scheme ?? cfg.scheme,
    network: envelope.network ?? cfg.network,
    maxAmountRequired: envelope?.payload?.authorization?.value ?? envelope?.authorization?.value ?? '0',
    amount: envelope?.payload?.authorization?.value ?? envelope?.authorization?.value ?? '0',
    asset: envelope.asset ?? cfg.assetAddress,
    payTo: envelope?.payload?.authorization?.to ?? envelope?.authorization?.to ?? '',
    maxTimeoutSeconds: 300,
  });
  const version = reqs.x402Version ?? cfg.x402Version;
  const paymentPayload = version === 2 && envelope.accepted
    ? envelope
    : version === 2
      ? {
          x402Version: 2,
          accepted: buildV2Accepted(reqs),
          payload: envelope.payload ?? envelope,
          resource: reqs.resource
            ? {
                url: reqs.resource,
                description: reqs.description,
                mimeType: reqs.mimeType ?? 'application/json',
              }
            : undefined,
        }
      : {
          x402Version: 1,
          scheme: envelope.scheme ?? reqs.scheme,
          network: envelope.network ?? reqs.network,
          payload: envelope.payload ?? envelope,
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
        txHash: res.data?.txHash || res.data?.transactionHash || res.data?.transaction,
        network: reqs.network,
        facilitator: cfg.facilitatorAddress,
        payer: getPayer(envelope),
        payee: reqs.payTo,
        amount: getPaymentPayloadAmount(envelope, reqs),
      };
    }
    return {
      success: false,
      network: reqs.network,
      facilitator: cfg.facilitatorAddress,
      payer: getPayer(envelope),
      payee: reqs.payTo,
      amount: getPaymentPayloadAmount(envelope, reqs),
      error: typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
    };
  } catch (err) {
    if (!isX402SimulationEnabled()) {
      return {
        success: false,
        network: reqs.network,
        facilitator: cfg.facilitatorAddress,
        payer: getPayer(envelope),
        payee: reqs.payTo,
        amount: getPaymentPayloadAmount(envelope, reqs),
        error: `facilitator unreachable: ${(err as Error).message}`,
      };
    }

    return {
      success: true,
      simulated: true,
      network: reqs.network,
      facilitator: cfg.facilitatorAddress,
      payer: getPayer(envelope),
      payee: reqs.payTo,
      amount: getPaymentPayloadAmount(envelope, reqs),
      error: `facilitator unreachable: ${(err as Error).message}`,
    };
  }
}

export function buildPaymentReceipt(result: SettlementResult): string {
  return JSON.stringify(result);
}
