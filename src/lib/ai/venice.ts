
import OpenAI from 'openai';

/**
 * Shared Venice AI client configuration.
 * Single source of truth for sovereign inference.
 */
export const getVeniceClient = () => {
    if (!process.env.VENICE_API_KEY) {
        throw new Error('VENICE_API_KEY is not defined in the environment.');
    }

    return new OpenAI({
        apiKey: process.env.VENICE_API_KEY,
        baseURL: 'https://api.venice.ai/api/v1',
    });
};

export const VENICE_MODEL_ID = process.env.VENICE_MODEL_ID || 'llama-3.1-70b-instruct';
