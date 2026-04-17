import OpenAI from 'openai';

export interface ProviderConfig {
    apiKey: string | undefined;
    baseURL?: string;
}

export function createProviderClient(config: ProviderConfig): OpenAI | null {
    if (!config.apiKey) return null;
    return new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
    });
}