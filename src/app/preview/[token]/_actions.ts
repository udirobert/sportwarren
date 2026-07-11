/**
 * Server actions for the perception quiz.
 *
 * The rater submits a choice for a (target, scenario, kind). The
 * unique constraint on PlayerPerception lets us upsert — re-answering
 * overwrites the previous choice. Choices are per (rater, target,
 * scenario, kind) so a rater can answer descriptive AND prescriptive
 * versions of the same scenario.
 */

'use server';

import { prisma } from '@/lib/db';
import { getPreviewUser } from '../_lib/get-preview-user';
import { getScenarioById } from '@/server/services/perception/scenarios';
import { maybeSendTierUnlockNudge } from '@/server/services/perception/nudges';
import { redisService } from '@/server/services/redis';
import { getWhatsAppService } from '@/server/services/communication/whatsapp';
import {
  normalizePhone,
  isPlausiblePhone,
  pickConfirmWord,
  phoneLinkRedisKey,
  requestMessage,
  PHONE_LINK_TTL_SECONDS,
  type PendingPhoneLink,
  type PhoneLinkContext,
} from '@/server/services/personalization/phone-link';
import { commitmentFraming } from '@/server/services/personalization/commitment-framing';

export interface PerceptionPeek {
  scenarioId: string;
  kind: 'descriptive' | 'prescriptive';
  myChoice: 'a' | 'b' | 'c' | 'd';
  counts: { a: number; b: number; c: number; d: number; total: number };
  /** Headline computed from how the rater's choice compares to peers. */
  headline: string;
  /** Optional label of the winning choice text (filled in client-side from scenario lib). */
  topChoice: 'a' | 'b' | 'c' | 'd' | null;
}

export interface SubmitPerceptionResult {
  ok: boolean;
  reason?: 'not_preview' | 'no_profile' | 'invalid_scenario' | 'self_target' | 'unauthorized';
  givenCount?: number;
  peek?: PerceptionPeek;
}

export async function submitPerception(input: {
  token: string;
  targetProfileId: string;
  scenarioId: string;
  choice: 'a' | 'b' | 'c' | 'd';
  kind: 'descriptive' | 'prescriptive';
}): Promise<SubmitPerceptionResult> {
  const { token, targetProfileId, scenarioId, choice, kind } = input;

  // Validate the scenario exists in the library.
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return { ok: false, reason: 'invalid_scenario' };
  if (kind === 'prescriptive' && !scenario.hasPrescriptive) {
    return { ok: false, reason: 'invalid_scenario' };
  }

  const user = await getPreviewUser(token, {
    include: { playerProfile: true },
  });
  if (!user) return { ok: false, reason: 'not_preview' };
  const rater = user.playerProfile;
  if (!rater) return { ok: false, reason: 'no_profile' };
  if (rater.id === targetProfileId) return { ok: false, reason: 'self_target' };

  // Make sure target is in the same squad as the rater (don't let
  // arbitrary IDs in — rater can only perceive squad-mates).
  const sharedSquad = await prisma.squadMember.findFirst({
    where: {
      user: { playerProfile: { id: targetProfileId } },
      squad: {
        members: { some: { userId: user.id } },
      },
    },
  });
  if (!sharedSquad) return { ok: false, reason: 'unauthorized' };

  // Upsert via the composite unique key.
  await prisma.playerPerception.upsert({
    where: {
      raterId_targetId_scenarioId_kind: {
        raterId: rater.id,
        targetId: targetProfileId,
        scenarioId,
        kind,
      },
    },
    update: { choice },
    create: {
      raterId: rater.id,
      targetId: targetProfileId,
      scenarioId,
      choice,
      kind,
    },
  });

  // Return the rater's total given count for the reciprocity gate.
  const givenCount = await prisma.playerPerception.count({
    where: { raterId: rater.id },
  });

  // Tier-unlock celebration via Telegram. Fire-and-forget so any send
  // failure doesn't sink the submit. No-op unless count just hit
  // 5 / 10 / 20 exactly.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';
  const dashboardUrl = `${baseUrl}/preview/${encodeURIComponent(token)}`;
  void maybeSendTierUnlockNudge(user.id, givenCount, dashboardUrl);

  // Build the sneak-peek — aggregate of all ratings on this exact
  // (target, scenario, kind) combo + a headline that frames the
  // rater's choice relative to peers. Drives the "wait, what did
  // the others say?" curiosity that keeps the quiz loop going.
  const peerRatings = await prisma.playerPerception.findMany({
    where: { targetId: targetProfileId, scenarioId, kind },
    select: { choice: true },
  });
  const counts = { a: 0, b: 0, c: 0, d: 0, total: 0 };
  for (const r of peerRatings) {
    const c = r.choice as 'a' | 'b' | 'c' | 'd';
    if (c === 'a' || c === 'b' || c === 'c' || c === 'd') {
      counts[c] += 1;
      counts.total += 1;
    }
  }

  // Find the modal choice
  let topChoice: 'a' | 'b' | 'c' | 'd' | null = null;
  let topCount = -1;
  for (const k of ['a', 'b', 'c', 'd'] as const) {
    if (counts[k] > topCount) {
      topCount = counts[k];
      topChoice = k;
    }
  }

  // Compute the headline relative to the rater's own choice.
  const myCount = counts[choice];
  const others = counts.total - 1; // excluding this rater's own
  let headline: string;
  if (others === 0) {
    headline = 'First to call this one — no one else has weighed in yet';
  } else if (myCount === counts.total) {
    headline = `Consensus — all ${counts.total} lads picked ${choice.toUpperCase()}`;
  } else if (myCount - 1 === 0) {
    headline = `Hot take — you're the only one to pick ${choice.toUpperCase()}`;
  } else if (myCount - 1 === 1) {
    headline = `Spicy — only 1 other lad agrees with you`;
  } else if (myCount >= counts.total / 2 + 1) {
    headline = `Majority view — ${myCount - 1} of ${others} other lads agree`;
  } else {
    const winnerLabel = topChoice ? topChoice.toUpperCase() : '?';
    headline = `Outvoted — most lads went with ${winnerLabel}`;
  }

  return {
    ok: true,
    givenCount,
    peek: {
      scenarioId,
      kind,
      myChoice: choice,
      counts,
      headline,
      topChoice,
    },
  };
}

export interface RequestPhoneLinkResult {
  ok: boolean;
  error?: string;
  /** Returned so the UI can show "we sent you BANGER" without a re-fetch. */
  code?: string;
}

/**
 * Voluntary phone-link, step 1 of 2. The player types their own number; we
 * text THAT number a confirm word via WhatsApp. Nothing is written to
 * PlatformIdentity yet — that only happens when they reply with the code
 * (see whatsapp.ts's text handler), proving they actually hold the number.
 */
export async function requestPhoneLink(input: {
  token: string;
  phone: string;
  context: PhoneLinkContext;
}): Promise<RequestPhoneLinkResult> {
  const { token, phone, context } = input;

  if (!isPlausiblePhone(phone)) {
    return { ok: false, error: "That doesn't look like a real number" };
  }

  const user = await getPreviewUser(token);
  if (!user) return { ok: false, error: 'Could not find your card' };

  const whatsappService = getWhatsAppService();
  if (!whatsappService?.isConfigured()) {
    return { ok: false, error: 'WhatsApp linking is not available right now' };
  }

  const normalized = normalizePhone(phone);
  const firstName = (user.name ?? 'there').split(' ')[0];
  const code = pickConfirmWord();

  const pending: PendingPhoneLink = { userId: user.id, previewToken: token, firstName, code, context };
  await redisService.set(phoneLinkRedisKey(normalized), JSON.stringify(pending), PHONE_LINK_TTL_SECONDS);

  try {
    await whatsappService.sendText(normalized, requestMessage(firstName, code, context));
  } catch (err) {
    console.error('[phone-link] Failed to send confirm message:', err);
    return { ok: false, error: 'Could not send that WhatsApp message — check the number' };
  }

  return { ok: true, code };
}

/** Minimum committed players for a kickabout to happen (both sides of a
 *  5-a-side + subs). Mirrors session/[sessionId]/analysis/[playerToken]'s
 *  commitToNextSession — same MIN_TO_PLAY default until per-group config
 *  exists, but scoped through the preview-token model (guest players)
 *  rather than a claimed playerToken. */
const MIN_TO_PLAY = 10;
const NEXT_SESSION_OFFSET_DAYS = 7;

export interface CommitToNextKickaboutResult {
  ok: boolean;
  inCount: number;
  target: number;
  line: string;
  met: boolean;
  error?: string;
}

/**
 * Preview-tier commitment capture: a returning (tier >= 1) guest taps "same
 * time next week?". Finds the squad's already-seeded upcoming session if
 * it's still ahead of now (the one the roster-reveal page points at — this
 * naturally chains onto it, no duplicate session created), otherwise
 * creates one a week out. Idempotent — tapping again just keeps them 'in'.
 */
export async function commitToNextKickabout(token: string): Promise<CommitToNextKickaboutResult> {
  const empty = { ok: false, inCount: 0, target: MIN_TO_PLAY, line: '', met: false };

  const user = await getPreviewUser(token, {
    include: { playerProfile: true, squads: true },
  });
  if (!user?.playerProfile) return { ...empty, error: 'Could not find your card' };

  // Prefer the squad this guest captains, matching page.tsx's own
  // resolution — consistent behaviour if a guest is ever seeded into more
  // than one group.
  const captainMembership = user.squads.find((m) => m.role === 'captain');
  const squadId = captainMembership?.squadId ?? user.squads[0]?.squadId;
  if (!squadId) return { ...empty, error: 'No squad found' };

  let next = await prisma.session.findFirst({
    where: { squadId, status: { in: ['open', 'scheduled'] }, date: { gt: new Date() } },
    orderBy: { date: 'asc' },
    select: { id: true },
  });
  if (!next) {
    const nextDate = new Date(Date.now() + NEXT_SESSION_OFFSET_DAYS * 24 * 60 * 60 * 1000);
    next = await prisma.session.create({
      data: { squadId, name: 'Next session', date: nextDate, status: 'scheduled' },
      select: { id: true },
    });
  }

  await prisma.sessionAttendee.upsert({
    where: { sessionId_profileId: { sessionId: next.id, profileId: user.playerProfile.id } },
    update: { status: 'in', committedAt: new Date() },
    create: {
      sessionId: next.id,
      profileId: user.playerProfile.id,
      status: 'in',
      committedAt: new Date(),
    },
  });

  const inCount = await prisma.sessionAttendee.count({
    where: { sessionId: next.id, status: 'in' },
  });
  const framing = commitmentFraming(inCount, MIN_TO_PLAY, true);

  return { ok: true, inCount, target: MIN_TO_PLAY, line: framing.line, met: framing.met };
}
