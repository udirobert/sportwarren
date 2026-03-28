import OpenAI from 'openai';

export const VENICE_MODEL_ID = process.env.VENICE_MODEL_ID || 'llama-3.3-70b';

export const getVeniceClient = () => {
    if (!process.env.VENICE_API_KEY) return null;
    return new OpenAI({
        apiKey: process.env.VENICE_API_KEY,
        baseURL: 'https://api.venice.ai/api/v1',
    });
};
