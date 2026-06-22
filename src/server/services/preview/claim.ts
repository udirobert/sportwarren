/**
 * Preview → authed claim — migrates a preview user's data onto a real
 * Privy/wallet account.
 *
 * The preview tier is "auth-by-URL" — each preview user has a
 * walletAddress shaped like `<name>-<6char>` (no real chain). When the
 * lad eventually signs in via the main app, this service collapses
 * their preview row into their authed row.
 *
 * Design rules:
 *   - **Atomic.** All work runs in `prisma.$transaction` — a partial
 *     migration would orphan data or block the next claim attempt.
 *   - **Merge, don't clobber.** PlayerTwin merges (max level, sum XP,
 *     preserve every other field). Squad memberships skip on conflict
 *     so the authed user's existing role wins.
 *   - **No silent drops.** Every User-referencing relation is handled
 *     explicitly. The audit at top-of-file lists all of them.
 *   - **Token retires.** Preview user isn't deleted — it's marked
 *     `chain='claimed'`. This (a) prevents the same token from minting
 *     a new preview row, (b) preserves audit trail, and (c) keeps
 *     getPreviewUser() returning null so /preview/{token} 404s.
 *
 * Full relation audit (regen with `grep "User\s*@relation" schema.prisma`):
 *   PlayerProfile.userId (unique)            → MERGE (twin) or REASSIGN
 *   SquadMember.@@unique([squadId,userId])    → SKIP on conflict
 *   SquadPlayerContext.@@unique([userId,sq])  → SKIP on conflict
 *   PlatformIdentity.@@unique([platform,pUId])→ REASSIGN (unique not on userId)
 *   TelegramLinkCode.userId                   → DROP (ephemeral)
 *   TwinSignalPreference.@@unique([u,ch,kind])→ SKIP on conflict
 *   AiMemory.userId (unique)                  → SKIP if authed has one
 *   SquadAvailability.@@unique([u,sq,day])    → SKIP on conflict
 *   MatchRsvp.@@unique([userId,matchId])      → SKIP on conflict
 *   Match.submittedBy (restrict)              → REASSIGN
 *   MatchVerification.verifierId (restrict)   → REASSIGN
 */

import type { Prisma, PrismaClient } from '@prisma/client';

export interface ClaimPreviewIdentityInput {
  /** The authed user (already authenticated via Privy / wallet). */
  authedUserId: string;
  /** The preview user's walletAddress — the value from the URL token. */
  previewToken: string;
}

export type ClaimResult =
  | { ok: true; message: string }
  | { ok: false; reason: 'not_found' | 'already_claimed'; message: string };

export async function claimPreviewIdentity(
  prisma: PrismaClient,
  input: ClaimPreviewIdentityInput,
): Promise<ClaimResult> {
  const { authedUserId, previewToken } = input;

  // Pre-flight read outside the tx — confirms the token exists and
  // is still in the preview tier. Cheap, no race-window risk because
  // the tx will re-check.
  const previewUser = await prisma.user.findUnique({
    where: { walletAddress: previewToken },
    include: {
      playerProfile: { include: { twin: true } },
    },
  });

  if (!previewUser) {
    return { ok: false, reason: 'not_found', message: 'No preview identity for this token' };
  }
  if (previewUser.chain !== 'preview') {
    return { ok: false, reason: 'already_claimed', message: 'This preview link has already been claimed' };
  }
  if (previewUser.id === authedUserId) {
    // Idempotent — re-running claim against own row is a no-op.
    return { ok: true, message: 'Already linked' };
  }

  return await prisma.$transaction(async (tx) => {
    // Re-fetch inside the tx to catch races (two tabs claiming at once).
    const preview = await tx.user.findUnique({
      where: { id: previewUser.id },
      include: {
        playerProfile: { include: { twin: true } },
        squads: true,
      },
    });
    if (!preview || preview.chain !== 'preview') {
      return { ok: false, reason: 'already_claimed', message: 'Claim raced with another window' };
    }

    // 1. PlayerProfile — at most one per user (userId @unique).
    if (preview.playerProfile) {
      const authedProfile = await tx.playerProfile.findUnique({
        where: { userId: authedUserId },
        include: { twin: true },
      });

      if (authedProfile) {
        // Merge twin into the authed profile, then delete preview's profile.
        if (preview.playerProfile.twin) {
          if (authedProfile.twin) {
            await mergeTwinFields(tx, authedProfile.twin.id, preview.playerProfile.twin);
          } else {
            // Authed user has profile but no twin yet — reassign preview's twin.
            await tx.playerTwin.update({
              where: { id: preview.playerProfile.twin.id },
              data: { profileId: authedProfile.id },
            });
          }
        }
        // Merge career counters into the existing profile.
        await tx.playerProfile.update({
          where: { id: authedProfile.id },
          data: {
            level: Math.max(authedProfile.level, preview.playerProfile.level),
            totalXP: authedProfile.totalXP + preview.playerProfile.totalXP,
            seasonXP: authedProfile.seasonXP + preview.playerProfile.seasonXP,
            totalMatches: authedProfile.totalMatches + preview.playerProfile.totalMatches,
            totalGoals: authedProfile.totalGoals + preview.playerProfile.totalGoals,
            totalAssists: authedProfile.totalAssists + preview.playerProfile.totalAssists,
          },
        });
        await tx.playerProfile.delete({ where: { id: preview.playerProfile.id } });
      } else {
        // Authed user has no profile — reassign preview's wholesale.
        await tx.playerProfile.update({
          where: { id: preview.playerProfile.id },
          data: { userId: authedUserId },
        });
      }
    }

    // 2. SquadMember — composite unique on (squadId, userId).
    await reassignSkipDuplicates(
      tx,
      'squadMember',
      preview.id,
      authedUserId,
      async (row) =>
        !!(await tx.squadMember.findUnique({
          where: { squadId_userId: { squadId: row.squadId, userId: authedUserId } },
        })),
    );

    // 3. SquadPlayerContext — composite unique on (userId, squadId).
    await reassignSkipDuplicates(
      tx,
      'squadPlayerContext',
      preview.id,
      authedUserId,
      async (row) =>
        !!(await tx.squadPlayerContext.findUnique({
          where: { userId_squadId: { userId: authedUserId, squadId: row.squadId } },
        })),
    );

    // 4. PlatformIdentity — unique on (platform, platformUserId), not userId.
    // Safe to reassign all of preview's identities to the authed user; the
    // only collision risk is if the authed user already has an identity for
    // the same platform with a *different* platformUserId, which is fine —
    // they coexist (different rows).
    await tx.platformIdentity.updateMany({
      where: { userId: preview.id },
      data: { userId: authedUserId },
    });

    // 5. TelegramLinkCode — short-lived (TTL). Safe to drop.
    await tx.telegramLinkCode.deleteMany({ where: { userId: preview.id } });

    // 6. TwinSignalPreference — composite unique on (userId, channel, kind).
    await reassignSkipDuplicates(
      tx,
      'twinSignalPreference',
      preview.id,
      authedUserId,
      async (row) =>
        !!(await tx.twinSignalPreference.findUnique({
          where: {
            userId_channel_kind: {
              userId: authedUserId,
              channel: row.channel,
              kind: row.kind,
            },
          },
        })),
    );

    // 7. AiMemory — unique on userId. Keep authed's if it exists; else reassign.
    const authedMemory = await tx.aiMemory.findUnique({
      where: { userId: authedUserId },
    });
    if (authedMemory) {
      await tx.aiMemory.deleteMany({ where: { userId: preview.id } });
    } else {
      await tx.aiMemory.updateMany({
        where: { userId: preview.id },
        data: { userId: authedUserId },
      });
    }

    // 8. SquadAvailability — composite unique on (userId, squadId, dayOfWeek).
    await reassignSkipDuplicates(
      tx,
      'squadAvailability',
      preview.id,
      authedUserId,
      async (row) =>
        !!(await tx.squadAvailability.findUnique({
          where: {
            userId_squadId_dayOfWeek: {
              userId: authedUserId,
              squadId: row.squadId,
              dayOfWeek: row.dayOfWeek,
            },
          },
        })),
    );

    // 9. MatchRsvp — composite unique on (userId, matchId).
    await reassignSkipDuplicates(
      tx,
      'matchRsvp',
      preview.id,
      authedUserId,
      async (row) =>
        !!(await tx.matchRsvp.findUnique({
          where: { userId_matchId: { userId: authedUserId, matchId: row.matchId } },
        })),
    );

    // 10. Match.submittedBy — restricted FK, no cascade. Reassign.
    await tx.match.updateMany({
      where: { submittedBy: preview.id },
      data: { submittedBy: authedUserId },
    });

    // 11. MatchVerification.verifierId — restricted FK. Reassign.
    await tx.matchVerification.updateMany({
      where: { verifierId: preview.id },
      data: { verifierId: authedUserId },
    });

    // 12. Retire the preview row — flip chain so the token returns 404.
    // We don't delete because (a) wallet_address is unique and we don't
    // want anyone to mint a new preview at the same token, and (b) the
    // row is a useful audit trail for "this token was claimed at X".
    await tx.user.update({
      where: { id: preview.id },
      data: {
        chain: 'claimed',
        walletLabel: `claimed:${authedUserId}`, // forward-pointer for redirect UX
        updatedAt: new Date(),
      },
    });

    return { ok: true, message: 'Preview identity claimed' };
  });
}

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

interface RowWithId { id: string }

/**
 * For composite-unique relations: walk the preview rows, check each
 * against a conflict predicate, and either reassign to the authed user
 * OR delete the preview row (authed user already has the equivalent).
 *
 * Generic over the prisma model name so we don't write the same
 * loop 6 times.
 */
async function reassignSkipDuplicates(
  tx: Prisma.TransactionClient,
  model:
    | 'squadMember'
    | 'squadPlayerContext'
    | 'twinSignalPreference'
    | 'squadAvailability'
    | 'matchRsvp',
  previewUserId: string,
  authedUserId: string,
  conflicts: (row: any) => Promise<boolean>,
): Promise<void> {
  const delegate = tx[model] as unknown as {
    findMany: (args: any) => Promise<RowWithId[]>;
    update: (args: any) => Promise<unknown>;
    delete: (args: any) => Promise<unknown>;
  };
  const rows = await delegate.findMany({ where: { userId: previewUserId } });
  for (const row of rows) {
    if (await conflicts(row)) {
      await delegate.delete({ where: { id: row.id } });
    } else {
      await delegate.update({
        where: { id: row.id },
        data: { userId: authedUserId },
      });
    }
  }
}

/**
 * Merge a preview twin's state into the authed twin: max level, sum
 * XP, sum prestige/reputation, preserve attestation count. Base
 * attributes from the preview win because that's where the lads have
 * been actively shaping the card.
 */
async function mergeTwinFields(
  tx: Prisma.TransactionClient,
  authedTwinId: string,
  previewTwin: {
    baseAttributes: Prisma.JsonValue;
    xp: number;
    level: number;
    prestige: number;
    reputation: number;
    attestationCount: number;
  },
): Promise<void> {
  const authedTwin = await tx.playerTwin.findUnique({
    where: { id: authedTwinId },
  });
  if (!authedTwin) return;

  await tx.playerTwin.update({
    where: { id: authedTwinId },
    data: {
      baseAttributes: previewTwin.baseAttributes as Prisma.InputJsonValue,
      xp: authedTwin.xp + previewTwin.xp,
      level: Math.max(authedTwin.level, previewTwin.level),
      prestige: authedTwin.prestige + previewTwin.prestige,
      reputation: Math.max(authedTwin.reputation, previewTwin.reputation),
      attestationCount: authedTwin.attestationCount + previewTwin.attestationCount,
    },
  });
}
