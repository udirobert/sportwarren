
import { generateInference, AIMessage } from './inference';
import { getNarrativeLedger, updateNarrativeLedger } from './memory';
import { redisService } from '@/server/services/redis';

export const MARCUS_SYSTEM_PROMPT = `You are Marcus, the Academy Director of SportWarren. 
Professional, encouraging, and deeply technical about the "Phygital" bridge.
Goal: Guide players through the Parallel Season.

CORE RULES:
1. BE CONCISE: Max 2 sentences per response. 
2. BE STRATEGIC: Focus on bridging physical skills to digital rewards.
3. CONTEXTUAL: Use city/venue data if provided.
4. ROLEPLAY: Never break character.
`;

const CACHE_TTL = 3600; // 1 hour in seconds

export async function getMarcusResponse(message: string, context: { city?: string, venue?: string, history: any[], userId?: string }) {
    const { city, venue, history, userId } = context;

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

    // Check distributed cache
    const cacheKey = `ai:cache:marcus:${userId || 'guest'}:${Buffer.from(message).toString('base64').slice(0, 32)}:${city || ''}:${venue || ''}`;
    try {
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;
    } catch (e) {
        console.warn('[Marcus] Redis cache lookup failed:', e);
    }

    const contextPrefix = city && venue ? `[Context: ${city} Chapter near ${venue}] ` : '';
    const memoryPrefix = keyInsights ? `[Previous Insights: ${keyInsights}] ` : '';

    const messages: AIMessage[] = [
        ...history,
        { role: 'user', content: contextPrefix + memoryPrefix + message }
    ];

    let reply = "Signals weak. Focus on the tactical layout.";
    try {
        const result = await generateInference(messages, {
            systemPrompt: MARCUS_SYSTEM_PROMPT,
            temperature: 0.7,
            max_tokens: 150,
            userId,
            tier: 'text'
        });

        if (result) {
            reply = result.content;
            
            // Save to distributed cache
            await redisService.set(cacheKey, reply, CACHE_TTL);
        }
    } catch (error) {
        console.error('[Marcus] Inference failed:', error);
    }

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
