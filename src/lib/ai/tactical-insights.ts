import { generateInference, AIMessage } from './inference';
import { redisService } from '@/server/services/redis';

export interface TacticalInsight {
  id: string;
  type: 'tactical' | 'performance' | 'mental' | 'fitness';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  priority: number;
}

const INSIGHT_SYSTEM_PROMPT = `You are Coach Kite, the Head of Academy at SportWarren.
Your job is to analyze match data and provide "Phygital" tactical insights.
Phygital means bridging physical match performance with digital growth.

Analyze the provided match data and player stats to generate 1-2 personalized insights.
Each insight should be a JSON object with:
- title: Short, punchy title (max 5 words)
- description: Concise advice or observation (max 2 sentences)
- type: one of ['tactical', 'performance', 'mental', 'fitness']
- actionLabel: Optional call to action
- actionHref: Optional internal link (e.g., /squad?tab=tactics, /stats, /training)
- priority: 1-10 (higher is more urgent)

Tone: Professional, firm, analytical, but deeply encouraging.
Format: Return only a JSON array of objects.`;

const CACHE_TTL = 3600; // 1 hour

export async function generateTacticalInsights(
  playerStats: any,
  recentMatches: any[],
  squadContext?: any,
  userId?: string
): Promise<TacticalInsight[]> {
  // 1. Try cache
  const cacheKey = `ai:cache:insights:${userId || 'anon'}`;
  if (userId) {
    try {
      const cached = await redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('[TacticalInsights] Cache lookup failed:', e);
    }
  }

  const messages: AIMessage[] = [
    {
      role: 'user',
      content: `Player Stats: ${JSON.stringify(playerStats)}
                Recent Matches: ${JSON.stringify(recentMatches)}
                Squad Context: ${JSON.stringify(squadContext)}`
    }
  ];

  try {
    const result = await generateInference(messages, {
      systemPrompt: INSIGHT_SYSTEM_PROMPT,
      temperature: 0.7,
      max_tokens: 400,
      userId,
      tier: 'text'
    });

    if (result?.content) {
      const cleanContent = result.content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      if (Array.isArray(parsed)) {
        const insights = parsed.map((insight: any, index: number) => ({
          id: `insight-${Date.now()}-${index}`,
          ...insight
        }));

        // 2. Save to cache
        if (userId) {
          await redisService.set(cacheKey, JSON.stringify(insights), CACHE_TTL);
        }

        return insights;
      }
    }
  } catch (error) {
    console.error('[TacticalInsights] Generation failed:', error);
  }

  // Fallback insight
  return [{
    id: 'fallback-1',
    type: 'tactical',
    title: 'Maintain Defensive Shape',
    description: 'Data suggests a slight gap in midfield transition. Focus on holding your position during counter-attacks.',
    actionLabel: 'Review Tactics',
    actionHref: '/squad?tab=tactics',
    priority: 5
  }];
}
