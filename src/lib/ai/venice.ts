import OpenAI from 'openai';

/**
 * Shared AI client configuration - Single Source of Truth
 * Priority: Venice → OpenAI → kilocode
 */

// ─────────────────────────────────────────────────────────────
// Venice AI (Primary - privacy-first)
// ─────────────────────────────────────────────────────────────

export const getVeniceClient = () => {
    if (!process.env.VENICE_API_KEY) {
        throw new Error('VENICE_API_KEY is not defined in the environment.');
    }

    return new OpenAI({
        apiKey: process.env.VENICE_API_KEY,
        baseURL: 'https://api.venice.ai/api/v1',
    });
};

export const getOptionalVeniceClient = () => {
    if (!process.env.VENICE_API_KEY) {
        return null;
    }

    return new OpenAI({
        apiKey: process.env.VENICE_API_KEY,
        baseURL: 'https://api.venice.ai/api/v1',
    });
};

// ─────────────────────────────────────────────────────────────
// OpenAI (First Fallback)
// ─────────────────────────────────────────────────────────────

export const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
};

// ─────────────────────────────────────────────────────────────
// kilocode (Second Fallback - free models)
// ─────────────────────────────────────────────────────────────

export const getKilocodeClient = () => {
    if (!process.env.KILOCODE_API_KEY) {
        return null;
    }

    return new OpenAI({
        apiKey: process.env.KILOCODE_API_KEY,
        baseURL: 'https://api.kilo.ai/api/openrouter/',
    });
};

// ─────────────────────────────────────────────────────────────
// Model IDs
// ─────────────────────────────────────────────────────────────

export const VENICE_MODEL_ID = process.env.VENICE_MODEL_ID || 'llama-3.3-70b';
export const OPENAI_MODEL_ID = process.env.OPENAI_MODEL_ID || 'gpt-4o-mini';
export const KILOCODE_MODEL_ID = process.env.KILOCODE_MODEL_ID || 'minimax/minimax-m2.5:free';
export const KILOCODE_FALLBACK_MODEL = 'xiaomi/mimo-v2-pro:free';

// ─────────────────────────────────────────────────────────────
// Unified Inference Client
// ─────────────────────────────────────────────────────────────

export interface AIProvider {
    name: 'venice' | 'openai' | 'kilocode';
    client: OpenAI;
    model: string;
}

export function getAIProvider(): AIProvider | null {
    const venice = getOptionalVeniceClient();
    if (venice) {
        return { name: 'venice', client: venice, model: VENICE_MODEL_ID };
    }

    const openai = getOpenAIClient();
    if (openai) {
        return { name: 'openai', client: openai, model: OPENAI_MODEL_ID };
    }

    const kilocode = getKilocodeClient();
    if (kilocode) {
        return { name: 'kilocode', client: kilocode, model: KILOCODE_MODEL_ID };
    }

    return null;
}

export function getAllAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    const venice = getOptionalVeniceClient();
    if (venice) providers.push({ name: 'venice', client: venice, model: VENICE_MODEL_ID });

    const openai = getOpenAIClient();
    if (openai) providers.push({ name: 'openai', client: openai, model: OPENAI_MODEL_ID });

    const kilocode = getKilocodeClient();
    if (kilocode) providers.push({ name: 'kilocode', client: kilocode, model: KILOCODE_MODEL_ID });

    return providers;
}