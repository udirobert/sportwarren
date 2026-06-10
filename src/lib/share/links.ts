/**
 * Single source of truth for share-link construction across Telegram,
 * WhatsApp, and the Web Share API. Replaces the ad-hoc `https://wa.me/?text=...`
 * URLs that were previously duplicated in OnboardingFlow, TacticShareActions,
 * challenge-link, and match-result-card.
 */

import { buildTelegramShareUrl } from '@/lib/telegram/deep-links';

export type ShareChannel = 'whatsapp' | 'telegram' | 'web';

export interface SharePayload {
  /**
   * Pre-formatted message body. The helper appends the URL on its own line
   * for WhatsApp/Web, and forwards it to the Telegram share intent. Avoid
   * including the URL twice in `text`.
   */
  text: string;
  /** Canonical web URL the recipient should open. */
  url?: string;
  /**
   * Optional Telegram Mini App deep link. When provided, it is preferred
   * over `url` inside the Telegram share — Telegram users land in the
   * Mini App, web users get the regular `url`.
   */
  telegramDeepLink?: string;
  /**
   * Defaults to "SportWarren". Appended as a single-line footer to `text`
   * when the channel supports free-form text. Set to empty string to
   * suppress.
   */
  attribution?: string;
}

export interface ShareLinks {
  whatsapp: string;
  telegram: string;
  /** Web Share API payload for `navigator.share`. */
  webShare: { title: string; text: string; url?: string };
}

const DEFAULT_ATTRIBUTION = 'SportWarren';

function withAttribution(text: string, attribution: string | undefined): string {
  if (attribution === '') return text;
  const tag = attribution ?? DEFAULT_ATTRIBUTION;
  if (text.includes(tag)) return text;
  return `${text}\n\n${tag}`;
}

/**
 * Build share URLs / payloads for the three supported channels. The function
 * is pure (no DOM, no fetch) so it can be table-tested.
 */
export function buildShareLinks(payload: SharePayload): ShareLinks {
  const attribution = payload.attribution ?? DEFAULT_ATTRIBUTION;
  const text = withAttribution(payload.text, attribution);

  // WhatsApp: text + URL on separate lines, classic wa.me intent.
  const whatsappBody = payload.url ? `${text}\n${payload.url}` : text;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(whatsappBody)}`;

  // Telegram: t.me/share/url?url=...&text=... — prefer the deep link if set.
  const telegramTarget = payload.telegramDeepLink ?? payload.url;
  const telegram = telegramTarget
    ? buildTelegramShareUrl(text, telegramTarget)
    : `https://t.me/share/url?text=${encodeURIComponent(text)}`;

  // Web Share API: use the canonical web URL (never the deep link).
  const webShare: ShareLinks['webShare'] = {
    title: attribution,
    text,
  };
  if (payload.url) webShare.url = payload.url;

  return { whatsapp, telegram, webShare };
}

/**
 * Order channels by what the user is most likely to use. Telegram users
 * already have the bot installed so Telegram comes first; everyone else
 * sees WhatsApp first because the wa.me intent opens in 1 tap on mobile.
 */
export function pickPreferredChannel(
  platform: 'web' | 'mobile' | 'telegram',
): ShareChannel[] {
  if (platform === 'telegram') return ['telegram', 'whatsapp'];
  if (platform === 'mobile') return ['whatsapp', 'telegram'];
  return ['whatsapp', 'telegram'];
}
