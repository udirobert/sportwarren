/**
 * Captain tactical doctrine — `/preview/[token]/doctrine`.
 *
 * Gated to the squad's captain (resolved by the preview token's user
 * having `role === 'captain'` in their SquadMember row). For everyone
 * else this 404s — the doctrine is the captain's read of the dressing
 * room, not the group chat.
 *
 * The page groups perception aggregates by the *target's* position so
 * the captain sees "across all my CBs, what do the lads think they DO
 * vs SHOULD do." This is the foundation of tactical doctrine: the
 * group's perception of role-by-role behaviour, anonymized.
 *
 * V3 Risograph register. Reuses PerceptionBars per position bucket.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { getPreviewUser } from '../../_lib/get-preview-user';
import {
  PALETTE,
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3SectionLabel,
  V3SolidCard,
  V3CTAButton,
} from '@/components/v3';
import { PerceptionBars } from '@/components/perception/PerceptionBars';
import {
  aggregateSquadDoctrine,
  topChoice,
  type ChoiceCounts,
} from '@/server/services/perception/aggregate';
import { SCENARIOS } from '@/server/services/perception/scenarios';
import { DoctrineShareButton } from './DoctrineShareButton';

interface PageProps {
  params: Promise<{ token: string }>;
}

const SCENARIO_PAYLOAD = SCENARIOS.map((s) => ({
  id: s.id,
  prompt: s.prompt,
  context: s.context,
  hasPrescriptive: s.hasPrescriptive,
  options: s.options.map((o) => ({ id: o.id, label: o.label })),
}));

/**
 * Stable ordering for positions in the doctrine layout — defenders first,
 * then midfielders, then forwards. Anything we don't know about falls
 * through to the end alphabetically.
 */
const POSITION_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];

function orderPositions(positions: string[]): string[] {
  return [...positions].sort((a, b) => {
    const ai = POSITION_ORDER.indexOf(a);
    const bi = POSITION_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

/** Pull the single biggest divergence between "is" and "should" inside a position bucket. */
function strongestTension(
  scenarios: Record<string, { descriptive: ChoiceCounts; prescriptive: ChoiceCounts }>,
): { scenarioId: string; descLabel: string; prescLabel: string; score: number } | null {
  let best: { scenarioId: string; descLabel: string; prescLabel: string; score: number } | null = null;
  for (const [scenarioId, buckets] of Object.entries(scenarios)) {
    const d = topChoice(buckets.descriptive);
    const p = topChoice(buckets.prescriptive);
    if (!d || !p || d === p) continue;
    const scenarioMeta = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenarioMeta) continue;
    const descOpt = scenarioMeta.options.find((o) => o.id === d);
    const prescOpt = scenarioMeta.options.find((o) => o.id === p);
    if (!descOpt || !prescOpt) continue;
    const dominance =
      buckets.descriptive[d] / Math.max(1, buckets.descriptive.total) +
      buckets.prescriptive[p] / Math.max(1, buckets.prescriptive.total);
    const score = (buckets.descriptive.total + buckets.prescriptive.total) * dominance;
    if (!best || score > best.score) {
      best = { scenarioId, descLabel: descOpt.label, prescLabel: prescOpt.label, score };
    }
  }
  return best;
}

export default async function CaptainDoctrinePage({ params }: PageProps) {
  const { token } = await params;

  const user = await getPreviewUser(token, {
    include: {
      squads: { include: { squad: true } },
    },
  });
  if (!user) notFound();

  const captainMembership = user.squads.find((m) => m.role === 'captain');
  if (!captainMembership) notFound();
  const squad = captainMembership.squad;

  const { byPosition, totalRows, uniqueRaters, uniqueTargets } = await aggregateSquadDoctrine(squad.id);
  const orderedPositions = orderPositions(Object.keys(byPosition));

  return (
    <V3PageShell>
      <V3Ribbon order={['navy', 'sage', 'mustard', 'red']} marginBottom={24} />
      <V3IdentityLine context={`${squad.name} · doctrine`} />

      <V3Heading size="large">
        The group&apos;s read.
      </V3Heading>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 13,
          color: PALETTE.inkLight,
          lineHeight: 1.55,
          marginTop: 16,
          marginBottom: 28,
          maxWidth: 480,
        }}
      >
        What the lads think each role DOES versus what it SHOULD do.
        Aggregated and position-anonymized — no individual names attached.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          marginBottom: 36,
        }}
      >
        <V3SolidCard accent="navy" padding="12px 14px">
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1,
              color: PALETTE.ink,
            }}
          >
            {totalRows}
          </div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              marginTop: 6,
            }}
          >
            Ratings logged
          </div>
        </V3SolidCard>
        <V3SolidCard accent="sage" padding="12px 14px">
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1,
              color: PALETTE.ink,
            }}
          >
            {uniqueRaters}
          </div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              marginTop: 6,
            }}
          >
            Voices
          </div>
        </V3SolidCard>
        <V3SolidCard accent="mustard" padding="12px 14px">
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1,
              color: PALETTE.ink,
            }}
          >
            {uniqueTargets}
          </div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              marginTop: 6,
            }}
          >
            Lads read
          </div>
        </V3SolidCard>
      </div>

      {totalRows > 0 && (
        <DoctrineShareButton token={token} squadName={squad.name} />
      )}

      {orderedPositions.length === 0 && (
        <V3SolidCard accent="navy" padding="20px">
          <p
            style={{
              fontFamily: TYPE.mono,
              fontSize: 13,
              lineHeight: 1.6,
              color: PALETTE.inkLight,
              margin: 0,
            }}
          >
            No perceptions yet. Once the lads start rating each other the doctrine
            will fill in by position — CBs, mids, forwards — so you can see what
            the group expects from each role.
          </p>
        </V3SolidCard>
      )}

      {orderedPositions.map((position) => {
        const positionAggregate = byPosition[position];
        const tension = strongestTension(positionAggregate);

        return (
          <section key={position} style={{ marginBottom: 40 }}>
            <V3SectionLabel marginBottom={14}>{position}</V3SectionLabel>

            {tension && (
              <V3SolidCard accent="red" padding="14px 16px" marginBottom={18}>
                <div
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: TRACKING.cap,
                    textTransform: 'uppercase',
                    color: PALETTE.red,
                    marginBottom: 6,
                  }}
                >
                  Doctrine gap
                </div>
                <div
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: PALETTE.ink,
                  }}
                >
                  Group says <strong>{position}</strong> usually:{' '}
                  <em style={{ color: PALETTE.sage }}>{tension.descLabel}</em>
                  <br />
                  Group says they should:{' '}
                  <em style={{ color: PALETTE.navy }}>{tension.prescLabel}</em>
                </div>
              </V3SolidCard>
            )}

            <PerceptionBars
              aggregate={positionAggregate}
              scenarios={SCENARIO_PAYLOAD}
              nameSubstitution={`the ${position}`}
              emptyMessage="No ratings for this position yet."
            />
          </section>
        );
      })}

      <V3CTAButton
        href={`/preview/${encodeURIComponent(token)}`}
        variant="secondary"
        marginBottom={16}
      >
        ← Back to my card
      </V3CTAButton>
    </V3PageShell>
  );
}
