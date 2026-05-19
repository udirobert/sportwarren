/**
 * Scout — x402 paid AI scouting reports on Kite.
 *
 * POST /api/x402/scout
 *   body: { opponent: string, requestedBy?: string }
 *   → 402 with PaymentRequirements if no X-Payment header
 *   → on payment, generates an AI scouting report, persists an
 *     `Attestation` on the Kite chain record, returns the report
 *     and settlement tx.
 *
 * Default price: KITE_SCOUT_PRICE_USDC (env, default 0.005 testnet token).
 * External agents can call this route directly. Internal WhatsApp commands use
 * the shared scout-report service without routing through Passport.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  buildPaymentRequirements,
  settleWithFacilitator,
  decodeXPayment,
  type PaymentEnvelope,
} from '@/server/services/blockchain/x402-client';
import { createScoutReport } from '@/server/services/ai/scout-report';

const SCOUT_PRICE_USDC = Number(process.env.KITE_SCOUT_PRICE_USDC || '0.005');

function getPayToAddress(): string {
  const configuredPayTo = process.env.KITE_X402_PAY_TO_ADDRESS?.trim();
  if (configuredPayTo) return ethers.getAddress(configuredPayTo);

  const pk = process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) throw new Error('WEB3_PRIVATE_KEY not configured');
  return new ethers.Wallet(pk).address;
}

function buildScoutRequirements() {
  return buildPaymentRequirements({
    payTo: getPayToAddress(),
    amountUsdc: SCOUT_PRICE_USDC,
    description: `SportWarren Scout — AI scouting report on Kite (${SCOUT_PRICE_USDC} USDC)`,
    merchantName: 'SportWarren',
    resource: '/api/x402/scout',
    outputSchema: {
      type: 'object',
      properties: {
        opponent: { type: 'string' },
        summary: { type: 'string' },
        attestationId: { type: 'string' },
        txHash: { type: 'string' },
      },
    },
  });
}

function build402(): NextResponse {
  const requirements = buildScoutRequirements();
  const paymentRequired = Buffer.from(JSON.stringify({
    x402Version: requirements.x402Version ?? 2,
    accepts: [requirements],
  }), 'utf-8').toString('base64');

  return NextResponse.json(
    { requirements, accepts: [requirements] },
    { status: 402, headers: { 'PAYMENT-REQUIRED': paymentRequired } },
  );
}

export async function GET() {
  return build402();
}

export async function POST(request: NextRequest) {
  const paymentHeader = request.headers.get('payment-signature') ?? request.headers.get('x-payment');
  if (!paymentHeader) return build402();

  // Decode + settle payment first; never produce work for an unpaid call.
  let envelope: PaymentEnvelope;
  try {
    envelope = decodeXPayment(paymentHeader);
  } catch {
    return NextResponse.json({ error: 'Invalid X-Payment header' }, { status: 400 });
  }

  const settlement = await settleWithFacilitator(envelope, buildScoutRequirements());
  if (!settlement.success && !settlement.simulated) {
    return NextResponse.json(
      { error: 'Payment settlement failed', details: settlement.error },
      { status: 402 },
    );
  }

  let body: { opponent?: string; requestedBy?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const opponent = (body.opponent ?? '').trim();
  if (!opponent) {
    return NextResponse.json({ error: 'Missing opponent' }, { status: 400 });
  }

  try {
    const report = await createScoutReport({
      opponent,
      requestedBy: body.requestedBy,
      priceUsdc: SCOUT_PRICE_USDC,
      settlement,
      enforceUserLimit: true,
    });
    return NextResponse.json(report);
  } catch (err) {
    const status = typeof (err as any).status === 'number' ? (err as any).status : 500;
    return NextResponse.json(
      {
        error: (err as Error).message,
        limitUsdc: (err as any).limitUsdc,
        remaining: (err as any).remaining,
      },
      { status },
    );
  }
}
