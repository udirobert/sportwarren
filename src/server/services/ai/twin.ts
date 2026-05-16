/**
 * Player Twin service — Kite Passport-backed autonomous agents per player.
 *
 * Each twin:
 *   • Accepts attestations (match results, peer ratings, activity) that update its stats
 *   • Can hire coaches via x402 (time-decaying stat modifiers)
 *   • Can compete in overnight simulated tournaments
 *   • Has a spending session with budget the captain approves
 *
 * Stat = base + sum(active CoachingEffect modifiers)
 */

import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { kiteAIService } from './kite';
import { WhatsAppService } from '../communication/whatsapp';

export class PlayerTwinService {
  private whatsapp: WhatsAppService;

  constructor(private db: PrismaClient = prisma) {
    this.whatsapp = new WhatsAppService();
  }

  /**
   * Get or create a twin for a player profile.
   * Creates the backing AiAgent (Kite Passport) if it doesn't exist.
   */
  async getOrCreateTwin(profileId: string, displayName: string) {
    const existing = await this.db.playerTwin.findUnique({
      where: { profileId },
      include: { agent: true },
    });
    if (existing) return existing;

    // Create the backing AiAgent via kite service
    const agent = await kiteAIService.upsertPlayerTwinAgent(profileId, displayName);
    if (!agent) throw new Error('Failed to create twin agent');

    return this.db.playerTwin.create({
      data: {
        profileId,
        agentId: agent.id,
        baseAttributes: {
          pace: 50, shooting: 50, passing: 50,
          dribbling: 50, defending: 50, physical: 50,
        },
      },
      include: { agent: true },
    });
  }

  /**
   * Record an attestation that updates the twin's stats.
   * Every IRL input (match result, peer rating, Strava run) flows through here.
   */
  async recordAttestation(input: {
    profileId: string;
    kind: string;
    payload: Record<string, unknown>;
    attributeDeltas?: Record<string, number>; // { shooting: +2, pace: -1 }
    xpGain?: number;
  }) {
    const twin = await this.db.playerTwin.findUnique({
      where: { profileId: input.profileId },
    });
    if (!twin) throw new Error('Twin not found — call getOrCreateTwin first');

    // Apply attribute deltas
    if (input.attributeDeltas) {
      const base = twin.baseAttributes as Record<string, number>;
      const updated = { ...base };
      for (const [attr, delta] of Object.entries(input.attributeDeltas)) {
        updated[attr] = Math.max(0, Math.min(99, (updated[attr] ?? 50) + delta));
      }
      await this.db.playerTwin.update({
        where: { id: twin.id },
        data: { baseAttributes: updated },
      });
    }

    // Apply XP
    if (input.xpGain) {
      const newXp = twin.xp + input.xpGain;
      const nextLevelXp = twin.level * 500;
      const levelUp = newXp >= nextLevelXp;
      await this.db.playerTwin.update({
        where: { id: twin.id },
        data: {
          xp: levelUp ? newXp - nextLevelXp : newXp,
          level: levelUp ? twin.level + 1 : twin.level,
          prestige: twin.prestige + (input.xpGain > 100 ? 2 : 1),
        },
      });
    }

    // Persist attestation (linked to the twin's agent)
    await this.db.attestation.create({
      data: {
        subjectType: 'player',
        subjectId: input.profileId,
        kind: input.kind,
        payload: input.payload as any,
        signerAgentId: twin.agentId,
        network: 'kite-testnet',
      },
    });

    // Update last attestation timestamp
    await this.db.playerTwin.update({
      where: { id: twin.id },
      data: { lastAttestationAt: new Date() },
    });

    // --- KITE-WHATSAPP BRIDGE ---
    // Notify player via WhatsApp if they have a linked identity
    try {
      const identity = await this.db.platformIdentity.findFirst({
        where: { 
          platform: 'whatsapp',
          user: { id: input.profileId }
        },
      });

      if (identity?.platformUserId && this.whatsapp.isConfigured()) {
        let message = `Kite Chain Attestation Verified: Your digital twin just recorded a new '${input.kind.replace('_', ' ')}' event.`;
        if (input.xpGain) message += ` \n\n📈 +${input.xpGain} XP Earned.`;
        if (input.attributeDeltas) {
          const attrs = Object.keys(input.attributeDeltas).join(', ');
          message += ` \n⚽ Skills improved: ${attrs}.`;
        }
        message += `\n\nYour legend is growing on the Kite Agentic Economy. - Marcus`;

        await this.whatsapp.sendText(identity.platformUserId, message);
      }
    } catch (notifyErr) {
      console.warn('[Kite Bridge] Failed to send WhatsApp notification:', notifyErr);
    }
  }

  /**
   * Get the twin's effective stats (base + active coaching modifiers).
   */
  async getEffectiveStats(profileId: string): Promise<Record<string, number>> {
    const twin = await this.db.playerTwin.findUnique({
      where: { profileId },
    });
    if (!twin) throw new Error('Twin not found');

    const base = twin.baseAttributes as Record<string, number>;
    const effective = { ...base };

    // Apply active coaching effects
    const effects = await this.db.coachingEffect.findMany({
      where: {
        targetType: 'player',
        targetId: profileId,
        active: true,
        expiresAt: { gt: new Date() },
      },
    });

    for (const effect of effects) {
      effective[effect.attribute] = Math.max(0, Math.min(99,
        (effective[effect.attribute] ?? 50) + effect.modifier
      ));
    }

    return effective;
  }

  /**
   * Hire a coach agent for this twin — creates a spending session and
   * records a CoachingEffect with time-decay.
   */
  async hireCoach(input: {
    profileId: string;
    coachAgentId: string;
    attribute: string;
    modifier: number;
    durationDays: number;
    priceUsdc: number;
  }) {
    const twin = await this.db.playerTwin.findUnique({
      where: { profileId: input.profileId },
    });
    if (!twin) throw new Error('Twin not found');

    // Create spending session for this hire
    const session = await kiteAIService.createSession({
      agentId: twin.agentId,
      taskSummary: `Hire coach for ${input.attribute} (+${input.modifier}) for ${input.durationDays}d`,
      maxPerTxUsdc: input.priceUsdc,
      maxTotalUsdc: input.priceUsdc * 30, // ~30 calls during the hire period
      ttlSeconds: input.durationDays * 86400,
      scope: { coachAgentId: input.coachAgentId, attribute: input.attribute },
    });

    // Create coaching effect with expiry
    const effect = await this.db.coachingEffect.create({
      data: {
        targetType: 'player',
        targetId: input.profileId,
        coachAgentId: input.coachAgentId,
        attribute: input.attribute,
        modifier: input.modifier,
        reason: `Coach hired for ${input.durationDays} days`,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + input.durationDays * 86400 * 1000),
        active: true,
      },
    });

    // Record the hire as an attestation
    await this.db.attestation.create({
      data: {
        subjectType: 'player',
        subjectId: input.profileId,
        kind: 'coach_hire',
        payload: {
          coachAgentId: input.coachAgentId,
          attribute: input.attribute,
          modifier: input.modifier,
          durationDays: input.durationDays,
          priceUsdc: input.priceUsdc,
        } as any,
        signerAgentId: twin.agentId,
        network: 'kite-testnet',
        sessionId: session.id,
      },
    });

    return { session, effect };
  }

  /**
   * Run a round-robin simulation between twins.
   * Each twin's effective stats determine match outcomes.
   */
  async runSimulation(input: {
    name: string;
    twinIds: string[];
    entryFeeUsdc?: number;
  }) {
    if (input.twinIds.length < 2) throw new Error('Need at least 2 twins');

    // Create simulation
    const simulation = await this.db.twinSimulation.create({
      data: {
        name: input.name,
        entryFeeUsdc: input.entryFeeUsdc ?? 0,
        totalPrizeUsdc: (input.entryFeeUsdc ?? 0) * input.twinIds.length,
        status: 'running',
        startedAt: new Date(),
      },
    });

    // Register participants
    for (const twinId of input.twinIds) {
      await this.db.twinSimulationParticipant.create({
        data: { simulationId: simulation.id, twinId },
      });
    }

    // Get effective stats for all twins
    const twinStats: Array<{ twinId: string; stats: Record<string, number> }> = [];
    for (const twinId of input.twinIds) {
      const twin = await this.db.playerTwin.findUnique({ where: { id: twinId } });
      if (!twin) continue;
      const stats = await this.getEffectiveStats(twin.profileId);
      twinStats.push({ twinId, stats });
    }

    // Round-robin: every pair plays once
    const matches: Array<{ homeIdx: number; awayIdx: number; homeScore: number; awayScore: number }> = [];
    for (let i = 0; i < twinStats.length; i++) {
      for (let j = i + 1; j < twinStats.length; j++) {
        const result = this.simulateMatch(twinStats[i].stats, twinStats[j].stats);
        matches.push({ homeIdx: i, awayIdx: j, ...result });
      }
    }

    // Persist match results and update standings
    for (const m of matches) {
      const homeTwin = twinStats[m.homeIdx];
      const awayTwin = twinStats[m.awayIdx];

      await this.db.twinSimulationMatch.create({
        data: {
          simulationId: simulation.id,
          homeTwinId: homeTwin.twinId,
          awayTwinId: awayTwin.twinId,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          playedAt: new Date(),
        },
      });

      // Update participant standings
      await this.updateStanding(simulation.id, homeTwin.twinId, m.homeScore, m.awayScore);
      await this.updateStanding(simulation.id, awayTwin.twinId, m.awayScore, m.homeScore);
    }

    // Complete simulation
    await this.db.twinSimulation.update({
      where: { id: simulation.id },
      data: { status: 'completed', completedAt: new Date() },
    });

    // Distribute prizes if there's an entry fee
    if ((input.entryFeeUsdc ?? 0) > 0) {
      await this.distributePrizes(simulation.id);
    }

    return { simulation, matches };
  }

  /**
   * Simulate a match between two attribute vectors.
   * Weighted random based on attack/defense/midfield differentials.
   */
  private simulateMatch(
    home: Record<string, number>,
    away: Record<string, number>,
  ): { homeScore: number; awayScore: number } {
    const homeAttack = (home.shooting ?? 50) + (home.pace ?? 50) * 0.3;
    const homeDefense = (home.defending ?? 50) + (home.physical ?? 50) * 0.2;
    const awayAttack = (away.shooting ?? 50) + (away.pace ?? 50) * 0.3;
    const awayDefense = (away.defending ?? 50) + (away.physical ?? 50) * 0.2;

    const homeExpected = Math.max(0.2, (homeAttack - awayDefense) / 100 + 1.2);
    const awayExpected = Math.max(0.2, (awayAttack - homeDefense) / 100 + 0.9); // home advantage

    const homeScore = Math.floor(this.poissonSample(homeExpected));
    const awayScore = Math.floor(this.poissonSample(awayExpected));

    return { homeScore, awayScore };
  }

  private poissonSample(lambda: number): number {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }

  private async updateStanding(simulationId: string, twinId: string, goalsFor: number, goalsAgainst: number) {
    const standing = await this.db.twinSimulationParticipant.findUnique({
      where: { simulationId_twinId: { simulationId, twinId } },
    });
    if (!standing) return;

    const isWin = goalsFor > goalsAgainst;
    const isDraw = goalsFor === goalsAgainst;

    await this.db.twinSimulationParticipant.update({
      where: { id: standing.id },
      data: {
        wins: standing.wins + (isWin ? 1 : 0),
        draws: standing.draws + (isDraw ? 1 : 0),
        losses: standing.losses + (!isWin && !isDraw ? 1 : 0),
        goalsFor: standing.goalsFor + goalsFor,
        goalsAgainst: standing.goalsAgainst + goalsAgainst,
        points: standing.points + (isWin ? 3 : isDraw ? 1 : 0),
      },
    });
  }

  private async distributePrizes(simulationId: string) {
    const participants = await this.db.twinSimulationParticipant.findMany({
      where: { simulationId },
      orderBy: { points: 'desc' },
    });

    const simulation = await this.db.twinSimulation.findUnique({
      where: { id: simulationId },
    });
    if (!simulation || simulation.totalPrizeUsdc <= 0) return;

    // Winner takes all (or split top 3)
    const prizes = participants.length >= 3
      ? [0.6, 0.3, 0.1]
      : [1.0];

    for (let i = 0; i < Math.min(prizes.length, participants.length); i++) {
      const prize = simulation.totalPrizeUsdc * prizes[i];
      await this.db.twinSimulationParticipant.update({
        where: { id: participants[i].id },
        data: { prizeUsdc: prize },
      });
    }
  }
}

let instance: PlayerTwinService | null = null;
export function getPlayerTwinService(): PlayerTwinService {
  if (!instance) instance = new PlayerTwinService();
  return instance;
}
