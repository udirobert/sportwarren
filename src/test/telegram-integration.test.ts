import { afterEach, describe, expect, it } from 'vitest';
import { createHmac } from 'crypto';
import { parseTelegramMatchResult } from '../server/services/communication/telegram-match-parser';
import {
  buildTelegramDeepLink,
  buildTelegramMiniAppUrl,
  extractTelegramConnectToken,
  isTelegramConnectToken,
} from '../server/services/communication/platform-connections';
import { verifyTelegramWebAppInitData } from '../server/services/communication/telegram-auth';
import { buildTonCommentPayload, toTonNanoString } from '../lib/ton/payload';

const originalTelegramBotUsername = process.env.TELEGRAM_BOT_USERNAME;
const originalClientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;
const originalTelegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

afterEach(() => {
  if (originalTelegramBotUsername === undefined) {
    delete process.env.TELEGRAM_BOT_USERNAME;
  } else {
    process.env.TELEGRAM_BOT_USERNAME = originalTelegramBotUsername;
  }

  if (originalClientUrl === undefined) {
    delete process.env.NEXT_PUBLIC_CLIENT_URL;
  } else {
    process.env.NEXT_PUBLIC_CLIENT_URL = originalClientUrl;
  }

  if (originalTelegramBotToken === undefined) {
    delete process.env.TELEGRAM_BOT_TOKEN;
  } else {
    process.env.TELEGRAM_BOT_TOKEN = originalTelegramBotToken;
  }
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
    process.env.NEXT_PUBLIC_CLIENT_URL = 'https://www.sportwarren.com';

    expect(buildTelegramMiniAppUrl({ token: 'launch123' })).toBe('https://www.sportwarren.com/telegram/mini-app?token=launch123');
  });
});

describe('telegram mini app auth', () => {
  it('verifies valid init data signatures', () => {
    process.env.TELEGRAM_BOT_TOKEN = '12345:test-token';

    const params = new URLSearchParams({
      auth_date: String(Math.floor(Date.now() / 1000)),
      query_id: 'AAEAAEAA',
      user: JSON.stringify({
        id: 9917,
        first_name: 'Marcus',
        username: 'marcus',
        photo_url: 'https://t.me/i/userpic/320/marcus.jpg',
      }),
    });

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secret = createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();
    const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex');
    params.set('hash', hash);

    const result = verifyTelegramWebAppInitData(params.toString());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.platformUserId).toBe('9917');
      expect(result.data.username).toBe('marcus');
      expect(result.data.displayName).toBe('Marcus');
      expect(result.data.photoUrl).toBe('https://t.me/i/userpic/320/marcus.jpg');
    }
  });

  it('rejects invalid init data signatures', () => {
    process.env.TELEGRAM_BOT_TOKEN = '12345:test-token';

    const params = new URLSearchParams({
      auth_date: String(Math.floor(Date.now() / 1000)),
      query_id: 'AAEAAEAA',
      user: JSON.stringify({ id: 1001, first_name: 'Test' }),
      hash: 'deadbeef',
    });

    const result = verifyTelegramWebAppInitData(params.toString());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('invalid');
    }
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
