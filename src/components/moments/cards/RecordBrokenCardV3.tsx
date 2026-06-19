/**
 * RecordBrokenCardV3 — V3 reference card. Originally written inline
 * during the V3 concept-piece iteration, now refactored to use the
 * shared V3 scaffold + celebratory layer + avatar so it stays in
 * sync with the rest of the library.
 *
 * Register: editorial football magazine + grassroots ephemera.
 * Mood: CELEBRATORY (milestone) — sunburst, confetti, foil stamp,
 * mustard ribbon, parameterized player avatar.
 */

import React from 'react';
import { MomentCardProps } from './types';
import {
  V3,
  PaperBg,
  IconWatermark,
  KickerLine,
  MisregistrationHeadline,
  SubStat,
  TallyMarks,
  FoilStamp,
  InkSplatter,
  TwinStatStrip,
  BrokenRule,
  AttestationByline,
  EditorialFooter,
  HeroNumber,
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
  { x: 268, y: 232, s: 2.5, o: 0.55 },
  { x: 488, y: 244, s: 3.2, o: 0.45 },
  { x: 296, y: 296, s: 1.8, o: 0.6 },
  { x: 462, y: 295, s: 2.2, o: 0.5 },
  { x: 380, y: 232, s: 1.5, o: 0.45 },
  { x: 514, y: 272, s: 2, o: 0.4 },
];

export function RecordBrokenCardV3({ moment }: MomentCardProps) {
  const date = moment.createdAt
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={490} cy={160} rayCount={14} innerR={70} outerR={290} color={V3.MUSTARD} opacity={0.16} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.NAVY, V3.MUSTARD]} />
      <IconWatermark icon="ball" top={50} left={320} size={240} color={V3.NAVY} opacity={0.07} />
      <V3Avatar
        kitColor={V3.RED}
        accentColor={V3.NAVY}
        skinTone={V3.SKIN_MID}
        hairColor={V3.HAIR_DARK}
        number="9"
        hairStyle="short"
        top={28}
        left={444}
        size={130}
      />
      <HeroNumber text="28" top={172} maxFontSize={200} />
      <KickerLine label="Squad Record · Broken" position="No. 9 · CF" hypeColor={V3.RED} />
      <MisregistrationHeadline lines={['Most Goals', 'In a Season']} />
      <SubStat label="Previous · 23 set 2019" />
      <TallyMarks count={28} highlightIdx={27} top={228} />
      <FoilStamp text="Broken" top={232} left={292} fontSize={38} />
      <InkSplatter dots={SPLATTER} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Clinical Finisher" accent={V3.RED} top={278} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="9 of 11 peers · Ref. J. Keegan" />
      <EditorialFooter no="No. 028" rep={847} date={date} />
    </CardShell>
  );
}
