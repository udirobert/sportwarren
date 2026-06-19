/**
 * V3Cards — 10 archetypes in the Panini-sticker mise-en-place layout.
 *
 * All archetypes are data-driven: avatar and squad crest data come from
 * `MomentCardProps.avatar` and `MomentCardProps.squad` (resolved by
 * `src/server/services/personalization/avatar.ts`). When props are absent,
 * palette defaults are used so the card still renders.
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

const DEFAULT_AVATAR = {
  kitColor: V3.RED,
  accentColor: V3.NAVY,
  skinTone: V3.SKIN_MID,
  hairColor: V3.HAIR_DARK,
  number: '0',
  hairStyle: 'short' as const,
};

const DEFAULT_CREST = {
  kitColor: V3.RED,
  accentColor: V3.MUSTARD,
  initials: '??',
  founded: "''00",
};

function useAvatar(props: MomentCardProps) {
  const a = props.avatar;
  if (!a) return DEFAULT_AVATAR;
  return {
    kitColor: a.kitColor,
    accentColor: a.accentColor,
    skinTone: a.skinTone,
    hairColor: a.hairColor,
    number: a.number || '0',
    hairStyle: a.hairStyle,
  };
}

function useCrest(props: MomentCardProps) {
  const s = props.squad;
  if (!s) return DEFAULT_CREST;
  return {
    kitColor: s.kitColor,
    accentColor: s.accentColor,
    initials: s.initials,
    founded: s.founded,
  };
}

function name(props: MomentCardProps): string {
  return props.playerName ?? 'Player';
}

// ──────────────────────────────────────────────────────────────────────────
// record_broken — CELEBRATORY
// ──────────────────────────────────────────────────────────────────────────
export function RecordBrokenCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const av = useAvatar(props);

  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={440} cy={150} rayCount={16} innerR={110} outerR={300} color={V3.MUSTARD} opacity={0.18} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, V3.RED, V3.NAVY, V3.MUSTARD]} />
      <InkSplatter dots={RIGHT_SPLATTER} />
      <V3Avatar {...av} top={50} left={340} size={200} />
      <CornerSticker text="Broken" top={48} left={480} rotation={12} bg={V3.MUSTARD} border={V3.RED} textColor={V3.RED} fontSize={20} />
      <StatBand primary="28" label="Goals · Season Best" top={240} left={320} width={240} accent={V3.RED} />
      <KickerLine label="Squad Record · Broken" position={`No. ${av.number} · ${moment.detail ?? 'CF'}`} hypeColor={V3.RED} />
      <MisregistrationHeadline lines={['Most Goals', 'In a Season']} />
      <SubStat label="Previous · 23 set 2019" />
      <TallyMarks count={28} highlightIdx={27} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Clinical Finisher" accent={V3.RED} top={258} />
      <BrokenRule />
      <AttestationByline player={name(props)} attestation="9 of 11 peers · Ref. J. Keegan" />
      <EditorialFooter no="No. 028" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// level_up — CELEBRATORY
// ──────────────────────────────────────────────────────────────────────────
export function LevelUpCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const av = useAvatar(props);
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
      <V3Avatar {...av} top={50} left={340} size={200} />
      <CornerSticker text="Ascended" top={48} left={460} rotation={12} bg={V3.MUSTARD} border={V3.SAGE} textColor={V3.SAGE} fontSize={18} />
      <StatBand primary="L. 47" label="Level · ↑1" top={240} left={320} width={240} accent={V3.SAGE} />
      <KickerLine label="Level Up · ↑1" position={`No. ${av.number}`} hypeColor={V3.SAGE} />
      <MisregistrationHeadline lines={['Up the', 'Ranks']} />
      <SubStat label="Previous · L. 46 · 14 matches" />
      <TallyMarks count={18} highlightIdx={17} top={228} />
      <TwinStatStrip stats={stats} heroKey="DRI" hypeTag="Engine" accent={V3.SAGE} top={258} />
      <BrokenRule />
      <AttestationByline player={name(props)} attestation="18 matches · peer consensus" />
      <EditorialFooter no="No. 047" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// season_end — CELEBRATORY (squad-level)
// ──────────────────────────────────────────────────────────────────────────
export function SeasonEndCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const crest = useCrest(props);
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={440} cy={150} rayCount={16} innerR={110} outerR={300} color={V3.MUSTARD} opacity={0.14} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, crest.kitColor, V3.SAGE, V3.NAVY, V3.MUSTARD]} />
      <InkSplatter dots={RIGHT_SPLATTER} />
      <V3SquadCrest {...crest} top={50} left={340} size={200} />
      <CornerSticker text="Wrapped" top={48} left={470} rotation={12} bg={V3.MUSTARD} border={crest.kitColor} textColor={V3.NAVY} fontSize={18} />
      <StatBand primary="14" label="Played · 9W 3D 2L" top={240} left={320} width={240} accent={V3.MUSTARD} />
      <KickerLine label="Season Ended · Spring 2026" hypeColor={V3.MUSTARD} />
      <MisregistrationHeadline lines={['Wrapped &', 'Archived']} />
      <SubStat label="14 matches · 31 GF · 18 GA" color={V3.NAVY} />
      <TallyMarks count={14} highlightIdx={13} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag={crest.initials} accent={V3.MUSTARD} top={258} />
      <BrokenRule />
      <AttestationByline player={name(props)} attestation="14 matches · season ratified" />
      <EditorialFooter no="No. 014" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// twin_created — QUIET (identity opening)
// ──────────────────────────────────────────────────────────────────────────
export function TwinCreatedCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const av = useAvatar(props);
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 3)} />
      <V3Avatar {...av} top={50} left={340} size={200} />
      <CornerSticker text="Enrolled" top={48} left={464} rotation={12} bg={V3.CREAM} border={V3.NAVY} textColor={V3.NAVY} fontSize={18} />
      <StatBand primary="001" label="First Match · Sat" top={240} left={320} width={240} accent={V3.NAVY} />
      <KickerLine label={`Twin Created · No. ${av.number}`} hypeColor={V3.NAVY} />
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
      <AttestationByline player={name(props)} attestation="Record opened" />
      <EditorialFooter no="No. 001" rep={50} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// achievement — CELEBRATORY
// ──────────────────────────────────────────────────────────────────────────
export function AchievementCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const av = useAvatar(props);
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={440} cy={150} rayCount={12} innerR={110} outerR={280} color={V3.SAGE} opacity={0.16} />
      <Confetti dots={CELEBRATORY_CONFETTI.slice(0, 9)} />
      <RibbonBars top={0} left={32} colors={[V3.SAGE, V3.MUSTARD, V3.SAGE]} />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 4)} />
      <V3Avatar
        {...av}
        kitColor={V3.SAGE}
        accentColor={V3.MUSTARD}
        top={50}
        left={340}
        size={200}
      />
      <CornerSticker text="Earned" top={48} left={476} rotation={12} bg={V3.MUSTARD} border={V3.SAGE} textColor={V3.SAGE} fontSize={20} />
      <StatBand primary="0" label="Conceded · 90 mins" top={240} left={320} width={240} accent={V3.SAGE} />
      <KickerLine label={`Achievement · No. ${av.number}`} hypeColor={V3.SAGE} />
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
      <AttestationByline player={name(props)} attestation="Full 90'" />
      <EditorialFooter no="No. 042" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// sim_complete — NEUTRAL (squad-level)
// ──────────────────────────────────────────────────────────────────────────
export function SimCompleteCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const crest = useCrest(props);
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 4)} />
      <V3SquadCrest {...crest} top={50} left={340} size={200} />
      <CornerSticker text="Played" top={48} left={476} rotation={12} bg={V3.CREAM} border={V3.NAVY} textColor={V3.NAVY} fontSize={18} />
      <StatBand primary="7W 2D 1L" label="Ghost Round · 10 Sqd" top={240} left={320} width={240} accent={V3.NAVY} />
      <KickerLine label="Simulation · 10 Squads · Ghost Round" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Round', 'Robin Sim']} />
      <SubStat label="10 squads · 7W · 2D · 1L" color={V3.NAVY} />
      <TallyMarks count={10} highlightIdx={9} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="PAS" hypeTag="Tactical" accent={V3.NAVY} top={258} />
      <BrokenRule />
      <AttestationByline player={name(props)} attestation="System oracle · ghost round" />
      <EditorialFooter no="No. 010" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// attestation_milestone — CELEBRATORY (squad-level)
// ──────────────────────────────────────────────────────────────────────────
export function AttestationMilestoneCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const crest = useCrest(props);
  return (
    <CardShell>
      <PaperBg />
      <SunburstRays cx={440} cy={150} rayCount={18} innerR={110} outerR={320} color={V3.MUSTARD} opacity={0.18} />
      <Confetti dots={CELEBRATORY_CONFETTI} />
      <RibbonBars top={0} left={32} colors={[V3.MUSTARD, crest.kitColor, V3.MUSTARD, crest.kitColor, V3.MUSTARD]} />
      <InkSplatter dots={RIGHT_SPLATTER} />
      <V3SquadCrest {...crest} top={50} left={340} size={200} />
      <CornerSticker text="Sealed" top={48} left={476} rotation={12} bg={V3.MUSTARD} border={crest.kitColor} textColor={V3.RED} fontSize={20} />
      <StatBand primary="100" label="Attestations · permanent" top={240} left={320} width={240} accent={V3.RED} />
      <KickerLine label={`Attestation Milestone · ${crest.initials}`} hypeColor={V3.RED} />
      <MisregistrationHeadline lines={['One Hundred', 'Verified']} />
      <SubStat label="Every match · preserved permanently" />
      <TallyMarks count={20} highlightIdx={19} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Permanent Record" accent={V3.RED} top={258} />
      <BrokenRule />
      <AttestationByline player={name(props)} attestation="100 attestations · verified" />
      <EditorialFooter no="No. 100" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// coaching_hired — NEUTRAL
// ──────────────────────────────────────────────────────────────────────────
export function CoachingHiredCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const av = useAvatar(props);
  const boosted: TwinStat[] = TWIN.map((s) =>
    s.k === 'SHO' ? { ...s, delta: 5 } : s.k === 'PAC' ? { ...s, delta: 3 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 3)} />
      <V3Avatar
        {...av}
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
      <AttestationByline player={name(props)} attestation="Coach E. Owens · session 1 of 30" />
      <EditorialFooter no="No. 014" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// coaching_expired — QUIET (farewell)
// ──────────────────────────────────────────────────────────────────────────
export function CoachingExpiredCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const av = useAvatar(props);
  const expired: TwinStat[] = TWIN.map((s) =>
    s.k === 'SHO' ? { ...s, delta: -5 } : s.k === 'PAC' ? { ...s, delta: -3 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 2)} />
      <V3Avatar
        {...av}
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
      <AttestationByline player={name(props)} attestation="30 sessions · contract concluded" />
      <EditorialFooter no="No. 030" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// match_imported — QUIET (archive)
// ──────────────────────────────────────────────────────────────────────────
export function MatchImportedCardV3(props: MomentCardProps) {
  const { moment } = props;
  const date = fmt(moment.createdAt);
  const crest = useCrest(props);
  return (
    <CardShell>
      <PaperBg />
      <InkSplatter dots={RIGHT_SPLATTER.slice(0, 3)} />
      <V3SquadCrest {...crest} top={50} left={340} size={200} />
      <CornerSticker text="Archived" top={48} left={470} rotation={12} bg={V3.CREAM} border={V3.NAVY} textColor={V3.NAVY} fontSize={17} />
      <StatBand primary="3-1" label={moment.detail ?? 'Home · League'} top={240} left={320} width={240} accent={V3.NAVY} />
      <KickerLine label="Match Archived · League" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['From the', 'Archives']} />
      <SubStat label={`${crest.initials} · imported from spreadsheet`} color={V3.NAVY} />
      <TallyMarks count={4} highlightIdx={3} top={228} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="From Spreadsheet" accent={V3.NAVY} top={258} />
      <BrokenRule />
      <AttestationByline player={name(props)} attestation="Imported · captain-attested" />
      <EditorialFooter no="No. 042" date={date} />
    </CardShell>
  );
}
