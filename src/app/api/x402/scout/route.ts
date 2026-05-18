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
 * Default price: KITE_SCOUT_PRICE_USDC (env, default 0.50 USDC).
 * Used by the WhatsApp `scout <opponent>` command via
 * KITE_SCOUT_SERVICE_URL, but any agent can call it directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '@/lib/db';
import {
  buildPaymentRequirements,
  settleWithFacilitator,
  decodeXPayment,
  readX402Config,
  type PaymentEnvelope,
} from '@/server/services/blockchain/x402-client';
import { generateInference } from '@/lib/ai/inference';
import { AGENT_PERSONAS } from '@/server/services/ai/prompts';

const SCOUT_PRICE_USDC = Number(process.env.KITE_SCOUT_PRICE_USDC || '0.50');

function getPayToAddress(): string {
  const pk = process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) throw new Error('WEB3_PRIVATE_KEY not configured');
  return new ethers.Wallet(pk).address;
}

function build402(): NextResponse {
  const payTo = getPayToAddress();
  const requirements = buildPaymentRequirements({
    payTo,
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
  return NextResponse.json({ requirements }, { status: 402 });
}

export async function GET() {
  return build402();
}

export async function POST(request: NextRequest) {
  const paymentHeader = request.headers.get('x-payment');
  if (!paymentHeader) return build402();

  // Decode + settle payment first; never produce work for an unpaid call.
  let envelope: PaymentEnvelope;
  try {
    envelope = decodeXPayment(paymentHeader);
  } catch {
    return NextResponse.json({ error: 'Invalid X-Payment header' }, { status: 400 });
  }

  const settlement = await settleWithFacilitator(envelope);
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

  // Generate the report. Falls back to a deterministic blurb if AI is unavailable.
  const persona = AGENT_PERSONAS.VISION_SCOUT;
  let summary = `Scouting report on ${opponent}: no recent telemetry. Treat as unknown threat — keep formation tight, exploit set-pieces.`;
  try {
    const ai = await generateInference(
      [{ role: 'user', content: `Give a tight 3-sentence scouting brief on ${opponent} for an amateur football squad. Mention likely formation, one strength, one weakness, and a tactical recommendation. No markdown.` }],
      { systemPrompt: persona.systemPrompt, max_tokens: 200, temperature: 0.4 },
    );
    if (ai?.content) summary = ai.content.trim();
  } catch (err) {
    console.warn('[scout] AI inference failed, using deterministic summary', err);
  }

  // Persist attestation on Kite chain record
  const cfg = readX402Config();
  const attestation = await prisma.attestation.create({
    data: {
      subjectType: 'squad',
      subjectId: body.requestedBy ?? 'external',
      kind: 'scout_report',
      payload: { opponent, summary, requestedBy: body.requestedBy ?? null },
      network: cfg.network,
      txHash: settlement.txHash ?? `sim-${Date.now()}`,
      facilitator: settlement.facilitator,
      amountUsdc: SCOUT_PRICE_USDC,
    },
  });

  return NextResponse.json({
    opponent,
    summary,
    attestationId: attestation.id,
    txHash: settlement.txHash ?? null,
    simulated: settlement.simulated ?? false,
    network: cfg.network,
    priceUsdc: SCOUT_PRICE_USDC,
  });
}
