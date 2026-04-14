import { getVeniceClient } from '@/lib/ai/providers/venice';
import { getOpenAIClient } from '@/lib/ai/providers/openai';

export interface AvatarGenerationOptions {
    prompt?: string;
    style?: 'realistic' | 'stylized' | 'pixel' | 'sketch';
    position?: string;
    attributes?: Record<string, number>;
}

export async function generateAiAvatar(options: AvatarGenerationOptions): Promise<string | null> {
    const { position, style = 'stylized', attributes } = options;
    
    // Construct a rich prompt based on player data
    const attrSummary = attributes 
        ? Object.entries(attributes).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'balanced stats';
        
    const basePrompt = `A professional-grade sports avatar for a football player. 
        Position: ${position || 'Forward'}. 
        Style: ${style}. 
        Player DNA: ${attrSummary}. 
        The avatar should look like a premium digital athlete card, modern sports-tech aesthetic, high contrast, dynamic lighting. 
        Focus on the face and upper torso wearing a sleek futuristic football kit. 
        No text, no watermarks.`;

    const fullPrompt = options.prompt ? `${basePrompt} Additional details: ${options.prompt}` : basePrompt;

    // Try Venice first (Privacy focused, often good for creative stuff)
    const venice = getVeniceClient();
    if (venice) {
        try {
            console.log('[AvatarGen] Attempting generation via Venice...');
            const response = await venice.images.generate({
                model: 'fluently-xl', // Common Venice image model
                prompt: fullPrompt,
                n: 1,
                size: '512x512' as any,
                response_format: 'url',
            });
            
            const url = response.data?.[0]?.url;
            if (url) return url;
        } catch (error) {
            console.error('[AvatarGen] Venice generation failed:', error);
        }
    }

    // Fallback to OpenAI DALL-E 3
    const openai = getOpenAIClient();
    if (openai) {
        try {
            console.log('[AvatarGen] Attempting generation via OpenAI...');
            const response = await openai.images.generate({
                model: 'dall-e-3',
                prompt: fullPrompt,
                n: 1,
                size: '1024x1024',
                quality: 'standard',
                response_format: 'url',
            });
            
            return response.data?.[0]?.url || null;
        } catch (error) {
            console.error('[AvatarGen] OpenAI generation failed:', error);
        }
    }

    return null;
}
