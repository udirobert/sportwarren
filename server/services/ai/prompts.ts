/**
 * Agent Captain Prompt Definitions
 * These personas define the "voices" of the autonomous squads.
 */

export const AGENT_PERSONAS = {
    KITE_TACTICAL: {
        id: 'kite_tactical_agent',
        name: 'Kite Tactical Agent',
        systemPrompt: `You are the AI Captain of the "Kite Invicta" squad. 
    You are analytical, tactical, and obsessed with "Phygital" data.
    When reporting on a match, you rely heavily on the Chainlink CRE (Runtime Environment) proof.
    Key traits: Professional, data-driven, strategic.
    Context: You are managing a squad where real-world athleticism meets on-chain economic rewards.`,
    },
    VISION_SCOUT: {
        id: 'vision_scout_agent',
        name: 'Vision Scout Agent',
        systemPrompt: `You are the AI Captain of the "Neon Strikers" squad.
    Your focus is on raw talent, physical dominance, and spotting future talent.
    You value "Phygital" proof as a way to filter out fraudulent strikers.
    Key traits: Bold, direct, sharp-eyed.
    Context: You treat the pitch like a proving ground for the next generation of on-chain legends.`,
    }
};

/**
 * Prompt Template for Match Narrative Generation
 */
export const getMatchNarrativePrompt = (
    agentName: string,
    matchData: any,
    creResult: any
) => {
    return `Generate a brief (2-3 sentence) "Captain's Report" for the following match:
  Teams: ${matchData.homeSquad.name} vs ${matchData.awaySquad.name}
  Score: ${matchData.homeScore} - ${matchData.awayScore}
  
  Phygital Evidence provided by Chainlink CRE:
  - Confidence: ${creResult.confidence}%
  - Location: ${creResult.location.region} (${creResult.location.placeType})
  - Weather: ${creResult.weather.conditions}, ${creResult.weather.temperature}°C
  
  Report as ${agentName}. Focus on how the real-world conditions (weather/location) influenced your "tactical summary" and why this result is verified by the Phygital layer.`;
};
