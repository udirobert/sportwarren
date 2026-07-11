'use client';

/**
 * The one shared "who's who" link the organizer posts publicly (game-day
 * comments, a group chat) when nobody's phone number was pre-seeded. Each
 * player finds their own name and taps through to their own preview card —
 * no phone numbers required to reach this point.
 *
 * Deliberately shows NAMES ONLY, never raw preview tokens in page source —
 * a tap calls resolveRosterMemberToken, which re-validates server-side and
 * hands back only the tapped player's own token. A one-tap "is this you?"
 * confirm cuts down accidental taps without adding a real auth boundary —
 * the preview token model has always been "whoever holds the link", and
 * this doesn't change that.
 */

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3SectionLabel,
  V3SolidCard,
  PALETTE,
  TYPE,
  TRACKING,
} from '@/components/v3';
import { MiniAvatar } from '../../_components/MiniAvatar';
import { resolveRosterMemberToken } from './_actions';

interface RosterPlayer {
  profileId: string;
  team: string | null;
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
}

export function RosterReveal({
  revealToken,
  squadName,
  sessionName,
  sessionDate,
  players,
}: {
  revealToken: string;
  squadName: string;
  sessionName: string;
  sessionDate: string;
  players: RosterPlayer[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const formattedDate = new Date(sessionDate).toLocaleDateString(undefined, {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const teams = new Map<string, RosterPlayer[]>();
  for (const p of players) {
    const key = p.team ?? 'Unassigned';
    if (!teams.has(key)) teams.set(key, []);
    teams.get(key)!.push(p);
  }

  const onConfirm = (profileId: string) => {
    setError('');
    startTransition(async () => {
      const res = await resolveRosterMemberToken(revealToken, profileId);
      if (res.ok && res.previewToken) {
        router.push(`/preview/${encodeURIComponent(res.previewToken)}`);
      } else {
        setError(res.error ?? 'Something went wrong');
        setPendingId(null);
      }
    });
  };

  return (
    <V3PageShell>
      <V3Ribbon />
      <V3IdentityLine context="who's who" />
      <V3Heading size="large">{squadName}</V3Heading>
      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 13,
          color: PALETTE.inkLight,
          margin: '8px 0 28px',
        }}
      >
        {sessionName} — {formattedDate}. Find your name, tap it, get your card.
      </p>

      {[...teams.entries()].map(([team, teamPlayers]) => (
        <div key={team} style={{ marginBottom: 24 }}>
          <V3SectionLabel>{team}</V3SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teamPlayers.map((p) => (
              <button
                key={p.profileId}
                type="button"
                disabled={isPending}
                onClick={() => setPendingId(pendingId === p.profileId ? null : p.profileId)}
                style={{
                  all: 'unset',
                  cursor: isPending ? 'default' : 'pointer',
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <V3SolidCard
                  accent={pendingId === p.profileId ? 'mustard' : undefined}
                  padding="10px 14px"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MiniAvatar {...p.avatar} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: TYPE.display,
                          fontSize: 18,
                          fontWeight: 800,
                          color: PALETTE.ink,
                          textTransform: 'uppercase',
                        }}
                      >
                        {p.name}
                      </div>
                      {p.position && (
                        <div
                          style={{
                            fontFamily: TYPE.mono,
                            fontSize: 10,
                            letterSpacing: TRACKING.cap,
                            textTransform: 'uppercase',
                            color: PALETTE.inkLight,
                          }}
                        >
                          {p.position}
                        </div>
                      )}
                    </div>
                    {pendingId === p.profileId && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirm(p.profileId);
                        }}
                        style={{
                          fontFamily: TYPE.mono,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: TRACKING.cap,
                          textTransform: 'uppercase',
                          color: PALETTE.cream,
                          background: PALETTE.ink,
                          padding: '8px 12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isPending ? '…' : "That's me →"}
                      </span>
                    )}
                  </div>
                </V3SolidCard>
              </button>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <p style={{ fontFamily: TYPE.mono, fontSize: 12, color: PALETTE.red, marginTop: 8 }}>
          {error}
        </p>
      )}

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          lineHeight: 1.6,
          color: PALETTE.inkLight,
          marginTop: 24,
        }}
      >
        Only tap your own name — it opens your personal card, not a public
        page anyone can browse.
      </p>
    </V3PageShell>
  );
}
