/**
 * Manager Insight Service
 * Generates proactive tactical and market alerts for Squad DAOs
 */

import { generateInference } from '@/lib/ai/inference';
import { AGENT_PERSONAS } from './prompts';
import { simulateMatch, calculateWinProbabilities } from '@/lib/match/simulation-engine';
import { calculatePlayerValue } from '@/lib/player/valuation-engine';
import { Tactics, PlayerAttributes, Formation, PlayStyle, TeamInstructions, SetPieceInstructions, AttributeType, SkillRating, PlayerPosition } from '@/types';

/**
 * Minimal type shapes required for mapping Prisma data to engine types.
 * These are subsets of the actual Prisma output types.
 */
interface ProfileMappingInput {
  user?: {
    walletAddress?: string | null;
    name?: string | null;
    position?: string | null;
  } | null;
  attributes?: Array<{ attribute: string; rating: number; history?: number[] }> | null;
  level?: number;
  totalXP?: number;
  seasonXP?: number;
  sharpness?: number;
}

interface SquadMappingInput {
  tactics?: {
    formation?: string | null;
    playStyle?: string | null;
    instructions?: unknown;
    setPieces?: unknown;
  } | null;
  members: Array<{
    user: {
      playerProfile?: ProfileMappingInput | null;
    } | null;
  }>;
  name: string;
}

export interface ManagerInsight {
  id: string;
  type: 'tactical' | 'market' | 'fitness';
  title: string;
  message: string;
  agentName: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class ManagerInsightService {
  /**
   * Generates a tactical preview for an upcoming match
   */
  async generateTacticalPreview(
    homeSquadData: SquadMappingInput,
    awaySquadData: SquadMappingInput
  ): Promise<ManagerInsight | null> {
    const homeSquad = this.mapSquadData(homeSquadData);
    const awaySquad = this.mapSquadData(awaySquadData);

    // 1. Run Shadow Engine Simulation
    const simulation = simulateMatch(homeSquad, awaySquad);
    const probs = calculateWinProbabilities(homeSquad, awaySquad);

    // 2. Identify Critical Issues
    const avgSharpness = homeSquad.players.reduce((sum, p) => sum + (p.sharpness || 50), 0) / homeSquad.players.length;
    const isUnderdog = probs.homeWin < 0.4;

    let priority: ManagerInsight['priority'] = 'medium';
    if (avgSharpness < 60 || isUnderdog) priority = 'high';

    // 3. Generate Persona-driven AI Insight
    try {
      const prompt = `Analyze this match simulation:
      Home (${homeSquadData.name}): ${Math.round(probs.homeWin * 100)}% win chance. Avg Sharpness: ${Math.round(avgSharpness)}%.
      Away (${awaySquadData.name}): ${Math.round(probs.awayWin * 100)}% win chance.
      Simulation Findings: ${simulation.insights.join(', ')}
      
      As Coach Kite, provide a single, firm tactical alert. Focus on the most critical weakness.`;

      const result = await generateInference([
        { role: 'system', content: AGENT_PERSONAS.COACH_KITE.systemPrompt },
        { role: 'user', content: prompt }
      ], { max_tokens: 100 });

      return {
        id: `tactical_${Date.now()}`,
        type: 'tactical',
        title: `Match Preview vs ${awaySquadData.name}`,
        message: result?.content || "Focus on the basics. Match sharpness is the priority.",
        agentName: AGENT_PERSONAS.COACH_KITE.name,
        priority,
        timestamp: new Date().toISOString(),
        metadata: { probs, insights: simulation.insights }
      };
    } catch (error) {
      console.warn('[MANAGER-INSIGHT] Tactical insight generation failed:', error);
      return null;
    }
  }

  /**
   * Generates a market recommendation for the DAO
   */
  async generateMarketInsight(
    playerProfile: ProfileMappingInput,
    interestCount: number = 0
  ): Promise<ManagerInsight | null> {
    const playerAttrs = this.mapPlayerProfile(playerProfile);
    const valuation = calculatePlayerValue(playerAttrs, interestCount);

    try {
       const prompt = `Analyze this player's market status:
       Player: ${playerProfile.user?.name ?? 'Unknown'}. Valuation: $${valuation.value}. Tier: ${valuation.tier}.
       Form Modifier: ${valuation.breakdown.formMultiplier}x. Demand Modifier: ${valuation.breakdown.demandMultiplier}x.
       
       As Scout Finn, provide a direct market insight. Should we sell, hold, or is this an undervalued asset?`;

       const result = await generateInference([
         { role: 'system', content: AGENT_PERSONAS.SCOUT_FINN.systemPrompt },
         { role: 'user', content: prompt }
       ], { max_tokens: 100 });

       return {
         id: `market_${Date.now()}`,
         type: 'market',
         title: `Market Update: ${playerProfile.user?.name ?? 'Unknown'}`,
        message: result?.content || "Market conditions stable. Monitor performance.",
        agentName: AGENT_PERSONAS.SCOUT_FINN.name,
        priority: valuation.breakdown.demandMultiplier > 1.2 ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        metadata: { valuation }
      };
    } catch (error) {
      console.warn('[MANAGER-INSIGHT] Market insight generation failed:', error);
      return null;
    }
  }

  /**
   * Internal Helper: Map Prisma Squad Data to Engine Types
   */
  private mapSquadData(squad: SquadMappingInput): { players: PlayerAttributes[]; tactics: Tactics } {
    const tactics: Tactics = {
      formation: (squad.tactics?.formation as Formation) || '4-4-2',
      style: (squad.tactics?.playStyle as PlayStyle) || 'balanced',
      instructions: (squad.tactics?.instructions as unknown as TeamInstructions) || {
        width: 'normal',
        tempo: 'normal',
        passing: 'mixed',
        pressing: 'medium',
        defensiveLine: 'normal'
      },
      setPieces: (squad.tactics?.setPieces as unknown as SetPieceInstructions) || {
        corners: 'near_post',
        freeKicks: 'shoot',
        penalties: ''
      }
    };

     const players: PlayerAttributes[] = squad.members
       .filter(m => m.user?.playerProfile)
       .map(m => {
         const profile = m.user!.playerProfile!;
         const player = this.mapPlayerProfile(profile) as PlayerAttributes & { sharpness?: number };
         player.sharpness = profile.sharpness;
         return player;
       });

    return { players, tactics };
  }

  /**
   * Internal Helper: Map Prisma Profile to Engine Types
   */
  private mapPlayerProfile(profile: ProfileMappingInput): PlayerAttributes {
    return {
      address: profile.user?.walletAddress || '0x0',
      playerName: profile.user?.name || 'Unknown',
      position: (profile.user?.position as PlayerPosition) || 'MF',
      totalMatches: 0,
      totalGoals: 0,
      totalAssists: 0,
      reputationScore: 0,
      verifiedStats: false,
      skills: (profile.attributes ?? []).map((a): SkillRating => ({
        skill: a.attribute as AttributeType,
        rating: a.rating,
        history: a.history ?? [],
        xp: 0,
        xpToNextLevel: 100,
        maxRating: 99,
        verified: false,
        lastUpdated: new Date()
      })),
      form: {
        current: 0,
        history: [],
        trend: 'stable'
      },
      xp: {
        level: profile.level ?? 1,
        totalXP: profile.totalXP ?? 0,
        seasonXP: profile.seasonXP ?? 0,
        nextLevelXP: 0
      },
      achievements: [],
      careerHighlights: [],
      scoutXP: 0,
      scoutTier: 'rookie'
    };
  }
}

export const managerInsightService = new ManagerInsightService();
