import OpenAI from 'openai';

export const KILOCODE_MODEL_ID = process.env.KILOCODE_MODEL_ID || 'minimax/minimax-m2.5:free';
export const KILOCODE_FALLBACK_MODEL = 'xiaomi/mimo-v2-pro:free';

export const getKilocodeClient = () => {
    if (!process.env.KILOCODE_API_KEY) return null;
    return new OpenAI({
        apiKey: process.env.KILOCODE_API_KEY,
        baseURL: 'https://api.kilo.ai/api/openrouter/',
    });
};
