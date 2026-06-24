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
  V3SolidCard,
  type Attrs,
} from '@/components/v3';
import { PerceptionBars } from '@/components/perception/PerceptionBars';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';
import {
  aggregateSquadDoctrine,
  findSquadHotTake,
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

function isSameUTCDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
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

  const profileId = user.playerProfile.id;

  // Pull everything in parallel.
  const [members, doctrineResult, recentPerceptions, viewerGiven, lastSession] = await Promise.all([
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
      where: { raterId: profileId },
      select: { targetId: true },
    }),
    prisma.session.findFirst({
      where: { squadId: squad.id },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),
  ]);

  const givenTargetIds = new Set(viewerGiven.map((g) => g.targetId));

  // ── "X lads drilled today" stat ──
  const memberTwinIds = members
    .map((m) => m.user.playerProfile?.twin?.id)
    .filter((id): id is string => !!id);

  let ladsDrilledCount = 0;
  if (memberTwinIds.length > 0) {
    const now = new Date();
    const twinsWithDrill = await prisma.playerTwin.findMany({
      where: {
        id: { in: memberTwinIds },
        lastDailyDrillAt: { not: null },
      },
      select: { lastDailyDrillAt: true },
    });
    ladsDrilledCount = twinsWithDrill.filter(
      (t) => t.lastDailyDrillAt && isSameUTCDay(t.lastDailyDrillAt, now),
    ).length;
  }

  // ── "Hot take from last session" ──
  // Query perceptions created since the last session date (or last 48h if no session)
  let sessionHotTake: {
    position: string;
    scenarioId: string;
    choice: string;
    label: string;
    count: number;
    total: number;
  } | null = null;
  if (lastSession) {
    const sinceDate = lastSession.date;
    const recentPerceptionsRaw = await prisma.playerPerception.findMany({
      where: {
        createdAt: { gte: sinceDate },
        target: { user: { squads: { some: { squadId: squad.id } } } },
      },
      select: {
        scenarioId: true,
        choice: true,
        kind: true,
        target: { select: { user: { select: { position: true } } } },
      },
    });

    // Build a mini position→scenario aggregate from session perceptions
    const sessionByPosition: Record<string, Record<string, { descriptive: ChoiceCounts; prescriptive: ChoiceCounts }>> = {};
    for (const r of recentPerceptionsRaw) {
      const position = r.target?.user?.position ?? 'Unknown';
      if (!sessionByPosition[position]) sessionByPosition[position] = {};
      if (!sessionByPosition[position][r.scenarioId]) {
        sessionByPosition[position][r.scenarioId] = {
          descriptive: { a: 0, b: 0, c: 0, d: 0, total: 0 },
          prescriptive: { a: 0, b: 0, c: 0, d: 0, total: 0 },
        };
      }
      const bucket = r.kind === 'prescriptive'
        ? sessionByPosition[position][r.scenarioId].prescriptive
        : sessionByPosition[position][r.scenarioId].descriptive;
      const c = r.choice as 'a' | 'b' | 'c' | 'd';
      if (c === 'a' || c === 'b' || c === 'c' || c === 'd') {
        bucket[c] += 1;
        bucket.total += 1;
      }
    }
    sessionHotTake = findSquadHotTake(sessionByPosition, SCENARIOS);
  }

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

  // Biggest overall hot take (all-time)
  const topHotTake = findSquadHotTake(doctrineResult.byPosition, SCENARIOS);

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

  // ── Filter chip URLs (relative — used with <Link> for internal nav)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const squadUrl = `/preview/${encodeURIComponent(token)}/squad`;
  const previewUrl = `/preview/${encodeURIComponent(token)}`;
  const buildUrl = (overrides: Partial<{ sort: string; position: string; tier: string; unrated: string }>) => {
    const params = new URLSearchParams();
    const current = { sort, position: positionFilter ?? undefined, tier: tierFilter !== null ? String(tierFilter) : undefined, unrated: unratedOnly ? '1' : undefined };
    const merged = { ...current, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    }
    const q = params.toString();
    return q ? `${squadUrl}?${q}` : squadUrl;
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

  // ── Build wa.me URL for a hot take (absolute URL so recipients can tap from WhatsApp) ──
  const buildHotTakeShareUrl = (take: typeof topHotTake): string | null => {
    if (!take) return null;
    const clubhouseUrl = `${baseUrl}${squadUrl}`;
    const shareText = [
      `oi check the clubhouse — the lads reckon`,  // continues on next line
      `your ${take.position}s always ${take.label.toLowerCase()}`,
      `(${take.count}/${take.total} votes).`,
      `whats your number?`,
      clubhouseUrl,
    ].join(' ');
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  };

  // Build the leaderboard tiles
  type Leader = { label: string; player: string; meta: string | null; accent: 'mustard' | 'navy' | 'sage' | 'red'; shareWaUrl?: string };
  const leaderTiles: Leader[] = [];

  if (sortByOverall[0]) {
    leaderTiles.push({
      label: 'Top of the pile',
      player: sortByOverall[0].name,
      meta: `${sortByOverall[0].position ?? ''} · ${sortByOverall[0].overall} OVR`.trim(),
      accent: 'mustard',
    });
  }
  if (topHotTake) {
    leaderTiles.push({
      label: 'Biggest hot take (all-time)',
      player: `${topHotTake.position}s`,
      meta: `${topHotTake.count}/${topHotTake.total} say ${topHotTake.label.toLowerCase()}`,
      accent: 'red',
      shareWaUrl: buildHotTakeShareUrl(topHotTake) ?? undefined,
    });
  }
  if (sessionHotTake) {
    leaderTiles.push({
      label: 'Last session hot take',
      player: `${sessionHotTake.position}s`,
      meta: `${sessionHotTake.count}/${sessionHotTake.total} say ${sessionHotTake.label.toLowerCase()}`,
      accent: 'navy',
      shareWaUrl: buildHotTakeShareUrl(sessionHotTake) ?? undefined,
    });
  }
  // Lads drilled stat as a leader tile
  if (ladsDrilledCount > 0) {
    leaderTiles.push({
      label: 'Drilled today',
      player: `${ladsDrilledCount} lad${ladsDrilledCount === 1 ? '' : 's'}`,
      meta: ladsDrilledCount === 1 ? 'completed the daily drill' : 'completed the daily drill',
      accent: 'sage',
    });
  }
  if (sortByReceived[0] && sortByReceived[0].perceptionsReceived > 0) {
    leaderTiles.push({
      label: 'Most rated',
      player: sortByReceived[0].name,
      meta: `${sortByReceived[0].perceptionsReceived} ratings received`,
      accent: 'navy',
    });
  }
  if (sortByGiven[0] && sortByGiven[0].perceptionsGiven > 0) {
    leaderTiles.push({
      label: 'Most active rater',
      player: sortByGiven[0].name,
      meta: `${sortByGiven[0].perceptionsGiven} given`,
      accent: 'sage',
    });
  }
  if (tier3Lads.length > 0) {
    leaderTiles.push({
      label: 'Tier 3 unlocked',
      player: tier3Lads.map((t) => t.name.split(' ')[0]).join(', '),
      meta: `${tier3Lads.length} lad${tier3Lads.length === 1 ? '' : 's'}`,
      accent: 'mustard',
    });
  }

  // ── Session hot take narrative (inline detail for the session hot take) ──
  let sessionHotTakeNarrative: { scenarioId: string; prompt: string; descLabel: string; prescLabel: string } | null = null;
  if (sessionHotTake) {
    const scenario = SCENARIOS.find((s) => s.id === sessionHotTake.scenarioId);
    if (scenario) {
      const opt = scenario.options.find((o) => o.id === sessionHotTake.choice);
      if (opt) {
        sessionHotTakeNarrative = {
          scenarioId: sessionHotTake.scenarioId,
          prompt: scenario.prompt.replace(/\{name\}/g, `the ${sessionHotTake.position}`),
          descLabel: opt.label,
          prescLabel: '',
        };
      }
    }
  }

  // Build the inline leaderboard list — show all non-empty tiles.
  const visibleActivity = recentPerceptions.slice(0, 5);
  const hiddenActivity = recentPerceptions.slice(5);

  return (
    <V3PageShell maxWidth={720}>
      <V3Ribbon order={['red', 'mustard', 'navy', 'sage']} marginBottom={20} />
      <V3IdentityLine context={`${squad.name} · clubhouse`} marginBottom={10} />

      <V3Heading size="medium">The clubhouse.</V3Heading>

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
        {ladsDrilledCount === 0 ? ' · 0 drilled today' : ''}
      </p>

      {/* ── Leaderboards (all inline now, no collapsed) ────────────── */}
      {leaderTiles.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 28 }}>
          {leaderTiles.map((l) => (
            <LeaderTile key={l.label} {...l} />
          ))}
        </div>
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
              token={token}
              quizHref={`${previewUrl}?mode=quiz`}
              previewUrl={previewUrl}
            />
          ))
        )}
      </div>

      {/* ── Doctrine (ALWAYS OPEN — the hottest debate fuel) ──────── */}
      {doctrineResult.totalRows > 0 && (
        <div style={{ marginBottom: 32 }}>
          <V3SolidCard accent="navy" padding="14px 16px" marginBottom={16}>
            <div
              style={{
                fontFamily: TYPE.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: TRACKING.cap,
                textTransform: 'uppercase',
                color: PALETTE.navy,
                marginBottom: 4,
              }}
            >
              What the group says by role
            </div>
            <p style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.inkLight, lineHeight: 1.55 }}>
              Anonymized positional read — no names attached. This is where the lads
              agree and disagree about what each role should do.
            </p>
          </V3SolidCard>

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
      )}

      {/* ── Activity ticker (5 inline + collapse) ─────────────────── */}
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
  shareWaUrl,
}: {
  label: string;
  player: string;
  meta: string | null;
  accent: 'navy' | 'mustard' | 'sage' | 'red';
  shareWaUrl?: string;
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
      {shareWaUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {meta && (
            <div
              style={{
                fontFamily: TYPE.mono,
                fontSize: 10,
                fontWeight: 700,
                color: PALETTE[accent],
                textAlign: 'right',
                maxWidth: '40%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {meta}
            </div>
          )}
          <a
            href={shareWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PALETTE.cream,
              background: PALETTE[accent],
              padding: '4px 8px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              border: `1px solid ${PALETTE[accent]}`,
            }}
          >
            ⚡ Share
          </a>
        </div>
      ) : (
        meta && (
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
        )
      )}
    </div>
  );
}

function RosterRow({
  row,
  token,
  quizHref,
  previewUrl,
}: {
  row: {
    userId: string;
    profileId: string | null;
    name: string;
    position: string | null;
    overall: number;
    level: number;
    isViewer: boolean;
    viewerHasRated: boolean;
  };
  token: string;
  quizHref: string;
  previewUrl: string;
}) {
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

  // WhatsApp compare intent — opens wa.me with a challenge message.
  // The message links to the clubhouse so the recipient lands on the
  // shared squad home, not a personal auth URL.
  // Uses absolute baseUrl so the link works when tapped on mobile.
  const compareMessage = `Oi, I'm on the SportWarren clubhouse. Overall: ${row.overall} · ${row.position ?? '—'}. What's your number? Check the lads: ${baseUrl}${previewUrl}/squad`;
  const compareWaUrl = `https://wa.me/?text=${encodeURIComponent(compareMessage)}`;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Compare button — opens WhatsApp with a challenge */}
        {!row.isViewer && (
          <a
            href={compareWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: PALETTE.navy,
              border: `1px solid ${PALETTE.navy}`,
              padding: '3px 7px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ Compare
          </a>
        )}
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
            }}
          >
            Rate →
          </span>
        )}
      </div>
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
