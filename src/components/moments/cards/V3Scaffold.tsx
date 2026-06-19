/**
 * V3Scaffold — shared building blocks for the V3 card system.
 *
 * The visual register is locked in:
 *   - Cream Risograph paper with vignette
 *   - Antonio (display) + JetBrains Mono (data)
 *   - 5-color palette: cream, ink, red, navy, sage
 *   - Per-archetype Iconify watermark
 *   - Misregistration ghost on headline
 *   - Hand-drawn broken rule + ink splatter + tally marks
 *   - Editorial masthead with VOL · NO · REP · date
 *
 * Each archetype card composes these blocks with its own content.
 */

import React from 'react';
import { ICONS } from './v3-icons';

export const V3 = {
  CREAM: '#f0e8d6',
  INK: '#0a0a0a',
  INK_2: '#3a3a3a',
  RED: '#c91022',
  NAVY: '#1c3a5e',
  SAGE: '#4a7549',
  // Celebratory accent — used only on milestone/champion archetypes
  MUSTARD: '#d4a437',
  // Skin/hair palette (for avatars — keep flexibility for the customization UI)
  SKIN_LIGHT: '#f0d4b8',
  SKIN_MID: '#c89e7c',
  SKIN_DARK: '#8b5a3c',
  HAIR_DARK: '#2a1a10',
  HAIR_BROWN: '#5c3a1a',
  HAIR_BLOND: '#c89048',
  HAIR_RED: '#a64a20',
} as const;

export const HEAD = 'Antonio';
export const MONO = 'JetBrains Mono';

export type IconKey = keyof typeof ICONS;

/**
 * SunburstRays — celebratory radial lines emanating from a focal point.
 * Used behind hero stats on milestone archetypes.
 */
export function SunburstRays({
  cx,
  cy,
  rayCount = 12,
  innerR = 60,
  outerR = 320,
  color = V3.MUSTARD,
  opacity = 0.18,
}: {
  cx: number;
  cy: number;
  rayCount?: number;
  innerR?: number;
  outerR?: number;
  color?: string;
  opacity?: number;
}) {
  // Rays drawn as long thin rectangles, rotated radially.
  const rays = Array.from({ length: rayCount }).map((_, i) => {
    const angle = (i * 360) / rayCount;
    return { angle, w: 3, h: outerR - innerR };
  });
  return (
    <>
      {rays.map((r, i) => (
        <div
          key={`ray-${i}`}
          style={{
            display: 'flex',
            position: 'absolute',
            top: cy - r.h / 2,
            left: cx - r.w / 2,
            width: r.w,
            height: r.h,
            background: color,
            opacity: opacity * (i % 2 === 0 ? 1 : 0.6),
            transform: `rotate(${r.angle}deg) translateY(-${innerR + r.h / 2}px)`,
            transformOrigin: 'center bottom',
          }}
        />
      ))}
    </>
  );
}

/**
 * Confetti — scattered small dots in multi-color palette.
 * Used on celebratory archetypes.
 */
export function Confetti({
  dots,
}: {
  dots: { x: number; y: number; s: number; color: string; opacity?: number }[];
}) {
  return (
    <>
      {dots.map((dot, i) => (
        <div
          key={`confetti-${i}`}
          style={{
            display: 'flex',
            position: 'absolute',
            top: dot.y,
            left: dot.x,
            width: dot.s,
            height: dot.s,
            borderRadius: dot.s / 2,
            background: dot.color,
            opacity: dot.opacity ?? 0.8,
          }}
        />
      ))}
    </>
  );
}

/**
 * RibbonBars — small colored squares like a championship rosette.
 * Visible top-edge accent for celebratory archetypes.
 */
export function RibbonBars({
  top = 0,
  left = 32,
  colors = [V3.MUSTARD, V3.RED, V3.SAGE, V3.NAVY],
}: {
  top?: number;
  left?: number;
  colors?: readonly string[];
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left,
        height: 4,
        gap: 4,
      }}
    >
      {colors.map((c, i) => (
        <div
          key={`ribbon-${i}`}
          style={{ display: 'flex', width: 28, height: 4, background: c }}
        />
      ))}
    </div>
  );
}

/**
 * Standard sample confetti positions for a 600x400 card.
 * Spread across the canvas with multi-color variation.
 */
export const CELEBRATORY_CONFETTI = [
  { x: 60, y: 28, s: 4, color: V3.MUSTARD, opacity: 0.85 },
  { x: 180, y: 18, s: 3, color: V3.RED, opacity: 0.7 },
  { x: 250, y: 38, s: 5, color: V3.SAGE, opacity: 0.65 },
  { x: 460, y: 22, s: 3, color: V3.NAVY, opacity: 0.6 },
  { x: 540, y: 50, s: 4, color: V3.MUSTARD, opacity: 0.7 },
  { x: 70, y: 360, s: 5, color: V3.RED, opacity: 0.65 },
  { x: 170, y: 372, s: 3, color: V3.MUSTARD, opacity: 0.75 },
  { x: 380, y: 358, s: 4, color: V3.SAGE, opacity: 0.7 },
  { x: 490, y: 372, s: 3, color: V3.NAVY, opacity: 0.5 },
  { x: 545, y: 350, s: 5, color: V3.MUSTARD, opacity: 0.75 },
  { x: 20, y: 200, s: 3, color: V3.RED, opacity: 0.55 },
  { x: 575, y: 200, s: 3, color: V3.MUSTARD, opacity: 0.6 },
];

export function PaperBg() {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse at 0% 0%, rgba(28,58,94,0.06) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(201,16,34,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.04) 0%, transparent 70%)',
      }}
    />
  );
}

export function IconWatermark({
  icon,
  top,
  left,
  size = 280,
  color = V3.NAVY,
  opacity = 0.09,
}: {
  icon: IconKey;
  top: number;
  left: number;
  size?: number;
  color?: string;
  opacity?: number;
}) {
  const ic = ICONS[icon];
  return (
    <svg
      width={size}
      height={size}
      viewBox={ic.viewBox}
      style={{ position: 'absolute', top, left, opacity }}
    >
      <path d={ic.d} fill={color} />
    </svg>
  );
}

export function KickerLine({
  label,
  position,
  hype,
  hypeColor = V3.RED,
}: {
  label: string;
  position?: string;
  hype?: string;
  hypeColor?: string;
}) {
  return (
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
          background: hypeColor,
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontFamily: MONO,
          fontWeight: 700,
          color: V3.NAVY,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {position && (
        <>
          <span
            style={{
              display: 'flex',
              width: 1,
              height: 11,
              background: V3.INK_2,
              opacity: 0.4,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO,
              fontWeight: 700,
              color: V3.INK_2,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {position}
          </span>
        </>
      )}
    </div>
  );
}

export function MisregistrationHeadline({
  lines,
  top = 80,
  left = 32,
  width = 280,
  fontSize = 56,
}: {
  lines: string[];
  top?: number;
  left?: number;
  width?: number;
  fontSize?: number;
}) {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    fontFamily: HEAD,
    fontWeight: 700,
    fontSize,
    lineHeight: 0.92,
    letterSpacing: '-0.015em',
    textTransform: 'uppercase',
  };
  return (
    <>
      {/* Misregistration ghost — navy under-print */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: top + 2,
          left: left + 2,
          width,
          opacity: 0.22,
        }}
      >
        {lines.map((line, i) => (
          <span key={`ghost-${i}`} style={{ ...baseStyle, color: V3.NAVY }}>
            {line}
          </span>
        ))}
      </div>
      {/* Main */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top,
          left,
          width,
        }}
      >
        {lines.map((line, i) => (
          <span key={`head-${i}`} style={{ ...baseStyle, color: V3.INK }}>
            {line}
          </span>
        ))}
      </div>
    </>
  );
}

export function SubStat({
  label,
  top = 204,
  left = 32,
  color = V3.SAGE,
}: {
  label: string;
  top?: number;
  left?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left,
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', width: 24, height: 2, background: color }} />
      <span
        style={{
          fontSize: 11,
          fontFamily: MONO,
          fontWeight: 700,
          color,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function TallyMarks({
  count,
  highlightIdx,
  top = 228,
  left = 66,
  color = V3.INK,
  highlightColor = V3.SAGE,
}: {
  count: number;
  highlightIdx?: number;
  top?: number;
  left?: number;
  color?: string;
  highlightColor?: string;
}) {
  // Render in groups of 5 (4 verticals + 1 strike)
  const groups: number[] = [];
  let remaining = count;
  while (remaining > 0) {
    groups.push(Math.min(5, remaining));
    remaining -= 5;
  }
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left,
        alignItems: 'center',
        gap: 4,
      }}
    >
      {groups.map((groupCount, groupIdx) => (
        <div
          key={`tally-${groupIdx}`}
          style={{ display: 'flex', gap: 2, alignItems: 'center' }}
        >
          {Array.from({ length: groupCount }).map((_, i) => {
            const overallIdx = groupIdx * 5 + i;
            const isHero = overallIdx === highlightIdx;
            const base = {
              display: 'flex' as const,
              width: 1.5,
              height: 12,
              background: isHero ? highlightColor : color,
              opacity: isHero ? 1 : 0.55,
            };
            const isStrike = i === 4;
            return (
              <div
                key={`mark-${groupIdx}-${i}`}
                style={
                  isStrike
                    ? { ...base, transform: 'rotate(-72deg) translateY(-3px)' }
                    : base
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function InkStamp({
  text,
  top,
  left,
  color = V3.RED,
  rotation = -7,
  fontSize = 42,
}: {
  text: string;
  top: number;
  left: number;
  color?: string;
  rotation?: number;
  fontSize?: number;
}) {
  return (
    <>
      {/* Shadow / ink-bleed */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: top + 2,
          left: left - 3,
          padding: '6px 18px 8px',
          background: 'transparent',
          border: `3px solid ${V3.INK}`,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.18,
        }}
      >
        <span
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize,
            color: V3.INK,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      </div>
      {/* Main stamp */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top,
          left,
          padding: '6px 18px 8px',
          background: 'transparent',
          border: `3px solid ${color}`,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.94,
        }}
      >
        <span
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize,
            color,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      </div>
    </>
  );
}

export function InkSplatter({
  dots,
}: {
  dots: { x: number; y: number; s: number; o: number }[];
}) {
  return (
    <>
      {dots.map((dot, i) => (
        <div
          key={`splat-${i}`}
          style={{
            display: 'flex',
            position: 'absolute',
            top: dot.y,
            left: dot.x,
            width: dot.s,
            height: dot.s,
            borderRadius: dot.s / 2,
            background: V3.INK,
            opacity: dot.o,
          }}
        />
      ))}
    </>
  );
}

export type TwinStat = { k: string; v: number; delta?: number };

export function TwinStatStrip({
  stats,
  heroKey,
  hypeTag,
  top = 258,
  left = 32,
  accent = V3.RED,
}: {
  stats: TwinStat[];
  heroKey?: string;
  hypeTag?: string;
  top?: number;
  left?: number;
  accent?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top,
        left,
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 9,
            fontFamily: MONO,
            fontWeight: 700,
            color: V3.NAVY,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Twin Stats
        </span>
        {hypeTag && (
          <>
            <div
              style={{
                display: 'flex',
                width: 1,
                height: 9,
                background: V3.INK_2,
                opacity: 0.4,
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontFamily: MONO,
                fontWeight: 700,
                color: accent,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              {hypeTag}
            </span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        {stats.map((stat) => {
          const isHero = stat.k === heroKey;
          return (
            <div
              key={stat.k}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontFamily: MONO,
                  fontWeight: 700,
                  color: isHero ? accent : V3.INK_2,
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
                  background: V3.INK,
                  opacity: 0.18,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: (30 * stat.v) / 99,
                    height: 4,
                    background: isHero ? accent : V3.INK,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: MONO,
                    fontWeight: 700,
                    color: isHero ? accent : V3.INK,
                    letterSpacing: '0.02em',
                  }}
                >
                  {stat.v}
                </span>
                {stat.delta !== undefined && (
                  <span
                    style={{
                      fontSize: 7,
                      fontFamily: MONO,
                      fontWeight: 700,
                      color: stat.delta > 0 ? V3.SAGE : V3.RED,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {stat.delta > 0 ? `+${stat.delta}` : `${stat.delta}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BrokenRule({ top = 318 }: { top?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left: 32,
        width: 536,
        height: 4,
        alignItems: 'center',
        gap: 0,
      }}
    >
      <div style={{ display: 'flex', width: 100, height: 3, background: V3.INK }} />
      <div style={{ display: 'flex', width: 6 }} />
      <div style={{ display: 'flex', width: 60, height: 2, background: V3.INK, opacity: 0.8 }} />
      <div style={{ display: 'flex', width: 10 }} />
      <div style={{ display: 'flex', width: 6, height: 6, borderRadius: 3, background: V3.SAGE }} />
      <div style={{ display: 'flex', width: 10 }} />
      <div style={{ display: 'flex', width: 160, height: 3, background: V3.INK }} />
      <div style={{ display: 'flex', width: 6 }} />
      <div style={{ display: 'flex', width: 48, height: 2, background: V3.INK, opacity: 0.65 }} />
      <div style={{ display: 'flex', width: 8 }} />
      <div style={{ display: 'flex', width: 90, height: 2.5, background: V3.INK }} />
    </div>
  );
}

export function AttestationByline({
  player,
  attestation,
  top = 336,
}: {
  player: string;
  attestation: string;
  top?: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left: 32,
        width: 536,
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: V3.INK }}
      >
        {player}
      </span>
      <span
        style={{
          display: 'flex',
          padding: '1px 5px',
          fontSize: 8,
          fontFamily: MONO,
          fontWeight: 700,
          color: V3.CREAM,
          background: V3.NAVY,
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
          color: V3.INK_2,
          letterSpacing: '0.04em',
        }}
      >
        {attestation}
      </span>
    </div>
  );
}

export function EditorialFooter({
  no,
  rep,
  date,
}: {
  no: string;
  rep?: number;
  date: string;
}) {
  return (
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
            color: V3.INK,
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
            background: V3.RED,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontFamily: MONO,
            fontWeight: 600,
            color: V3.NAVY,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Vol. III · {no}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {rep !== undefined && (
          <>
            <span
              style={{
                fontSize: 10,
                fontFamily: MONO,
                fontWeight: 700,
                color: V3.SAGE,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Rep · {rep}
            </span>
            <span
              style={{
                display: 'flex',
                width: 3,
                height: 3,
                borderRadius: 1.5,
                background: V3.INK_2,
                opacity: 0.4,
              }}
            />
          </>
        )}
        <span
          style={{
            fontSize: 10,
            fontFamily: MONO,
            fontWeight: 600,
            color: V3.INK_2,
            letterSpacing: '0.2em',
          }}
        >
          {date}
        </span>
      </div>
    </div>
  );
}

/**
 * Compute a hero font size + left position that fits inside the safe area.
 * JetBrains Mono Bold char width ≈ 0.6 × fontSize. Aims for the hero to
 * land in the right half of the card, with right-edge ≤ maxRight.
 */
export function fitHero(
  text: string,
  opts: { maxRight?: number; maxWidth?: number; maxFontSize?: number } = {},
): { fontSize: number; left: number } {
  const maxRight = opts.maxRight ?? 568;
  const maxWidth = opts.maxWidth ?? 268;
  const maxFontSize = opts.maxFontSize ?? 240;
  const charsW = text.length;
  // Solve maxWidth = charsW * 0.6 * fontSize for fontSize.
  const fontSizeFromWidth = Math.floor(maxWidth / (charsW * 0.6));
  const fontSize = Math.min(maxFontSize, fontSizeFromWidth);
  const textW = charsW * 0.6 * fontSize;
  const left = Math.round(maxRight - textW);
  return { fontSize, left };
}

export function HeroNumber({
  text,
  top = 32,
  left,
  fontSize,
  maxFontSize,
  color = V3.INK,
}: {
  text: string;
  top?: number;
  left?: number;
  fontSize?: number;
  /** Cap the auto-fit font size (used when calling without an explicit fontSize). */
  maxFontSize?: number;
  color?: string;
}) {
  // Auto-fit if dimensions not provided
  const auto = fitHero(text, { maxFontSize });
  const fs = fontSize ?? auto.fontSize;
  const lx = left ?? auto.left;
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left: lx,
        fontSize: fs,
        fontFamily: MONO,
        fontWeight: 700,
        lineHeight: 0.85,
        color,
        letterSpacing: '-0.06em',
      }}
    >
      {text}
    </div>
  );
}

/**
 * FoilStamp — celebratory gradient-fill version of InkStamp.
 * Used on milestone ink-stamps (BROKEN, SEALED, EARNED, WRAPPED).
 */
export function FoilStamp({
  text,
  top,
  left,
  rotation = -7,
  fontSize = 42,
}: {
  text: string;
  top: number;
  left: number;
  rotation?: number;
  fontSize?: number;
}) {
  return (
    <>
      {/* Shadow / ink-bleed */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: top + 2,
          left: left - 3,
          padding: '6px 18px 8px',
          background: 'transparent',
          border: `3px solid ${V3.INK}`,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.18,
        }}
      >
        <span
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize,
            color: V3.INK,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      </div>
      {/* Foil layer — mustard gold with red shimmer hint */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top,
          left,
          padding: '6px 18px 8px',
          background: `linear-gradient(110deg, ${V3.MUSTARD} 0%, ${V3.RED} 50%, ${V3.MUSTARD} 100%)`,
          border: `3px solid ${V3.RED}`,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.95,
        }}
      >
        <span
          style={{
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize,
            color: V3.CREAM,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      </div>
    </>
  );
}

export function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        width: 600,
        height: 400,
        background: V3.CREAM,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
