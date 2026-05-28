import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * OG image for tournament brackets: 1200x630
 * Shows bracket with scores, entry names, and winner crown.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');

  if (!tournamentId) {
    return new Response('Missing tournamentId', { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      entries: { orderBy: { seedNumber: 'asc' } },
      matches: {
        orderBy: [{ round: 'asc' }, { position: 'asc' }],
        include: {
          homeEntry: true,
          awayEntry: true,
        },
      },
    },
  });

  if (!tournament) {
    return new Response('Tournament not found', { status: 404 });
  }

  const qf = tournament.matches.filter((m: any) => m.round === 'quarter');
  const sf = tournament.matches.filter((m: any) => m.round === 'semi');
  const final_ = tournament.matches.filter((m: any) => m.round === 'final');

  const winner = final_.length > 0 && final_[0].status === 'completed'
    ? (final_[0].homeScore! >= final_[0].awayScore!
      ? final_[0].homeEntry
      : final_[0].awayEntry)
    : null;

  const bracketEntries = (matches: any[]) =>
    matches.map((m: any) => ({
      home: m.homeEntry?.squadId ? m.homeEntry.formation || 'Unknown' : `Seed ${m.homeEntry?.seedNumber}`,
      away: m.awayEntry?.squadId ? m.awayEntry.formation || 'Unknown' : `Seed ${m.awayEntry?.seedNumber}`,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    }));

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {winner ? '🏆' : '⚽'} {tournament.name}
          </div>
          <div style={{ fontSize: '16px', color: '#94a3b8', marginLeft: 'auto' }}>
            {tournament.type === 'squad' ? 'Squad Tournament' : 'Individual Tournament'}
          </div>
        </div>

        {/* Bracket */}
        <div style={{ display: 'flex', flex: 1, gap: '60px', alignItems: 'center' }}>
          {/* Quarter-finals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>QUARTER-FINALS</div>
            {bracketEntries(qf).map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: m.homeScore! > m.awayScore! ? '#166534' : '#1e293b',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '14px',
                }}>
                  <span style={{ flex: 1 }}>{m.home}</span>
                  <span style={{ fontWeight: 'bold' }}>{m.homeScore}</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: m.awayScore! > m.homeScore! ? '#166534' : '#1e293b',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '14px',
                }}>
                  <span style={{ flex: 1 }}>{m.away}</span>
                  <span style={{ fontWeight: 'bold' }}>{m.awayScore}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Semi-finals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>SEMI-FINALS</div>
            {bracketEntries(sf).map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: m.homeScore! > m.awayScore! ? '#166534' : '#1e293b',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '14px',
                }}>
                  <span style={{ flex: 1 }}>{m.home}</span>
                  <span style={{ fontWeight: 'bold' }}>{m.homeScore}</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: m.awayScore! > m.homeScore! ? '#166534' : '#1e293b',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '14px',
                }}>
                  <span style={{ flex: 1 }}>{m.away}</span>
                  <span style={{ fontWeight: 'bold' }}>{m.awayScore}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Final */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: '#f59e0b', marginBottom: '8px' }}>FINAL</div>
            {bracketEntries(final_).map((m: any, i: number) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: m.homeScore! > m.awayScore! ? '#92400e' : '#1e293b',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '16px',
                  border: m.homeScore! > m.awayScore! ? '2px solid #f59e0b' : 'none',
                }}>
                  <span style={{ flex: 1 }}>{m.home}</span>
                  <span style={{ fontWeight: 'bold' }}>{m.homeScore}</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: m.awayScore! > m.homeScore! ? '#92400e' : '#1e293b',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '16px',
                  border: m.awayScore! > m.homeScore! ? '2px solid #f59e0b' : 'none',
                }}>
                  <span style={{ flex: 1 }}>{m.away}</span>
                  <span style={{ fontWeight: 'bold' }}>{m.awayScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
          {winner && (
            <div style={{ fontSize: '20px', color: '#f59e0b' }}>
              🏆 Champion: {winner.squadId ? 'Squad' : `Seed ${winner.seedNumber}`}
            </div>
          )}
          <div style={{ fontSize: '14px', color: '#64748b', marginLeft: 'auto' }}>
            sportwarren.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
