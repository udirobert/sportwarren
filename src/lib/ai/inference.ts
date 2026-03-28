import OpenAI from 'openai';
import { getKilocodeClient, KILOCODE_MODEL_ID, KILOCODE_FALLBACK_MODEL } from './providers/kilocode';
import { getVeniceClient, VENICE_MODEL_ID } from './providers/venice';
import { getOpenAIClient, OPENAI_MODEL_ID } from './providers/openai';

/**
 * Shared AI Inference Orchestrator - Single Source of Truth
 * Priority: kilocode (Primary) → Venice (First Fallback) → OpenAI (Second Fallback)
 */

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIProvider {
    name: 'kilocode' | 'venice' | 'openai';
    client: OpenAI;
    model: string;
}

/**
 * Returns available providers in requested priority order.
 */
export function getAllAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    const kilocode = getKilocodeClient();
    if (kilocode) {
        providers.push({ name: 'kilocode', client: kilocode, model: KILOCODE_MODEL_ID });
    }

    const venice = getVeniceClient();
    if (venice) {
        providers.push({ name: 'venice', client: venice, model: VENICE_MODEL_ID });
    }

    const openai = getOpenAIClient();
    if (openai) {
        providers.push({ name: 'openai', client: openai, model: OPENAI_MODEL_ID });
    }

    return providers;
}

/**
 * Single entry point for AI inference with automatic fallback chain.
 */
export async function generateInference(
    messages: AIMessage[],
    options: { temperature?: number; max_tokens?: number } = {}
): Promise<{ content: string; provider: string } | null> {
    const providers = getAllAvailableProviders();

    if (providers.length === 0) {
        console.warn('[AI] No AI providers available.');
        return null;
    }

    for (const provider of providers) {
        try {
            const completion = await provider.client.chat.completions.create({
                model: provider.model,
                messages: messages as any,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 300,
            });

            const content = completion.choices[0]?.message?.content?.trim();
            if (content) {
                return { content, provider: provider.name };
            }
        } catch (error) {
            console.error(`[AI] ${provider.name} inference failed:`, error instanceof Error ? error.message : String(error));
            
            // Internal fallback for kilocode
            if (provider.name === 'kilocode') {
                try {
                    const fallbackCompletion = await provider.client.chat.completions.create({
                        model: KILOCODE_FALLBACK_MODEL,
                        messages: messages as any,
                        temperature: options.temperature ?? 0.7,
                        max_tokens: options.max_tokens ?? 300,
                    });
                    const fallbackContent = fallbackCompletion.choices[0]?.message?.content?.trim();
                    if (fallbackContent) {
                        return { content: fallbackContent, provider: 'kilocode-fallback' };
                    }
                } catch (fallbackError) {
                    console.error('[AI] kilocode fallback model failed:', fallbackError);
                }
            }
        }
    }

    return null;
}
