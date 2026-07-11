/**
 * Phone-link: the voluntary "connect your WhatsApp" flow for preview-tier
 * (guest) players. Nobody's number is ever pre-seeded — a player types
 * their own number on a preview surface, we send THAT number a WhatsApp
 * message with a confirm word, and when they reply with it from the same
 * number, whatsapp.ts's webhook upserts a PlatformIdentity onto their guest
 * User. That reply is the only path a phone number reaches the system for
 * a preview-tier player.
 *
 * Pure helpers only (word list, phone normalization, key naming, TTL). The
 * Redis I/O and WhatsApp send live at the two call sites that already own
 * that plumbing — the request action and the webhook's text handler —
 * following the existing `wa:avail:` pending-lookup pattern.
 */

// Football-flavoured so "reply BANGER" reads as fun, not like a bank OTP —
// matches the playful, no-shaming copy voice used elsewhere in the preview
// flow (commitment-framing.ts, the prediction "bold call").
const CONFIRM_WORDS = [
  'ONSIDE', 'NUTMEG', 'BANGER', 'WORLDIE', 'OVERLAP', 'ONETWO',
  'BICYCLE', 'VOLLEY', 'DUMMY', 'STEPOVER', 'HATTRICK', 'CROSSBAR',
] as const;

export const PHONE_LINK_TTL_SECONDS = 15 * 60;

export function phoneLinkRedisKey(normalizedPhone: string): string {
  return `phonelink:${normalizedPhone}`;
}

/**
 * Digits only, no leading `+`. Matches Meta Cloud API's own convention for
 * both inbound `message.from` and the outbound `sendText(to, ...)` param —
 * a webhook confirm reply and a form-typed number must normalize to the
 * identical string or the lookup silently never matches.
 */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

/**
 * Loose on purpose — grassroots players type numbers in every format under
 * the sun (spaces, dashes, leading 0 vs +44, whole thing pasted from
 * contacts). The WhatsApp send itself is the real validation; this just
 * catches obvious junk before spending a send.
 */
export function isPlausiblePhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * A random, easy-to-type-back confirm word. Accepts an explicit index so
 * callers (and tests) can pin a deterministic pick instead of relying on
 * Math.random.
 */
export function pickConfirmWord(index?: number): string {
  const i = index ?? Math.floor(Math.random() * CONFIRM_WORDS.length);
  return CONFIRM_WORDS[((i % CONFIRM_WORDS.length) + CONFIRM_WORDS.length) % CONFIRM_WORDS.length];
}

/** What earns the phone-link — picks the right copy on both the request and
 *  the webhook's confirmation reply without threading extra state around. */
export type PhoneLinkContext = 'pregame' | 'next_week';

export interface PendingPhoneLink {
  userId: string;
  previewToken: string;
  firstName: string;
  code: string;
  context: PhoneLinkContext;
}

export function requestMessage(firstName: string, code: string, context: PhoneLinkContext): string {
  return context === 'next_week'
    ? `${firstName} — it's SportWarren. Reply *${code}* and we'll ping you before next week's game instead of you having to remember.`
    : `${firstName} — it's SportWarren. Reply *${code}* to link this number — we'll tell you tomorrow if you proved us wrong.`;
}

export function confirmedMessage(firstName: string, context: PhoneLinkContext): string {
  return context === 'next_week'
    ? `You're linked, ${firstName}. We'll ping you before next week's game.`
    : `You're linked, ${firstName}. Check back after the game — we'll tell you if you proved us wrong.`;
}
