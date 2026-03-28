import OpenAI from 'openai';

export const OPENAI_MODEL_ID = process.env.OPENAI_MODEL_ID || 'gpt-4o-mini';

export const getOpenAIClient = () => {
    if (!process.env.OPENAI_API_KEY) return null;
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
};
