/**
 * Team of the Night rating UI — each player picks 5 they thought made
 * the night feel good. Aggregate across raters determines the night's
 * team.
 *
 * Anti-gaming: stored as PeerRating rows (attribute = "team_of_the_night",
 * score = 1). The existing deviation + scoutXP fields can later weight
 * raters by accuracy across sessions. For Tuesday v1 we just collect
 * votes; the reputation gradient kicks in once we have multiple sessions.
 */

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../../../../preview/_components/MiniAvatar';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ sessionId: string; playerToken: string }>;
}

async function submitTeamOfTheNight(
  sessionId: string,
  playerToken: string,
  formData: FormData,
) {
  'use server';

  const picks = formData.getAll('pick').map(String);
  if (picks.length !== 5) return;

  const rater = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: true },
  });
  if (!rater || !rater.playerProfile) return;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { matches: true },
  });
  if (!session) return;

  const matchId = session.matches[0]?.id;
  if (!matchId) return;

  // Clear any prior picks for this rater/session (allow re-rating)
  await prisma.peerRating.deleteMany({
    where: {
      matchId,
      raterId: rater.playerProfile.id,
      attribute: 'team_of_the_night',
    },
  });

  // Insert fresh picks
  for (const targetProfileId of picks) {
    if (targetProfileId === rater.playerProfile.id) continue; // can't pick yourself
    await prisma.peerRating.create({
      data: {
        matchId,
        raterId: rater.playerProfile.id,
        targetId: targetProfileId,
        attribute: 'team_of_the_night',
        score: 1,
      },
    });
  }

  revalidatePath(`/session/${sessionId}/rate/${playerToken}`);
  redirect(`/session/${sessionId}/rate/${playerToken}?submitted=1`);
}

export default async function RatePage({ params }: PageProps) {
  const { sessionId, playerToken } = await params;

  const rater = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: true },
  });
  if (!rater || !rater.playerProfile) notFound();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      squad: true,
      attendees: {
        include: {
          profile: {
            include: { user: true },
          },
        },
      },
      matches: true,
    },
  });
  if (!session) notFound();

  const matchId = session.matches[0]?.id;
  if (!matchId) notFound();

  // Look up the rater's existing picks
  const existingPicks = await prisma.peerRating.findMany({
    where: {
      matchId,
      raterId: rater.playerProfile.id,
      attribute: 'team_of_the_night',
    },
  });
  const existingTargetIds = new Set(existingPicks.map((p) => p.targetId));

  // List of attendees minus the rater
  const candidates = session.attendees
    .filter((a) => a.profileId !== rater.playerProfile!.id)
    .map((a) => ({
      profileId: a.profileId,
      name: a.profile.user.name ?? 'Player',
      position: a.profile.user.position,
      avatar: {
        kit: a.profile.user.avatarKitColor ?? undefined,
        accent: a.profile.user.avatarAccentColor ?? undefined,
        skin: a.profile.user.avatarSkinTone ?? undefined,
        hair: a.profile.user.avatarHairColor ?? undefined,
        hairStyle: a.profile.user.avatarHairStyle ?? 'short',
        number: a.profile.user.avatarNumber ?? '',
      },
      alreadyPicked: existingTargetIds.has(a.profileId),
    }));

  const boundSubmit = submitTeamOfTheNight.bind(null, sessionId, playerToken);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
        paddingBottom: 140,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 12,
          }}
        >
          Team of the Night · {session.squad.name}
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Pick 5 lads.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginBottom: 36,
            maxWidth: 480,
          }}
        >
          Five players who made tonight feel good. Doesn't have to be skill
          — could be vibes, banter, hustle, the one who showed up despite
          the rain. The five picked most overall become the night's team.
        </p>

        <form action={boundSubmit} id="rate-form">
          <PickGrid candidates={candidates} />

          <PickFooter />
        </form>
      </div>
    </div>
  );
}

function PickGrid({
  candidates,
}: {
  candidates: Array<{
    profileId: string;
    name: string;
    position: string | null;
    avatar: {
      kit?: string;
      accent?: string;
      skin?: string;
      hair?: string;
      hairStyle?: string;
      number?: string;
    };
    alreadyPicked: boolean;
  }>;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        marginBottom: 32,
      }}
    >
      {candidates.map((c) => (
        <label
          key={c.profileId}
          htmlFor={`pick-${c.profileId}`}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <input
            type="checkbox"
            name="pick"
            id={`pick-${c.profileId}`}
            value={c.profileId}
            defaultChecked={c.alreadyPicked}
            className="picker-checkbox"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />
          <div
            className="picker-card"
            style={{
              background: c.alreadyPicked ? 'rgba(212,164,55,0.18)' : PALETTE.cream,
              border: `2px solid ${c.alreadyPicked ? PALETTE.mustard : PALETTE.ink}`,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.15s',
            }}
          >
            <MiniAvatar
              kit={c.avatar.kit}
              accent={c.avatar.accent}
              skin={c.avatar.skin}
              hair={c.avatar.hair}
              hairStyle={c.avatar.hairStyle}
              number={c.avatar.number}
              size={64}
            />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  fontWeight: 700,
                  color: PALETTE.ink,
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  fontWeight: 600,
                  color: PALETTE.inkLight,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                {c.position ?? '—'}
              </div>
            </div>
          </div>
        </label>
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .picker-checkbox:checked + .picker-card {
              background: rgba(212,164,55,0.25) !important;
              border-color: ${PALETTE.mustard} !important;
            }
          `,
        }}
      />
    </div>
  );
}

function PickFooter() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: PALETTE.ink,
        padding: '18px 20px',
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ maxWidth: 560, width: '100%' }}>
        <button
          type="submit"
          style={{
            background: PALETTE.mustard,
            color: PALETTE.ink,
            padding: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            border: `2px solid ${PALETTE.red}`,
            width: '100%',
            cursor: 'pointer',
          }}
        >
          Lock in 5 →
        </button>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: PALETTE.cream,
            opacity: 0.7,
            textAlign: 'center',
            marginTop: 10,
            letterSpacing: '0.1em',
          }}
        >
          Need exactly 5 picked. Your vote is one of {/* count */}.
        </p>
      </div>
    </div>
  );
}
