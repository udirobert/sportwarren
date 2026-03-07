import OpenAI from 'openai';

/**
 * Venice AI Service — The Sovereign Inference Layer
 * SportWarren's default for "Parallel Season" narratives.
 */
export class VeniceAIService {
    private client: OpenAI;
    private modelId: string;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.VENICE_API_KEY,
            baseURL: 'https://api.venice.ai/api/v1',
        });
        this.modelId = process.env.VENICE_MODEL_ID || 'llama-3.1-70b-instruct';
    }

    /**
     * Generates a completion using Venice AI.
     * Leverages the OpenAI-compatible API for seamless transition.
     */
    async generateCompletion(
        messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
        options: { temperature?: number; max_tokens?: number } = {}
    ): Promise<string> {
        if (!process.env.VENICE_API_KEY) {
            console.warn('[VENICE-AI] API Key missing. Skipping inference.');
            return '';
        }

        try {
            const response = await this.client.chat.completions.create({
                model: this.modelId,
                messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 300,
            });

            return response.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('[VENICE-AI] Inference failed:', error);
            throw error;
        }
    }
}

export const veniceAI = new VeniceAIService();
