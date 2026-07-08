'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PALETTE } from '../_components/MiniAvatar';
import { storePreviewClaim } from '@/lib/preview-claim';
import {
  TYPE,
  TRACKING,
  buildPlayerCardData,
  type Attrs,
} from '@/components/v3';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';
import { ATTRIBUTE_KEYS } from '@/server/services/personalization/twin-types';
import { PerceptionBars } from '@/components/perception/PerceptionBars';
import type {
  PerceptionAggregate,
  ChoiceCounts,
} from '@/server/services/perception/aggregate';

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

const STYLE_ID = 'pcd-anim';
function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes swSlideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes swBarGrow {
      from { transform: scaleX(0); }
    }
    .pcd-blur { filter: blur(6px); pointer-events: none; user-select: none; }
    .pcd-overlay { opacity: 0; animation: swSlideUp 400ms cubic-bezier(0.23,1,0.32,1) forwards; }
    .pcd-slide { opacity: 0; animation: swSlideUp 400ms cubic-bezier(0.23,1,0.32,1) forwards; }

    @media (prefers-reduced-motion: reduce) {
      .pcd-blur { filter: none; }
      .pcd-slide, .pcd-overlay { opacity: 1; transform: none; animation: none; }
      [style*="transition"] { transition: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export function PreviewCardDashboard({
  user, rater, squad, baseUrl, token,
  perceptionsGiven, perceptionsReceived, uniquePerceivers, tier, remainingCombos,
  squadTwins, lastSession, aggregate, scenarios, isCaptain = false,
}: {
  user: any;
  rater: any;
  squad: any;
  baseUrl: string;
  token: string;
  perceptionsGiven: number;
  perceptionsReceived: number;
  uniquePerceivers: number;
  tier: number;
  remainingCombos: number;
  squadTwins: Array<{ profileId: string; baseAttributes: unknown }>;
  lastSession: any;
  aggregate: PerceptionAggregate;
  scenarios: Array<{ id: string; prompt: string; context?: string; hasPrescriptive: boolean; options: Array<{ id: string; label: string }> }>;
  isCaptain?: boolean;
}) {
  const injected = useRef(false);
  if (!injected.current) { injectStyles(); injected.current = true; }

  const router = useRouter();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleKeepCard = () => {
    storePreviewClaim({
      previewToken: token,
      userId: user.id,
      name: user.name ?? null,
      squadName: squad.name ?? null,
    });
    router.push('/?claim=preview');
  };

  const profile = user.playerProfile;
  const myAttrs: Attrs = (profile?.twin?.baseAttributes as Attrs | null) ?? baselineForPosition(user.position);
  const myLevel = profile?.twin?.level ?? 1;
  const overall = computeOverall(myAttrs, user.position, myLevel, profile?.twin?.prestige ?? 0);

  const groupByAttr: Record<string, number[]> = { pace: [], shooting: [], passing: [], dribbling: [], defending: [], physical: [] };
  for (const t of squadTwins) {
    if (t.profileId === rater.id) continue;
    const attrs = t.baseAttributes as Attrs | null;
    if (!attrs) continue;
    for (const k of ATTRIBUTE_KEYS) {
      if (typeof attrs[k] === 'number') groupByAttr[k].push(attrs[k]);
    }
  }
  const groupAvgByAttr: Partial<Record<string, number>> = {};
  for (const k of ATTRIBUTE_KEYS) {
    if (groupByAttr[k].length > 0) {
      groupAvgByAttr[k] = Math.round(groupByAttr[k].reduce((s: number, v: number) => s + v, 0) / groupByAttr[k].length);
    }
  }

  const playerStats = lastSession?.playerStats?.find((s: any) => s.profileId === rater.id);
  const goals = playerStats?.goals ?? 0;
  const sessionLeaderboard = lastSession?.playerStats ?? [];
  const playersAhead = sessionLeaderboard.filter((s: any) => s.goals > goals).length;
  const sessionRank = playerStats ? playersAhead + 1 : null;

  const nextTierLabel = tier === 1
    ? `Rate ${10 - perceptionsGiven} more to unlock your full card`
    : tier === 2
    ? `Rate ${20 - perceptionsGiven} more to see what the lads said`
    : null;

  const secStyle = (step: number): React.CSSProperties => ({
    opacity: phase >= step ? 1 : 0,
    transform: phase >= step ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 400ms ${EASE_OUT} ${step * 100}ms, transform 400ms ${EASE_OUT} ${step * 100}ms`,
  });

  return (
    <div style={{ background: PALETTE.cream, minHeight: '100vh', padding: '48px 24px' }}>
      {/* Header */}
      <div style={secStyle(0)}>
        <p style={{
          fontFamily: TYPE.mono, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: PALETTE.navy, marginBottom: 6,
        }}>
          {squad.name}
        </p>
        <h1 style={{
          fontFamily: TYPE.display, fontSize: 36, fontWeight: 800,
          lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase',
          color: PALETTE.ink, margin: 0,
        }}>
          {user.name}
        </h1>
      </div>

      {/* Perception summary */}
      <div style={{ ...secStyle(0), marginTop: 24, marginBottom: 32 }}>
        <p style={{
          fontFamily: TYPE.mono, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: PALETTE.inkLight, marginBottom: 4,
        }}>
          Perception
        </p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
          <span style={{
            fontFamily: TYPE.display, fontSize: 40, fontWeight: 800,
            lineHeight: 1, letterSpacing: '-0.02em', color: PALETTE.navy,
          }}>
            {perceptionsReceived}
          </span>
          <span style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.inkLight }}>
            lads rated you
          </span>
        </div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 10, color: PALETTE.inkLight, marginTop: 4 }}>
          You rated {perceptionsGiven} · {uniquePerceivers} unique voices
        </div>
      </div>

      {/* Overall badge — blurred on Tier 1 */}
      <div style={secStyle(1)}>
        <div className={tier === 1 ? 'pcd-blur' : ''} style={{
          background: PALETTE.ink, color: PALETTE.cream, padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative',
        }}>
          <div>
            <p style={{
              fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              opacity: 0.7, margin: 0,
            }}>
              Overall rating · L{myLevel}
            </p>
            <p style={{
              fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
              margin: '4px 0 0', opacity: 0.85,
            }}>
              {user.position ?? '—'} · {sessionRank ? `#${sessionRank} last week` : 'No games yet'}
            </p>
          </div>
          <span style={{
            fontFamily: TYPE.display, fontSize: 56, fontWeight: 800,
            lineHeight: 0.9, letterSpacing: '-0.03em', color: PALETTE.mustard,
          }}>
            {overall}
          </span>
        </div>
        {tier === 1 && (
          <div style={{
            marginTop: 8, fontFamily: TYPE.mono, fontSize: 10,
            color: PALETTE.inkLight, textAlign: 'center',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {nextTierLabel}
          </div>
        )}
      </div>

      {/* Attribute bars — empty outlines on Tier 1, filled on Tiers 2-3 */}
      <div style={{ ...secStyle(2), display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
        {ATTRIBUTE_KEYS.map((key, i) => {
          const value = myAttrs[key] ?? 50;
          const groupVal = groupAvgByAttr[key];
          const comp = typeof groupVal === 'number'
            ? (value > groupVal ? `+${value - groupVal} vs squad` : value < groupVal ? `${value - groupVal} vs squad` : 'parity')
            : null;
          const accent = ({ pace: 'mustard', shooting: 'red', passing: 'navy', dribbling: 'sage', defending: 'navy', physical: 'red' } as const)[key];
          const accentColor = PALETTE[accent];

          return (
            <div key={key}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4,
              }}>
                <span style={{
                  fontFamily: TYPE.display, fontSize: 18, fontWeight: 800,
                  letterSpacing: '-0.01em', color: tier === 1 ? PALETTE.inkLight : accentColor,
                }}>
                  {key.toUpperCase().slice(0, 3)}
                </span>
                <span style={{
                  fontFamily: TYPE.display, fontSize: 24, fontWeight: 800,
                  lineHeight: 1, letterSpacing: '-0.02em', color: tier === 1 ? PALETTE.inkLight : PALETTE.ink,
                }}>
                  {tier === 1 ? '·' : value}
                </span>
                {tier >= 2 && comp && (
                  <span style={{
                    fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: PALETTE.inkLight, marginLeft: 'auto',
                  }}>
                    {comp}
                  </span>
                )}
              </div>
              <div style={{ position: 'relative', width: '100%', height: 5, background: 'rgba(0,0,0,0.06)' }}>
                {tier >= 2 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    transform: `scaleX(${Math.max(0, Math.min(99, value)) / 100})`,
                    transformOrigin: 'left',
                    background: accentColor,
                    transition: `transform 500ms ${EASE_OUT} ${120 + i * 80}ms`,
                  }} />
                )}
                {typeof groupVal === 'number' && (
                  <div style={{
                    position: 'absolute', top: -2, left: `${Math.max(0, Math.min(99, groupVal))}%`,
                    width: 2, height: 9, background: PALETTE.ink, transform: 'translateX(-1px)',
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next tier lock indicator */}
      {tier < 3 && nextTierLabel && (
        <div style={{ ...secStyle(2), marginBottom: 16 }}>
          <Link
            href={`/preview/${encodeURIComponent(token)}?mode=quiz`}
            style={{
              display: 'block', width: '100', textAlign: 'center' as const,
              fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: PALETTE.navy, textDecoration: 'none',
              padding: '12px 0', border: `1px solid ${PALETTE.navy}30`,
            }}
          >
            {nextTierLabel} →
          </Link>
        </div>
      )}

      {/* Tier 3 — perception report inline */}
      {tier >= 3 && (
        <div style={secStyle(2)}>
          <p style={{
            fontFamily: TYPE.mono, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: PALETTE.navy, marginBottom: 16,
          }}>
            What the lads said about you
          </p>
          <PerceptionBars aggregate={aggregate} scenarios={scenarios} />
        </div>
      )}

      {/* ── "What if I..." — attribute projection sandbox (Tier 2+) ── */}
      {tier >= 2 && (
        <div style={{...secStyle(2), marginBottom: 16}}>
          <details>
            <summary
              style={{
                cursor: 'pointer',
                listStyle: 'none',
                fontFamily: TYPE.display,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: PALETTE.ink,
                padding: '12px 14px',
                border: `1.5px solid ${PALETTE.ink}30`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>What if I…</span>
              <span style={{fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: PALETTE.inkLight,}}>
                PROJECT
              </span>
            </summary>
            <div style={{padding: '14px 14px 0', borderLeft: `1.5px solid ${PALETTE.ink}30`, borderRight: `1.5px solid ${PALETTE.ink}30`, borderBottom: `1.5px solid ${PALETTE.ink}30`}}>
              <p style={{fontFamily: TYPE.mono, fontSize: 10, color: PALETTE.inkLight, lineHeight: 1.5, marginBottom: 12}}>
                Slide the bars to project how your card would change if you
                focused on different attributes. These are just projections —
                real movement comes from drills, matches, and peer ratings.
              </p>
              <WhatIfSliders
                currentAttrs={myAttrs}
                position={user.position}
                level={myLevel}
                prestige={profile?.twin?.prestige ?? 0}
              />
            </div>
          </details>
        </div>
      )}

      {/* ── Primary CTAs — clubhouse first, then rate, rest tertiary ── */}
      <div style={{
        ...secStyle(2), display: 'flex', flexDirection: 'column', gap: 8,
        paddingTop: 24, borderTop: `1px solid ${PALETTE.ink}15`,
        marginTop: 16,
      }}>
        {/* Share CTA — only at Tier 2+ */}
        {tier >= 2 && (
          <ShareToWhatsApp
            baseUrl={baseUrl}
            firstName={(user.name ?? 'Player').split(' ')[0]}
            handle={user.handle ?? null}
            discoverable={user.discoverable ?? false}
            tier={tier}
          />
        )}

        {/* PRIMARY: Clubhouse — the squad home. The destination the lads
            keep coming back to. Highest prominence. */}
        <Link
          href={`/preview/${encodeURIComponent(token)}/squad`}
          style={{
            fontFamily: TYPE.display,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: PALETTE.ink,
            textDecoration: 'none',
            padding: '18px 20px',
            background: PALETTE.mustard,
            border: `2px solid ${PALETTE.red}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <span>The clubhouse</span>
          <span style={{
            fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', opacity: 0.7,
          }}>
            THE SQUAD →
          </span>
        </Link>

        {/* SECONDARY: Rate more lads */}
        {remainingCombos > 0 && (
          <Link
            href={`/preview/${encodeURIComponent(token)}?mode=quiz`}
            style={{
              fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
              letterSpacing: '-0.01em', textTransform: 'uppercase',
              color: PALETTE.ink, textDecoration: 'none',
              padding: '12px 16px',
              border: `2px solid ${PALETTE.navy}`,
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span>Rate more lads</span>
            <span style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.inkLight }}>
              {remainingCombos} left
            </span>
          </Link>
        )}

        {/* TERTIARY: remaining links — smaller, subdued */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '4px 0' }}>
          <Link
            href={`/preview/${encodeURIComponent(token)}/customize`}
            style={{
              fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
              letterSpacing: TRACKING.cap, textTransform: 'uppercase',
              color: PALETTE.inkLight, textDecoration: 'none',
              padding: '6px 0',
            }}
          >
            Pick your kit
          </Link>
          {isCaptain && (
            <Link
              href={`/preview/${encodeURIComponent(token)}/doctrine`}
              style={{
                fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
                letterSpacing: TRACKING.cap, textTransform: 'uppercase',
                color: PALETTE.inkLight, textDecoration: 'none',
                padding: '6px 0',
              }}
            >
              The group&apos;s read
            </Link>
          )}
          <Link
            href={`/preview/${encodeURIComponent(token)}/drill`}
            style={{
              fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
              letterSpacing: TRACKING.cap, textTransform: 'uppercase',
              color: PALETTE.inkLight, textDecoration: 'none',
              padding: '6px 0',
            }}
          >
            Daily drill
          </Link>
          <Link
            href={`/preview/${encodeURIComponent(token)}/sim`}
            style={{
              fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700,
              letterSpacing: TRACKING.cap, textTransform: 'uppercase',
              color: PALETTE.inkLight, textDecoration: 'none',
              padding: '6px 0',
            }}
          >
            Match sim
          </Link>
        </div>
      </div>

      {/* Auth explanation + claim bridge */}
      <div style={{ ...secStyle(2), marginTop: 32, paddingTop: 24, borderTop: `1px solid ${PALETTE.ink}15` }}>
        <p style={{
          fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: PALETTE.inkLight, marginBottom: 8,
        }}>
          Your private link
        </p>
        <p style={{
          fontFamily: TYPE.mono, fontSize: 11, lineHeight: 1.55,
          color: PALETTE.inkLight, marginBottom: 16, maxWidth: 400,
        }}>
          The captain sent this link to your WhatsApp. Only you have it —
          it's how the app knows it's you. No password needed.
        </p>
        <button
          onClick={handleKeepCard}
          style={{
            fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
            letterSpacing: '-0.01em', textTransform: 'uppercase',
            color: PALETTE.navy, textDecoration: 'none',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span>Keep your card forever →</span>
          <span style={{
            fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em', color: PALETTE.sage,
          }}>
            CONNECT
          </span>
        </button>
      </div>
    </div>
  );
}

/**
 * Share-to-WhatsApp CTA. Opens wa.me with a pre-filled message linking
 * to the player's PUBLIC profile (/player/{handle}) — that page has
 * og:image pointing at /api/og/card/{token}, so WhatsApp unfurls the
 * card visually AND tapping the unfurl lands the recipient on a real
 * page with a CTA, not a raw PNG endpoint.
 *
 * Fallbacks:
 *   - If the player has no handle (collision or hasn't been set), use
 *     the homepage as the landing — still gets a generic SportWarren
 *     unfurl, recipient lands somewhere coherent.
 *   - If the player isn't discoverable, /player/{handle} would 404 —
 *     same fallback to the homepage to avoid a dead link in the wild.
 */
/**
 * "What if I…" — attribute projection sliders for the dashboard.
 * Lets players play with their stats in a sandbox (no persistence).
 * Reintroduces the homepage's IKEA effect into the authenticated experience.
 */
function WhatIfSliders({
  currentAttrs,
  position,
  level,
  prestige,
}: {
  currentAttrs: Attrs;
  position: string | null;
  level: number;
  prestige: number;
}) {
  const [deltas, setDeltas] = useState<Partial<Record<typeof ATTRIBUTE_KEYS[number], number>>>({});

  const projectedAttrs: Attrs = { ...currentAttrs };
  for (const k of ATTRIBUTE_KEYS) {
    const d = deltas[k] ?? 0;
    projectedAttrs[k] = Math.max(1, Math.min(99, currentAttrs[k] + d));
  }
  const projectedOverall = computeOverall(projectedAttrs, position, level, prestige);
  const currentOverall = computeOverall(currentAttrs, position, level, prestige);
  const overallDelta = projectedOverall - currentOverall;

  const handleChange = (key: typeof ATTRIBUTE_KEYS[number], value: number) => {
    setDeltas((prev) => {
      const next = { ...prev };
      if (value === 0) {
        delete next[key];
      } else {
        next[key] = Math.max(-10, Math.min(10, value));
      }
      return next;
    });
  };

  const resetAll = () => setDeltas({});
  const hasChanges = Object.keys(deltas).length > 0;

  const accent = ({
    pace: 'mustard', shooting: 'red', passing: 'navy',
    dribbling: 'sage', defending: 'navy', physical: 'red',
  } as const);

  return (
    <div>
      {/* Projected overall banner */}
      <div
        style={{
          background: PALETTE.ink,
          color: PALETTE.cream,
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <span style={{ fontFamily: TYPE.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.8 }}>
          Projected Overall
        </span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: TYPE.display, fontSize: 28, fontWeight: 800, lineHeight: 1, color: PALETTE.mustard }}>
            {projectedOverall}
          </span>
          {hasChanges && (
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 11,
                fontWeight: 700,
                color: overallDelta > 0 ? PALETTE.sage : overallDelta < 0 ? PALETTE.red : PALETTE.inkLight,
              }}
            >
              {overallDelta > 0 ? '+' : ''}{overallDelta}
            </span>
          )}
        </span>
      </div>

      {/* Attribute sliders */}
      {ATTRIBUTE_KEYS.map((key) => {
        const current = currentAttrs[key];
        const delta = deltas[key] ?? 0;
        const projected = projectedAttrs[key];
        return (
          <div key={key} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
              <span style={{ fontFamily: TYPE.display, fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', color: PALETTE[accent[key]] }}>
                {key.toUpperCase().slice(0, 3)}
              </span>
              <span style={{ fontFamily: TYPE.mono, fontSize: 11, fontWeight: 700, color: PALETTE.ink }}>
                {projected}
                {delta !== 0 && (
                  <span style={{ color: delta > 0 ? PALETTE.sage : PALETTE.red, marginLeft: 4 }}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="range"
                min={-10}
                max={10}
                step={1}
                value={delta}
                onChange={(e) => handleChange(key, parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  height: 4,
                  appearance: 'none',
                  background: `linear-gradient(to right, ${PALETTE[accent[key]]} ${((delta + 10) / 20) * 100}%, rgba(0,0,0,0.08) ${((delta + 10) / 20) * 100}%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: TYPE.mono, fontSize: 8, color: PALETTE.inkLight, marginTop: 2 }}>
                <span>-10</span>
                <span style={{ fontFamily: TYPE.mono, fontSize: 8, fontWeight: 700, color: PALETTE.inkLight }}>
                  {current} base
                </span>
                <span>+10</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Revert button */}
      {hasChanges && (
        <button
          onClick={resetAll}
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: PALETTE.red,
            background: 'transparent',
            border: `1px solid ${PALETTE.red}40`,
            padding: '6px 12px',
            cursor: 'pointer',
            marginTop: 6,
            width: '100%',
          }}
        >
          Revert to current
        </button>
      )}
    </div>
  );
}

function ShareToWhatsApp({
  baseUrl,
  firstName,
  handle,
  discoverable,
  tier,
}: {
  baseUrl: string;
  firstName: string;
  handle: string | null;
  discoverable: boolean;
  tier: number;
}) {
  // Pick the landing URL — public profile if available + discoverable,
  // else the marketing homepage. Never link to the preview token URL
  // (that's an auth surface and must not leak into shared chat).
  const landingUrl = handle && discoverable
    ? `${baseUrl}/player/${encodeURIComponent(handle)}`
    : baseUrl;

  // Single URL in the message — WhatsApp unfurls the first link it
  // encounters by reading the page's og:* meta tags. /player/{handle}
  // sets og:image to the satori PNG, so the recipient sees the card
  // preview and the tap lands them on the profile.
  const message =
    tier >= 3
      ? `My SportWarren card — the lads have spoken. Rate me back + build yours: ${landingUrl}`
      : `My SportWarren card. Rate the lads + build yours: ${landingUrl}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: TYPE.display,
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        color: PALETTE.ink,
        textDecoration: 'none',
        padding: '14px 16px',
        background: PALETTE.mustard,
        border: `2px solid ${PALETTE.red}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span>Share my card to WhatsApp</span>
      <span
        style={{
          fontFamily: TYPE.mono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: PALETTE.ink,
          opacity: 0.7,
        }}
      >
        {firstName.toUpperCase()} →
      </span>
    </a>
  );
}
