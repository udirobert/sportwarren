/**
 * Public Challenge Link System
 * Enables squads to generate shareable challenge URLs that rivals
 * can use to accept a match challenge directly.
 */
import { buildShareLinks } from './links';

export interface ChallengeData {
  challengerSquadId: string;
  challengerSquadName: string;
  message?: string;
  matchType?: string;
}

export function buildChallengePath(challengerSquadId: string): string {
  return `/match?challenge=${encodeURIComponent(challengerSquadId)}`;
}

export function buildChallengeUrl(challengerSquadId: string): string {
  if (typeof window === 'undefined') return buildChallengePath(challengerSquadId);
  return `${window.location.origin}${buildChallengePath(challengerSquadId)}`;
}

export function buildChallengeShareText(squadName: string, message?: string): string {
  const base = `${squadName} is challenging you to a match on SportWarren!`;
  return message ? `${base}\n\n"${message}"` : base;
}

export function buildChallengeWhatsAppUrl(squadName: string, challengerSquadId: string, message?: string): string {
  const text = buildChallengeShareText(squadName, message);
  const url = buildChallengeUrl(challengerSquadId);
  return buildShareLinks({ text, url }).whatsapp;
}

/**
 * Full multi-channel share for a public challenge. Returns URLs for
 * WhatsApp and Telegram so callers can render both pills without
 * re-deriving the text/url themselves.
 */
export function buildChallengeShareLinks(squadName: string, challengerSquadId: string, message?: string) {
  return buildShareLinks({
    text: buildChallengeShareText(squadName, message),
    url: buildChallengeUrl(challengerSquadId),
  });
}
