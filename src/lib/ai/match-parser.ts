import { generateInference, AIMessage } from '@/lib/ai/inference';

export interface ParsedMatchResult {
  homeScore: number;
  awayScore: number;
  opponent: string;
  isHome: boolean;
  scorers: Array<{ name: string; goals: number }>;
  confidence: number;
}

const PARSER_SYSTEM_PROMPT = `You are a match result parser for SportWarren, an amateur football app.
Extract the match details from the user's natural language message.
If the message is about a match result, return a JSON object with:
- homeScore (number)
- awayScore (number)
- opponent (string)
- isHome (boolean, default true if the user implies their team)
- scorers (array of objects with {name: string, goals: number})
- confidence (number between 0 and 1, reflecting your certainty)

If the user says "we won 4-2", "we" is the home team.
If the user says "I scored two", add the user (name: "You" or "I") to the scorers list with 2 goals.
Only return the JSON object. If you cannot parse it, return null.`;

export async function parseNaturalLanguageMatch(text: string): Promise<ParsedMatchResult | null> {
  const messages: AIMessage[] = [
    { role: 'system', content: PARSER_SYSTEM_PROMPT },
    { role: 'user', content: text }
  ];

  try {
    const result = await generateInference(messages, { temperature: 0.1 });
    if (!result || !result.content) return null;

    // Clean the JSON string if it's wrapped in code blocks
    const cleanContent = result.content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    if (parsed && typeof parsed === 'object' && parsed.confidence > 0.5) {
      return parsed as ParsedMatchResult;
    }
  } catch (error) {
    console.error('[AI Parser] Failed to parse match result:', error);
  }

  return null;
}
