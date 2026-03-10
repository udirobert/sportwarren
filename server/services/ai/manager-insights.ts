/**
 * Manager Insight Service
 * Generates proactive tactical and market alerts for Squad DAOs
 */

import { openaiService } from '../openai';
import { AGENT_PERSONAS } from './prompts';
import { simulateMatch, calculateWinProbabilities } from '@/lib/match/simulation-engine';
import { calculatePlayerValue } from '@/lib/player/valuation-engine';
import { Tactics, PlayerAttributes } from '@/types';

export interface ManagerInsight {
  id: string;
  type: 'tactical' | 'market' | 'fitness';
  title: string;
  message: string;
  agentName: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  metadata?: any;
}

export class ManagerInsightService {
  /**
   * Generates a tactical preview for an upcoming match
   */
  async generateTacticalPreview(
    homeSquadData: any,
    awaySquadData: any
  ): Promise<ManagerInsight | null> {
    const homeSquad = this.mapSquadData(homeSquadData);
    const awaySquad = this.mapSquadData(awaySquadData);

    // 1. Run Shadow Engine Simulation
    const simulation = simulateMatch(homeSquad, awaySquad);
    const probs = calculateWinProbabilities(homeSquad, awaySquad);

    // 2. Identify Critical Issues
    const avgSharpness = homeSquad.players.reduce((sum, p: any) => sum + (p.sharpness || 50), 0) / homeSquad.players.length;
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

      const response = await openaiService.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: AGENT_PERSONAS.COACH_KITE.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return {
        id: `tactical_${Date.now()}`,
        type: 'tactical',
        title: `Match Preview vs ${awaySquadData.name}`,
        message: response.choices[0]?.message?.content || "Focus on the basics. Match sharpness is the priority.",
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
    playerProfile: any,
    interestCount: number = 0
  ): Promise<ManagerInsight | null> {
    const playerAttrs = this.mapPlayerProfile(playerProfile);
    const valuation = calculatePlayerValue(playerAttrs, interestCount);

    try {
      const prompt = `Analyze this player's market status:
      Player: ${playerProfile.user.name}. Valuation: $${valuation.value}. Tier: ${valuation.tier}.
      Form Modifier: ${valuation.breakdown.formMultiplier}x. Demand Modifier: ${valuation.breakdown.demandMultiplier}x.
      
      As Scout Finn, provide a direct market insight. Should we sell, hold, or is this an undervalued asset?`;

      const response = await openaiService.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: AGENT_PERSONAS.SCOUT_FINN.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return {
        id: `market_${Date.now()}`,
        type: 'market',
        title: `Market Update: ${playerProfile.user.name}`,
        message: response.choices[0]?.message?.content || "Market conditions stable. Monitor performance.",
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
  private mapSquadData(squad: any): { players: PlayerAttributes[]; tactics: Tactics } {
    const tactics: Tactics = {
      formation: (squad.tactics?.formation as any) || '4-4-2',
      style: (squad.tactics?.playStyle as any) || 'balanced',
      instructions: (squad.tactics?.instructions as any) || {},
      setPieces: (squad.tactics?.setPieces as any) || {}
    };

    const players: PlayerAttributes[] = squad.members
      .filter((m: any) => m.user.playerProfile)
      .map((m: any) => {
        const profile = m.user.playerProfile!;
        const p = this.mapPlayerProfile(profile);
        (p as any).sharpness = profile.sharpness;
        return p;
      });

    return { players, tactics };
  }

  /**
   * Internal Helper: Map Prisma Profile to Engine Types
   */
  private mapPlayerProfile(profile: any): PlayerAttributes {
    return {
      address: profile.user?.walletAddress || '0x0',
      playerName: profile.user?.name || 'Unknown',
      position: (profile.user?.position as any) || 'MF',
      skills: profile.attributes.map((a: any) => ({
        skill: a.attribute as any,
        rating: a.rating,
        history: a.history || [],
      } as any)),
      xp: {
        level: profile.level,
        totalXP: profile.totalXP,
        seasonXP: profile.seasonXP,
        nextLevelXP: 0
      },
      form: {
        current: 0,
        history: [],
        trend: 'stable'
      }
    } as any;
  }
}

export const managerInsightService = new ManagerInsightService();
