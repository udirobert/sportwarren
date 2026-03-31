import type { ErrorCode } from '../types';

/**
 * Consolidated Error Responses
 * CONSOLIDATION: Single source of truth for error messages
 * DRY: No scattered error strings
 */

const ERRORS: Record<ErrorCode, string> = {
  NOT_LINKED: `⚠️ This chat is not linked to your SportWarren account.

Use /link for instructions, or open the app → Settings → Telegram to connect.`,

  NO_SQUAD: `❌ You're not in any squad yet.

Use /app to create or join a squad.`,

  MULTIPLE_SQUADS: `⚠️ You're in multiple squads. Please specify:

• /squad [squad-name] - View squad details
• /log vs [opponent] - Specify which squad`,

  NOT_CAPTAIN: `⛔ Only squad captains can use this command.

Ask your captain to do this, or transfer leadership in /app.`,

  RATE_LIMITED: `⏳ *Slow down!* You've hit the rate limit.

Please wait a moment and try again.`,

  INVALID_INPUT: `❌ Invalid input.

Check the command format and try again.`,

  NOT_FOUND: `🔍 Not found.

The item you're looking for doesn't exist or was deleted.`,

  INTERNAL_ERROR: `⚠️ Something went wrong.

Please try again. If the problem persists, contact support.`,
};

/**
 * Get error message for code
 * CLEAN: Single function for error lookup
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERRORS[code] ?? ERRORS.INTERNAL_ERROR;
}

/**
 * Get error message with custom context
 */
export function getErrorWithContext(code: ErrorCode, context: string): string {
  return `${ERRORS[code] ?? ERRORS.INTERNAL_ERROR}\n\n_${context}_`;
}

/**
 * Common success messages
 * CONSOLIDATION: Reuse across commands
 */
export const SUCCESS = {
  LINKED: (username?: string) => 
    `✅ Chat linked to @${username ?? 'your account'}!\n\nYou can now use /log, /stats, and more.`,

  UNLINKED: `✅ Chat unlinked from your account.`,

  MATCH_LOGGED: (opponent: string, score: string) => 
    `⚽ Match logged: *${score}* vs ${opponent}\n\n_Use /stats to view your squad's record_`,

  AVAILABILITY_SET: (day: string) => 
    `✅ Availability set for *${day}*\n\n_Captains can view with /roster_`,

  FEE_PROPOSED: (amount: string, matchId: string) => 
    `💰 Fee proposed: *${amount} TON*\n\nMatch: ${matchId}\n\n_Players can approve in /app_`,
} as const;

/**
 * Common prompt messages
 */
export const PROMPTS = {
  LINK: `🔗 *Link Your Account*

To use chat commands, link this chat to your SportWarren account:

1. Open SportWarren app
2. Go to *Settings → Telegram*  
3. Click *Link Chat*
4. Return here and use /link

_This connects your identity for all commands._`,

  SELECT_SQUAD: (squads: string[]) => 
    `⚠️ You're in multiple squads. Which one?

${squads.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Reply with the number.`,

  CONFIRM_MATCH: (opponent: string, score: string) => 
    `⚽ *Confirm Match Result*

*${score}* vs ${opponent}

Is this correct? Reply *yes* to confirm or *no* to cancel.`,
} as const;