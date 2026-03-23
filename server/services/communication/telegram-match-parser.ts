export interface ParsedTelegramMatchResult {
  outcome: 'win' | 'loss' | 'draw';
  opponent: string;
  teamScore: number;
  opponentScore: number;
}

export function parseTelegramMatchResult(text: string): ParsedTelegramMatchResult | null {
  const trimmed = text.trim();

  const winMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)\s+(?:win|won)\s+(?:vs|against)\s+(.+)$/i);
  if (winMatch) {
    return {
      teamScore: Number.parseInt(winMatch[1], 10),
      opponentScore: Number.parseInt(winMatch[2], 10),
      outcome: 'win',
      opponent: winMatch[3].trim(),
    };
  }

  const lossMatch = trimmed.match(/^(?:lost|lose)\s+(\d+)\s*-\s*(\d+)\s+(?:to|vs|against)\s+(.+)$/i);
  if (lossMatch) {
    return {
      teamScore: Number.parseInt(lossMatch[1], 10),
      opponentScore: Number.parseInt(lossMatch[2], 10),
      outcome: 'loss',
      opponent: lossMatch[3].trim(),
    };
  }

  const drawMatch = trimmed.match(/^(?:drew|draw)\s+(\d+)\s*-\s*(\d+)\s+(?:with|vs|against)\s+(.+)$/i);
  if (drawMatch) {
    return {
      teamScore: Number.parseInt(drawMatch[1], 10),
      opponentScore: Number.parseInt(drawMatch[2], 10),
      outcome: 'draw',
      opponent: drawMatch[3].trim(),
    };
  }

  return null;
}
