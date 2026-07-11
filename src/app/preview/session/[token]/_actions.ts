'use server';

import { prisma } from '@/lib/db';
import { getSessionReveal } from '@/server/services/personalization/session-reveal';

export interface ResolveRosterMemberResult {
  ok: boolean;
  previewToken?: string;
  error?: string;
}

/**
 * The roster-reveal page shows names only — never raw preview tokens in
 * page source (a static list of every player's auth token would be
 * trivially scrapable). A tap on a name calls this instead; it re-validates
 * the reveal token, confirms the profileId is actually part of THIS
 * session's roster (not an arbitrary id), and only then hands back that
 * player's own token for the client to redirect into.
 */
export async function resolveRosterMemberToken(
  revealToken: string,
  profileId: string,
): Promise<ResolveRosterMemberResult> {
  const pointer = await getSessionReveal(revealToken);
  if (!pointer) return { ok: false, error: 'This link has expired' };

  const attendee = await prisma.sessionAttendee.findUnique({
    where: { sessionId_profileId: { sessionId: pointer.sessionId, profileId } },
    select: {
      profile: { select: { user: { select: { walletAddress: true, chain: true } } } },
    },
  });

  const wallet = attendee?.profile.user.walletAddress;
  if (!wallet || attendee?.profile.user.chain !== 'preview') {
    return { ok: false, error: 'Could not find that player' };
  }

  return { ok: true, previewToken: wallet };
}
