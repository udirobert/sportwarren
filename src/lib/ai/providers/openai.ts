import { createProviderClient } from './common';

export const OPENAI_MODEL_ID = process.env.OPENAI_MODEL_ID || 'gpt-4o-mini';

export const getOpenAIClient = () => {
    return createProviderClient({
        apiKey: process.env.OPENAI_API_KEY,
    });
};