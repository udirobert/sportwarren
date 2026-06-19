/**
 * V3Cards — 9 archetypes in the Panini-sticker mise-en-place layout.
 *
 * Composition system:
 *   LEFT COLUMN (32-300px): kicker, headline, sub-stat, tally,
 *     twin stats, broken rule, byline, editorial footer.
 *   RIGHT COLUMN (320-580px): avatar OR squad crest as the visual
 *     hero, with sunburst rays behind (celebratory cards only),
 *     a small angled CornerSticker for the milestone word, and a
 *     StatBand nameplate overlapping the bottom of the avatar.
 *
 * Tier:
 *   - CELEBRATORY (record_broken, level_up, season_end, achievement,
 *     attestation_milestone): SunburstRays + Confetti + RibbonBars +
 *     CornerSticker on mustard+red foil.
 *   - QUIET (twin_created, match_imported, coaching_expired): no
 *     sunburst/confetti, plain CornerSticker in archetype color.
 *   - NEUTRAL (sim_complete, coaching_hired): same as quiet.
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
  TwinStat,
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

const RIGHT_SPLATTER = [
  { x: 290, y: 70, s: 2.5, o: 0.45 },
  { x: 555, y: 130, s: 3.2, o: 0.4 },
  { x: 305, y: 200, s: 1.8, o: 0.5 },
  { x: 560, y: 240, s: 2.2, o: 0.45 },
  { x: 555, y: 70, s: 1.5, o: 0.4 },
  { x: 320, y: 270, s: 2, o: 0.35 },
];

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
// level_up — CELEBRATORY
// ──────────────────────────────────────────────────────────────────────────
export function LevelUpCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  const stats: TwinStat[] = TWIN.map((s) =>
    s.k === 'DRI' ? { ...s, delta: 3 } : s.k === 'SHO' ? { ...s, delta: 2 } : s.k === 'PAS' ? { ...s, delta: 1 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={440} cy={150} rayCount={14} innerR={110} outerR={290} color={V3.MUSTARD} opacity={0.16} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.SAGE, V3.NAVY, V3.MUSTARD]} />
      <InkSplatter dots={RIGHT_SPLATTER} />
      <V3Avatar {...MARCUS_AVATAR} top={50} left={340} size={200} />
      <CornerSticker text="Ascended" top={48} left={460} rotation={12} bg={V3.MUSTARD} border={V3.SAGE} textColor={V3.SAGE} fontSize={18} />
      <StatBand primary="L. 47" label="Level · ↑1" top={240} left={320} width={240} accent={V3.SAGE} />
      <KickerLine label="Level Up · ↑1" position="No. 9 · CF" hypeColor={V3.SAGE} />
      <MisregistrationHeadline lines={['Up the', 'Ranks']} />
      <SubStat label="Previous · L. 46 · 14 matches" />
      <TallyMarks count={18} highlightIdx={17} top={228} />
      <TwinStatStrip stats={stats} heroKey="DRI" hypeTag="Engine" accent={V3.SAGE} top={258} />
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
      <SunburstRays cx={440} cy={150} rayCount={16} innerR={110} outerR={300} color={V3.MUSTARD} opacity={0.14} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.SAGE, V3.NAVY, V3.MUSTARD]} />
      <InkSplatter dots={RIGHT_SPLATTER} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={50} left={340} size={200} />
      <CornerSticker text="Wrapped" top={48} left={470} rotation={12} bg={V3.MUSTARD} border={V3.RED} textColor={V3.NAVY} fontSize={18} />
      <StatBand primary="14" label="Played · 9W 3D 2L" top={240} left={320} width={240} accent={V3.MUSTARD} />
      <KickerLine label="Season Ended · Spring 2026" hypeColor={V3.MUSTARD} />
      <MisregistrationHeadline lines={['Wrapped &', 'Archived']} />
      <SubStat label="14 matches · 31 GF · 18 GA" color={V3.NAVY} />
      <TallyMarks count={14} highlightIdx={13} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Brockenhurst Rovers" accent={V3.MUSTARD} top={258} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="14 matches · season ratified" />
      <EditorialFooter no="No. 014" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// twin_created — QUIET (identity opening)
// ──────────────────────────────────────────────────────────────────────────
export function TwinCreatedCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 3)} />
      <V3Avatar {...MARCUS_AVATAR} top={50} left={340} size={200} />
      <CornerSticker text="Enrolled" top={48} left={464} rotation={12} bg={V3.CREAM} border={V3.NAVY} textColor={V3.NAVY} fontSize={18} />
      <StatBand primary="001" label="First Match · Sat" top={240} left={320} width={240} accent={V3.NAVY} />
      <KickerLine label="Twin Created · No. 9" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Record', 'Opened']} />
      <SubStat label="First match · Saturday" color={V3.NAVY} />
      <TallyMarks count={1} highlightIdx={0} top={228} />
      <TwinStatStrip
        stats={TWIN.map((s) => ({ ...s, v: 50 }))}
        hypeTag="New Signing"
        accent={V3.NAVY}
        top={258}
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
      <SunburstRays cx={440} cy={150} rayCount={12} innerR={110} outerR={280} color={V3.SAGE} opacity={0.16} />
      <Confetti dots={CELEBRATORY_CONFETTI.slice(0, 9)} />
      <RibbonBars top={0} left={32} colors={[V3.SAGE, V3.MUSTARD, V3.SAGE]} />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 4)} />
      <V3Avatar
        {...MARCUS_AVATAR}
        kitColor={V3.SAGE}
        accentColor={V3.MUSTARD}
        top={50}
        left={340}
        size={200}
      />
      <CornerSticker text="Earned" top={48} left={476} rotation={12} bg={V3.MUSTARD} border={V3.SAGE} textColor={V3.SAGE} fontSize={20} />
      <StatBand primary="0" label="Conceded · 90 mins" top={240} left={320} width={240} accent={V3.SAGE} />
      <KickerLine label="Achievement · No. 9 · CB" hypeColor={V3.SAGE} />
      <MisregistrationHeadline lines={['First Clean', 'Sheet']} />
      <SubStat label="Goals conceded · across 90 mins" />
      <TallyMarks count={1} highlightIdx={0} top={228} />
      <TwinStatStrip
        stats={TWIN.map((s) => (s.k === 'DEF' ? { ...s, v: 84 } : s))}
        heroKey="DEF"
        hypeTag="Wall"
        accent={V3.SAGE}
        top={258}
      />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Ref. J. Keegan · full 90'" />
      <EditorialFooter no="No. 042" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// sim_complete — NEUTRAL (squad-level)
// ──────────────────────────────────────────────────────────────────────────
export function SimCompleteCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 4)} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={50} left={340} size={200} />
      <CornerSticker text="Played" top={48} left={476} rotation={12} bg={V3.CREAM} border={V3.NAVY} textColor={V3.NAVY} fontSize={18} />
      <StatBand primary="7W 2D 1L" label="Ghost Round · 10 Sqd" top={240} left={320} width={240} accent={V3.NAVY} />
      <KickerLine label="Simulation · 10 Squads · Ghost Round" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Round', 'Robin Sim']} />
      <SubStat label="10 squads · 7W · 2D · 1L" color={V3.NAVY} />
      <TallyMarks count={10} highlightIdx={9} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="PAS" hypeTag="Tactical" accent={V3.NAVY} top={258} />
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
      <SunburstRays cx={440} cy={150} rayCount={18} innerR={110} outerR={320} color={V3.MUSTARD} opacity={0.18} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.MUSTARD, V3.RED, V3.MUSTARD]} />
      <InkSplatter dots={RIGHT_SPLATTER} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={50} left={340} size={200} />
      <CornerSticker text="Sealed" top={48} left={476} rotation={12} bg={V3.MUSTARD} border={V3.RED} textColor={V3.RED} fontSize={20} />
      <StatBand primary="100" label="Attestations · on-chain" top={240} left={320} width={240} accent={V3.RED} />
      <KickerLine label="Attestation Milestone · Brockenhurst Rvr" hypeColor={V3.RED} />
      <MisregistrationHeadline lines={['One Hundred', 'Verified']} />
      <SubStat label="Every match · preserved on-chain" />
      <TallyMarks count={20} highlightIdx={19} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Permanent Record" accent={V3.RED} top={258} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="100 attestations · oracle-signed" />
      <EditorialFooter no="No. 100" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// coaching_hired — NEUTRAL
// ──────────────────────────────────────────────────────────────────────────
export function CoachingHiredCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  const boosted: TwinStat[] = TWIN.map((s) =>
    s.k === 'SHO' ? { ...s, delta: 5 } : s.k === 'PAC' ? { ...s, delta: 3 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 3)} />
      <V3Avatar
        {...MARCUS_AVATAR}
        accentColor={V3.NAVY}
        hairStyle="cap"
        top={50}
        left={340}
        size={200}
      />
      <CornerSticker text="Signed" top={48} left={476} rotation={12} bg={V3.CREAM} border={V3.NAVY} textColor={V3.NAVY} fontSize={18} />
      <StatBand primary="30D" label="Active · SHO +5 PAC +3" top={240} left={320} width={240} accent={V3.NAVY} />
      <KickerLine label="Coaching · Signed · 30 Days" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Owens', 'Signed']} fontSize={56} />
      <SubStat label="Shooting +5 · Pace +3 · Active" color={V3.NAVY} />
      <TallyMarks count={1} highlightIdx={0} top={232} />
      <TwinStatStrip stats={boosted} heroKey="SHO" hypeTag="Coached" accent={V3.NAVY} top={258} />
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
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 2)} />
      <V3Avatar
        {...MARCUS_AVATAR}
        kitColor={V3.INK_2}
        accentColor={V3.INK_2}
        hairStyle="cap"
        top={50}
        left={340}
        size={200}
      />
      <CornerSticker text="Ended" top={48} left={486} rotation={12} bg={V3.CREAM} border={V3.INK_2} textColor={V3.INK_2} fontSize={18} />
      <StatBand primary="30D" label="Concluded · Boosts Off" top={240} left={320} width={240} bg={V3.INK_2} accent={V3.INK} />
      <KickerLine label="Coaching · Ended · 30 Days" hypeColor={V3.INK_2} />
      <MisregistrationHeadline lines={['Owens', 'Departed']} fontSize={56} />
      <SubStat label="Final session · boosts lapsed" color={V3.INK_2} />
      <TallyMarks count={30} highlightIdx={29} top={232} color={V3.INK_2} highlightColor={V3.INK_2} />
      <TwinStatStrip stats={expired} heroKey="SHO" hypeTag="Farewell" accent={V3.INK_2} top={258} />
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
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 3)} />
      <V3SquadCrest {...BROCKENHURST_CREST} top={50} left={340} size={200} />
      <CornerSticker text="Archived" top={48} left={470} rotation={12} bg={V3.CREAM} border={V3.NAVY} textColor={V3.NAVY} fontSize={17} />
      <StatBand primary="3-1" label="vs Ballygally · Home" top={240} left={320} width={240} accent={V3.NAVY} />
      <KickerLine label="Match Archived · League" position="vs Ballygally" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['From the', 'Archives']} />
      <SubStat label="Brockenhurst · home · 18 Jun 2024" color={V3.NAVY} />
      <TallyMarks count={4} highlightIdx={3} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="From Spreadsheet" accent={V3.NAVY} top={258} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Imported · captain-attested" />
      <EditorialFooter no="No. 042" date={date} />
    </CardShell>
  );
}
