import { createProviderClient } from './common';

export const VENICE_MODEL_ID = process.env.VENICE_MODEL_ID || 'llama-3.3-70b';

export const getVeniceClient = () => {
    return createProviderClient({
        apiKey: process.env.VENICE_API_KEY,
        baseURL: 'https://api.venice.ai/api/v1',
    });
};