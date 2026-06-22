/**
 * Squad clubhouse — `/preview/[token]/squad`.
 *
 * The shared squad home that lives alongside the WhatsApp group: a
 * destination URL the lads keep coming back to. Every player's card,
 * the leaderboards generated from current data, the universalized
 * doctrine view, the activity ticker, and URL-param sort/filter.
 *
 * Token-gated via getPreviewUser (auth-by-URL pattern). The viewer's
 * own card is highlighted because each token identifies which lad is
 * looking — the page is the same data for everyone, but the framing
 * personalizes via the highlight.
 *
 * V3 Risograph register. Reuses V3PlayerCard compact + the perception
 * aggregate service.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
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
  V3CTAButton,
  type Attrs,
} from '@/components/v3';
import { PerceptionBars } from '@/components/perception/PerceptionBars';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';
import {
  aggregateSquadDoctrine,
  topChoice,
} from '@/server/services/perception/aggregate';
import { SCENARIOS } from '@/server/services/perception/scenarios';

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    sort?: string;
    position?: string;
    tier?: string;
    unrated?: string;
  }>;
}

type SortKey = 'overall' | 'name' | 'ratings' | 'tier';

const VALID_SORTS: SortKey[] = ['overall', 'name', 'ratings', 'tier'];
const POSITION_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF'];
const TIER_THRESHOLDS = { 1: 5, 2: 10, 3: 20 } as const;

function tierFromGiven(given: number): 0 | 1 | 2 | 3 {
  if (given >= 20) return 3;
  if (given >= 10) return 2;
  if (given >= 5) return 1;
  return 0;
}

function timeAgo(ts: Date): string {
  const seconds = Math.floor((Date.now() - ts.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const SCENARIO_PAYLOAD = SCENARIOS.map((s) => ({
  id: s.id,
  prompt: s.prompt,
  context: s.context,
  hasPrescriptive: s.hasPrescriptive,
  options: s.options.map((o) => ({ id: o.id, label: o.label })),
}));

export default async function SquadClubhousePage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const sp = await searchParams;
  const sort: SortKey = (VALID_SORTS as string[]).includes(sp.sort ?? '')
    ? (sp.sort as SortKey)
    : 'overall';
  const positionFilter = sp.position?.toUpperCase() ?? null;
  const tierFilter = sp.tier !== undefined && /^[0-3]$/.test(sp.tier) ? Number(sp.tier) : null;
  const unratedOnly = sp.unrated === '1';

  const user = await getPreviewUser(token, {
    include: {
      playerProfile: true,
      squads: { include: { squad: true } },
    },
  });
  if (!user || !user.playerProfile) notFound();
  const squad = user.squads[0]?.squad;
  if (!squad) notFound();

  // Pull everything in parallel. Three queries cover the surface.
  const [members, doctrineResult, recentPerceptions, viewerGiven] = await Promise.all([
    prisma.squadMember.findMany({
      where: { squadId: squad.id },
      include: {
        user: {
          include: { playerProfile: { include: { twin: true } } },
        },
      },
    }),
    aggregateSquadDoctrine(squad.id),
    prisma.playerPerception.findMany({
      where: {
        OR: [
          { rater: { user: { squads: { some: { squadId: squad.id } } } } },
          { target: { user: { squads: { some: { squadId: squad.id } } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        rater: { select: { user: { select: { position: true } } } },
        target: { select: { user: { select: { position: true } } } },
      },
    }),
    prisma.playerPerception.findMany({
      where: { raterId: user.playerProfile.id },
      select: { targetId: true },
    }),
  ]);

  const givenTargetIds = new Set(viewerGiven.map((g) => g.targetId));

  // Build per-member rows with everything we need to render + sort.
  type Row = {
    userId: string;
    profileId: string | null;
    name: string;
    position: string | null;
    overall: number;
    level: number;
    tier: 0 | 1 | 2 | 3;
    perceptionsReceived: number;
    perceptionsGiven: number;
    isViewer: boolean;
    viewerHasRated: boolean;
  };

  // Counts per profile in single roundtrips
  const profileIds = members.map((m) => m.user.playerProfile?.id).filter((id): id is string => !!id);
  const [receivedCounts, givenCounts] = await Promise.all([
    prisma.playerPerception.groupBy({
      by: ['targetId'],
      where: { targetId: { in: profileIds } },
      _count: { _all: true },
    }),
    prisma.playerPerception.groupBy({
      by: ['raterId'],
      where: { raterId: { in: profileIds } },
      _count: { _all: true },
    }),
  ]);
  const receivedMap = new Map(receivedCounts.map((r) => [r.targetId, r._count._all]));
  const givenMap = new Map(givenCounts.map((g) => [g.raterId, g._count._all]));

  const rows: Row[] = members
    .filter((m) => m.user.playerProfile)
    .map((m) => {
      const profile = m.user.playerProfile!;
      const attrs: Attrs =
        (profile.twin?.baseAttributes as Attrs | null) ??
        baselineForPosition(m.user.position);
      const level = profile.twin?.level ?? 1;
      const overall = computeOverall(attrs, m.user.position, level, profile.twin?.prestige ?? 0);
      const given = givenMap.get(profile.id) ?? 0;
      return {
        userId: m.userId,
        profileId: profile.id,
        name: m.user.name ?? 'Player',
        position: m.user.position,
        overall,
        level,
        tier: tierFromGiven(given),
        perceptionsReceived: receivedMap.get(profile.id) ?? 0,
        perceptionsGiven: given,
        isViewer: m.userId === user.id,
        viewerHasRated: givenTargetIds.has(profile.id),
      };
    });

  // ── Leaderboards (computed before filtering — they reflect the whole squad)
  const sortByOverall = [...rows].sort((a, b) => b.overall - a.overall);
  const sortByReceived = [...rows].sort((a, b) => b.perceptionsReceived - a.perceptionsReceived);
  const sortByGiven = [...rows].sort((a, b) => b.perceptionsGiven - a.perceptionsGiven);
  const tier3Lads = rows.filter((r) => r.tier === 3);

  // Biggest hot take — scenario+position bucket with highest (total · dominance)
  let topHotTake: {
    position: string;
    scenarioId: string;
    choice: string;
    label: string;
    count: number;
    total: number;
  } | null = null;
  for (const [position, scenarios] of Object.entries(doctrineResult.byPosition)) {
    for (const [scenarioId, buckets] of Object.entries(scenarios)) {
      const top = topChoice(buckets.descriptive);
      if (!top) continue;
      const scenario = SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) continue;
      const opt = scenario.options.find((o) => o.id === top);
      if (!opt) continue;
      const count = buckets.descriptive[top];
      const total = buckets.descriptive.total;
      if (total < 2) continue;
      const score = total * (count / total);
      if (!topHotTake || score > topHotTake.count) {
        topHotTake = {
          position,
          scenarioId,
          choice: top,
          label: opt.label,
          count,
          total,
        };
      }
    }
  }

  // ── Apply roster filters
  const filtered = rows.filter((r) => {
    if (positionFilter && (r.position ?? '').toUpperCase() !== positionFilter) return false;
    if (tierFilter !== null && r.tier !== tierFilter) return false;
    if (unratedOnly && (r.viewerHasRated || r.isViewer)) return false;
    return true;
  });

  // ── Apply roster sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'ratings') return b.perceptionsReceived - a.perceptionsReceived;
    if (sort === 'tier') return b.tier - a.tier;
    return b.overall - a.overall;
  });

  // ── Filter chip URLs
  const baseUrl = `/preview/${encodeURIComponent(token)}/squad`;
  const buildUrl = (overrides: Partial<{ sort: string; position: string; tier: string; unrated: string }>) => {
    const params = new URLSearchParams();
    const current = { sort, position: positionFilter ?? undefined, tier: tierFilter !== null ? String(tierFilter) : undefined, unrated: unratedOnly ? '1' : undefined };
    const merged = { ...current, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    }
    const q = params.toString();
    return q ? `${baseUrl}?${q}` : baseUrl;
  };

  // Distinct positions present in the roster, ordered
  const presentPositions = [...new Set(rows.map((r) => (r.position ?? '').toUpperCase()).filter(Boolean))].sort(
    (a, b) => {
      const ai = POSITION_ORDER.indexOf(a);
      const bi = POSITION_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    },
  );

  const squadAvgOverall = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + r.overall, 0) / rows.length)
    : 0;

  // Build the inline leaderboard list — top 2 always visible, rest collapsed.
  type Leader = { label: string; player: string; meta: string | null; accent: 'mustard' | 'navy' | 'sage' | 'red' };
  const inlineLeaders: Leader[] = [];
  const collapsedLeaders: Leader[] = [];

  if (sortByOverall[0]) {
    inlineLeaders.push({
      label: 'Top of the pile',
      player: sortByOverall[0].name,
      meta: `${sortByOverall[0].position ?? ''} · ${sortByOverall[0].overall} OVR`.trim(),
      accent: 'mustard',
    });
  }
  if (topHotTake) {
    inlineLeaders.push({
      label: 'Biggest hot take',
      player: `${topHotTake.position}s`,
      meta: `${topHotTake.count}/${topHotTake.total} say ${topHotTake.label.toLowerCase()}`,
      accent: 'red',
    });
  }
  if (sortByReceived[0] && sortByReceived[0].perceptionsReceived > 0) {
    collapsedLeaders.push({
      label: 'Most rated',
      player: sortByReceived[0].name,
      meta: `${sortByReceived[0].perceptionsReceived} ratings received`,
      accent: 'navy',
    });
  }
  if (sortByGiven[0] && sortByGiven[0].perceptionsGiven > 0) {
    collapsedLeaders.push({
      label: 'Most active rater',
      player: sortByGiven[0].name,
      meta: `${sortByGiven[0].perceptionsGiven} given`,
      accent: 'sage',
    });
  }
  if (tier3Lads.length > 0) {
    collapsedLeaders.push({
      label: 'Tier 3 unlocked',
      player: tier3Lads.map((t) => t.name.split(' ')[0]).join(', '),
      meta: `${tier3Lads.length} lad${tier3Lads.length === 1 ? '' : 's'}`,
      accent: 'mustard',
    });
  }

  const visibleActivity = recentPerceptions.slice(0, 4);
  const hiddenActivity = recentPerceptions.slice(4);

  return (
    <V3PageShell maxWidth={720}>
      <V3Ribbon order={['red', 'mustard', 'navy', 'sage']} marginBottom={20} />
      <V3IdentityLine context={`${squad.name} · clubhouse`} marginBottom={10} />

      <V3Heading size="medium">The lads.</V3Heading>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          marginTop: 8,
          marginBottom: 24,
        }}
      >
        {rows.length} lads · {squadAvgOverall} avg · {doctrineResult.totalRows} ratings · {doctrineResult.uniqueRaters} voices
      </p>

      {/* ── Leaderboards (top 2 inline, rest behind details) ──────── */}
      {inlineLeaders.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
          {inlineLeaders.map((l) => (
            <LeaderTile key={l.label} {...l} />
          ))}
        </div>
      )}
      {collapsedLeaders.length > 0 && (
        <details style={{ marginBottom: 28 }}>
          <summary
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              padding: '6px 0',
            }}
          >
            + {collapsedLeaders.length} more leaderboard{collapsedLeaders.length === 1 ? '' : 's'}
          </summary>
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            {collapsedLeaders.map((l) => (
              <LeaderTile key={l.label} {...l} />
            ))}
          </div>
        </details>
      )}

      {/* ── Roster filters ────────────────────────────────────────── */}
      <V3SectionLabel marginBottom={10} marginTop={4}>The roster</V3SectionLabel>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        <Chip href={buildUrl({ sort: 'overall' })} active={sort === 'overall'}>OVR</Chip>
        <Chip href={buildUrl({ sort: 'ratings' })} active={sort === 'ratings'}>Ratings</Chip>
        <Chip href={buildUrl({ sort: 'tier' })} active={sort === 'tier'}>Tier</Chip>
        <Chip href={buildUrl({ sort: 'name' })} active={sort === 'name'}>A→Z</Chip>
        <span style={{ width: 8 }} />
        {unratedOnly ? (
          <Chip href={buildUrl({ unrated: undefined })} active muted>
            ✓ Untrated only
          </Chip>
        ) : (
          <Chip href={buildUrl({ unrated: '1' })} active={false} muted>
            Untrated only
          </Chip>
        )}
      </div>

      {presentPositions.length > 1 && (
        <details style={{ marginBottom: 16 }}>
          <summary
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              padding: '4px 0',
            }}
          >
            Filter by position {positionFilter ? `· ${positionFilter}` : ''}
          </summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            <Chip href={buildUrl({ position: undefined })} active={positionFilter === null} muted>All</Chip>
            {presentPositions.map((p) => (
              <Chip key={p} href={buildUrl({ position: p })} active={positionFilter === p} muted>
                {p}
              </Chip>
            ))}
          </div>
        </details>
      )}

      {/* ── Roster rows ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
        {sorted.length === 0 ? (
          <p style={{ fontFamily: TYPE.mono, fontSize: 12, color: PALETTE.inkLight, fontStyle: 'italic' }}>
            No lads match those filters.
          </p>
        ) : (
          sorted.map((r) => (
            <RosterRow
              key={r.userId}
              row={r}
              quizHref={`/preview/${encodeURIComponent(token)}?mode=quiz`}
            />
          ))
        )}
      </div>

      {/* ── Doctrine (collapsed) ──────────────────────────────────── */}
      {doctrineResult.totalRows > 0 && (
        <details style={{ marginBottom: 32 }}>
          <summary
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              fontFamily: TYPE.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.navy,
              padding: '10px 12px',
              border: `1.5px solid ${PALETTE.navy}`,
              borderLeft: `6px solid ${PALETTE.navy}`,
              background: PALETTE.cream,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>What the group says by role</span>
            <span style={{ opacity: 0.7 }}>tap →</span>
          </summary>
          <div style={{ marginTop: 14 }}>
            <p style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.inkLight, lineHeight: 1.55, marginBottom: 18 }}>
              Anonymized positional read — no names attached.
            </p>
            {Object.entries(doctrineResult.byPosition).map(([position, scenarios]) => (
              <div key={position} style={{ marginBottom: 24 }}>
                <V3SectionLabel marginBottom={10} color={PALETTE.red}>
                  {position}
                </V3SectionLabel>
                <PerceptionBars
                  aggregate={scenarios}
                  scenarios={SCENARIO_PAYLOAD}
                  nameSubstitution={`the ${position}`}
                  emptyMessage="No ratings for this role yet."
                />
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ── Activity ticker (4 inline + collapse) ─────────────────── */}
      {visibleActivity.length > 0 && (
        <>
          <V3SectionLabel marginBottom={10}>Recent activity</V3SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            {visibleActivity.map((p) => (
              <ActivityRow key={p.id} perception={p} />
            ))}
          </div>
          {hiddenActivity.length > 0 && (
            <details style={{ marginBottom: 32 }}>
              <summary
                style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  fontFamily: TYPE.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: TRACKING.cap,
                  textTransform: 'uppercase',
                  color: PALETTE.inkLight,
                  padding: '4px 0',
                }}
              >
                + {hiddenActivity.length} more
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                {hiddenActivity.map((p) => (
                  <ActivityRow key={p.id} perception={p} />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {/* ── CTAs ──────────────────────────────────────────────────── */}
      <V3CTAButton
        href={`/preview/${encodeURIComponent(token)}?mode=quiz`}
        variant="primary"
        marginBottom={10}
      >
        Rate more lads →
      </V3CTAButton>
      <V3CTAButton
        href={`/preview/${encodeURIComponent(token)}`}
        variant="secondary"
        marginBottom={16}
      >
        ← Your card
      </V3CTAButton>
    </V3PageShell>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Local components
// ──────────────────────────────────────────────────────────────────────

function LeaderTile({
  label,
  player,
  meta,
  accent,
}: {
  label: string;
  player: string;
  meta: string | null;
  accent: 'navy' | 'mustard' | 'sage' | 'red';
}) {
  return (
    <div
      style={{
        background: PALETTE.cream,
        border: `1.5px solid ${PALETTE.ink}`,
        borderLeft: `5px solid ${PALETTE[accent]}`,
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            marginBottom: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 13,
            fontWeight: 700,
            color: PALETTE.ink,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {player}
        </div>
      </div>
      {meta && (
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10,
            fontWeight: 700,
            color: PALETTE[accent],
            textAlign: 'right',
            flexShrink: 0,
            maxWidth: '50%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {meta}
        </div>
      )}
    </div>
  );
}

function RosterRow({
  row,
  quizHref,
}: {
  row: {
    userId: string;
    name: string;
    position: string | null;
    overall: number;
    level: number;
    isViewer: boolean;
    viewerHasRated: boolean;
  };
  quizHref: string;
}) {
  // One row, one shape — same skeleton for everyone, status pip on the right.
  const ratedTag = row.isViewer
    ? { text: 'YOU', color: PALETTE.ink, bg: PALETTE.mustard }
    : row.viewerHasRated
    ? { text: '✓ RATED', color: PALETTE.sage, bg: 'transparent' }
    : null;

  const Wrap = (children: React.ReactNode) =>
    !row.isViewer && !row.viewerHasRated ? (
      <Link
        href={quizHref}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        {children}
      </Link>
    ) : (
      <div>{children}</div>
    );

  return Wrap(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        background: row.isViewer ? 'rgba(212,164,55,0.14)' : PALETTE.cream,
        border: row.isViewer ? `2px solid ${PALETTE.mustard}` : `1px solid ${PALETTE.ink}25`,
      }}
    >
      <div
        style={{
          fontFamily: TYPE.display,
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: PALETTE.mustard,
          background: PALETTE.ink,
          padding: '2px 8px',
          lineHeight: 1.05,
          flexShrink: 0,
        }}
      >
        {row.overall}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 13,
            fontWeight: 700,
            color: PALETTE.ink,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.name}
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
          }}
        >
          {row.position ?? '—'} · L{row.level}
        </div>
      </div>
      {ratedTag ? (
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            color: ratedTag.color,
            background: ratedTag.bg,
            padding: ratedTag.bg !== 'transparent' ? '2px 6px' : 0,
            flexShrink: 0,
          }}
        >
          {ratedTag.text}
        </span>
      ) : (
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            fontWeight: 700,
            color: PALETTE.red,
            flexShrink: 0,
          }}
        >
          Rate →
        </span>
      )}
    </div>,
  );
}

function ActivityRow({
  perception,
}: {
  perception: {
    id: string;
    scenarioId: string;
    createdAt: Date;
    rater: { user: { position: string | null } | null } | null;
    target: { user: { position: string | null } | null } | null;
  };
}) {
  const raterPos = perception.rater?.user?.position ?? 'a lad';
  const targetPos = perception.target?.user?.position ?? 'a lad';
  const scenario = SCENARIOS.find((s) => s.id === perception.scenarioId);
  const lens = scenario ? scenario.attributeTag : 'play';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: TYPE.mono,
        fontSize: 11,
        color: PALETTE.inkLight,
        padding: '4px 8px',
      }}
    >
      <span>A {raterPos} rated a {targetPos} on {lens}</span>
      <span style={{ opacity: 0.65 }}>{timeAgo(perception.createdAt)}</span>
    </div>
  );
}

function Chip({
  href,
  active,
  muted,
  children,
}: {
  href: string;
  active: boolean;
  muted?: boolean;
  children: React.ReactNode;
}) {
  const bg = active ? (muted ? PALETTE.navy : PALETTE.mustard) : 'transparent';
  const color = active ? (muted ? PALETTE.cream : PALETTE.ink) : PALETTE.inkLight;
  const border = active
    ? `1.5px solid ${muted ? PALETTE.navy : PALETTE.red}`
    : `1.5px solid ${PALETTE.ink}25`;
  return (
    <Link
      href={href}
      style={{
        fontFamily: TYPE.mono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '6px 10px',
        background: bg,
        color,
        border,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  );
}
