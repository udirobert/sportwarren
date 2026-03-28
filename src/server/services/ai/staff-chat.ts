import { 
    getOptionalVeniceClient, 
    getOpenAIClient, 
    getKilocodeClient,
    VENICE_MODEL_ID,
    OPENAI_MODEL_ID,
    KILOCODE_MODEL_ID,
    KILOCODE_FALLBACK_MODEL,
    getAllAvailableProviders
} from '@/lib/ai/venice';
import OpenAI from 'openai';

// ─────────────────────────────────────────────────────────────
// Brand Voice Configuration
// ─────────────────────────────────────────────────────────────

const BRAND_VOICE = [
    'Voice rules:',
    '- Keep it short, direct, and football-first (2-4 sentences).',
    '- Never call the user "Boss".',
    '- Avoid corporate phrases and avoid long formal welcomes.',
    '- Focus on concrete actions the user can take next.',
    '- Match SportWarren tone: "Stop ghost matches", "Log the score. Track your stats. Build your legacy.", "Every match. Every stat. Forever."',
].join('\n');

// ─────────────────────────────────────────────────────────────
// Staff Personas
// ─────────────────────────────────────────────────────────────

export const STAFF_PERSONAS: Record<string, { staffId: string; name: string; emoji: string; persona: string }> = {
    'agent-1': {
        staffId: 'agent-1',
        name: 'The Agent',
        emoji: '💼',
        persona: `You are The Agent — a sharp, streetwise contract negotiator for a grassroots football club in a Web3 sports management game called SportWarren. You specialise in reputation-based valuations, contract negotiations, and transfer market intelligence. You speak with confidence and dry wit. Always end with a clear recommendation or question.\n\n${BRAND_VOICE}`,
    },
    'scout': {
        staffId: 'scout',
        name: 'The Scout',
        emoji: '🔭',
        persona: `You are The Scout — a talent identification specialist for a grassroots football club in SportWarren. You have deep knowledge of youth academies, rival teams, and emerging prospects. You speak with enthusiasm and precision. Always end with a clear recommendation or question.\n\n${BRAND_VOICE}`,
    },
    'coach': {
        staffId: 'coach',
        name: 'Coach Kite',
        emoji: '🪁',
        persona: `You are Coach Kite — the Tactical Director for a grassroots football club in SportWarren. You are analytical, direct, and passionate about formations and player development. Always end with a clear recommendation or question.\n\n${BRAND_VOICE}`,
    },
    'physio': {
        staffId: 'physio',
        name: 'The Physio',
        emoji: '🏥',
        persona: `You are The Physio — the Health & Recovery specialist for a grassroots football club in SportWarren. You monitor player fitness, injury risk, and recovery protocols. You speak with calm authority and medical precision. Always end with a clear recommendation or question.\n\n${BRAND_VOICE}`,
    },
    'analyst': {
        staffId: 'analyst',
        name: 'The Analyst',
        emoji: '📊',
        persona: `You are The Analyst — the performance data specialist for a grassroots football club in SportWarren. You track player stats, trends, and progression. You are precise, numbers-driven, and always back your insights with data. Always end with a clear recommendation or question.\n\n${BRAND_VOICE}`,
    },
    'commercial': {
        staffId: 'commercial',
        name: 'Commercial Lead',
        emoji: '📈',
        persona: `You are the Commercial Lead — responsible for treasury operations, sponsorships, and financial health in SportWarren. You are sharp, commercially practical, and always thinking about runway and growth. Always end with a clear recommendation or question.\n\n${BRAND_VOICE}`,
    },
};

// Aliases for retro-compatibility
STAFF_PERSONAS['scout-1'] = STAFF_PERSONAS['scout'];
STAFF_PERSONAS['coach-1'] = STAFF_PERSONAS['coach'];
STAFF_PERSONAS['physio-1'] = STAFF_PERSONAS['physio'];
STAFF_PERSONAS['commercial-1'] = STAFF_PERSONAS['commercial'];

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface StaffMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GenerateStaffReplyParams {
    staffId: string;
    message: string;
    chatHistory?: StaffMessage[];
    contextBlock?: string;
    decisionBlock?: string;
    signalContext?: string;
}

// ─────────────────────────────────────────────────────────────
// Inference with Fallback Chain
// ─────────────────────────────────────────────────────────────

async function tryInference(
    client: OpenAI, 
    model: string, 
    messages: StaffMessage[]
): Promise<string> {
    const completion = await client.chat.completions.create({
        model,
        messages: messages as any,
        max_tokens: 200,
        temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() ?? '';
}

export async function generateStaffReply({
    staffId,
    message,
    chatHistory,
    contextBlock,
    decisionBlock,
    signalContext,
}: GenerateStaffReplyParams): Promise<{ reply: string; staff: typeof STAFF_PERSONAS[string]; provider: string }> {
    // Resolve persona
    const resolvedId = staffId.toLowerCase().trim();
    let staff = STAFF_PERSONAS[resolvedId];

    if (!staff) {
        for (const [id, s] of Object.entries(STAFF_PERSONAS)) {
            if (s.name.toLowerCase().includes(resolvedId) || resolvedId.includes(id)) {
                staff = s;
                break;
            }
        }
    }

    if (!staff) {
        staff = STAFF_PERSONAS['coach'];
    }

    // Build system prompt
    const promptParts = [
        staff.persona,
        contextBlock && `\n\nCurrent squad data:\n${contextBlock}`,
        signalContext && `\n\nActive insights algorithm:\n${signalContext}`,
        decisionBlock,
    ].filter(Boolean).join('');

    const messages: StaffMessage[] = [
        { role: 'system', content: promptParts },
        ...(chatHistory || []),
        { role: 'user', content: message },
    ];

    // Get available providers
    const providers = getAllAvailableProviders();

    if (providers.length === 0) {
        return { 
            reply: "AI staff is offline right now. Set VENICE_API_KEY, OPENAI_API_KEY, or KILOCODE_API_KEY to bring it online.",
            staff,
            provider: 'none'
        };
    }

    // Try each provider in priority order
    const errors: string[] = [];
    
    for (const provider of providers) {
        try {
            const reply = await tryInference(provider.client, provider.model, messages);
            if (reply) {
                return { reply, staff, provider: provider.name };
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            errors.push(`${provider.name}: ${errorMsg}`);
            console.error(`[AI] ${provider.name} inference failed:`, errorMsg);
            
            // If kilocode failed, try fallback model
            if (provider.name === 'kilocode') {
                try {
                    const fallbackReply = await tryInference(provider.client, KILOCODE_FALLBACK_MODEL, messages);
                    if (fallbackReply) {
                        return { reply: fallbackReply, staff, provider: 'kilocode-fallback' };
                    }
                } catch (fallbackErr) {
                    console.error('[AI] kilocode fallback failed:', fallbackErr);
                }
            }
        }
    }

    // All providers failed
    console.error('[AI] All providers failed:', errors);
    return { 
        reply: "Noted. Ask again in a sec while I sync the data.",
        staff,
        provider: 'failed'
    };
}