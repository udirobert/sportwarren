/**
 * Match Result Card — generates shareable image data for WhatsApp/Instagram
 * Uses html-to-image (already in deps) to render a DOM node to PNG/JPEG.
 */

export interface ShareableMatchData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  playerName?: string;
  playerGoals?: number;
  playerAssists?: number;
  xpGained?: number;
  matchType?: string;
}

export function buildShareText(data: ShareableMatchData): string {
  const result =
    data.homeScore > data.awayScore
      ? 'W'
      : data.homeScore < data.awayScore
        ? 'L'
        : 'D';
  const emoji = result === 'W' ? '🏆' : result === 'D' ? '🤝' : '😤';

  let text = `${emoji} ${data.homeTeam} ${data.homeScore} - ${data.awayScore} ${data.awayTeam}`;

  if (data.playerGoals || data.playerAssists) {
    const parts: string[] = [];
    if (data.playerGoals) parts.push(`${data.playerGoals}⚽`);
    if (data.playerAssists) parts.push(`${data.playerAssists}🅰️`);
    text += `\n${parts.join(' ')}`;
  }

  if (data.xpGained) {
    text += `\n+${data.xpGained} XP`;
  }

  text += '\n\nTrack your game on SportWarren';
  return text;
}

export function buildShareUrl(matchId: string): string {
  if (typeof window === 'undefined') return `/match/${matchId}`;
  return `${window.location.origin}/match/${matchId}`;
}

export function buildWhatsAppShareUrl(text: string, url: string): string {
  const encoded = encodeURIComponent(`${text}\n${url}`);
  return `https://wa.me/?text=${encoded}`;
}

export function buildTwitterShareUrl(text: string, url: string): string {
  const encoded = encodeURIComponent(text);
  return `https://twitter.com/intent/tweet?text=${encoded}&url=${encodeURIComponent(url)}`;
}

export async function shareMatchResult(
  data: ShareableMatchData,
  matchId: string,
  cardElement?: HTMLElement | null,
): Promise<void> {
  const text = buildShareText(data);
  const url = buildShareUrl(matchId);

  if (navigator.share) {
    const shareData: ShareData = { title: 'Match Result', text, url };

    if (cardElement) {
      try {
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(cardElement, { quality: 0.92, pixelRatio: 2 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'match-result.png', { type: 'image/png' });
        shareData.files = [file];
      } catch {
        // Fall through — share without image
      }
    }

    try {
      await navigator.share(shareData);
      return;
    } catch {
      // User cancelled or API unavailable
    }
  }

  // Fallback: open WhatsApp share
  window.open(buildWhatsAppShareUrl(text, url), '_blank');
}
