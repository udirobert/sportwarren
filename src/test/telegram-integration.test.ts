import { afterEach, describe, expect, it } from 'vitest';
import { parseTelegramMatchResult } from '../../server/services/communication/telegram-match-parser';
import {
  buildTelegramDeepLink,
  extractTelegramConnectToken,
  isTelegramConnectToken,
} from '../../server/services/communication/platform-connections';

const originalTelegramBotUsername = process.env.TELEGRAM_BOT_USERNAME;

afterEach(() => {
  if (originalTelegramBotUsername === undefined) {
    delete process.env.TELEGRAM_BOT_USERNAME;
    return;
  }

  process.env.TELEGRAM_BOT_USERNAME = originalTelegramBotUsername;
});

describe('telegram match parsing', () => {
  it('parses a win result from the documented format', () => {
    expect(parseTelegramMatchResult('4-2 win vs Red Lions')).toEqual({
      teamScore: 4,
      opponentScore: 2,
      outcome: 'win',
      opponent: 'Red Lions',
    });
  });

  it('parses a loss result without dropping the opponent name', () => {
    expect(parseTelegramMatchResult('lost 1-3 to Sunday Legends')).toEqual({
      teamScore: 1,
      opponentScore: 3,
      outcome: 'loss',
      opponent: 'Sunday Legends',
    });
  });

  it('parses a draw result without throwing', () => {
    expect(parseTelegramMatchResult('drew 2-2 with Park Rangers')).toEqual({
      teamScore: 2,
      opponentScore: 2,
      outcome: 'draw',
      opponent: 'Park Rangers',
    });
  });
});

describe('telegram connection deep links', () => {
  it('builds a bot deep link from the configured username', () => {
    process.env.TELEGRAM_BOT_USERNAME = '@sportwarren_bot';

    expect(buildTelegramDeepLink('abc123')).toBe('https://t.me/sportwarren_bot?start=connect_abc123');
  });

  it('recognizes and extracts Telegram connect tokens', () => {
    expect(isTelegramConnectToken('connect_deadbeef')).toBe(true);
    expect(extractTelegramConnectToken('connect_deadbeef')).toBe('deadbeef');
    expect(isTelegramConnectToken('deadbeef')).toBe(false);
  });
});
