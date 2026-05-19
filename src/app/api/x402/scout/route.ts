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
import { kiteAIService } from '@/server/services/ai/kite';

const SCOUT_PRICE_USDC = Number(process.env.KITE_SCOUT_PRICE_USDC || '0.50');
const SCOUT_MAX_USDC = Number(process.env.KITE_SCOUT_MAX_USDC || '0.50');

function getPayToAddress(): string {
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

  // ── Per-user-per-day spending guard ──────────────────────────────
  if (body.requestedBy) {
    const guard = await kiteAIService.checkUserSpending(
      body.requestedBy,
      SCOUT_PRICE_USDC,
      SCOUT_MAX_USDC,
    );
    if (!guard.ok) {
      return NextResponse.json(
        {
          error: 'Daily scout limit reached',
          limitUsdc: SCOUT_MAX_USDC,
          remaining: guard.remaining,
        },
        { status: 429 },
      );
    }
  }

  // Gather context + resolve attestation subject.
  // Schema: subjectType ∈ {'player' | 'squad' | 'match' | 'agent'}
  // Default fallback ensures TS strict-mode safety — overwritten below when possible.
  let subjectType: string = 'player';
  let subjectId: string = body.requestedBy ?? 'anonymous';

  let squadContext = '';
  if (body.requestedBy) {
    const user = await prisma.user.findUnique({
      where: { id: body.requestedBy },
      include: { squads: { take: 1, where: { status: 'active' }, include: { squad: true } } },
    });
    const squad = user?.squads[0]?.squad;
    if (squad) {
      subjectType = 'squad';
      subjectId = squad.id;

      // Enrich the prompt with real match data
      const recentMatches = await prisma.match.findMany({
        where: {
          OR: [{ homeSquadId: squad.id }, { awaySquadId: squad.id }],
          status: { in: ['verified', 'finalized'] },
        },
        include: {
          homeSquad: { select: { name: true } },
          awaySquad: { select: { name: true } },
        },
        orderBy: { matchDate: 'desc' },
        take: 3,
      });
      if (recentMatches.length > 0) {
        const form = recentMatches.map(m => {
          const isHome = m.homeSquadId === squad.id;
          const us = isHome ? m.homeScore : m.awayScore;
          const them = isHome ? m.awayScore : m.homeScore;
          const opponentName = isHome ? m.awaySquad.name : m.homeSquad.name;
          return `${opponentName} (${us}-${them})`;
        }).join(', ');
        squadContext += `\nRequesting squad recent form: ${form}.`;
      }

      const opponentSquad = await prisma.squad.findFirst({
        where: {
          name: { contains: opponent, mode: 'insensitive' },
          id: { not: squad.id },
        },
      });
      if (opponentSquad) {
        const headToHead = await prisma.match.findMany({
          where: {
            OR: [
              { homeSquadId: squad.id, awaySquadId: opponentSquad.id },
              { homeSquadId: opponentSquad.id, awaySquadId: squad.id },
            ],
            status: { in: ['verified', 'finalized'] },
          },
          take: 3,
          orderBy: { matchDate: 'desc' },
        });
        if (headToHead.length > 0) {
          const h2h = headToHead.map(m => {
            const isHome = m.homeSquadId === squad.id;
            const us = isHome ? m.homeScore : m.awayScore;
            const them = isHome ? m.awayScore : m.homeScore;
            return `${m.homeSquadId === squad.id ? 'H' : 'A'} ${us}-${them}`;
          }).join(', ');
          squadContext += `\nHead-to-head vs ${opponentSquad.name}: ${h2h}.`;
        }
      }
    } else if (user) {
      // User exists but has no active squad — attest to the player
      subjectType = 'player';
      subjectId = user.id;
    }
  }

  // Final fallback when no requestedBy or user not found — attest to the
  // opponent squad if it exists, otherwise the match-level.
  if (!subjectType) {
    const opponentSquad = await prisma.squad.findFirst({
      where: { name: { contains: opponent, mode: 'insensitive' } },
    });
    if (opponentSquad) {
      subjectType = 'squad';
      subjectId = opponentSquad.id;
    } else {
      subjectType = 'match';
      subjectId = `scout:${opponent.toLowerCase().replace(/\s+/g, '-')}`;
    }
  }

  // Generate the report. Falls back to a deterministic blurb if AI is unavailable.
  const persona = AGENT_PERSONAS.VISION_SCOUT;
  let summary = `Scouting report on ${opponent}: no recent telemetry. Treat as unknown threat — keep formation tight, exploit set-pieces.`;
  try {
    const contextBlock = squadContext
      ? `\n\nREAL DATA FOR THIS REQUEST:${squadContext}`
      : '';
    const ai = await generateInference(
      [{ role: 'user', content: `Give a tight 3-sentence scouting brief on ${opponent} for an amateur football squad. Mention likely formation, one strength, one weakness, and a tactical recommendation. No markdown.${contextBlock}` }],
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
      subjectType,
      subjectId,
      kind: 'scout_report',
      payload: { opponent, summary, requestedBy: body.requestedBy ?? null },
      network: cfg.network,
      txHash: settlement.txHash ?? `sim-${Date.now()}`,
      facilitator: settlement.facilitator,
      amountUsdc: SCOUT_PRICE_USDC,
    },
  });

  // Determine data provenance for transparency.
  const dataSources: string[] = [];
  if (squadContext.includes('recent form')) dataSources.push('your squad recent match form');
  if (squadContext.includes('Head-to-head')) dataSources.push('head-to-head history vs opponent');
  if (!dataSources.length) dataSources.push('no stored match data — report is AI-generated from general knowledge only');

  return NextResponse.json({
    opponent,
    summary,
    attestationId: attestation.id,
    txHash: settlement.txHash ?? null,
    simulated: settlement.simulated ?? false,
    network: cfg.network,
    priceUsdc: SCOUT_PRICE_USDC,
    dataSources, // transparently tells the user what real data informed this report
  });
}
