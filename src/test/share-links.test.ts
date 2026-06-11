import { describe, it, expect } from 'vitest';
import { buildShareLinks, pickPreferredChannel } from '@/lib/share/links';

describe('buildShareLinks', () => {
  const basePayload = {
    text: 'Come play Sunday 5-a-side on SportWarren',
    url: 'https://sportwarren.com/squad/abc',
  };

  it('appends the URL to the WhatsApp text body', () => {
    const { whatsapp } = buildShareLinks(basePayload);
    expect(whatsapp).toMatch(/^https:\/\/wa\.me\/\?text=/);
    const decoded = decodeURIComponent(whatsapp.split('text=')[1]);
    expect(decoded).toContain(basePayload.text);
    expect(decoded).toContain(basePayload.url);
    expect(decoded.trim().endsWith(basePayload.url)).toBe(true);
  });

  it('appends the attribution line when not already present', () => {
    const { whatsapp } = buildShareLinks(basePayload);
    const decoded = decodeURIComponent(whatsapp.split('text=')[1]);
    expect(decoded).toContain('SportWarren');
  });

  it('skips attribution when the body already mentions the brand', () => {
    const { whatsapp } = buildShareLinks({
      text: 'I love SportWarren — come play',
      url: 'https://sportwarren.com/squad/abc',
    });
    const decoded = decodeURIComponent(whatsapp.split('text=')[1]);
    const occurrences = (decoded.match(/SportWarren/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  it('suppresses attribution when set to empty string', () => {
    const { whatsapp } = buildShareLinks({
      text: 'Come play Sunday 5-a-side',
      url: 'https://sportwarren.com/squad/abc',
      attribution: '',
    });
    const decoded = decodeURIComponent(whatsapp.split('text=')[1]);
    expect(decoded).not.toContain('SportWarren');
  });

  it('uses the deep link for the Telegram share when provided', () => {
    const { telegram } = buildShareLinks({
      ...basePayload,
      telegramDeepLink: 'https://t.me/sportwarrenbot/app?startapp=tab%3Dsquad',
    });
    const decoded = decodeURIComponent(telegram);
    expect(decoded).toContain('t.me/share/url');
    expect(decoded).toContain(encodeURIComponent('https://t.me/sportwarrenbot/app?startapp=tab%3Dsquad'));
    expect(decoded).not.toContain(encodeURIComponent(basePayload.url));
  });

  it('falls back to the web URL in the Telegram share when no deep link is set', () => {
    const { telegram } = buildShareLinks(basePayload);
    const decoded = decodeURIComponent(telegram);
    expect(decoded).toContain('t.me/share/url');
    expect(decoded).toContain(encodeURIComponent(basePayload.url));
  });

  it('builds a Web Share payload that does not leak the deep link', () => {
    const { webShare } = buildShareLinks({
      ...basePayload,
      telegramDeepLink: 'https://t.me/sportwarrenbot/app?startapp=tab%3Dsquad',
    });
    expect(webShare.url).toBe(basePayload.url);
    expect(webShare.text).toContain(basePayload.text);
    expect(webShare.text).not.toContain('t.me/sportwarrenbot');
    expect(webShare.title).toBe('SportWarren');
  });

  it('omits the webShare url when no canonical URL is provided', () => {
    const { webShare } = buildShareLinks({ text: 'Hello' });
    expect(webShare.url).toBeUndefined();
  });
});

describe('pickPreferredChannel', () => {
  it('puts Telegram first for Telegram users', () => {
    expect(pickPreferredChannel('telegram')[0]).toBe('telegram');
  });

  it('puts WhatsApp first for mobile web users', () => {
    expect(pickPreferredChannel('mobile')[0]).toBe('whatsapp');
  });

  it('puts WhatsApp first for desktop web users', () => {
    expect(pickPreferredChannel('web')[0]).toBe('whatsapp');
  });

  it('always returns exactly two channels', () => {
    expect(pickPreferredChannel('web')).toHaveLength(2);
    expect(pickPreferredChannel('mobile')).toHaveLength(2);
    expect(pickPreferredChannel('telegram')).toHaveLength(2);
  });
});
