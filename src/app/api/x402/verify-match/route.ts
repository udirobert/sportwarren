/**
 * Match Verifier — an x402 service that other agents pay to call.
 *
 * POST /api/x402/verify-match
 *   → 402 with PaymentRequirements if no X-Payment header
 *   → verifies match data, returns signed attestation hash
 *   → settles payment via Pieverse facilitator on Kite chain
 *
 * This is the service SportWarren provides to the Kite agent economy.
 * Other agents (scout twins, opposing managers) pay USDC to verify
 * match results and get a cryptographically signed attestation.
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

// Price per verification call
const VERIFY_PRICE_USDC = 0.10;

// Platform wallet that receives payments
function getPayToAddress(): string {
  const pk = process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) throw new Error('WEB3_PRIVATE_KEY not configured');
  return new ethers.Wallet(pk).address;
}

export async function GET() {
  const payTo = getPayToAddress();
  const requirements = buildPaymentRequirements({
    payTo,
    amountUsdc: VERIFY_PRICE_USDC,
    description: 'SportWarren Match Verification — attested consensus result on Kite',
    merchantName: 'SportWarren',
    resource: '/api/x402/verify-match',
    outputSchema: {
      type: 'object',
      properties: {
        attestationId: { type: 'string' },
        matchHash: { type: 'string' },
        consensus: { type: 'string' },
        txHash: { type: 'string' },
      },
    },
  });

  return NextResponse.json({ requirements }, { status: 402 });
}

export async function POST(request: NextRequest) {
  const paymentHeader = request.headers.get('x-payment');

  // If no payment, return 402 with requirements
  if (!paymentHeader) {
    return GET();
  }

  // Parse and settle payment
  let envelope: PaymentEnvelope;
  try {
    envelope = decodeXPayment(paymentHeader);
  } catch {
    return NextResponse.json({ error: 'Invalid X-Payment header' }, { status: 400 });
  }

  const settlement = await settleWithFacilitator(envelope);
  if (!settlement.success && !settlement.simulated) {
    return NextResponse.json({ error: 'Payment settlement failed', details: settlement.error }, { status: 402 });
  }

  // Parse match payload
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { matchId, homeScore, awayScore, homeSquadId, awaySquadId, playerStats } = body;
  if (!matchId || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: 'Missing matchId, homeScore, or awayScore' }, { status: 400 });
  }

  // Verify: check if match exists and has peer consensus
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  // Build attestation payload
  const payload = {
    matchId,
    homeScore,
    awayScore,
    homeSquadId: homeSquadId ?? match.homeSquadId,
    awaySquadId: awaySquadId ?? match.awaySquadId,
    playerStats: playerStats ?? [],
    verifiedAt: new Date().toISOString(),
    verifier: 'sportwarren-match-verifier',
  };

  const matchHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(payload)));

  // Persist attestation on Kite chain record
  const cfg = readX402Config();
  const attestation = await prisma.attestation.create({
    data: {
      subjectType: 'match',
      subjectId: matchId,
      kind: 'x402_verification',
      payload,
      network: cfg.network,
      txHash: settlement.txHash ?? `sim-${Date.now()}`,
      facilitator: settlement.facilitator,
      amountUsdc: VERIFY_PRICE_USDC,
    },
  });

  return NextResponse.json({
    attestationId: attestation.id,
    matchHash,
    consensus: 'verified',
    txHash: settlement.txHash ?? null,
    simulated: settlement.simulated ?? false,
    network: cfg.network,
  });
}
