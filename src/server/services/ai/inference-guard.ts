import { redisService } from '../redis';

export type InferenceTier = 'text' | 'vision' | 'image' | 'voice';

export interface InferenceUsage {
    requestsToday: number;
    estimatedCostUsdc: number;
}

const TIER_COSTS: Record<InferenceTier, number> = {
    text: 0.002,   // Average cost per text inference
    vision: 0.01,  // Higher cost for vision
    voice: 0.005,  // Cost for transcription/voice
    image: 0.04,   // Highest cost (DALL-E 3)
};

const GLOBAL_DAILY_BUDGET_USDC = Number(process.env.AI_GLOBAL_DAILY_BUDGET_USDC || '10.00');
const USER_DAILY_LIMIT_REQUESTS = Number(process.env.AI_USER_DAILY_LIMIT_REQUESTS || '50');
const USER_DAILY_LIMIT_IMAGES = Number(process.env.AI_USER_DAILY_LIMIT_IMAGES || '5');

// Basic keyword list to catch egregious prompt injection or offensive content
const BANNED_KEYWORDS = [
    'nude', 'porn', 'explicit', 'violent', 'gore', 'kill', 'hate', 
    'racist', 'sex', 'blood', 'weapon', 'illegal', 'hack', 'steal',
    'admin', 'bypass', 'system prompt', 'ignore previous', 'forget previous'
];

export class InferenceGuard {
    /**
     * Check if a prompt is potentially offensive or represents a prompt injection.
     */
    async moderatePrompt(prompt: string | undefined): Promise<{
        safe: boolean;
        reason?: string;
    }> {
        if (!prompt) return { safe: true };
        
        const lowerPrompt = prompt.toLowerCase();
        for (const keyword of BANNED_KEYWORDS) {
            if (lowerPrompt.includes(keyword)) {
                return { 
                    safe: false, 
                    reason: `Potentially offensive or unsafe content detected: "${keyword}"` 
                };
            }
        }
        
        return { safe: true };
    }

    /**
     * Check if an inference request is permitted based on global and user limits.
     */
    async checkLimit(userId: string | undefined, tier: InferenceTier = 'text'): Promise<{ 
        allowed: boolean; 
        reason?: string 
    }> {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Global Budget Check
        const globalKey = `ai:usage:global:${today}`;
        const globalSpend = await redisService.get(globalKey);
        if (globalSpend && parseFloat(globalSpend) >= GLOBAL_DAILY_BUDGET_USDC) {
            console.error(`[InferenceGuard] Global daily budget reached: $${globalSpend}`);
            return { allowed: false, reason: 'Global AI budget exceeded for today.' };
        }

        // 2. User Limits (if logged in)
        if (userId) {
            const userKey = `ai:usage:user:${userId}:${today}`;
            const userRequests = await redisService.get(userKey);
            
            if (userRequests && parseInt(userRequests) >= USER_DAILY_LIMIT_REQUESTS) {
                return { allowed: false, reason: 'You have reached your daily AI request limit.' };
            }

            if (tier === 'image') {
                const userImageKey = `ai:usage:user:${userId}:images:${today}`;
                const userImages = await redisService.get(userImageKey);
                if (userImages && parseInt(userImages) >= USER_DAILY_LIMIT_IMAGES) {
                    return { allowed: false, reason: 'You have reached your daily AI image generation limit.' };
                }
            }
        } else if (tier === 'image') {
            // Guest users cannot generate images
            return { allowed: false, reason: 'Authentication required for image generation.' };
        }

        return { allowed: true };
    }

    /**
     * Record successful inference usage and update budget trackers.
     */
    async trackUsage(userId: string | undefined, tier: InferenceTier = 'text', provider: string = 'unknown'): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const cost = TIER_COSTS[tier];

        // 1. Global usage (atomic)
        const globalKey = `ai:usage:global:${today}`;
        await redisService.incrbyfloat(globalKey, cost, 86400);

        // 2. User usage
        if (userId) {
            const userKey = `ai:usage:user:${userId}:${today}`;
            await redisService.incr(userKey, 86400);

            if (tier === 'image') {
                const userImageKey = `ai:usage:user:${userId}:images:${today}`;
                await redisService.incr(userImageKey, 86400);
            }
        }

        console.log(`[InferenceGuard] Recorded ${tier} inference via ${provider}. Estimated cost: $${cost}`);
    }
}

export const inferenceGuard = new InferenceGuard();
