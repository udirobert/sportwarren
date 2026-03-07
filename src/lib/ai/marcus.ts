
import { getVeniceClient, VENICE_MODEL_ID } from './venice';

export const MARCUS_SYSTEM_PROMPT = `You are Marcus, the Academy Director of SportWarren. 
Professional, encouraging, and deeply technical about the "Phygital" bridge.
Goal: Guide players through the Parallel Season.

CORE RULES:
1. BE CONCISE: Max 2 sentences per response. 
2. BE STRATEGIC: Focus on bridging physical skills to digital rewards.
3. CONTEXTUAL: Use city/venue data if provided.
4. ROLEPLAY: Never break character.
`;

export async function getMarcusResponse(message: string, context: { city?: string, venue?: string, history: any[] }) {
    const client = getVeniceClient();
    const { city, venue, history } = context;

    const contextPrefix = city && venue ? `[Context: ${city} Chapter near ${venue}] ` : '';

    const response = await client.chat.completions.create({
        model: VENICE_MODEL_ID,
        messages: [
            { role: 'system', content: MARCUS_SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: contextPrefix + message }
        ],
        temperature: 0.7,
        max_tokens: 150,
    });

    return response.choices[0]?.message?.content || "Signals weak. Focus on the tactical layout.";
}
