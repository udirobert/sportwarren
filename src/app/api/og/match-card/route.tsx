import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Generates a match result card image (1200x630 PNG).
 * Used by the Telegram bot to send post-match visual summaries to group chats.
 *
 * GET /api/og/match-card?matchId=xxx&squadId=yyy
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');
  const squadId = searchParams.get('squadId');

  if (!matchId) {
    return new Response('matchId required', { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeSquad: { select: { id: true, name: true } },
      awaySquad: { select: { id: true, name: true } },
      motmVotes: { select: { targetId: true } },
    },
  });

  if (!match) {
    return new Response('Match not found', { status: 404 });
  }

  // Calculate MOTM
  const voteCounts = new Map<string, number>();
  for (const vote of match.motmVotes) {
    voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) ?? 0) + 1);
  }
  let motmName: string | null = null;
  if (voteCounts.size > 0) {
    const topCandidateId = [...voteCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const motmProfile = await prisma.playerProfile.findUnique({
      where: { id: topCandidateId },
      include: { user: { select: { name: true } } },
    });
    motmName = motmProfile?.user?.name ?? null;
  }

  // Get top XP gainers for this match
  const xpGains = await prisma.xPGain.findMany({
    where: { matchId },
  });

  // Resolve player names for XP gainers
  const profileIds = [...new Set(xpGains.map(g => g.profileId))];
  const profiles = await prisma.playerProfile.findMany({
    where: { id: { in: profileIds } },
    include: { user: { select: { name: true } } },
  });
  const profileNameMap = new Map(profiles.map(p => [p.id, p.user?.name ?? 'Player']));

  // Aggregate XP per player using attributeBreakdown JSON
  const playerXP = new Map<string, { name: string; total: number; topAttribute: string; topGain: number }>();
  for (const gain of xpGains) {
    const name = profileNameMap.get(gain.profileId) ?? 'Player';
    const breakdown = (gain.attributeBreakdown as Record<string, number> | null) ?? {};
    // Find the top attribute from breakdown
    let topAttr = 'general';
    let topVal = 0;
    for (const [attr, val] of Object.entries(breakdown)) {
      if (val > topVal) { topAttr = attr; topVal = val; }
    }

    const existing = playerXP.get(gain.profileId);
    if (existing) {
      existing.total += gain.totalXP;
      if (topVal > existing.topGain) {
        existing.topAttribute = topAttr;
        existing.topGain = topVal;
      }
    } else {
      playerXP.set(gain.profileId, {
        name,
        total: gain.totalXP,
        topAttribute: topAttr,
        topGain: topVal,
      });
    }
  }

  const topPlayers = [...playerXP.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  // Determine result from the perspective of the viewing squad
  const viewingSquadId = squadId || match.homeSquad.id;
  const isHome = viewingSquadId === match.homeSquad.id;
  const viewingScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
  const opponentScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
  const result = viewingScore > opponentScore ? 'VICTORY' : viewingScore < opponentScore ? 'DEFEAT' : 'DRAW';
  const resultColor = result === 'VICTORY' ? '#22c55e' : result === 'DEFEAT' ? '#ef4444' : '#f59e0b';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #0f172a 0%, #000000 60%, #0a1628 100%)',
          padding: '48px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: '#22c55e',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              W
            </div>
            <span style={{ fontSize: '16px', color: '#94a3b8', letterSpacing: '2px' }}>
              SPORTWARREN
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 16px',
              border: `2px solid ${resultColor}`,
              borderRadius: '6px',
              fontSize: '14px',
              color: resultColor,
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            {result}
          </div>
        </div>

        {/* Score */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '48px',
            gap: '40px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', color: '#e2e8f0', fontWeight: 600 }}>
              {match.homeSquad.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '72px', fontWeight: 700 }}>{match.homeScore ?? 0}</span>
            <span style={{ fontSize: '36px', color: '#475569' }}>-</span>
            <span style={{ fontSize: '72px', fontWeight: 700 }}>{match.awayScore ?? 0}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', color: '#e2e8f0', fontWeight: 600 }}>
              {match.awaySquad.name}
            </span>
          </div>
        </div>

        {/* MOTM */}
        {motmName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '32px',
              padding: '12px 24px',
              background: 'linear-gradient(90deg, rgba(234,179,8,0.1) 0%, rgba(234,179,8,0.2) 50%, rgba(234,179,8,0.1) 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(234,179,8,0.3)',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '20px' }}>🏆</span>
            <span style={{ fontSize: '16px', color: '#fbbf24', fontWeight: 600 }}>
              Man of the Match: {motmName}
            </span>
          </div>
        )}

        {/* Top XP Gainers */}
        {topPlayers.length > 0 && (
          <div
            style={{
              display: 'flex',
              marginTop: '32px',
              gap: '16px',
              justifyContent: 'center',
            }}
          >
            {topPlayers.map((player, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  width: '140px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                  {player.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>
                  +{player.total}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {player.topAttribute}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '24px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#475569', letterSpacing: '1px' }}>
            sportwarren.com • Build Your Legend
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
