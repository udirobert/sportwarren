import { generateInference, AIMessage } from '@/lib/ai/inference';
import { STAFF_PERSONAS, AGENT_PERSONAS, getMatchNarrativePrompt, GenerateStaffReplyParams } from './prompts';

/**
 * Generate a "Captain's Report" for a match based on Phygital evidence.
 * Used after match verification to provide AI-generated match insights.
 */
export async function generateMatchReport(
  matchData: {
    homeSquad?: { name: string };
    awaySquad?: { name: string };
    homeTeam?: string;
    awayTeam?: string;
    homeScore: number;
    awayScore: number;
  },
  creResult: {
    verified: boolean;
    confidence?: number;
    weather?: { conditions?: string; temperature?: number };
    location?: { region?: string; placeType?: string };
  }
): Promise<{
  agentId: string;
  agentName: string;
  report: string;
  decision: string;
  timestamp: string;
}> {
  const awayTeamName = matchData.awaySquad?.name || matchData.awayTeam || 'Away Team';

  // Select persona based on team name or default
  let persona = AGENT_PERSONAS.KITE_TACTICAL;
  if (awayTeamName.toLowerCase().includes('neon')) {
    persona = AGENT_PERSONAS.VISION_SCOUT;
  }

  try {
    const prompt = getMatchNarrativePrompt(persona.name, matchData, creResult);
    const messages: AIMessage[] = [
      { role: 'system', content: persona.systemPrompt },
      { role: 'user', content: prompt },
    ];

    const result = await generateInference(messages, { max_tokens: 200 });

    if (!result) {
      throw new Error('No inference engine available.');
    }

    return {
      agentId: persona.id,
      agentName: persona.name,
      report: result.content,
      decision: creResult.verified ? "APPROVE_XP_DISBURSEMENT" : "DENY_XP_PENDING_REVIEW",
      timestamp: new Date().toISOString()
    };
  } catch (_error) {
    console.warn('[STAFF-CHAT] Match report generation failed, falling back to basic data.');
    return {
      agentId: persona.id,
      agentName: persona.name,
      report: `Phygital consensus reached with ${creResult.confidence ?? 0}% confidence. Weather: ${creResult.weather?.conditions ?? 'unknown'}.`,
      decision: creResult.verified ? "APPROVE_XP_DISBURSEMENT" : "DENY_XP_PENDING_REVIEW",
      timestamp: new Date().toISOString()
    };
  }
}

export async function generateStaffReply({
    staffId,
    message,
    chatHistory,
    contextBlock,
    decisionBlock,
    signalContext,
    userId,
}: GenerateStaffReplyParams): Promise<{ reply: string; staff: any; provider: string }> {
    // Resolve persona
    const resolvedId = staffId.toLowerCase().trim();
    // Using a simple lookup for now, can be enhanced
    const staff = STAFF_PERSONAS[resolvedId as keyof typeof STAFF_PERSONAS] || STAFF_PERSONAS['coach'];

    // Build system prompt
    const promptParts = [
        staff.persona,
        contextBlock && `\n\nCurrent squad data:\n${contextBlock}`,
        signalContext && `\n\nActive insights algorithm:\n${signalContext}`,
        decisionBlock,
    ].filter(Boolean).join('');

    const messages: AIMessage[] = [
        { role: 'system', content: promptParts },
        ...(chatHistory || []).map(m => ({ role: m.role as any, content: m.content })),
        { role: 'user', content: message },
    ];

    const result = await generateInference(messages, {
        userId,
        tier: 'text',
    });

    if (result) {
        return { 
            reply: result.content, 
            staff, 
            provider: result.provider 
        };
    }

    return { 
        reply: "AI staff is currently offline. Please check your API keys.",
        staff,
        provider: 'none'
    };
}
