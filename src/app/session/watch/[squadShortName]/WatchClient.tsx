/**
 * WatchClient — polls /api/session/watch/[squadShortName] every 2s
 * and renders the live state with animated transitions when goals
 * change. The total-goals counter flashes when it ticks up.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MiniAvatar, PALETTE } from '../../../preview/_components/MiniAvatar';

interface WatchData {
  squad: { name: string; shortName: string };
  session: {
    id: string;
    date: string;
    status: string;
    updatedAt: string;
    isLive: boolean;
    totalGoals: number;
    leaderboard: Array<{
      profileId: string;
      name: string | null;
      goals: number;
      avatar: {
        kit: string | null;
        accent: string | null;
        skin: string | null;
        hair: string | null;
        hairStyle: string;
        number: string;
      };
    }>;
  } | null;
}

export function WatchClient({
  squadShortName,
  initial,
}: {
  squadShortName: string;
  initial: WatchData;
}) {
  const [data, setData] = useState<WatchData>(initial);
  const [goalFlash, setGoalFlash] = useState(false);
  const lastGoalsRef = useRef(initial.session?.totalGoals ?? 0);

  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/session/watch/${encodeURIComponent(squadShortName)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const next = (await res.json()) as WatchData;
        if (cancelled) return;
        if (next.session && next.session.totalGoals > lastGoalsRef.current) {
          setGoalFlash(true);
          setTimeout(() => setGoalFlash(false), 600);
        }
        lastGoalsRef.current = next.session?.totalGoals ?? 0;
        setData(next);
      } catch {
        // swallow, retry next tick
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [squadShortName]);

  const { squad, session } = data;

  if (!session) {
    return <NoSession squadName={squad.name} />;
  }

  const sorted = [...session.leaderboard].sort((a, b) => b.goals - a.goals);
  const topScorer = sorted[0] && sorted[0].goals > 0 ? sorted[0] : null;
  const isLive = session.isLive;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '32px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        {/* Live ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div
            style={{
              width: 28,
              height: 4,
              background: isLive ? PALETTE.red : PALETTE.inkLight,
              animation: isLive ? 'livePulse 1.4s ease-in-out infinite' : undefined,
            }}
          />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          {isLive && (
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: PALETTE.red,
                animation: 'livePulse 1.4s ease-in-out infinite',
              }}
            />
          )}
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: isLive ? PALETTE.red : PALETTE.inkLight,
            }}
          >
            {isLive ? 'Live · session running' : `Final · ${formatRelative(new Date(session.updatedAt))}`}
          </div>
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
          {squad.name} · {formatDate(new Date(session.date))}
        </div>

        {/* Total goals hero — flashes when increments */}
        <div
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 144,
            fontWeight: 800,
            color: goalFlash ? PALETTE.red : PALETTE.ink,
            letterSpacing: '-0.05em',
            lineHeight: 0.85,
            marginBottom: 4,
            transition: 'color 0.3s',
            transform: goalFlash ? 'scale(1.04)' : 'scale(1)',
            transformOrigin: 'left center',
            transitionProperty: 'color, transform',
            transitionDuration: '0.3s',
          }}
        >
          {session.totalGoals}
        </div>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            marginBottom: 32,
          }}
        >
          Goals tonight
        </div>

        {/* Top scorer hero card */}
        {topScorer && (
          <div
            style={{
              background: PALETTE.cream,
              border: `2px solid ${PALETTE.ink}`,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 28,
              borderLeft: `6px solid ${PALETTE.mustard}`,
            }}
          >
            <MiniAvatar
              kit={topScorer.avatar.kit ?? undefined}
              accent={topScorer.avatar.accent ?? undefined}
              skin={topScorer.avatar.skin ?? undefined}
              hair={topScorer.avatar.hair ?? undefined}
              hairStyle={topScorer.avatar.hairStyle}
              number={topScorer.avatar.number}
              size={64}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: PALETTE.inkLight,
                }}
              >
                Top scorer
              </div>
              <div
                style={{
                  fontFamily: 'Antonio, Impact, sans-serif',
                  fontSize: 32,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  marginTop: 2,
                }}
              >
                {topScorer.name ?? 'Anon'}
              </div>
            </div>
            <div
              style={{
                background: PALETTE.ink,
                color: PALETTE.cream,
                padding: '10px 14px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {topScorer.goals}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 14,
          }}
        >
          Leaderboard
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: PALETTE.inkLight,
                border: `1px dashed ${PALETTE.inkLight}`,
              }}
            >
              No goals yet. Be patient.
            </div>
          )}
          {sorted.map((s, i) => {
            const isScorer = s.goals > 0;
            return (
              <div
                key={s.profileId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: i === 0 && isScorer ? 'rgba(212,164,55,0.12)' : 'transparent',
                  opacity: isScorer ? 1 : 0.5,
                  transition: 'background 0.3s, opacity 0.3s',
                }}
              >
                <div
                  style={{
                    width: 28,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: PALETTE.inkLight,
                  }}
                >
                  {i + 1}.
                </div>
                <MiniAvatar
                  kit={s.avatar.kit ?? undefined}
                  accent={s.avatar.accent ?? undefined}
                  skin={s.avatar.skin ?? undefined}
                  hair={s.avatar.hair ?? undefined}
                  hairStyle={s.avatar.hairStyle}
                  number={s.avatar.number}
                  size={40}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {s.name ?? 'Anon'}
                  </div>
                </div>
                {s.goals > 0 && (
                  <div
                    style={{
                      background: PALETTE.ink,
                      color: PALETTE.cream,
                      padding: '4px 10px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {s.goals} ⚽
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: '1px solid rgba(58,58,58,0.2)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            textAlign: 'center',
          }}
        >
          SPORTWARREN · live · refreshes every 2s
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes livePulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `,
        }}
      />
    </div>
  );
}

function NoSession({ squadName }: { squadName: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            margin: 0,
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          Nothing on yet
        </h1>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
          }}
        >
          {squadName} hasn't started a session. Check back when the
          captain's at the pitch.
        </p>
      </div>
    </div>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelative(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(d);
}
