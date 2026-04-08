import { generateInference, AIMessage } from './inference';

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

export async function generateTacticalInsights(
  playerStats: any,
  recentMatches: any[],
  squadContext?: any
): Promise<TacticalInsight[]> {
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
    });

    if (result?.content) {
      const cleanContent = result.content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      if (Array.isArray(parsed)) {
        return parsed.map((insight: any, index: number) => ({
          id: `insight-${Date.now()}-${index}`,
          ...insight
        }));
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
