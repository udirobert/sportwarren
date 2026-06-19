/**
 * V3Marketing — Marketing Toolkit templates in the V3 Risograph
 * register. Mirrors the visual system established by the V3 moment
 * cards: cream paper, Antonio + JetBrains Mono, Risograph palette,
 * Iconify motifs, sticker compositions.
 *
 * Five templates:
 *   - SquadRecruitmentSquare (1080×1080)  — captain-led recruitment post
 *   - SquadOfTheWeekSquare   (1080×1080)  — weekly editorial feature
 *   - CaptainSpotlightSquare (1080×1080)  — captain showcase
 *   - LandingHero            (1920×1080)  — web landing page hero
 *   - FeatureExplainerSquare (1080×1080)  — 3-step product diagram
 *
 * Same primitives as V3Scaffold but composed for larger canvases.
 */

import React from 'react';
import {
  V3,
  PaperBg,
  SunburstRays,
  Confetti,
  RibbonBars,
  StatBand,
  CornerSticker,
  InkSplatter,
  CELEBRATORY_CONFETTI,
} from './V3Scaffold';
import { V3Avatar, V3SquadCrest } from './V3Avatar';

const HEAD = 'Antonio';
const MONO = 'JetBrains Mono';

function MarketingShell({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        width,
        height,
        background: V3.CREAM,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function MarketingFooter({
  no,
  date,
  width,
  cta,
}: {
  no: string;
  date: string;
  width: number;
  cta?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        bottom: 48,
        left: 64,
        right: 64,
        width: width - 128,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            fontSize: 18,
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
            width: 5,
            height: 5,
            borderRadius: 2.5,
            background: V3.RED,
          }}
        />
        <span
          style={{
            fontSize: 16,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {cta && (
          <span
            style={{
              fontSize: 16,
              fontFamily: MONO,
              fontWeight: 700,
              color: V3.RED,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {cta}
          </span>
        )}
        <span
          style={{
            fontSize: 16,
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

function Kicker({
  label,
  top = 56,
  left = 64,
  hypeColor = V3.RED,
}: {
  label: string;
  top?: number;
  left?: number;
  hypeColor?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left,
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', width: 10, height: 10, borderRadius: 5, background: hypeColor }} />
      <span
        style={{
          fontSize: 18,
          fontFamily: MONO,
          fontWeight: 700,
          color: V3.NAVY,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Tagline({
  text,
  top,
  left = 64,
  width = 600,
  fontSize = 22,
  color = V3.INK_2,
}: {
  text: string;
  top: number;
  left?: number;
  width?: number;
  fontSize?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top,
        left,
        width,
        fontFamily: MONO,
        fontSize,
        fontWeight: 500,
        color,
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

// Sample roster for the recruitment squad collage
const SQUAD_ROSTER: Array<{
  kit: string;
  accent: string;
  skin: string;
  hair: string;
  num: string;
  style: 'short' | 'tall' | 'shaved' | 'cap';
}> = [
  { kit: V3.RED, accent: V3.NAVY, skin: V3.SKIN_MID, hair: V3.HAIR_DARK, num: '9', style: 'short' },
  { kit: V3.RED, accent: V3.NAVY, skin: V3.SKIN_LIGHT, hair: V3.HAIR_BLOND, num: '7', style: 'tall' },
  { kit: V3.RED, accent: V3.NAVY, skin: V3.SKIN_DARK, hair: V3.HAIR_DARK, num: '4', style: 'shaved' },
  { kit: V3.RED, accent: V3.NAVY, skin: V3.SKIN_MID, hair: V3.HAIR_BROWN, num: '11', style: 'short' },
  { kit: V3.RED, accent: V3.NAVY, skin: V3.SKIN_LIGHT, hair: V3.HAIR_RED, num: '2', style: 'short' },
  { kit: V3.RED, accent: V3.NAVY, skin: V3.SKIN_MID, hair: V3.HAIR_DARK, num: '1', style: 'cap' },
];

// ─────────────────────────────────────────────────────────────────────────
// Squad Recruitment (1080×1080) — captain shares to invite players
// ─────────────────────────────────────────────────────────────────────────
export function SquadRecruitmentSquare() {
  const W = 1080;
  const H = 1080;
  return (
    <MarketingShell width={W} height={H}>
      <PaperBg />
      <RibbonBars top={0} left={64} colors={[V3.MUSTARD, V3.RED, V3.NAVY, V3.SAGE, V3.MUSTARD]} />
      <SunburstRays cx={540} cy={540} rayCount={20} innerR={300} outerR={520} color={V3.MUSTARD} opacity={0.10} />
      <Confetti
        dots={[
          { x: 80, y: 90, s: 6, color: V3.MUSTARD, opacity: 0.75 },
          { x: 200, y: 65, s: 5, color: V3.RED, opacity: 0.7 },
          { x: 880, y: 80, s: 7, color: V3.SAGE, opacity: 0.7 },
          { x: 990, y: 130, s: 5, color: V3.NAVY, opacity: 0.6 },
          { x: 60, y: 540, s: 4, color: V3.RED, opacity: 0.5 },
          { x: 1020, y: 540, s: 5, color: V3.MUSTARD, opacity: 0.65 },
          { x: 100, y: 980, s: 6, color: V3.SAGE, opacity: 0.7 },
          { x: 980, y: 1000, s: 5, color: V3.MUSTARD, opacity: 0.7 },
        ]}
      />

      <Kicker label="Brockenhurst Rovers · Recruiting" top={96} left={64} hypeColor={V3.RED} />

      {/* Big editorial headline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: 150,
          left: 64,
          width: 560,
        }}
      >
        {/* Misregistration ghost */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 3, left: 3, opacity: 0.22 }}>
          <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 140, lineHeight: 0.92, color: V3.NAVY, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Join the</span>
          <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 140, lineHeight: 0.92, color: V3.NAVY, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Squad</span>
        </div>
        {/* Main */}
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 140, lineHeight: 0.92, color: V3.INK, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Join the</span>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 140, lineHeight: 0.92, color: V3.INK, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Squad</span>
      </div>

      <Tagline
        text="A grassroots Sunday League side with seven seasons of history. We're four matches into Spring, looking to fill three spots before May. Captain Marcus Tate."
        top={440}
        left={64}
        width={560}
        fontSize={24}
      />

      {/* Squad roster collage on the right */}
      <V3SquadCrest kitColor={V3.RED} accentColor={V3.MUSTARD} initials="BR" founded="'73" top={130} left={770} size={230} />
      <CornerSticker text="Recruiting" top={130} left={970} rotation={14} bg={V3.MUSTARD} border={V3.RED} textColor={V3.RED} fontSize={26} />

      {/* Avatar collage */}
      <div style={{ display: 'flex', position: 'absolute', top: 410, left: 700, gap: 8 }}>
        {SQUAD_ROSTER.slice(0, 3).map((p, i) => (
          <V3Avatar
            key={`a1-${i}`}
            kitColor={p.kit}
            accentColor={p.accent}
            skinTone={p.skin}
            hairColor={p.hair}
            number={p.num}
            hairStyle={p.style}
            top={0}
            left={i * 120}
            size={110}
          />
        ))}
      </div>
      <div style={{ display: 'flex', position: 'absolute', top: 540, left: 700, gap: 8 }}>
        {SQUAD_ROSTER.slice(3, 6).map((p, i) => (
          <V3Avatar
            key={`a2-${i}`}
            kitColor={p.kit}
            accentColor={p.accent}
            skinTone={p.skin}
            hairColor={p.hair}
            number={p.num}
            hairStyle={p.style}
            top={0}
            left={i * 120}
            size={110}
          />
        ))}
      </div>
      {/* "?" placeholders for the spots they're filling */}
      <div style={{ display: 'flex', position: 'absolute', top: 670, left: 700, gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={`q-${i}`}
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: i * 120,
              width: 110,
              height: 110,
              borderRadius: 55,
              background: V3.CREAM,
              border: `2px dashed ${V3.NAVY}`,
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: HEAD,
              fontWeight: 700,
              fontSize: 56,
              color: V3.NAVY,
            }}
          >
            ?
          </div>
        ))}
      </div>

      {/* CTA stat-band */}
      <StatBand
        primary="3 SPOTS"
        label="CF · CM · GK · UNDER 35"
        top={830}
        left={64}
        width={950}
        accent={V3.RED}
      />

      <InkSplatter
        dots={[
          { x: 600, y: 200, s: 4, o: 0.4 },
          { x: 50, y: 800, s: 5, o: 0.45 },
          { x: 700, y: 870, s: 3, o: 0.5 },
        ]}
      />

      <MarketingFooter no="No. 014" date="JOIN SPORTWARREN.COM/BR" width={W} cta="" />
    </MarketingShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Squad of the Week (1080×1080)
// ─────────────────────────────────────────────────────────────────────────
export function SquadOfTheWeekSquare() {
  const W = 1080;
  const H = 1080;
  return (
    <MarketingShell width={W} height={H}>
      <PaperBg />
      <RibbonBars top={0} left={64} colors={[V3.MUSTARD, V3.RED, V3.MUSTARD, V3.RED, V3.MUSTARD]} />
      <SunburstRays cx={540} cy={580} rayCount={24} innerR={280} outerR={540} color={V3.MUSTARD} opacity={0.18} />
      <Confetti
        dots={[
          { x: 80, y: 90, s: 8, color: V3.MUSTARD, opacity: 0.8 },
          { x: 240, y: 80, s: 5, color: V3.RED, opacity: 0.7 },
          { x: 880, y: 60, s: 7, color: V3.SAGE, opacity: 0.65 },
          { x: 1010, y: 130, s: 6, color: V3.MUSTARD, opacity: 0.75 },
          { x: 60, y: 1000, s: 7, color: V3.RED, opacity: 0.7 },
          { x: 200, y: 1010, s: 5, color: V3.MUSTARD, opacity: 0.75 },
          { x: 880, y: 990, s: 8, color: V3.SAGE, opacity: 0.7 },
          { x: 1010, y: 980, s: 5, color: V3.MUSTARD, opacity: 0.6 },
        ]}
      />

      <Kicker label="Squad of the Week · Spring 2026" top={96} left={64} hypeColor={V3.MUSTARD} />

      {/* Headline + name */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 150, left: 64, width: 950 }}>
        <span
          style={{
            display: 'flex',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 22,
            color: V3.RED,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Spring 2026 · Week 12
        </span>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 130, lineHeight: 0.92, color: V3.INK, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Squad of the</span>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 130, lineHeight: 0.92, color: V3.RED, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Week</span>
      </div>

      {/* Squad crest centered, large */}
      <V3SquadCrest kitColor={V3.RED} accentColor={V3.MUSTARD} initials="BR" founded="'73" top={490} left={400} size={280} />
      <CornerSticker text="SOTW" top={460} left={650} rotation={14} bg={V3.MUSTARD} border={V3.RED} textColor={V3.RED} fontSize={32} />

      {/* Stat band */}
      <StatBand
        primary="3-0-0"
        label="WEEK · +12 GF · -2 GA"
        top={800}
        left={64}
        width={950}
        accent={V3.MUSTARD}
      />

      <Tagline
        text="Brockenhurst Rovers ran the table this week — three clean wins, twelve goals scored, two conceded. Captain Marcus Tate notched six of those twelve himself."
        top={895}
        left={64}
        width={950}
        fontSize={22}
        color={V3.INK_2}
      />

      <MarketingFooter no="No. 012" date="18 JUN 2026" width={W} />
    </MarketingShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Captain Spotlight (1080×1080)
// ─────────────────────────────────────────────────────────────────────────
export function CaptainSpotlightSquare() {
  const W = 1080;
  const H = 1080;
  return (
    <MarketingShell width={W} height={H}>
      <PaperBg />
      <RibbonBars top={0} left={64} colors={[V3.MUSTARD, V3.RED, V3.NAVY]} />
      <SunburstRays cx={540} cy={520} rayCount={18} innerR={280} outerR={520} color={V3.MUSTARD} opacity={0.14} />
      <Confetti
        dots={[
          { x: 90, y: 95, s: 6, color: V3.MUSTARD, opacity: 0.75 },
          { x: 240, y: 80, s: 5, color: V3.RED, opacity: 0.7 },
          { x: 920, y: 80, s: 7, color: V3.NAVY, opacity: 0.6 },
          { x: 80, y: 980, s: 5, color: V3.MUSTARD, opacity: 0.7 },
          { x: 990, y: 1000, s: 6, color: V3.RED, opacity: 0.7 },
        ]}
      />

      <Kicker label="Captain Spotlight · No. 9" top={96} left={64} hypeColor={V3.RED} />

      {/* Avatar centered, very large */}
      <V3Avatar
        kitColor={V3.RED}
        accentColor={V3.NAVY}
        skinTone={V3.SKIN_MID}
        hairColor={V3.HAIR_DARK}
        number="9"
        hairStyle="short"
        top={170}
        left={350}
        size={380}
      />
      <CornerSticker text="Captain" top={170} left={680} rotation={14} bg={V3.MUSTARD} border={V3.RED} textColor={V3.RED} fontSize={28} />

      {/* Player name */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 600, left: 64, width: 950, alignItems: 'center' }}>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 120, lineHeight: 0.92, color: V3.INK, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Marcus Tate</span>
        <span style={{ display: 'flex', fontFamily: MONO, fontWeight: 700, fontSize: 18, color: V3.NAVY, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 16 }}>
          Brockenhurst Rovers · Captain since 2021
        </span>
      </div>

      {/* Career stat band */}
      <StatBand
        primary="147"
        label="Matches · 89 Goals · 5 Seasons"
        top={840}
        left={64}
        width={950}
        accent={V3.RED}
      />

      <Tagline
        text="Started as a midfielder. Moved up top in 2023. Holds the squad record for goals in a season — 28 and counting."
        top={935}
        left={64}
        width={950}
        fontSize={22}
        color={V3.INK_2}
      />

      <MarketingFooter no="No. 014" date="18 JUN 2026" width={W} />
    </MarketingShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Landing Hero (1920×1080)
// ─────────────────────────────────────────────────────────────────────────
export function LandingHero() {
  const W = 1920;
  const H = 1080;
  return (
    <MarketingShell width={W} height={H}>
      <PaperBg />
      <RibbonBars top={0} left={96} colors={[V3.MUSTARD, V3.RED, V3.NAVY, V3.SAGE, V3.MUSTARD]} />
      <SunburstRays cx={1450} cy={540} rayCount={24} innerR={320} outerR={680} color={V3.MUSTARD} opacity={0.13} />
      <Confetti
        dots={[
          { x: 110, y: 110, s: 7, color: V3.MUSTARD, opacity: 0.75 },
          { x: 280, y: 90, s: 5, color: V3.RED, opacity: 0.65 },
          { x: 800, y: 70, s: 6, color: V3.SAGE, opacity: 0.55 },
          { x: 1800, y: 80, s: 8, color: V3.MUSTARD, opacity: 0.7 },
          { x: 1700, y: 1000, s: 7, color: V3.RED, opacity: 0.7 },
          { x: 100, y: 970, s: 6, color: V3.MUSTARD, opacity: 0.7 },
          { x: 1000, y: 1010, s: 5, color: V3.SAGE, opacity: 0.7 },
        ]}
      />

      {/* Identity */}
      <div style={{ display: 'flex', position: 'absolute', top: 96, left: 96, alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', width: 14, height: 14, borderRadius: 7, background: V3.RED }} />
        <span style={{ fontSize: 30, fontFamily: MONO, fontWeight: 700, color: V3.INK, letterSpacing: '0.2em', textTransform: 'uppercase' }}>SportWarren</span>
      </div>

      <div style={{ display: 'flex', position: 'absolute', top: 144, left: 96, alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 18, fontFamily: MONO, fontWeight: 700, color: V3.NAVY, letterSpacing: '0.25em', textTransform: 'uppercase' }}>The Grassroots Football Archive</span>
      </div>

      {/* Left column: massive headline */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 260, left: 96, width: 980 }}>
        {/* Ghost */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 3, left: 3, opacity: 0.22 }}>
          <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 180, lineHeight: 0.92, color: V3.NAVY, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Every match</span>
          <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 180, lineHeight: 0.92, color: V3.NAVY, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Leaves a mark.</span>
        </div>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 180, lineHeight: 0.92, color: V3.INK, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Every match</span>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 180, lineHeight: 0.92, color: V3.RED, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Leaves a mark.</span>
      </div>

      <Tagline
        text="The captain's spreadsheet, but permanent. Bring your squad — every goal, every match, every season, kept exactly as it happened."
        top={680}
        left={96}
        width={1000}
        fontSize={32}
        color={V3.INK_2}
      />

      {/* Right column: squad crest + avatar cluster */}
      <V3SquadCrest kitColor={V3.RED} accentColor={V3.MUSTARD} initials="BR" founded="'73" top={260} left={1320} size={320} />
      <CornerSticker text="Live" top={260} left={1610} rotation={14} bg={V3.MUSTARD} border={V3.RED} textColor={V3.RED} fontSize={32} />

      <div style={{ display: 'flex', position: 'absolute', top: 620, left: 1300, gap: 14 }}>
        {SQUAD_ROSTER.slice(0, 5).map((p, i) => (
          <V3Avatar
            key={`hero-${i}`}
            kitColor={p.kit}
            accentColor={p.accent}
            skinTone={p.skin}
            hairColor={p.hair}
            number={p.num}
            hairStyle={p.style}
            top={0}
            left={i * 110}
            size={100}
          />
        ))}
      </div>

      {/* Stats / trust bar */}
      <StatBand
        primary="1,400"
        label="Matches preserved · 380 squads · 12 nations"
        top={840}
        left={96}
        width={1300}
        accent={V3.RED}
      />

      <MarketingFooter no="sportwarren.com" date="EST. 2025" width={W} cta="" />
    </MarketingShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Feature Explainer (1080×1080) — 3-step diagram
// ─────────────────────────────────────────────────────────────────────────
export function FeatureExplainerSquare() {
  const W = 1080;
  const H = 1080;
  const steps = [
    {
      n: '01',
      label: 'Import',
      detail: 'Paste your captain\'s spreadsheet. Every match, score, scorer goes in once.',
      color: V3.NAVY,
    },
    {
      n: '02',
      label: 'Verify',
      detail: 'Players attest the moments that matter. Peer consensus + referee.',
      color: V3.SAGE,
    },
    {
      n: '03',
      label: 'Archive',
      detail: 'Every match attested becomes a permanent record. Yours, on-chain, forever.',
      color: V3.RED,
    },
  ];
  return (
    <MarketingShell width={W} height={H}>
      <PaperBg />
      <RibbonBars top={0} left={64} colors={[V3.NAVY, V3.SAGE, V3.RED]} />
      <Confetti
        dots={[
          { x: 90, y: 95, s: 5, color: V3.NAVY, opacity: 0.55 },
          { x: 990, y: 95, s: 5, color: V3.RED, opacity: 0.55 },
          { x: 90, y: 990, s: 5, color: V3.SAGE, opacity: 0.55 },
        ]}
      />

      <Kicker label="How SportWarren Works · 3 Steps" top={96} left={64} hypeColor={V3.NAVY} />

      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 160, left: 64, width: 950 }}>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 110, lineHeight: 0.92, color: V3.INK, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>From Paper</span>
        <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 110, lineHeight: 0.92, color: V3.RED, letterSpacing: '-0.025em', textTransform: 'uppercase' }}>To Permanent</span>
      </div>

      {/* 3 steps stacked */}
      {steps.map((step, i) => (
        <div
          key={step.n}
          style={{
            display: 'flex',
            position: 'absolute',
            top: 430 + i * 165,
            left: 64,
            width: 950,
            alignItems: 'flex-start',
            gap: 28,
          }}
        >
          {/* Number badge */}
          <div
            style={{
              display: 'flex',
              width: 110,
              height: 110,
              borderRadius: 55,
              background: step.color,
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 44,
              color: V3.CREAM,
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            {step.n}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <span style={{ display: 'flex', fontFamily: HEAD, fontWeight: 700, fontSize: 56, lineHeight: 1, color: V3.INK, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{step.label}</span>
            <span style={{ display: 'flex', fontFamily: MONO, fontSize: 20, fontWeight: 500, color: V3.INK_2, lineHeight: 1.45, width: 800 }}>{step.detail}</span>
          </div>
        </div>
      ))}

      <MarketingFooter no="sportwarren.com/how" date="" width={W} cta="START TODAY" />
    </MarketingShell>
  );
}
