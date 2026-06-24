/**
 * Per-player session recap — what each player sees after the captain
 * fires the post-session WhatsApp blast. Their personal "you scored X,
 * played Y, here's what the lads said" surface.
 *
 * V3 Risograph register throughout. Perception narrative woven from
 * the player's peer ratings — the "what the lads said" framing that
 * makes every recap personal rather than a stats dump.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { MiniAvatar } from '../../../../preview/_components/MiniAvatar';
import {
  PALETTE,
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3SectionLabel,
  V3StatBand,
  V3CTAButton,
  V3SolidCard,
} from '@/components/v3';
import {
  aggregateReceivedPerceptions,
  topChoice,
} from '@/server/services/perception/aggregate';
import { getScenarioById } from '@/server/services/perception/scenarios';

interface PageProps {
  params: Promise<{ sessionId: string; playerToken: string }>;
}

/**
 * Compute a single narrative beat from the player's strongest perception
 * take, dyed by their actual match performance. This is the hook: "the
 * lads said X — but tonight you did Y."
 */
function strongestPerceptionTake(
  aggregate: Record<string, { descriptive: { a: number; b: number; c: number; d: number; total: number }; prescriptive: { a: number; b: number; c: number; d: number; total: number } }>,
): { scenarioId: string; choice: 'a' | 'b' | 'c' | 'd'; label: string; tag: string; dominance: number; total: number } | null {
  let best: { scenarioId: string; choice: 'a' | 'b' | 'c' | 'd'; label: string; tag: string; dominance: number; total: number } | null = null;
  for (const [scenarioId, buckets] of Object.entries(aggregate)) {
    const counts = buckets.descriptive;
    if (counts.total < 1) continue;
    const top = topChoice(counts);
    if (!top) continue;
    const scenario = getScenarioById(scenarioId);
    if (!scenario) continue;
    const opt = scenario.options.find((o) => o.id === top);
    if (!opt) continue;
    const dominance = counts[top] / counts.total;
    const score = counts.total * dominance;
    if (!best || score > best.total * best.dominance) {
      best = {
        scenarioId,
        choice: top,
        label: opt.label,
        tag: opt.tag,
        dominance,
        total: counts.total,
      };
    }
  }
  return best;
}

// Narrative payloads keyed by tendency tag — true-to-form vs against-grain
const TRUE_TO_FORM_NARRATIVES: Record<string, string[]> = {
  safe: ['the lads know you keep it tidy — and you did exactly that.', 'played the percentages every time. Exactly what the lads expect.'] as const,
  aggressive: ['the lads said you go for it — and you did. No half-measures.', 'pure aggression tonight. Exactly how the group sees you.'] as const,
  creative: ['the lads called it — you found the pass nobody else saw.', 'unpredictable, unplayable. The lads were right.'] as const,
  careless: ['the lads said you give it away — and tonight it cost you.', 'lost it a few times. The perception report called this.'] as const,
  composed: ['cool as you like. The lads see it, you live it.', 'half-turns, calm finishes. The composure the group talks about.'] as const,
  rash: ['the lads said you rush it — and there were moments tonight.', 'impulsive at times. The report flags this.'] as const,
  selfish: ['the lads said you keep it — and you did pull the trigger a few times.', 'went for goal yourself. The lads clocked this tendency.'] as const,
  selfless: ['the lads say you dish it — and you laid it off all night.', 'always the pass-first option. The group sees the selflessness.'] as const,
} as const;

const AGAINST_GRAIN_NARRATIVES: Record<string, string[]> = {
  safe: ['the lads expect safety — but tonight you took risks. And it worked.', 'off-script tonight. The lads won\'t believe you played it this way.'] as const,
  aggressive: ['the lads expect aggression — but you picked your moments and stayed measured.', 'uncharacteristically patient. The lads will have to update their read.'] as const,
  creative: ['the lads expect the unpredictable — but you kept it simple and effective.', 'simple football, perfectly executed. Not what the lads predicted.'] as const,
  careless: ['the lads expect mistakes — but you were clean tonight. Composed.', 'kept it tidy all night. The perception report might need a rewrite.'] as const,
  composed: ['the lads said composed — but you rushed a few and it showed.', 'unusually frantic tonight. Not the cool head the lads describe.'] as const,
  rash: ['the lads expect rash — but you made good decisions all night.', 'picked the right option every time. Defied the scout report.'] as const,
  selfish: ['the lads expect selfish — but you squared it every time.', 'played the unselfish ball all night. The group won\'t believe it.'] as const,
  selfless: ['the lads expect selfless — but you had a go yourself tonight.', 'took the shot instead of the pass. Watch the lads update your tags.'] as const,
} as const;

function pickNarrative(bag: readonly string[], seed: number): string {
  const idx = Math.abs(seed) % bag.length;
  return bag[idx];
}

export default async function RecapPage({ params }: PageProps) {
  const { sessionId, playerToken } = await params;

  const player = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: { include: { twin: true } } },
  });

  if (!player || !player.playerProfile) notFound();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      squad: true,
      matches: {
        include: {
          playerStats: {
            include: {
              profile: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!session) notFound();

  const profileId = player.playerProfile.id;
  const allStats = session.matches.flatMap((m) => m.playerStats);
  const myStats = allStats.find((s) => s.profileId === profileId);
  if (!myStats) notFound();

  const myGoals = myStats.goals;
  const myAssists = myStats.assists;

  // Compute session totals
  const totalGoals = allStats.reduce((s, st) => s + st.goals, 0);
  const topScorer = [...allStats]
    .filter((s) => s.profileId !== profileId)
    .sort((a, b) => b.goals - a.goals)[0];

  const isTopScorer = allStats.every(
    (s) => s.profileId === profileId || s.goals <= myGoals,
  );

  // Rank
  const ranked = [...allStats].sort((a, b) => b.goals - a.goals);
  const myRank = ranked.findIndex((s) => s.profileId === profileId) + 1;
  const totalScorers = ranked.filter((s) => s.goals > 0 || s.profileId === profileId).length;

  // Squad-mates who scored
  const otherScorers = allStats
    .filter((s) => s.profileId !== profileId && s.goals > 0)
    .sort((a, b) => b.goals - a.goals);

  const date = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // ── Perception narrative ──
  // Fetch the player's received perceptions, find their strongest take,
  // then weave it with tonight's performance.
  const [perceptionResult, givenCount, receivedCount] = await Promise.all([
    aggregateReceivedPerceptions(profileId),
    prisma.playerPerception.count({ where: { raterId: profileId } }),
    prisma.playerPerception.count({ where: { targetId: profileId } }),
  ]);

  const take = strongestPerceptionTake(perceptionResult.aggregate);
  let narrativeLine: string | null = null;
  if (take) {
    // Seed from player ID + session date so it's stable for the session
    const seed = (profileId + sessionId).split('').reduce((s, c) => s * 31 + c.charCodeAt(0), 0);
    const scored = myGoals > 0;
    // If player scored (or had impact), use true-to-form; else against-grain
    const bag = scored ? TRUE_TO_FORM_NARRATIVES[take.tag] : AGAINST_GRAIN_NARRATIVES[take.tag];
    if (bag) {
      narrativeLine = pickNarrative(bag, seed);
    }
  }

  // ── Reciprocity gate ──
  const RATING_THRESHOLD = 5;
  const givenEnough = givenCount >= RATING_THRESHOLD;
  const receivedEnough = receivedCount >= RATING_THRESHOLD;

  return (
    <V3PageShell maxWidth={640}>
      <V3Ribbon marginBottom={24} />
      <V3IdentityLine context={`Session recap · ${date}`} marginBottom={24} />

      {/* Hero — big goal number with perception narrative attached */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', marginBottom: 28 }}>
        <MiniAvatar
          kit={player.avatarKitColor ?? undefined}
          accent={player.avatarAccentColor ?? undefined}
          skin={player.avatarSkinTone ?? undefined}
          hair={player.avatarHairColor ?? undefined}
          hairStyle={player.avatarHairStyle ?? 'short'}
          number={player.avatarNumber ?? ''}
          size={120}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              marginBottom: 4,
            }}
          >
            {player.name} · {player.position ?? '—'}
          </div>

          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 120,
              fontWeight: 800,
              lineHeight: 0.9,
              color: isTopScorer && myGoals > 0 ? PALETTE.red : PALETTE.ink,
              letterSpacing: '-0.04em',
            }}
          >
            {myGoals}
          </div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              marginTop: -4,
            }}
          >
            Goals tonight {myAssists > 0 ? `· ${myAssists} assist${myAssists > 1 ? 's' : ''}` : ''}
          </div>
        </div>
      </div>

      {/* Perception narrative — the hook */}
      {narrativeLine && (
        <div
          style={{
            background: 'rgba(212,164,55,0.12)',
            border: `1px solid ${PALETTE.mustard}`,
            padding: '14px 18px',
            marginBottom: 28,
            fontFamily: TYPE.mono,
            fontSize: 13,
            lineHeight: 1.55,
            color: PALETTE.ink,
          }}
        >
          <strong>The lads said:</strong> {narrativeLine}
        </div>
      )}

      {/* Top scorer banner */}
      {isTopScorer && myGoals > 0 && (
        <V3SolidCard accent="mustard" padding="16px 20px" marginBottom={28}>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PALETTE.ink,
              marginBottom: 6,
            }}
          >
            Top scorer · {session.squad.name}
          </div>
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 32,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              lineHeight: 1,
              color: PALETTE.ink,
            }}
          >
            You were the night's leading scorer.
          </div>
        </V3SolidCard>
      )}

      {/* Rank line */}
      {!isTopScorer && totalScorers > 1 && (
        <div
          style={{
            background: 'rgba(28,58,94,0.06)',
            padding: 12,
            borderLeft: `4px solid ${PALETTE.navy}`,
            marginBottom: 24,
            fontFamily: TYPE.mono,
            fontSize: 13,
            color: PALETTE.ink,
          }}
        >
          #{myRank} of {totalScorers} scorers · top scorer was{' '}
          <strong>{topScorer?.profile.user.name ?? '—'}</strong> with{' '}
          {topScorer?.goals ?? 0}
        </div>
      )}

      {/* Session totals stat band */}
      <V3StatBand value={totalGoals} label={`Goals tonight · ${session.squad.name}`} accent="red" marginBottom={36} />

      {/* Other scorers */}
      {otherScorers.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <V3SectionLabel marginBottom={14}>Others on the scoresheet</V3SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>              {otherScorers.slice(0, 6).map((s) => (
                <div
                  key={s.profileId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 10,
                    border: `1px solid ${PALETTE.ink}15`,
                  }}
                >
                  <MiniAvatar
                    kit={s.profile.user.avatarKitColor ?? undefined}
                    accent={s.profile.user.avatarAccentColor ?? undefined}
                    skin={s.profile.user.avatarSkinTone ?? undefined}
                    hair={s.profile.user.avatarHairColor ?? undefined}
                    hairStyle={s.profile.user.avatarHairStyle ?? 'short'}
                    number={s.profile.user.avatarNumber ?? ''}
                    size={44}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        color: PALETTE.ink,
                      }}
                    >
                      {s.profile.user.name}
                    </div>
                    <div
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 10,
                        fontWeight: 600,
                        color: PALETTE.inkLight,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.profile.user.position ?? '—'}
                    </div>
                  </div>
                  <div
                    style={{
                      background: PALETTE.ink,
                      color: PALETTE.cream,
                      padding: '4px 10px',
                      fontFamily: TYPE.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {s.goals} ⚽
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Reciprocity gate — SubmitHub loop with social framing */}
      <div
        style={{
          border: `2px solid ${PALETTE.ink}`,
          padding: '18px 20px',
          marginBottom: 16,
          borderLeft: `6px solid ${givenEnough && receivedEnough ? PALETTE.sage : PALETTE.red}`,
        }}
      >
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: TRACKING.capWide,
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 6,
          }}
        >
          Who sees your card
        </div>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: 6,
            color: PALETTE.ink,
          }}
        >
          {givenCount} given · {receivedCount} received
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 12,
            lineHeight: 1.55,
            color: PALETTE.ink,
          }}
        >
          {!givenEnough && receivedCount === 0 && (
            <>
              The <strong>first {RATING_THRESHOLD} lads</strong> to rate your
              teammates see their own cards first. Pick your Team of the Night
              and unlock what the group says about you.
            </>
          )}
          {!givenEnough && receivedCount > 0 && (
            <>
              <strong>{receivedCount} lads</strong> have already rated you.
              Rate {RATING_THRESHOLD - givenCount} more and their picks show up
              in your card. <em>They already weighed in — return the favour.</em>
            </>
          )}
          {givenEnough && !receivedEnough && (
            <>
              You've rated enough. Now waiting on{' '}
              <strong>{RATING_THRESHOLD - receivedCount} more</strong> of your
              teammates to weigh in. The group decides what your numbers say next.
            </>
          )}
          {givenEnough && receivedEnough && (
            <>
              <strong>Card unlocked.</strong> {receivedCount} lads have weighed
              in. Your numbers move when the consensus window closes.
            </>
          )}
        </div>
      </div>

      {/* Primary CTA — Pick your Team of the Night */}
      <V3CTAButton
        href={`/session/${encodeURIComponent(sessionId)}/rate/${encodeURIComponent(playerToken)}`}
        variant={givenEnough ? 'secondary' : 'primary'}
        marginBottom={12}
      >
        {givenEnough
          ? 'Edit your picks →'
          : givenCount === 0
          ? 'Pick your Team of the Night →'
          : `Keep rating · ${RATING_THRESHOLD - givenCount} to go →`}
      </V3CTAButton>

      {/* Secondary CTA — Analysis */}
      <V3CTAButton
        href={`/session/${encodeURIComponent(sessionId)}/analysis/${encodeURIComponent(playerToken)}`}
        variant="secondary"
        marginBottom={16}
      >
        See how your card moved tonight →
      </V3CTAButton>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 11,
          lineHeight: 1.6,
          color: PALETTE.inkLight,
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        Takes 90 seconds. Could be skill, could be vibes. Top picks across
        the night form the XI — and your votes are what unlock yours.
      </p>

      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid rgba(58,58,58,0.2)',
          fontFamily: TYPE.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          textAlign: 'center',
        }}
      >
        SPORTWARREN · {session.squad.name}
      </div>
    </V3PageShell>
  );
}
