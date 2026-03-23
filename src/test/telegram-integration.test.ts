import { afterEach, describe, expect, it } from 'vitest';
import { parseTelegramMatchResult } from '../../server/services/communication/telegram-match-parser';
import {
  buildTelegramDeepLink,
  buildTelegramMiniAppUrl,
  extractTelegramConnectToken,
  isTelegramConnectToken,
} from '../../server/services/communication/platform-connections';
import { buildTonCommentPayload, toTonNanoString } from '../lib/ton/payload';

const originalTelegramBotUsername = process.env.TELEGRAM_BOT_USERNAME;
const originalClientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

afterEach(() => {
  if (originalTelegramBotUsername === undefined) {
    delete process.env.TELEGRAM_BOT_USERNAME;
  } else {
    process.env.TELEGRAM_BOT_USERNAME = originalTelegramBotUsername;
  }

  if (originalClientUrl === undefined) {
    delete process.env.NEXT_PUBLIC_CLIENT_URL;
    return;
  }

  process.env.NEXT_PUBLIC_CLIENT_URL = originalClientUrl;
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

  it('builds a Telegram mini app url from the configured client url', () => {
    process.env.NEXT_PUBLIC_CLIENT_URL = 'https://sportwarren.app';

    expect(buildTelegramMiniAppUrl('launch123')).toBe('https://sportwarren.app/telegram/mini-app?token=launch123');
  });
});

describe('ton payload helpers', () => {
  it('encodes a text comment payload to base64 boc', () => {
    expect(buildTonCommentPayload('SportWarren top-up')).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('converts whole TON values into nanotons', () => {
    expect(toTonNanoString(2)).toBe('2000000000');
  });
});
