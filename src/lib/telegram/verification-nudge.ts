/**
 * Telegram Verification Nudge Helper
 * Used by the Telegram bot service to send verification reminders
 * Single source of truth for verification nudge messaging
 */

import { buildTelegramDeepLink } from './deep-links';

interface PendingMatch {
  id: string;
  opponent: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  requiredVerifications: number;
  verificationCount: number;
}

interface NudgeOptions {
  squadName: string;
  pendingMatches: PendingMatch[];
  chatId: string;
}

/**
 * Build a verification nudge message for Telegram
 * @param options - Squad name, pending matches, and chat ID
 * @returns Formatted message string for Telegram
 */
export function buildVerificationNudgeMessage(options: NudgeOptions): string {
  const { squadName, pendingMatches } = options;

  if (pendingMatches.length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push(`⚽ ${squadName} — ${pendingMatches.length} match${pendingMatches.length > 1 ? 'es' : ''} pending verification!`);
  lines.push('');

  pendingMatches.forEach((match) => {
    const score = `${match.homeScore}-${match.awayScore}`;
    const status = match.verificationCount < match.requiredVerifications
      ? `needs ${match.requiredVerifications - match.verificationCount} more verification${match.requiredVerifications - match.verificationCount > 1 ? 's' : ''}`
      : 'ready to settle';

    lines.push(`vs ${match.opponent} (${score}) — ${status}`);
  });

  lines.push('');
  lines.push('[Verify in Mini App](' + buildTelegramDeepLink({ tab: 'match' }) + ')');

  return lines.join('\n');
}

/**
 * Build a simple nudge message for a single match
 * @param match - Pending match details
 * @param squadName - Squad name
 * @returns Formatted message string
 */
export function buildSingleMatchNudge(match: PendingMatch, squadName: string): string {
  const score = `${match.homeScore}-${match.awayScore}`;
  const remaining = match.requiredVerifications - match.verificationCount;

  return [
    `⚽ Verification needed for ${squadName}!`,
    '',
    `vs ${match.opponent} (${score})`,
    `${remaining} more verification${remaining > 1 ? 's' : ''} needed`,
    '',
    `[Verify Now](${buildTelegramDeepLink({ tab: 'match', prefilled: { matchId: match.id } })})`,
  ].join('\n');
}

/**
 * Determine if a nudge should be sent based on match age
 * @param matchCreatedAt - When the match was created
 * @param lastNudgeAt - When the last nudge was sent (optional)
 * @returns Whether to send a nudge
 */
export function shouldSendNudge(
  matchCreatedAt: Date,
  lastNudgeAt?: Date | null
): boolean {
  const now = Date.now();
  const matchAge = now - matchCreatedAt.getTime();

  // Don't nudge for matches less than 1 hour old
  if (matchAge < 60 * 60 * 1000) {
    return false;
  }

  // Don't nudge more than once per 6 hours
  if (lastNudgeAt) {
    const timeSinceLastNudge = now - lastNudgeAt.getTime();
    if (timeSinceLastNudge < 6 * 60 * 60 * 1000) {
      return false;
    }
  }

  return true;
}

/**
 * Get nudge frequency based on match age
 * @param matchCreatedAt - When the match was created
 * @returns Nudge frequency in hours
 */
export function getNudgeFrequency(matchCreatedAt: Date): number {
  const matchAge = Date.now() - matchCreatedAt.getTime();
  const hoursOld = matchAge / (60 * 60 * 1000);

  if (hoursOld < 24) {
    return 6; // Nudge every 6 hours for matches less than 24 hours old
  } else if (hoursOld < 72) {
    return 12; // Nudge every 12 hours for matches 1-3 days old
  } else {
    return 24; // Nudge every 24 hours for matches older than 3 days
  }
}