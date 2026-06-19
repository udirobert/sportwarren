/**
 * V3Cards — 9 archetypes composed from the V3 scaffold.
 *
 * Three feedback iterations applied:
 *  1. Hero numbers auto-fit to the 568px right edge (no clipping)
 *  2. Milestone archetypes (record_broken, level_up, achievement,
 *     attestation_milestone, season_end) gain a celebratory layer:
 *     mustard gold accents, sunburst rays, confetti, foil-stamp
 *  3. Identity-focused archetypes gain a parameterized avatar in
 *     place of the icon watermark (twin_created, record_broken,
 *     level_up, achievement, coaching_hired, coaching_expired)
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
  InkStamp,
  FoilStamp,
  InkSplatter,
  TwinStatStrip,
  BrokenRule,
  AttestationByline,
  EditorialFooter,
  HeroNumber,
  CardShell,
  TwinStat,
  SunburstRays,
  Confetti,
  RibbonBars,
  CELEBRATORY_CONFETTI,
  MONO,
} from './V3Scaffold';
import { V3Avatar, V3SquadCrest } from './V3Avatar';

function fmt(d: Date): string {
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

const TWIN: TwinStat[] = [
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

// Marcus Tate's standard avatar config — used across his identity cards.
const MARCUS_AVATAR = {
  kitColor: V3.RED,
  accentColor: V3.NAVY,
  skinTone: V3.SKIN_MID,
  hairColor: V3.HAIR_DARK,
  number: '9',
  hairStyle: 'short' as const,
};

const BROCKENHURST_CREST = {
  kitColor: V3.RED,
  accentColor: V3.MUSTARD,
  initials: 'BR',
  founded: "'73",
};

// ──────────────────────────────────────────────────────────────────────────
// level_up — CELEBRATORY (milestone)
// ──────────────────────────────────────────────────────────────────────────
export function LevelUpCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  const levelStats: TwinStat[] = TWIN.map((s) =>
    s.k === 'DRI' ? { ...s, delta: 3 } : s.k === 'SHO' ? { ...s, delta: 2 } : s.k === 'PAS' ? { ...s, delta: 1 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={490} cy={150} rayCount={14} innerR={70} outerR={280} color={V3.MUSTARD} opacity={0.16} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.SAGE, V3.NAVY]} />
      <V3Avatar {...MARCUS_AVATAR} top={28} left={444} size={130} />
      <HeroNumber text="47" top={170} maxFontSize={180} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 318,
          left: 442,
          fontSize: 12,
          fontFamily: MONO,
          fontWeight: 700,
          color: V3.INK_2,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Level
      </div>
      <KickerLine label="Level Up · ↑1" position="No. 9 · CF" hypeColor={V3.SAGE} />
      <MisregistrationHeadline lines={['Up the', 'Ranks']} />
      <SubStat label="Previous · L. 46 · 14 matches" />
      <TallyMarks count={18} highlightIdx={17} top={228} />
      <FoilStamp text="Ascended" top={234} left={282} fontSize={30} />
      <InkSplatter dots={SPLATTER.slice(0, 4)} />
      <TwinStatStrip stats={levelStats} heroKey="DRI" hypeTag="Engine" accent={V3.SAGE} top={278} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="18 matches · peer consensus" />
      <EditorialFooter no="No. 047" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// season_end — CELEBRATORY (squad-level)
// ──────────────────────────────────────────────────────────────────────────
export function SeasonEndCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={440} cy={160} rayCount={16} innerR={80} outerR={300} color={V3.MUSTARD} opacity={0.14} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.SAGE, V3.NAVY, V3.MUSTARD]} />
      <IconWatermark icon="laurel" top={32} left={336} size={232} color={V3.MUSTARD} opacity={0.18} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={32} left={448} size={130} />
      <HeroNumber text="14" top={180} maxFontSize={180} />
      <KickerLine label="Season Ended · Spring 2026" hypeColor={V3.MUSTARD} />
      <MisregistrationHeadline lines={['Wrapped &', 'Archived']} />
      <SubStat label="9W · 3D · 2L · 31 GF · 18 GA" color={V3.NAVY} />
      <TallyMarks count={14} highlightIdx={13} top={228} />
      <FoilStamp text="Wrapped" top={236} left={296} fontSize={30} />
      <InkSplatter dots={SPLATTER.slice(0, 5)} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Brockenhurst Rovers" accent={V3.MUSTARD} top={278} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="14 matches · season ratified" />
      <EditorialFooter no="No. 014" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// twin_created — QUIET (identity creation)
// ──────────────────────────────────────────────────────────────────────────
export function TwinCreatedCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="scrollQuill" top={50} left={300} size={280} color={V3.NAVY} opacity={0.08} />
      <V3Avatar {...MARCUS_AVATAR} top={32} left={416} size={150} />
      <HeroNumber text="001" top={196} maxFontSize={140} />
      <KickerLine label="Twin Created · No. 9" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Record', 'Opened']} />
      <SubStat label="First match · Saturday" color={V3.NAVY} />
      <TallyMarks count={1} highlightIdx={0} top={228} />
      <InkStamp text="Enrolled" top={236} left={296} color={V3.NAVY} fontSize={30} />
      <InkSplatter dots={SPLATTER.slice(0, 3)} />
      <TwinStatStrip
        stats={TWIN.map((s) => ({ ...s, v: 50 }))}
        hypeTag="New Signing"
        accent={V3.NAVY}
        top={278}
      />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Captain · Brockenhurst Rovers" />
      <EditorialFooter no="No. 001" rep={50} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// achievement — CELEBRATORY
// ──────────────────────────────────────────────────────────────────────────
export function AchievementCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={490} cy={150} rayCount={12} innerR={70} outerR={270} color={V3.SAGE} opacity={0.16} />
      <Confetti dots={CELEBRATORY_CONFETTI.slice(0, 9)} />
      <RibbonBars top={0} left={32} colors={[V3.SAGE, V3.MUSTARD, V3.SAGE]} />
      <V3Avatar
        {...MARCUS_AVATAR}
        kitColor={V3.SAGE}
        accentColor={V3.MUSTARD}
        top={28}
        left={444}
        size={130}
      />
      <HeroNumber text="0" top={170} maxFontSize={200} />
      <KickerLine label="Achievement · No. 9 · CB" hypeColor={V3.SAGE} />
      <MisregistrationHeadline lines={['First Clean', 'Sheet']} />
      <SubStat label="Goals conceded · across 90 mins" />
      <TallyMarks count={1} highlightIdx={0} top={228} />
      <FoilStamp text="Earned" top={236} left={302} fontSize={32} />
      <InkSplatter dots={SPLATTER.slice(0, 4)} />
      <TwinStatStrip
        stats={TWIN.map((s) => (s.k === 'DEF' ? { ...s, v: 84 } : s))}
        heroKey="DEF"
        hypeTag="Wall"
        accent={V3.SAGE}
        top={278}
      />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Ref. J. Keegan · full 90'" />
      <EditorialFooter no="No. 042" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// sim_complete — TACTICAL/NEUTRAL (squad-level)
// ──────────────────────────────────────────────────────────────────────────
export function SimCompleteCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="chessKnight" top={40} left={300} size={290} color={V3.NAVY} opacity={0.1} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={32} left={444} size={130} />
      <HeroNumber text="7W" top={172} maxFontSize={180} />
      <KickerLine label="Simulation · 10 Squads · Ghost Round" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Round', 'Robin Sim']} />
      <SubStat label="10 squads · 7W · 2D · 1L" color={V3.NAVY} />
      <TallyMarks count={10} highlightIdx={9} top={228} />
      <InkStamp text="Played" top={236} left={310} color={V3.NAVY} fontSize={30} />
      <InkSplatter dots={SPLATTER.slice(0, 4)} />
      <TwinStatStrip stats={TWIN} heroKey="PAS" hypeTag="Tactical" accent={V3.NAVY} top={278} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="System oracle · ghost round" />
      <EditorialFooter no="No. 010" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// attestation_milestone — CELEBRATORY (squad-level)
// ──────────────────────────────────────────────────────────────────────────
export function AttestationMilestoneCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={460} cy={160} rayCount={18} innerR={80} outerR={320} color={V3.MUSTARD} opacity={0.18} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.MUSTARD, V3.RED, V3.MUSTARD]} />
      <IconWatermark icon="waxSeal" top={32} left={336} size={232} color={V3.RED} opacity={0.16} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={32} left={448} size={130} />
      <HeroNumber text="100" top={180} maxFontSize={150} />
      <KickerLine label="Attestation Milestone · Brockenhurst Rvr" hypeColor={V3.RED} />
      <MisregistrationHeadline lines={['One Hundred', 'Verified']} />
      <SubStat label="Every match · preserved on-chain" />
      <TallyMarks count={20} highlightIdx={19} top={228} />
      <FoilStamp text="Sealed" top={236} left={290} fontSize={30} />
      <InkSplatter dots={SPLATTER.slice(0, 6)} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Permanent Record" accent={V3.RED} top={278} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="100 attestations · oracle-signed" />
      <EditorialFooter no="No. 100" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// coaching_hired — MODERATE
// ──────────────────────────────────────────────────────────────────────────
export function CoachingHiredCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  const boosted: TwinStat[] = TWIN.map((s) =>
    s.k === 'SHO' ? { ...s, delta: 5 } : s.k === 'PAC' ? { ...s, delta: 3 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="whistle" top={40} left={300} size={290} color={V3.NAVY} opacity={0.1} />
      <V3Avatar
        {...MARCUS_AVATAR}
        accentColor={V3.NAVY}
        hairStyle="cap"
        top={32}
        left={444}
        size={130}
      />
      <HeroNumber text="30" top={172} maxFontSize={200} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 320,
          left: 466,
          fontSize: 12,
          fontFamily: MONO,
          fontWeight: 700,
          color: V3.INK_2,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Days
      </div>
      <KickerLine label="Coaching · Signed · 30 Days" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Owens', 'Signed']} fontSize={56} />
      <SubStat label="Shooting +5 · Pace +3 · Active" color={V3.NAVY} />
      <TallyMarks count={1} highlightIdx={0} top={232} />
      <InkStamp text="Signed" top={240} left={306} color={V3.NAVY} fontSize={30} />
      <InkSplatter dots={SPLATTER.slice(0, 3)} />
      <TwinStatStrip stats={boosted} heroKey="SHO" hypeTag="Coached" accent={V3.NAVY} top={278} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Coach E. Owens · session 1 of 30" />
      <EditorialFooter no="No. 014" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// coaching_expired — QUIET (farewell)
// ──────────────────────────────────────────────────────────────────────────
export function CoachingExpiredCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  const expired: TwinStat[] = TWIN.map((s) =>
    s.k === 'SHO' ? { ...s, delta: -5 } : s.k === 'PAC' ? { ...s, delta: -3 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="emptyHourglass" top={40} left={300} size={290} color={V3.INK_2} opacity={0.12} />
      <V3Avatar
        {...MARCUS_AVATAR}
        kitColor={V3.INK_2}
        accentColor={V3.INK_2}
        hairStyle="cap"
        top={32}
        left={444}
        size={130}
        ringed
      />
      <HeroNumber text="30" top={172} maxFontSize={200} color={V3.INK_2} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 320,
          left: 466,
          fontSize: 12,
          fontFamily: MONO,
          fontWeight: 700,
          color: V3.INK_2,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Days
      </div>
      <KickerLine label="Coaching · Ended · 30 Days" hypeColor={V3.INK_2} />
      <MisregistrationHeadline lines={['Owens', 'Departed']} fontSize={56} />
      <SubStat label="Final session · boosts lapsed" color={V3.INK_2} />
      <TallyMarks count={30} highlightIdx={29} top={232} color={V3.INK_2} highlightColor={V3.INK_2} />
      <InkStamp text="Ended" top={242} left={312} color={V3.INK_2} fontSize={28} />
      <InkSplatter dots={SPLATTER.slice(0, 2)} />
      <TwinStatStrip stats={expired} heroKey="SHO" hypeTag="Farewell" accent={V3.INK_2} top={278} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="30 sessions · contract concluded" />
      <EditorialFooter no="No. 030" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// match_imported — QUIET (archive)
// ──────────────────────────────────────────────────────────────────────────
export function MatchImportedCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="ticket" top={40} left={300} size={290} color={V3.NAVY} opacity={0.1} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={32} left={444} size={130} />
      <HeroNumber text="3-1" top={172} maxFontSize={160} />
      <KickerLine label="Match Archived · League" position="vs Ballygally" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['From the', 'Archives']} />
      <SubStat label="Brockenhurst · home · 18 Jun 2024" color={V3.NAVY} />
      <TallyMarks count={4} highlightIdx={3} top={228} />
      <InkStamp text="Archived" top={236} left={288} color={V3.NAVY} fontSize={28} />
      <InkSplatter dots={SPLATTER.slice(0, 3)} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="From Spreadsheet" accent={V3.NAVY} top={278} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Imported · captain-attested" />
      <EditorialFooter no="No. 042" date={date} />
    </CardShell>
  );
}
