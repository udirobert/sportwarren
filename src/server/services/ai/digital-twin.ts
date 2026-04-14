import type { PrismaClient } from '@prisma/client';
import { generateInference } from '@/lib/ai/inference';

export interface SquadDigitalTwinStats {
  attack: number;
  defense: number;
  midfield: number;
  teamwork: number;
  prestige: number;
}

export class DigitalTwinService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Updates Squad XP and Level based on IRL match outcome.
   */
  async syncMatchResult(squadId: string, result: 'win' | 'loss' | 'draw', goalsFor: number, goalsAgainst: number) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      select: { xp: true, level: true, seasonPoints: true, digitalAttributes: true },
    });

    if (!squad) return;

    let xpGain = 0;
    let pointsGain = 0;

    if (result === 'win') {
      xpGain = 100 + goalsFor * 10;
      pointsGain = 3;
    } else if (result === 'draw') {
      xpGain = 50 + goalsFor * 5;
      pointsGain = 1;
    } else {
      xpGain = 20 + goalsFor * 5;
      pointsGain = 0;
    }

    const newXp = squad.xp + xpGain;
    const nextLevelXp = squad.level * 1000;
    const newLevel = newXp >= nextLevelXp ? squad.level + 1 : squad.level;
    const finalXp = newXp >= nextLevelXp ? newXp - nextLevelXp : newXp;

    // Evolve attributes based on match performance (simplified)
    const currentAttrs = (squad.digitalAttributes as any) || { attack: 50, defense: 50, midfield: 50, teamwork: 50, prestige: 10 };
    const newAttrs = { ...currentAttrs };

    if (goalsFor > 2) newAttrs.attack = Math.min(99, newAttrs.attack + 1);
    if (goalsAgainst === 0) newAttrs.defense = Math.min(99, newAttrs.defense + 1);
    newAttrs.teamwork = Math.min(99, newAttrs.teamwork + 0.5);
    if (result === 'win') newAttrs.prestige = Math.min(999, newAttrs.prestige + 2);

    await this.prisma.squad.update({
      where: { id: squadId },
      data: {
        xp: finalXp,
        level: newLevel,
        seasonPoints: squad.seasonPoints + pointsGain,
        digitalAttributes: newAttrs,
        lastSeasonSync: new Date(),
      },
    });
  }

  /**
   * Converts IRL payment (RSVP subs) into Digital Twin resources/prestige.
   */
  async processPaymentImpact(squadId: string, amount: number) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      select: { digitalAttributes: true },
    });

    if (!squad) return;

    const currentAttrs = (squad.digitalAttributes as any) || { attack: 50, defense: 50, midfield: 50, teamwork: 50, prestige: 10 };
    
    // Payments increase "Prestige" and "Teamwork" (financial stability/commitment)
    const prestigeGain = Math.floor(amount / 100); // 1 prestige per 100 units
    const teamworkGain = 0.2;

    await this.prisma.squad.update({
      where: { id: squadId },
      data: {
        digitalAttributes: {
          ...currentAttrs,
          prestige: Math.min(999, currentAttrs.prestige + prestigeGain),
          teamwork: Math.min(99, currentAttrs.teamwork + teamworkGain),
        },
      },
    });
  }

  /**
   * Syncs Peer Ratings to Player Attributes and Hype Tags.
   */
  async syncPeerRatings(matchId: string) {
    const ratings = await this.prisma.peerRating.findMany({
      where: { matchId, weighted: false },
    });

    if (ratings.length === 0) return;

    // Group by targetId
    const targetGroups: Record<string, typeof ratings> = {};
    for (const r of ratings) {
      if (!targetGroups[r.targetId]) targetGroups[r.targetId] = [];
      targetGroups[r.targetId].push(r);
    }

    for (const [targetId, playerRatings] of Object.entries(targetGroups)) {
      // 1. Update Player Attributes
      const attributeGains: Record<string, { sum: number, count: number }> = {};
      const allHypeTags: string[] = [];

      for (const r of playerRatings) {
        if (!attributeGains[r.attribute]) attributeGains[r.attribute] = { sum: 0, count: 0 };
        attributeGains[r.attribute].sum += r.score;
        attributeGains[r.attribute].count += 1;
        
        if (r.hypeTags && Array.isArray(r.hypeTags)) {
          allHypeTags.push(...(r.hypeTags as string[]));
        }
      }

      // Calculate weighted averages and update PlayerAttribute
      for (const [attr, data] of Object.entries(attributeGains)) {
        const avg = data.sum / data.count;
        // Attribute scaling: avg (1-10) -> rating (0-99). FIFA style is 0-99.
        // We'll use a conservative gain for now.
        await this.prisma.playerAttribute.upsert({
          where: { profileId_attribute: { profileId: targetId, attribute: attr } },
          create: { 
            profileId: targetId, 
            attribute: attr, 
            rating: Math.round(avg * 7) + 20, // Baseline 20 + up to 70 = 90
            xp: Math.round(avg * 25) 
          },
          update: {
            xp: { increment: Math.round(avg * 25) }
          }
        });
      }

      // 2. Process Hype Tags (Consensus)
      if (allHypeTags.length > 0) {
        const tagCounts: Record<string, number> = {};
        for (const tag of allHypeTags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }

        // Only keep tags with at least 2 votes (consensus) or 1 if it's the only rating
        const consensusTags = Object.entries(tagCounts)
          .filter(([_, count]) => count >= 1) // Keep all for now to see momentum
          .reduce((acc, [tag, count]) => ({ ...acc, [tag]: count }), {});

        // Update PlayerProfile hypeTags
        const profile = await this.prisma.playerProfile.findUnique({
          where: { id: targetId },
          select: { hypeTags: true }
        });

        const currentProfileTags = (profile?.hypeTags as Record<string, number>) || {};
        const updatedProfileTags = { ...currentProfileTags };
        for (const [tag, count] of Object.entries(consensusTags)) {
          updatedProfileTags[tag] = (updatedProfileTags[tag] || 0) + (count as number);
        }

        await this.prisma.playerProfile.update({
          where: { id: targetId },
          data: { hypeTags: updatedProfileTags }
        });
        
        // Update PlayerMatchStats for this match
        try {
          await this.prisma.playerMatchStats.update({
            where: { matchId_profileId: { matchId, profileId: targetId } },
            data: { hypeTags: Object.keys(consensusTags) }
          });
        } catch (e) {
          // If stats record doesn't exist, create one
          await this.prisma.playerMatchStats.create({
            data: {
              matchId,
              profileId: targetId,
              hypeTags: Object.keys(consensusTags)
            }
          });
        }
      }
    }

    // Mark ratings as weighted
    await this.prisma.peerRating.updateMany({
      where: { matchId, id: { in: ratings.map(r => r.id) } },
      data: { weighted: true }
    });
  }

  /**
   * Adjusts Squad Energy based on match-day participation and financial compliance.
   */
  async updateSquadEnergy(squadId: string, matchId: string) {
    const rsvps = await this.prisma.matchRsvp.findMany({
      where: { matchId }
    });

    if (rsvps.length === 0) return;

    const confirmedCount = rsvps.filter(r => r.status === 'confirmed').length;
    const paidCount = rsvps.filter(r => r.isPaid).length;
    const totalCount = rsvps.length;

    const participationScore = (confirmedCount / totalCount) * 50;
    const financialScore = (paidCount / (confirmedCount || 1)) * 50;
    
    const finalEnergy = Math.round(participationScore + financialScore);

    await this.prisma.squad.update({
      where: { id: squadId },
      data: {
        squadEnergy: finalEnergy
      }
    });
  }

  /**
   * Simulates a "Ghost Match" for the digital twin, consuming energy.
   */
  async simulateGhostMatch(squadId: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      select: { squadEnergy: true, level: true, digitalAttributes: true, xp: true, name: true }
    });

    if (!squad) throw new Error("Squad not found");
    if (squad.squadEnergy < 40) throw new Error("Insufficient energy (min 40%)");

    // Simulation: XP gain is lower than real matches
    const xpGain = 40 + Math.floor(Math.random() * 30);
    
    const attrs = (squad.digitalAttributes as any) || { attack: 50, defense: 50, midfield: 50, teamwork: 50, prestige: 10 };
    const newAttrs = { ...attrs };
    const focus = ['attack', 'defense', 'midfield', 'teamwork'][Math.floor(Math.random() * 4)];
    newAttrs[focus] = Math.min(99, (newAttrs[focus] || 50) + 0.2);

    const newXp = squad.xp + xpGain;
    const nextLevelXp = squad.level * 1000;
    const newLevel = newXp >= nextLevelXp ? squad.level + 1 : squad.level;
    const finalXp = newXp >= nextLevelXp ? newXp - nextLevelXp : newXp;

    await this.prisma.squad.update({
      where: { id: squadId },
      data: {
        xp: finalXp,
        level: newLevel,
        squadEnergy: squad.squadEnergy - 40,
        digitalAttributes: newAttrs,
        lastSeasonSync: new Date()
      }
    });

    return { xpGain, newLevel, energyConsumed: 40, focus };
  }

  /**
   * Generates a "Digital Twin Narrative" using AI for the squad's season.
   */
  async generateSeasonNarrative(squadId: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      include: {
        matchesHome: { where: { status: 'verified' }, take: 5, orderBy: { matchDate: 'desc' } },
        matchesAway: { where: { status: 'verified' }, take: 5, orderBy: { matchDate: 'desc' } },
      },
    });

    if (!squad) return "Our digital twin is still gathering data.";

    const prompt = `You are Marcus, the Academy Director. Analyze the digital twin of squad "${squad.name}".
    IRL Level: ${squad.level}
    Current Attributes: ${JSON.stringify(squad.digitalAttributes)}
    Recent Matches: ${squad.matchesHome.length + squad.matchesAway.length}
    Season Points: ${squad.seasonPoints}
    
    Write a 2-sentence tactical summary of how their IRL performance is affecting their on-chain season status. Keep it hype and "phygital".`;

    try {
      const response = await generateInference([
        { role: 'user', content: prompt }
      ], {
        systemPrompt: "You are Marcus, the Academy Director of SportWarren.",
      });
      return response?.content || `Squad ${squad.name} is making waves in the digital arena.`;
    } catch (error) {
      return `Squad ${squad.name} is making waves in the digital arena.`;
    }
  }
}

let digitalTwinService: DigitalTwinService | null = null;

export function getDigitalTwinService(prisma: PrismaClient) {
  if (!digitalTwinService) {
    digitalTwinService = new DigitalTwinService(prisma);
  }
  return digitalTwinService;
}
