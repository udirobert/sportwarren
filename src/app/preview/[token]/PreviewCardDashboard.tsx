'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { PALETTE } from '../_components/MiniAvatar';
import {
  TYPE,
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

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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

      {/* Keep rating + share + customize CTAs */}
      <div style={{
        ...secStyle(2), display: 'flex', flexDirection: 'column', gap: 8,
        paddingTop: 24, borderTop: `1px solid ${PALETTE.ink}15`,
        marginTop: 16,
      }}>
        {/* Share CTA — only at Tier 2+ (when the PNG has a real card to
            show). The wa.me deep-link pattern matches the existing
            broadcast UI; the card PNG URL pulls the rendered card from
            /api/og/card/[token] which respects the same tier rules. */}
        {tier >= 2 && (
          <ShareToWhatsApp
            baseUrl={baseUrl}
            firstName={(user.name ?? 'Player').split(' ')[0]}
            handle={user.handle ?? null}
            discoverable={user.discoverable ?? false}
            tier={tier}
          />
        )}

        {remainingCombos > 0 && (
          <Link
            href={`/preview/${encodeURIComponent(token)}?mode=quiz`}
            style={{
              fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
              letterSpacing: '-0.01em', textTransform: 'uppercase',
              color: PALETTE.ink, textDecoration: 'none',
              padding: '12px 0', borderBottom: `1px solid ${PALETTE.ink}15`,
              display: 'flex', justifyContent: 'space-between',
            }}
          >
            <span>Rate more lads</span>
            <span style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.inkLight }}>
              {remainingCombos} left
            </span>
          </Link>
        )}
        <Link
          href={`/preview/${encodeURIComponent(token)}/customize`}
          style={{
            fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
            letterSpacing: '-0.01em', textTransform: 'uppercase',
            color: PALETTE.ink, textDecoration: 'none',
            padding: '12px 0', borderBottom: `1px solid ${PALETTE.ink}15`,
          }}
        >
          Pick your kit →
        </Link>
        {isCaptain && (
          <Link
            href={`/preview/${encodeURIComponent(token)}/doctrine`}
            style={{
              fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
              letterSpacing: '-0.01em', textTransform: 'uppercase',
              color: PALETTE.ink, textDecoration: 'none',
              padding: '12px 0', borderBottom: `1px solid ${PALETTE.ink}15`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            }}
          >
            <span>The group&apos;s read →</span>
            <span style={{
              fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.14em', color: PALETTE.red,
            }}>
              CAPTAIN
            </span>
          </Link>
        )}
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
