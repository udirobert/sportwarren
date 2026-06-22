/**
 * Perception report — "what the lads said about you."
 *
 *   /preview/<token>/perceived
 *
 * Reciprocity-gated: only shows received data after the rater has
 * given 5+ ratings themselves. Aggregate per (scenario, kind) — bar
 * chart of which option got the most votes, headline take when the
 * group's prescriptive answer diverges from the descriptive one.
 *
 * Anti-mean-spirited: aggregate only. Never "Pete said you'd
 * miscontrol." Just "3 lads think you miscontrol under press."
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import {
  PALETTE,
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3SectionLabel,
  V3CTAButton,
  V3SolidCard,
  V3HollowCard,
} from '@/components/v3';
import { SCENARIOS } from '@/server/services/perception/scenarios';

interface PageProps {
  params: Promise<{ token: string }>;
}

const RECIPROCITY_GATE = 5;

export default async function PerceivedPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: true,
      squads: { include: { squad: true } },
    },
  });
  if (!user || user.chain !== 'preview') notFound();

  const profile = user.playerProfile;
  const squad = user.squads[0]?.squad;
  if (!profile || !squad) notFound();

  // Reciprocity counts — given (this rater's outgoing perceptions)
  // vs received (what others said about this player).
  const [givenCount, received] = await Promise.all([
    prisma.playerPerception.count({ where: { raterId: profile.id } }),
    prisma.playerPerception.findMany({
      where: { targetId: profile.id },
      select: { scenarioId: true, choice: true, kind: true, raterId: true },
    }),
  ]);

  const uniqueRaters = new Set(received.map((r) => r.raterId)).size;
  const isUnlocked = givenCount >= RECIPROCITY_GATE;

  // Aggregate received responses by (scenarioId, kind)
  // Shape: { [scenarioId]: { descriptive: { a, b, c, d, total }, prescriptive: {...} } }
  type ChoiceCounts = { a: number; b: number; c: number; d: number; total: number };
  const aggregate: Record<string, { descriptive: ChoiceCounts; prescriptive: ChoiceCounts }> = {};
  const empty = (): ChoiceCounts => ({ a: 0, b: 0, c: 0, d: 0, total: 0 });
  for (const r of received) {
    if (!aggregate[r.scenarioId]) {
      aggregate[r.scenarioId] = { descriptive: empty(), prescriptive: empty() };
    }
    const bucket =
      r.kind === 'prescriptive'
        ? aggregate[r.scenarioId].prescriptive
        : aggregate[r.scenarioId].descriptive;
    const c = r.choice as 'a' | 'b' | 'c' | 'd';
    bucket[c] += 1;
    bucket.total += 1;
  }

  const topChoice = (counts: ChoiceCounts): 'a' | 'b' | 'c' | 'd' | null => {
    if (counts.total === 0) return null;
    const entries = [['a', counts.a], ['b', counts.b], ['c', counts.c], ['d', counts.d]] as const;
    let best: 'a' | 'b' | 'c' | 'd' = 'a';
    let bestCount = -1;
    for (const [k, v] of entries) {
      if (v > bestCount) {
        bestCount = v;
        best = k;
      }
    }
    return best;
  };

  // Scenarios that have at least one response
  const scenariosWithData = SCENARIOS.filter((s) => aggregate[s.id]?.descriptive.total > 0 || aggregate[s.id]?.prescriptive.total > 0);

  return (
    <V3PageShell>
      <V3Ribbon />
      <V3IdentityLine context={`Perception · ${squad.name}`} showDot={false} marginBottom={20} />

      <V3Heading size="large">
        What the lads<br />said about you.
      </V3Heading>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 14,
          color: PALETTE.inkLight,
          lineHeight: 1.6,
          marginTop: 18,
          marginBottom: 28,
          maxWidth: 520,
        }}
      >
        {isUnlocked
          ? `${uniqueRaters} lad${uniqueRaters === 1 ? '' : 's'} weighed in. Hot takes below — descriptive (what you DO) on the left, prescriptive (what you SHOULD) on the right. Disagreements are where the banter lives.`
          : `Rate ${RECIPROCITY_GATE - givenCount} more lads to unlock what the group said about you. No free rides.`}
      </p>

      {!isUnlocked ? (
        <V3CTAButton href={`/preview/${encodeURIComponent(token)}/perceive`} marginBottom={16}>
          Keep rating · {RECIPROCITY_GATE - givenCount} to go →
        </V3CTAButton>
      ) : scenariosWithData.length === 0 ? (
        <V3HollowCard>
          <div style={{ fontFamily: TYPE.mono, fontSize: 13, lineHeight: 1.55, color: PALETTE.ink }}>
            <strong>No takes yet.</strong> You&apos;ve done your bit — now wait for the
            lads to rate you. Nudge them in the WhatsApp group.
          </div>
        </V3HollowCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
          {scenariosWithData.map((scenario) => {
            const data = aggregate[scenario.id];
            const descTop = topChoice(data.descriptive);
            const prescTop = topChoice(data.prescriptive);
            const divergence = descTop !== null && prescTop !== null && descTop !== prescTop;

            const headline = (() => {
              if (data.descriptive.total === 0) return null;
              const winner = scenario.options.find((o) => o.id === descTop);
              if (!winner) return null;
              if (divergence) {
                const should = scenario.options.find((o) => o.id === prescTop);
                return `The lads think you ${winner.label.toLowerCase()} — but they think you SHOULD ${(should?.label ?? '').toLowerCase()}.`;
              }
              return `The lads think you ${winner.label.toLowerCase()}.`;
            })();

            const accent = divergence ? 'red' : 'sage';

            return (
              <V3SolidCard key={scenario.id} accent={accent} padding="16px 18px">
                <div
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: TRACKING.capWide,
                    textTransform: 'uppercase',
                    color: PALETTE.navy,
                    marginBottom: 8,
                  }}
                >
                  {scenario.prompt.replace(/\{name\}/g, 'you')}
                </div>

                {headline && (
                  <div
                    style={{
                      fontFamily: TYPE.display,
                      fontSize: 22,
                      fontWeight: 800,
                      lineHeight: 1.1,
                      letterSpacing: '-0.005em',
                      textTransform: 'uppercase',
                      marginBottom: 14,
                      color: PALETTE.ink,
                    }}
                  >
                    {headline}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: scenario.hasPrescriptive && data.prescriptive.total > 0 ? '1fr 1fr' : '1fr', gap: 12 }}>
                  <ChoiceBars
                    title="What you DO"
                    counts={data.descriptive}
                    options={scenario.options}
                    barColor={PALETTE.mustard}
                  />
                  {scenario.hasPrescriptive && data.prescriptive.total > 0 && (
                    <ChoiceBars
                      title="What you SHOULD"
                      counts={data.prescriptive}
                      options={scenario.options}
                      barColor={PALETTE.red}
                    />
                  )}
                </div>
              </V3SolidCard>
            );
          })}
        </div>
      )}

      <V3SectionLabel marginTop={12}>Reciprocity</V3SectionLabel>
      <V3SolidCard accent={isUnlocked ? 'sage' : 'red'} padding="16px 18px" marginBottom={20}>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 26,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {givenCount} given · {received.length} received
        </div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 12, lineHeight: 1.55, color: PALETTE.inkLight }}>
          {isUnlocked
            ? `${uniqueRaters} lad${uniqueRaters === 1 ? '' : 's'} have weighed in. Your card unlocks as more lads rate you — share the link in the group.`
            : `Rate ${RECIPROCITY_GATE - givenCount} more to unlock the takes on the right.`}
        </div>
      </V3SolidCard>

      <V3CTAButton href={`/preview/${encodeURIComponent(token)}/perceive`} marginBottom={12}>
        {isUnlocked ? 'Rate more lads →' : `Keep rating · ${RECIPROCITY_GATE - givenCount} to go →`}
      </V3CTAButton>
      <V3CTAButton href={`/preview/${encodeURIComponent(token)}`} variant="secondary">
        Back to your card
      </V3CTAButton>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          lineHeight: 1.6,
          color: PALETTE.inkLight,
          marginTop: 32,
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        Aggregate only — we never show who said what. Make the lads
        argue, not fight.
      </p>
    </V3PageShell>
  );
}

function ChoiceBars({
  title,
  counts,
  options,
  barColor,
}: {
  title: string;
  counts: { a: number; b: number; c: number; d: number; total: number };
  options: Array<{ id: 'a' | 'b' | 'c' | 'd'; label: string }>;
  barColor: string;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: TRACKING.cap,
          textTransform: 'uppercase',
          color: PALETTE.navy,
          marginBottom: 8,
        }}
      >
        {title} · {counts.total}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt) => {
          const count = counts[opt.id];
          const pct = counts.total > 0 ? Math.round((count / counts.total) * 100) : 0;
          return (
            <div key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 10,
                    lineHeight: 1.4,
                    color: PALETTE.ink,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontWeight: 700, marginRight: 4 }}>{opt.id.toUpperCase()}.</span>
                  {opt.label}
                </span>
                <span
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    color: PALETTE.inkLight,
                    minWidth: 24,
                    textAlign: 'right',
                  }}
                >
                  {count}
                </span>
              </div>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 4,
                  background: 'rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${pct}%`,
                    background: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
