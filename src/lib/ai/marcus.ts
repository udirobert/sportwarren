
import { getVeniceClient, VENICE_MODEL_ID } from './venice';
import { getNarrativeLedger, updateNarrativeLedger } from './memory';

export const MARCUS_SYSTEM_PROMPT = `You are Marcus, the Academy Director of SportWarren. 
Professional, encouraging, and deeply technical about the "Phygital" bridge.
Goal: Guide players through the Parallel Season.

CORE RULES:
1. BE CONCISE: Max 2 sentences per response. 
2. BE STRATEGIC: Focus on bridging physical skills to digital rewards.
3. CONTEXTUAL: Use city/venue data if provided.
4. ROLEPLAY: Never break character.
`;

// Simple in-memory cache to optimize costs
const responseCache: Record<string, { reply: string, timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function getMarcusResponse(message: string, context: { city?: string, venue?: string, history: any[], userId?: string }) {
    const client = getVeniceClient();
    const { city, venue, history, userId } = context;

    // Retrieve ledger if userId is available
    const ledger = userId ? await getNarrativeLedger(userId) : null;
    const keyInsights = ledger?.keyInsights.join(". ") || "";

    // Check cache
    const cacheKey = `${userId || 'guest'}-${message}-${city || ''}-${venue || ''}`;
    if (responseCache[cacheKey] && (Date.now() - responseCache[cacheKey].timestamp < CACHE_TTL)) {
        return responseCache[cacheKey].reply;
    }

    const contextPrefix = city && venue ? `[Context: ${city} Chapter near ${venue}] ` : '';
    const memoryPrefix = keyInsights ? `[Previous Insights: ${keyInsights}] ` : '';

    const response = await client.chat.completions.create({
        model: VENICE_MODEL_ID,
        messages: [
            { role: 'system', content: MARCUS_SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: contextPrefix + memoryPrefix + message }
        ],
        temperature: 0.7,
        max_tokens: 150,
    });

    const reply = response.choices[0]?.message?.content || "Signals weak. Focus on the tactical layout.";

    // Save to cache
    responseCache[cacheKey] = { reply, timestamp: Date.now() };

    // Update ledger
    if (userId) {
        await updateNarrativeLedger(userId, { role: 'user', content: message, timestamp: Date.now() });
        await updateNarrativeLedger(userId, { role: 'assistant', content: reply, timestamp: Date.now() });
    }

    return reply;
}
