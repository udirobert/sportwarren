import { NextResponse } from 'next/server';
import { generateInference } from '@/lib/ai/inference';

export interface NlMatchPayload {
  command: string;
  formation: string;
  style: string;
  names: string[];
}

export interface NlMatchEvent {
  minute: number;
  text: string;
  type: 'goal' | 'save' | 'dribble' | 'pass' | 'tackle' | 'shot' | 'cross' | 'foul';
  player?: string;
  side: 'home' | 'away';
}

const MATCH_SYSTEM_PROMPT = `You are a football match commentator generating a realistic 60-second match timeline.

The user will describe a specific action or scenario they want to see. Convert their natural language command into 4-8 match events over 60 minutes.

Rules:
- Each event must have: minute (1-60), text (commentary line, max 80 chars), type (goal|save|dribble|pass|tackle|shot|cross|foul), player (name if mentioned or inferred), side (home for user's squad, away for opponent).
- The user's squad is the home team. The opponent is the away team.
- If the user describes a specific action, make it happen AND show realistic consequences (e.g. if they score, show the goal event AND a later counter-attack).
- Keep commentary punchy and energetic.
- Return ONLY a JSON object: {"events": [...], "homeScore": number, "awayScore": number}
- Do not include markdown code blocks or explanation text.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NlMatchPayload;
    const { command, formation, style, names } = body;

    const userMessage = `Squad: ${names.slice(0, 5).join(', ') || 'Player 1, Player 2'} playing ${formation} (${style}).\nCommand: ${command}`;

    const result = await generateInference(
      [
        { role: 'system', content: MATCH_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0.7, max_tokens: 800 }
    );

    let parsed;
    try {
      parsed = JSON.parse(result) as { events: NlMatchEvent[]; homeScore: number; awayScore: number };
    } catch {
      // Fallback: try to extract JSON from markdown
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]) as { events: NlMatchEvent[]; homeScore: number; awayScore: number };
      } else {
        throw new Error('Failed to parse match result');
      }
    }

    // Clamp and sort events
    const events = parsed.events
      .map((e) => ({ ...e, minute: Math.max(1, Math.min(60, e.minute)) }))
      .sort((a, b) => a.minute - b.minute);

    return NextResponse.json({
      events,
      homeScore: parsed.homeScore ?? 0,
      awayScore: parsed.awayScore ?? 0,
    });
  } catch (err) {
    console.error('[NL-MATCH] Failed:', err);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
