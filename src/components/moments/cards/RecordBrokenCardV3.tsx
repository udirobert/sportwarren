/**
 * RecordBrokenCardV3 — concept piece for the v3 redesign.
 *
 * Register: editorial football magazine + grassroots ephemera.
 * Palette: Risograph — cream paper, ink black, signal red, deep navy.
 * Type: Antonio Bold (display) + JetBrains Mono (stat + editorial).
 * Iconography: game-icons soccer ball as faded watermark.
 *
 * If this passes the visceral test, propagate to the other 9
 * archetypes with archetype-specific gestures + icons.
 */

import React from 'react';
import { CARD_WIDTH, CARD_HEIGHT, MomentCardProps } from './types';
import { ICONS } from './v3-icons';

// Risograph editorial palette
const CREAM = '#f0e8d6'; // warmer aged paper
const INK = '#0a0a0a';
const INK_2 = '#3a3a3a';
const RED = '#c91022'; // signal red
const NAVY = '#1c3a5e'; // deep editorial navy
const SAGE = '#4a7549'; // grass green for ornament

const HEAD = 'Antonio';
const MONO = 'JetBrains Mono';

export function RecordBrokenCardV3({ moment }: MomentCardProps) {
  const date = moment.createdAt
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <div
      style={{
        display: 'flex',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: CREAM,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Paper vignette — warm at corners */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 0% 0%, rgba(28,58,94,0.06) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(201,16,34,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Soccer ball watermark — faded navy behind the hero stat */}
      <svg
        width="280"
        height="280"
        viewBox={ICONS.ball.viewBox}
        style={{
          position: 'absolute',
          top: 40,
          left: 310,
          opacity: 0.09,
        }}
      >
        <path d={ICONS.ball.d} fill={NAVY} />
      </svg>

      {/* Hero stat — oversized mono numeral, hard right */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 32,
          left: 322,
          fontSize: 240,
          fontFamily: MONO,
          fontWeight: 700,
          lineHeight: 0.85,
          color: INK,
          letterSpacing: '-0.06em',
        }}
      >
        28
      </div>

      {/* Kicker — top-left, red dot + mono caps + jersey number tag */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 34,
          left: 32,
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 7,
            height: 7,
            borderRadius: 3.5,
            background: RED,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontFamily: MONO,
            fontWeight: 700,
            color: NAVY,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Squad Record · Broken
        </span>
        <span
          style={{
            display: 'flex',
            width: 1,
            height: 11,
            background: INK_2,
            opacity: 0.4,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontFamily: MONO,
            fontWeight: 700,
            color: INK_2,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          No. 9 · CF
        </span>
      </div>

      {/* Headline misregistration ghost — navy under-print, Risograph feel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 82,
          left: 34,
          width: 280,
          opacity: 0.22,
        }}
      >
        <span
          style={{
            display: 'flex',
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 0.92,
            color: NAVY,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
          }}
        >
          Most Goals
        </span>
        <span
          style={{
            display: 'flex',
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 0.92,
            color: NAVY,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
          }}
        >
          In a Season
        </span>
      </div>

      {/* Headline — condensed display, 2 deliberate lines */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 80,
          left: 32,
          width: 280,
        }}
      >
        <span
          style={{
            display: 'flex',
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 0.92,
            color: INK,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
          }}
        >
          Most Goals
        </span>
        <span
          style={{
            display: 'flex',
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 0.92,
            color: INK,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
          }}
        >
          In a Season
        </span>
      </div>

      {/* Sub-stat — mono, sage green, with hand-tally counting to 28 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 204,
          left: 32,
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              width: 24,
              height: 2,
              background: SAGE,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: MONO,
              fontWeight: 700,
              color: SAGE,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Previous · 23 set 2019
          </span>
        </div>
        {/* Hand-tally — 28 strokes in groups of 5, with sage tick on the 28th */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 34 }}>
          {[5, 5, 5, 5, 5, 3].map((count, groupIdx) => (
            <div
              key={`tally-${groupIdx}`}
              style={{ display: 'flex', gap: 2, alignItems: 'center' }}
            >
              {Array.from({ length: count }).map((_, i) => {
                const isStrike = i === 4;
                const baseStyle = {
                  display: 'flex' as const,
                  width: 1.5,
                  height: 12,
                  background: groupIdx === 5 && i === 2 ? SAGE : INK,
                  opacity: groupIdx === 5 && i === 2 ? 1 : 0.55,
                };
                return (
                  <div
                    key={`mark-${groupIdx}-${i}`}
                    style={
                      isStrike
                        ? { ...baseStyle, transform: 'rotate(-72deg) translateY(-3px)' }
                        : baseStyle
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 6-attribute stat strip — FIFA-style, on the left lane (no collision with 28) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 258,
          left: 32,
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 9,
              fontFamily: MONO,
              fontWeight: 700,
              color: NAVY,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Twin Stats
          </span>
          <div style={{ display: 'flex', width: 1, height: 9, background: INK_2, opacity: 0.4 }} />
          <span
            style={{
              fontSize: 9,
              fontFamily: MONO,
              fontWeight: 700,
              color: RED,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Clinical Finisher
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          {[
            { k: 'PAC', v: 78 },
            { k: 'SHO', v: 87 },
            { k: 'PAS', v: 71 },
            { k: 'DRI', v: 82 },
            { k: 'DEF', v: 38 },
            { k: 'PHY', v: 74 },
          ].map((stat) => {
            const isHero = stat.k === 'SHO';
            return (
              <div
                key={stat.k}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontFamily: MONO,
                    fontWeight: 700,
                    color: isHero ? RED : INK_2,
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.k}
                </span>
                <div
                  style={{
                    display: 'flex',
                    width: 30,
                    height: 4,
                    background: INK,
                    opacity: 0.18,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: (30 * stat.v) / 99,
                      height: 4,
                      background: isHero ? RED : INK,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: MONO,
                    fontWeight: 700,
                    color: isHero ? RED : INK,
                    letterSpacing: '0.02em',
                  }}
                >
                  {stat.v}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ink splatter — small irregular dots around BROKEN stamp area, print energy */}
      {[
        { x: 268, y: 232, s: 2.5, o: 0.55 },
        { x: 488, y: 244, s: 3.2, o: 0.45 },
        { x: 296, y: 296, s: 1.8, o: 0.6 },
        { x: 462, y: 295, s: 2.2, o: 0.5 },
        { x: 380, y: 232, s: 1.5, o: 0.45 },
        { x: 514, y: 272, s: 2, o: 0.4 },
      ].map((dot, i) => (
        <div
          key={`splatter-${i}`}
          style={{
            display: 'flex',
            position: 'absolute',
            top: dot.y,
            left: dot.x,
            width: dot.s,
            height: dot.s,
            borderRadius: dot.s / 2,
            background: INK,
            opacity: dot.o,
          }}
        />
      ))}

      {/* Ink-stamp BROKEN — angled with offset ink-bleed shadow */}
      {/* Shadow / ink-bleed layer */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 244,
          left: 277,
          padding: '6px 18px 8px',
          background: 'transparent',
          border: `3px solid ${INK}`,
          transform: 'rotate(-7deg)',
          opacity: 0.18,
        }}
      >
        <span
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 42,
            color: INK,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          Broken
        </span>
      </div>
      {/* Main stamp */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 242,
          left: 280,
          padding: '6px 18px 8px',
          background: 'transparent',
          border: `3px solid ${RED}`,
          transform: 'rotate(-7deg)',
          opacity: 0.94,
        }}
      >
        <span
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 42,
            color: RED,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          Broken
        </span>
      </div>

      {/* Hand-drawn broken rule — irregular segments + sage ornament */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 318,
          left: 32,
          width: 536,
          height: 4,
          alignItems: 'center',
          gap: 0,
        }}
      >
        <div style={{ display: 'flex', width: 100, height: 3, background: INK }} />
        <div style={{ display: 'flex', width: 6 }} />
        <div style={{ display: 'flex', width: 60, height: 2, background: INK, opacity: 0.8 }} />
        <div style={{ display: 'flex', width: 10 }} />
        <div style={{ display: 'flex', width: 6, height: 6, borderRadius: 3, background: SAGE }} />
        <div style={{ display: 'flex', width: 10 }} />
        <div style={{ display: 'flex', width: 160, height: 3, background: INK }} />
        <div style={{ display: 'flex', width: 6 }} />
        <div style={{ display: 'flex', width: 48, height: 2, background: INK, opacity: 0.65 }} />
        <div style={{ display: 'flex', width: 8 }} />
        <div style={{ display: 'flex', width: 90, height: 2.5, background: INK }} />
      </div>

      {/* Byline — editorial mono, includes attestation chain in the line */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 336,
          left: 32,
          width: 536,
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            color: INK,
          }}
        >
          Marcus Tate
        </span>
        <span
          style={{
            display: 'flex',
            padding: '1px 5px',
            fontSize: 8,
            fontFamily: MONO,
            fontWeight: 700,
            color: CREAM,
            background: NAVY,
            letterSpacing: '0.12em',
          }}
        >
          ATTESTED
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 600,
            color: INK_2,
            letterSpacing: '0.04em',
          }}
        >
          9 of 11 peers · Ref. J. Keegan
        </span>
      </div>

      {/* Editorial footer with masthead */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 24,
          left: 32,
          right: 32,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO,
              fontWeight: 700,
              color: INK,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            SportWarren
          </span>
          <span
            style={{
              display: 'flex',
              width: 3,
              height: 3,
              borderRadius: 1.5,
              background: RED,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO,
              fontWeight: 600,
              color: NAVY,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Vol. III · No. 028
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO,
              fontWeight: 700,
              color: SAGE,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Rep · 847
          </span>
          <span
            style={{
              display: 'flex',
              width: 3,
              height: 3,
              borderRadius: 1.5,
              background: INK_2,
              opacity: 0.4,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO,
              fontWeight: 600,
              color: INK_2,
              letterSpacing: '0.2em',
            }}
          >
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}
