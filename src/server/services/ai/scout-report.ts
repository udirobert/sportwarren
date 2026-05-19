import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { generateInference } from '@/lib/ai/inference';
import { AGENT_PERSONAS } from '@/server/services/ai/prompts';
import { readX402Config, type SettlementResult } from '@/server/services/blockchain/x402-client';
import { kiteAIService } from './kite';

export interface ScoutReportInput {
  opponent: string;
  requestedBy?: string;
  priceUsdc: number;
  settlement: Pick<SettlementResult, 'txHash' | 'facilitator' | 'simulated'>;
  enforceUserLimit?: boolean;
  enforceSquadLimit?: boolean;
}

export interface ScoutReportResult {
  opponent: string;
  summary: string;
  attestationId: string;
  txHash: string | null;
  simulated: boolean;
  network: string;
  priceUsdc: number;
  dataSources: string[];
  subjectType: string;
  subjectId: string;
}

export async function createScoutReport(input: ScoutReportInput): Promise<ScoutReportResult> {
  const opponent = input.opponent.trim();
  if (!opponent) throw new Error('Missing opponent');

  let subjectType = 'player';
  let subjectId = input.requestedBy ?? 'anonymous';
  let squadContext = '';
  let requestingSquadId: string | null = null;

  if (input.requestedBy) {
    const user = await prisma.user.findUnique({
      where: { id: input.requestedBy },
      include: { squads: { take: 1, where: { status: 'active' }, include: { squad: true } } },
    });

    const squad = user?.squads[0]?.squad;
    if (squad) {
      subjectType = 'squad';
      subjectId = squad.id;
      requestingSquadId = squad.id;

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
        const form = recentMatches.map((match) => {
          const isHome = match.homeSquadId === squad.id;
          const us = isHome ? match.homeScore : match.awayScore;
          const them = isHome ? match.awayScore : match.homeScore;
          const opponentName = isHome ? match.awaySquad.name : match.homeSquad.name;
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
          const h2h = headToHead.map((match) => {
            const isHome = match.homeSquadId === squad.id;
            const us = isHome ? match.homeScore : match.awayScore;
            const them = isHome ? match.awayScore : match.homeScore;
            return `${match.homeSquadId === squad.id ? 'H' : 'A'} ${us}-${them}`;
          }).join(', ');
          squadContext += `\nHead-to-head vs ${opponentSquad.name}: ${h2h}.`;
        }
      }
    } else if (user) {
      subjectType = 'player';
      subjectId = user.id;
    }
  }

  if (input.requestedBy && input.enforceUserLimit !== false) {
    const scoutLimit = kiteAIService.getScoutUserDailyLimit(input.requestedBy);
    const guard = await kiteAIService.checkUserSpending(input.requestedBy, input.priceUsdc, scoutLimit);
    if (!guard.ok) {
      const error = new Error('Daily scout limit reached');
      Object.assign(error, { limitUsdc: scoutLimit, remaining: guard.remaining, status: 429 });
      throw error;
    }
  }

  if (requestingSquadId && input.enforceSquadLimit) {
    const squadLimit = kiteAIService.getScoutSquadDailyLimit(requestingSquadId);
    const guard = await kiteAIService.checkSquadSpending(requestingSquadId, input.priceUsdc, squadLimit);
    if (!guard.ok) {
      const error = new Error('Squad daily scout limit reached');
      Object.assign(error, { limitUsdc: squadLimit, remaining: guard.remaining, status: 429 });
      throw error;
    }
  }

  const persona = AGENT_PERSONAS.VISION_SCOUT;
  let summary = `Scouting report on ${opponent}: no recent telemetry. Treat as unknown threat - keep formation tight, exploit set-pieces.`;
  try {
    const contextBlock = squadContext ? `\n\nREAL DATA FOR THIS REQUEST:${squadContext}` : '';
    const ai = await generateInference(
      [{ role: 'user', content: `Give a tight 3-sentence scouting brief on ${opponent} for an amateur football squad. Mention likely formation, one strength, one weakness, and a tactical recommendation. No markdown.${contextBlock}` }],
      { systemPrompt: persona.systemPrompt, max_tokens: 200, temperature: 0.4 },
    );
    if (ai?.content) summary = ai.content.trim();
  } catch (err) {
    console.warn('[scout] AI inference failed, using deterministic summary', err);
  }

  const cfg = readX402Config();
  const txHash = input.settlement.txHash ?? `internal-scout-${Date.now()}`;
  const attestation = await prisma.attestation.create({
    data: {
      subjectType,
      subjectId,
      kind: 'scout_report',
      payload: { opponent, summary, requestedBy: input.requestedBy ?? null } as Prisma.InputJsonValue,
      network: cfg.network,
      txHash,
      facilitator: input.settlement.facilitator,
      amountUsdc: input.priceUsdc,
    },
  });

  const dataSources: string[] = [];
  if (squadContext.includes('recent form')) dataSources.push('your squad recent match form');
  if (squadContext.includes('Head-to-head')) dataSources.push('head-to-head history vs opponent');
  if (!dataSources.length) dataSources.push('no stored match data - report is AI-generated from general knowledge only');

  return {
    opponent,
    summary,
    attestationId: attestation.id,
    txHash,
    simulated: input.settlement.simulated ?? false,
    network: cfg.network,
    priceUsdc: input.priceUsdc,
    dataSources,
    subjectType,
    subjectId,
  };
}
