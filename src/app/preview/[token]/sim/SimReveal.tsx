/**
 * SimReveal — staged anticipation for the sim result.
 *
 * The data is computed server-side and passed in. This component
 * just times the reveals. Three beats:
 *   0.0s  "Picking your team..."
 *   1.2s  show team avatars sliding in
 *   2.4s  "Game on..."
 *   3.6s  flash the score, big
 *   4.5s  scorers tick in one at a time
 *   ~6s   full result + CTAs
 *
 * Designed for the screen tap → suspense → reveal → share loop.
 */

'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../../_components/MiniAvatar';
import { claimSimOutcome, type ClaimResult } from './_actions';

const ATTR_LABEL: Record<string, string> = {
  pace: 'PAC',
  shooting: 'SHO',
  passing: 'PAS',
  dribbling: 'DRI',
  defending: 'DEF',
  physical: 'PHY',
};

interface PlayerData {
  userId: string;
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

interface SimRevealProps {
  token: string;
  squadName: string;
  me: PlayerData;
  teammates: PlayerData[];
  opponents: PlayerData[];
  myGoals: number;
  oppGoals: number;
  myScorers: Array<{ userId: string; goals: number }>;
  oppScorers: Array<{ userId: string; goals: number }>;
  shareUrl: string;
}

type Stage = 'picking' | 'team' | 'kickoff' | 'reveal' | 'scorers' | 'done';

export function SimReveal(props: SimRevealProps) {
  const [stage, setStage] = useState<Stage>('picking');
  const [revealedScorers, setRevealedScorers] = useState<number>(0);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isClaiming, startClaim] = useTransition();

  // Local idempotency — once this token has claimed a sim today, show
  // the already-locked-in state instead of the claim button.
  const claimKey = `sim_claimed_${props.token}_${new Date().toISOString().slice(0, 10)}`;
  useEffect(() => {
    try {
      const stored = localStorage.getItem(claimKey);
      if (stored) {
        setHasClaimed(true);
        setClaimResult(JSON.parse(stored) as ClaimResult);
      }
    } catch {
      /* noop */
    }
  }, [claimKey]);

  const onClaim = () => {
    if (hasClaimed || isClaiming) return;
    startClaim(async () => {
      const res = await claimSimOutcome({
        token: props.token,
        goalsScored: props.myGoals,
        goalsConceded: props.oppGoals,
      });
      setClaimResult(res);
      if (res.ok) {
        setHasClaimed(true);
        try {
          localStorage.setItem(claimKey, JSON.stringify(res));
        } catch {
          /* noop */
        }
      }
    });
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage('team'), 1200));
    timers.push(setTimeout(() => setStage('kickoff'), 2400));
    timers.push(setTimeout(() => setStage('reveal'), 3600));
    timers.push(setTimeout(() => setStage('scorers'), 4500));
    timers.push(setTimeout(() => setStage('done'), 5400));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'scorers' && stage !== 'done') return;
    const allScorers = [...props.myScorers, ...props.oppScorers];
    if (allScorers.length === 0) return;
    const interval = setInterval(() => {
      setRevealedScorers((prev) => {
        if (prev >= allScorers.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [stage, props.myScorers, props.oppScorers]);

  const result =
    props.myGoals > props.oppGoals
      ? 'win'
      : props.oppGoals > props.myGoals
      ? 'loss'
      : 'draw';
  const accentColor =
    result === 'win' ? PALETTE.sage : result === 'loss' ? PALETTE.red : PALETTE.navy;
  const resultLabel = result === 'win' ? 'WIN' : result === 'loss' ? 'LOSS' : 'DRAW';

  // PICKING stage
  if (stage === 'picking') {
    return (
      <CenteredStage>
        <PulsingDots />
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            marginTop: 24,
          }}
        >
          Picking your team…
        </div>
      </CenteredStage>
    );
  }

  // TEAM stage — show teammates sliding in
  if (stage === 'team') {
    return (
      <CenteredStage>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 20,
          }}
        >
          Your side
        </div>
        <SlideRow>
          {[props.me, ...props.teammates].map((p, i) => (
            <SlideAvatar key={p.userId} delay={i * 80}>
              <MiniAvatar {...p.avatar} size={56} />
            </SlideAvatar>
          ))}
        </SlideRow>
      </CenteredStage>
    );
  }

  // KICKOFF stage
  if (stage === 'kickoff') {
    return (
      <CenteredStage>
        <div
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 72,
            fontWeight: 800,
            color: PALETTE.ink,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            animation: 'pulseIn 0.6s ease-out',
          }}
        >
          Game on.
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes pulseIn {
                from { transform: scale(0.92); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `,
          }}
        />
      </CenteredStage>
    );
  }

  // REVEAL stage and beyond
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
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: accentColor }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <Link
          href={`/preview/${encodeURIComponent(props.token)}`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            textDecoration: 'none',
            marginBottom: 28,
            display: 'inline-block',
          }}
        >
          ← Back
        </Link>

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
          Simulated · {1 + props.teammates.length}v{props.opponents.length} · {props.squadName}
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.03em',
            color: accentColor,
            textTransform: 'uppercase',
            animation: 'slamIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {resultLabel}
        </h1>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: PALETTE.ink,
            marginTop: 16,
            marginBottom: 36,
            animation: 'slamIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s backwards',
          }}
        >
          {props.myGoals} — {props.oppGoals}
        </div>

        {/* Your stat band */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            borderLeft: `4px solid ${accentColor}`,
            marginBottom: 36,
          }}
        >
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700 }}>
            {props.myScorers.find((s) => s.userId === props.me.userId)?.goals ?? 0}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.85,
              textAlign: 'right',
            }}
          >
            Your goals · {props.me.position ?? 'unset'}
          </span>
        </div>

        {/* Team sheets — scorers tick in one at a time */}
        <ScorersList
          label={`Your team · ${props.myGoals} goals`}
          team={[props.me, ...props.teammates]}
          scorers={props.myScorers}
          highlight={props.me.userId}
          accent={result === 'win' ? PALETTE.sage : PALETTE.inkLight}
          revealed={revealedScorers}
          revealOrder={[...props.myScorers, ...props.oppScorers].map((s) => s.userId)}
        />

        <ScorersList
          label={`Opponents · ${props.oppGoals} goals`}
          team={props.opponents}
          scorers={props.oppScorers}
          accent={result === 'loss' ? PALETTE.red : PALETTE.inkLight}
          revealed={revealedScorers}
          revealOrder={[...props.myScorers, ...props.oppScorers].map((s) => s.userId)}
        />

        {/* CTAs — only show when fully done */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 40,
            opacity: stage === 'done' ? 1 : 0,
            transform: stage === 'done' ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.4s, transform 0.4s',
            pointerEvents: stage === 'done' ? 'auto' : 'none',
          }}
        >
          {/* Lock-this-in CTA — the chess.com moment. Fires the
              server action to apply attribute deltas to the twin. */}
          {!hasClaimed ? (
            <button
              type="button"
              onClick={onClaim}
              disabled={isClaiming}
              style={{
                background: result === 'win' ? PALETTE.sage : PALETTE.ink,
                color: PALETTE.cream,
                padding: '18px 20px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textAlign: 'center',
                border: `2px solid ${result === 'win' ? PALETTE.sage : PALETTE.ink}`,
                cursor: isClaiming ? 'wait' : 'pointer',
                opacity: isClaiming ? 0.7 : 1,
              }}
            >
              {isClaiming ? 'Locking in…' : 'Lock this in · move my card →'}
            </button>
          ) : claimResult?.ok && claimResult.deltas ? (
            <div
              style={{
                background: PALETTE.cream,
                border: `2px solid ${PALETTE.sage}`,
                borderLeft: `8px solid ${PALETTE.sage}`,
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: PALETTE.sage,
                  marginBottom: 8,
                }}
              >
                Locked in · this is now your card
              </div>
              <div
                style={{
                  fontFamily: 'Antonio, Impact, sans-serif',
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                {Object.entries(claimResult.deltas).map(([attr, delta]) => {
                  const d = delta as number;
                  if (!d) return null;
                  const sign = d > 0 ? '+' : '';
                  const color = d > 0 ? PALETTE.sage : PALETTE.red;
                  return (
                    <span key={attr} style={{ color }}>
                      {ATTR_LABEL[attr] ?? attr.toUpperCase()} {sign}
                      {d}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          <a
            href={props.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`sim-${props.me.name.toLowerCase().replace(/\s+/g, '-')}.png`}
            style={{
              background: PALETTE.mustard,
              color: PALETTE.ink,
              padding: '16px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `2px solid ${PALETTE.red}`,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            ↓ Save the card · share to WhatsApp
          </a>

          <Link
            href={`/preview/${encodeURIComponent(props.token)}/sim?r=${Date.now()}`}
            prefetch={false}
            style={{
              background: 'transparent',
              color: PALETTE.ink,
              padding: '16px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `2px solid ${PALETTE.navy}`,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Sim another
          </Link>

          <Link
            href={`/preview/${encodeURIComponent(props.token)}`}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              textDecoration: 'none',
              textAlign: 'center',
              padding: '12px',
            }}
          >
            Back to your twin
          </Link>
        </div>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 36,
            fontStyle: 'italic',
          }}
        >
          One claimed sim per day moves your card by ±1 in a couple of
          attributes. The real test is Tuesday — peer ratings + the night's
          goals do most of the moving.
        </p>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slamIn {
              from { transform: scale(0.7); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `,
        }}
      />
    </div>
  );
}

function CenteredStage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      {children}
    </div>
  );
}

function PulsingDots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: PALETTE.ink,
            animation: `dotPulse 1s ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes dotPulse {
              0%, 60%, 100% { transform: scale(0.8); opacity: 0.4; }
              30% { transform: scale(1.2); opacity: 1; }
            }
          `,
        }}
      />
    </div>
  );
}

function SlideRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 360,
      }}
    >
      {children}
    </div>
  );
}

function SlideAvatar({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <div
      style={{
        animation: `slideUp 0.4s ${delay}ms ease-out backwards`,
      }}
    >
      {children}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `,
        }}
      />
    </div>
  );
}

function ScorersList({
  label,
  team,
  scorers,
  accent,
  highlight,
  revealed,
  revealOrder,
}: {
  label: string;
  team: PlayerData[];
  scorers: Array<{ userId: string; goals: number }>;
  accent: string;
  highlight?: string;
  revealed: number;
  revealOrder: string[];
}) {
  const scorerMap = new Map(scorers.map((s) => [s.userId, s.goals]));
  const revealedSet = new Set(revealOrder.slice(0, revealed));

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {team.map((p) => {
          const goals = scorerMap.get(p.userId) ?? 0;
          const showGoals = goals > 0 && revealedSet.has(p.userId);
          const isMe = p.userId === highlight;
          return (
            <div
              key={p.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 10,
                background: isMe ? 'rgba(212,164,55,0.18)' : 'transparent',
                border: isMe ? `1.5px solid ${PALETTE.mustard}` : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 6,
                transition: 'background 0.3s',
              }}
            >
              <MiniAvatar {...p.avatar} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: PALETTE.ink,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    fontWeight: 600,
                    color: PALETTE.inkLight,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {p.position ?? '—'}
                </div>
              </div>
              {showGoals && (
                <div
                  style={{
                    background: PALETTE.ink,
                    color: PALETTE.cream,
                    padding: '4px 10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    animation: 'tickIn 0.3s ease-out',
                  }}
                >
                  {goals} ⚽
                </div>
              )}
            </div>
          );
        })}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes tickIn {
                from { transform: scale(0); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `,
          }}
        />
      </div>
    </div>
  );
}
