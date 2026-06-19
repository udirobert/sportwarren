/**
 * RecordBrokenCardV3 — Panini-sticker layout.
 *
 * Mise en place: avatar is the visual hero on the right column,
 * surrounded by sunburst rays. The "28" stat lives in a black
 * nameplate band overlapping the bottom of the avatar (Panini-style
 * caption). "BROKEN" lives as a small angled corner sticker on the
 * top-right of the avatar. The giant hero number is gone — the
 * player's face does the heavy lifting.
 */

import React from 'react';
import { MomentCardProps } from './types';
import {
  V3,
  PaperBg,
  KickerLine,
  MisregistrationHeadline,
  SubStat,
  TallyMarks,
  CornerSticker,
  StatBand,
  InkSplatter,
  TwinStatStrip,
  BrokenRule,
  AttestationByline,
  EditorialFooter,
  CardShell,
  SunburstRays,
  Confetti,
  RibbonBars,
  CELEBRATORY_CONFETTI,
} from './V3Scaffold';
import { V3Avatar } from './V3Avatar';

const TWIN = [
  { k: 'PAC', v: 78 },
  { k: 'SHO', v: 87 },
  { k: 'PAS', v: 71 },
  { k: 'DRI', v: 82 },
  { k: 'DEF', v: 38 },
  { k: 'PHY', v: 74 },
];

const SPLATTER = [
  { x: 290, y: 70, s: 2.5, o: 0.45 },
  { x: 555, y: 130, s: 3.2, o: 0.4 },
  { x: 305, y: 200, s: 1.8, o: 0.5 },
  { x: 560, y: 240, s: 2.2, o: 0.45 },
  { x: 555, y: 70, s: 1.5, o: 0.4 },
  { x: 320, y: 270, s: 2, o: 0.35 },
];

export function RecordBrokenCardV3({ moment }: MomentCardProps) {
  const date = moment.createdAt
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={440} cy={150} rayCount={16} innerR={110} outerR={300} color={V3.MUSTARD} opacity={0.18} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.NAVY, V3.MUSTARD]} />
      <InkSplatter dots={SPLATTER} />

      {/* Right column: avatar as hero, sticker, stat band */}
      <V3Avatar
        kitColor={V3.RED}
        accentColor={V3.NAVY}
        skinTone={V3.SKIN_MID}
        hairColor={V3.HAIR_DARK}
        number="9"
        hairStyle="short"
        top={50}
        left={340}
        size={200}
      />
      <CornerSticker text="Broken" top={48} left={480} rotation={12} bg={V3.MUSTARD} border={V3.RED} textColor={V3.RED} fontSize={20} />
      <StatBand primary="28" label="Goals · Season Best" top={240} left={320} width={240} accent={V3.RED} />

      {/* Left column: kicker, headline, sub-stat, tally, twin stats */}
      <KickerLine label="Squad Record · Broken" position="No. 9 · CF" hypeColor={V3.RED} />
      <MisregistrationHeadline lines={['Most Goals', 'In a Season']} />
      <SubStat label="Previous · 23 set 2019" />
      <TallyMarks count={28} highlightIdx={27} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Clinical Finisher" accent={V3.RED} top={258} />

      {/* Bottom: rule, byline, editorial footer */}
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="9 of 11 peers · Ref. J. Keegan" />
      <EditorialFooter no="No. 028" rep={847} date={date} />
    </CardShell>
  );
}
