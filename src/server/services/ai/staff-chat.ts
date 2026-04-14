import { generateInference, AIMessage } from '@/lib/ai/inference';
import { STAFF_PERSONAS, GenerateStaffReplyParams } from './prompts';

// Redefining types here if needed or importing from prompts if consolidated
// Assuming prompts.ts contains the personas now to keep staff-chat.ts clean

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
