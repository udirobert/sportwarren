
import { getOpenAIClient, OPENAI_MODEL_ID } from './providers/openai';
import { getVeniceClient, VENICE_MODEL_ID } from './providers/venice';
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
    const { city, venue, history, userId } = context;
    const veniceClient = getVeniceClient();
    const openaiClient = getOpenAIClient();

    // Guest sessions and raw wallet addresses should not hard-fail chat persistence.
    let ledger = null;
    if (userId) {
        try {
            ledger = await getNarrativeLedger(userId);
        } catch (error) {
            console.warn('[Marcus] Narrative ledger unavailable:', error);
        }
    }
    const keyInsights = ledger?.keyInsights.join(". ") || "";

    // Check cache
    const cacheKey = `${userId || 'guest'}-${message}-${city || ''}-${venue || ''}`;
    if (responseCache[cacheKey] && (Date.now() - responseCache[cacheKey].timestamp < CACHE_TTL)) {
        return responseCache[cacheKey].reply;
    }

    const contextPrefix = city && venue ? `[Context: ${city} Chapter near ${venue}] ` : '';
    const memoryPrefix = keyInsights ? `[Previous Insights: ${keyInsights}] ` : '';

    const messages = [
        { role: 'system' as const, content: MARCUS_SYSTEM_PROMPT },
        ...history,
        { role: 'user' as const, content: contextPrefix + memoryPrefix + message }
    ];

    if (!veniceClient && !openaiClient) {
        return "Tactical systems are in offline mode. Connect your identity and I will guide your next move.";
    }

    let reply = "Signals weak. Focus on the tactical layout.";
    try {
        const response = await (veniceClient ?? openaiClient)!.chat.completions.create({
            model: veniceClient ? VENICE_MODEL_ID : OPENAI_MODEL_ID,
            messages,
            temperature: 0.7,
            max_tokens: 150,
        });

        reply = response.choices[0]?.message?.content || reply;
    } catch (error) {
        if (veniceClient && openaiClient) {
            const fallbackResponse = await openaiClient.chat.completions.create({
                model: OPENAI_MODEL_ID,
                messages,
                temperature: 0.7,
                max_tokens: 150,
            });

            reply = fallbackResponse.choices[0]?.message?.content || reply;
        } else {
            throw error;
        }
    }

    // Save to cache
    responseCache[cacheKey] = { reply, timestamp: Date.now() };

    // Update ledger
    if (userId) {
        try {
            await updateNarrativeLedger(userId, { role: 'user', content: message, timestamp: Date.now() });
            await updateNarrativeLedger(userId, { role: 'assistant', content: reply, timestamp: Date.now() });
        } catch (error) {
            console.warn('[Marcus] Narrative ledger update skipped:', error);
        }
    }

    return reply;
}
