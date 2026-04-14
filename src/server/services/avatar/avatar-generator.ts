import { getVeniceClient } from '@/lib/ai/providers/venice';
import { getOpenAIClient } from '@/lib/ai/providers/openai';
import { inferenceGuard } from '../ai/inference-guard';

export interface AvatarGenerationOptions {
    prompt?: string;
    style?: 'realistic' | 'stylized' | 'pixel' | 'sketch';
    position?: string;
    attributes?: Record<string, number>;
    userId?: string;
}

export async function generateAiAvatar(options: AvatarGenerationOptions): Promise<string | null> {
    const { position, style = 'stylized', attributes, userId } = options;
    
    // Check moderation first if prompt is provided
    if (options.prompt) {
        const mod = await inferenceGuard.moderatePrompt(options.prompt);
        if (!mod.safe) {
            console.warn(`[AvatarGen] Prompt moderation failed: ${mod.reason}`);
            return null;
        }
    }

    // Check guard
    const guard = await inferenceGuard.checkLimit(userId, 'image');
    if (!guard.allowed) {
        console.warn(`[AvatarGen] Blocked by guard: ${guard.reason}`);
        return null;
    }
    
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
            if (url) {
                await inferenceGuard.trackUsage(userId, 'image', 'venice');
                return url;
            }
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
            
            const url = response.data?.[0]?.url;
            if (url) {
                await inferenceGuard.trackUsage(userId, 'image', 'openai-dalle');
                return url;
            }
            return null;
        } catch (error) {
            console.error('[AvatarGen] OpenAI generation failed:', error);
        }
    }

    return null;
}
