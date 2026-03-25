import { openaiService } from '../openai';
import { AGENT_PERSONAS, getMatchNarrativePrompt } from './prompts';

export class AgenticService {
    /**
     * Generates localized "Captain Reports" for a match based on Phygital evidence.
     */
    async generateMatchReport(matchData: any, creResult: any): Promise<any> {
        const awayTeamName = matchData.awaySquad?.name || matchData.awayTeam || 'Away Team';

        // Select persona based on team name or random for seeding
        let persona = AGENT_PERSONAS.KITE_TACTICAL;
        if (awayTeamName.toLowerCase().includes('neon')) {
            persona = AGENT_PERSONAS.VISION_SCOUT;
        }

        try {
            const prompt = getMatchNarrativePrompt(persona.name, matchData, creResult);
            const messages = [
                { role: 'system' as const, content: persona.systemPrompt },
                { role: 'user' as const, content: prompt },
            ];

            let report = '';

            // 1. Try Venice AI First (Sovereign Inference)
            if (process.env.VENICE_API_KEY) {
                try {
                    const { veniceAI } = await import('./venice');
                    report = await veniceAI.generateCompletion(messages);
                    console.log(`[AGENTIC-SERVICE] Report generated via Venice AI (${persona.name})`);
                } catch (_veniceError) {
                    console.warn('[AGENTIC-SERVICE] Venice AI failed, falling back to OpenAI.');
                }
            }

            // 2. Fallback to OpenAI
            if (!report && process.env.OPENAI_API_KEY) {
                const response = await openaiService.openai.chat.completions.create({
                    model: 'gpt-4-turbo-preview',
                    messages,
                    max_tokens: 200,
                    temperature: 0.7,
                });
                report = response.choices[0]?.message?.content || '';
                if (report) console.log(`[AGENTIC-SERVICE] Report generated via OpenAI (${persona.name})`);
            }

            if (!report) {
                throw new Error('No inference engine available.');
            }

            return {
                agentId: persona.id,
                agentName: persona.name,
                report,
                decision: creResult.verified ? "APPROVE_XP_DISBURSEMENT" : "DENY_XP_PENDING_REVIEW",
                timestamp: new Date().toISOString()
            };
        } catch (_error) {
            console.warn('[AGENTIC-SERVICE] AI Report generation failed, falling back to basic data.');
            return {
                agentId: persona.id,
                agentName: persona.name,
                report: `Phygital consensus reached with ${creResult.confidence}% confidence. Weather: ${creResult.weather.conditions}.`,
                decision: creResult.verified ? "APPROVE_XP_DISBURSEMENT" : "DENY_XP_PENDING_REVIEW",
                timestamp: new Date().toISOString()
            };
        }
    }
}

export const agenticService = new AgenticService();
