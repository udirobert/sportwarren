import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const ATTRIBUTE_LABELS: Record<string, string> = {
  pace: 'PAC',
  shooting: 'SHO',
  passing: 'PAS',
  dribbling: 'DRI',
  defending: 'DEF',
  physical: 'PHY',
};

const POSITION_MAP: Record<string, string> = {
  pace: 'WG', shooting: 'ST', passing: 'MF',
  dribbling: 'MF', defending: 'DF', physical: 'DF',
};

function getRatingColor(r: number): string {
  if (r >= 80) return '#22c55e';
  if (r >= 65) return '#f59e0b';
  if (r >= 50) return '#3b82f6';
  return '#94a3b8';
}

function detectPosition(attrs: { attribute: string; rating: number }[]): string {
  if (attrs.length === 0) return 'ST';
  const sorted = [...attrs].sort((a, b) => b.rating - a.rating);
  return POSITION_MAP[sorted[0].attribute] ?? 'ST';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId');
  const matchId = searchParams.get('matchId');

  if (!profileId) {
    return new Response('profileId required', { status: 400 });
  }

  const profile = await prisma.playerProfile.findUnique({
    where: { id: profileId },
    include: {
      user: { select: { name: true } },
      attributes: true,
    },
  });

  if (!profile) {
    return new Response('Profile not found', { status: 404 });
  }

  const attrs = profile.attributes.map(a => ({ attribute: a.attribute, rating: a.rating }));
  const overall = attrs.length > 0
    ? Math.round(attrs.reduce((s, a) => s + a.rating, 0) / attrs.length)
    : 0;
  const position = detectPosition(attrs);
  const topAttrs = [...attrs].sort((a, b) => b.rating - a.rating).slice(0, 6);

  let matchStats: { goals: number; assists: number; rating: number | null } | null = null;
  if (matchId) {
    matchStats = await prisma.playerMatchStats.findUnique({
      where: { matchId_profileId: { matchId, profileId } },
    });
  }

  const overallColor = getRatingColor(overall);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '48px',
        }}
      >
        <div style={{ display: 'flex', width: '100%', gap: '48px' }}>
          {/* Left: Rating + Position */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '220px' }}>
            <div style={{ fontSize: '96px', fontWeight: 800, color: overallColor, lineHeight: '1' }}>
              {overall}
            </div>
            <div style={{
              fontSize: '20px', fontWeight: 700, color: '#94a3b8',
              padding: '4px 16px', border: '2px solid #334155', borderRadius: '6px',
              marginTop: '8px',
            }}>
              {position}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '12px' }}>
              LVL {profile.level}
            </div>
          </div>

          {/* Center: Name + Attributes */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '24px' }}>
              {profile.user?.name ?? 'Player'}
            </div>

            {/* Attribute grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {topAttrs.map((a) => (
                <div
                  key={a.attribute}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>
                    {ATTRIBUTE_LABELS[a.attribute] ?? a.attribute.toUpperCase().slice(0, 3)}
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: getRatingColor(a.rating) }}>
                    {a.rating}
                  </span>
                </div>
              ))}
            </div>

            {/* Match stats badge */}
            {matchStats && (
              <div style={{
                display: 'flex', gap: '24px', marginTop: '24px',
                padding: '12px 20px', background: 'rgba(34,197,94,0.1)',
                borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>{matchStats.goals}</span> G
                </span>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>{matchStats.assists}</span> A
                </span>
                {matchStats.rating && (
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>{matchStats.rating.toFixed(1)}</span> RTG
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Career stats */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{profile.totalMatches}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>MATCHES</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{profile.totalGoals}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>GOALS</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6' }}>{profile.totalAssists}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>ASSISTS</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '24px', left: '48px', right: '48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '12px', color: '#475569', letterSpacing: '1px' }}>
            SPORTWARREN • BUILD YOUR LEGEND
          </span>
          {profile.scoutTier !== 'rookie' && (
            <span style={{
              fontSize: '11px', color: '#f59e0b', fontWeight: 600,
              padding: '2px 10px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px',
            }}>
              {profile.scoutTier.toUpperCase()} SCOUT
            </span>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
