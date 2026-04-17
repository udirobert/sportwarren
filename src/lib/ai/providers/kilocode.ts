import { createProviderClient } from './common';

export const KILOCODE_MODEL_ID = process.env.KILOCODE_MODEL_ID || 'minimax/minimax-m2.5:free';
export const KILOCODE_FALLBACK_MODEL = 'xiaomi/mimo-v2-pro:free';

export const getKilocodeClient = () => {
    return createProviderClient({
        apiKey: process.env.KILOCODE_API_KEY,
        baseURL: 'https://api.kilo.ai/api/openrouter/',
    });
};