/**
 * V3Cards — the remaining 9 archetypes propagated from the
 * RecordBrokenCardV3 register. Each composes the V3 scaffold and
 * customises content for its archetype.
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
  InkSplatter,
  TwinStatStrip,
  BrokenRule,
  AttestationByline,
  EditorialFooter,
  HeroNumber,
  CardShell,
  TwinStat,
} from './V3Scaffold';

function fmt(d: Date): string {
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

// Default twin attribute profile for stress-test rendering. Real renders
// will pass these through via the data path.
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

// ──────────────────────────────────────────────────────────────────────────
// level_up
// ──────────────────────────────────────────────────────────────────────────
export function LevelUpCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  const levelStats: TwinStat[] = TWIN.map((s) =>
    s.k === 'DRI' ? { ...s, delta: 3 } : s.k === 'SHO' ? { ...s, delta: 2 } : s.k === 'PAS' ? { ...s, delta: 1 } : s,
  );
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="uprising" top={40} left={300} size={290} color={V3.SAGE} opacity={0.1} />
      <HeroNumber text="47" top={32} left={362} fontSize={240} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 250,
          left: 386,
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
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
      <InkStamp text="+1 Lvl" top={240} left={284} color={V3.SAGE} />
      <InkSplatter dots={SPLATTER.slice(0, 4)} />
      <TwinStatStrip stats={levelStats} heroKey="DRI" hypeTag="Engine" accent={V3.SAGE} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="18 matches · peer consensus" />
      <EditorialFooter no="No. 047" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// season_end
// ──────────────────────────────────────────────────────────────────────────
export function SeasonEndCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="laurel" top={50} left={300} size={280} color={V3.NAVY} opacity={0.1} />
      <HeroNumber text="14" top={32} left={350} fontSize={240} />
      <KickerLine label="Season Ended · Spring 2026" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Wrapped &', 'Archived']} />
      <SubStat label="9W · 3D · 2L · 31 GF · 18 GA" color={V3.NAVY} />
      <TallyMarks count={14} highlightIdx={13} top={228} />
      <InkStamp text="Wrapped" top={244} left={312} color={V3.NAVY} fontSize={36} />
      <InkSplatter dots={SPLATTER.slice(0, 5)} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Brockenhurst Rovers" accent={V3.NAVY} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="14 matches · season ratified" />
      <EditorialFooter no="No. 014" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// twin_created
// ──────────────────────────────────────────────────────────────────────────
export function TwinCreatedCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="scrollQuill" top={50} left={300} size={280} color={V3.NAVY} opacity={0.1} />
      <HeroNumber text="001" top={32} left={300} fontSize={200} />
      <KickerLine label="Twin Created · No. 9" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Record', 'Opened']} />
      <SubStat label="First match · Saturday" color={V3.NAVY} />
      <TallyMarks count={1} highlightIdx={0} top={228} />
      <InkStamp text="Enrolled" top={246} left={296} color={V3.NAVY} fontSize={36} />
      <InkSplatter dots={SPLATTER.slice(0, 3)} />
      <TwinStatStrip stats={TWIN.map((s) => ({ ...s, v: 50 }))} hypeTag="New Signing" accent={V3.NAVY} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Captain · Brockenhurst Rovers" />
      <EditorialFooter no="No. 001" rep={50} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// achievement
// ──────────────────────────────────────────────────────────────────────────
export function AchievementCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="medal" top={40} left={300} size={290} color={V3.SAGE} opacity={0.1} />
      <HeroNumber text="0" top={32} left={386} fontSize={240} />
      <KickerLine label="Achievement · No. 9 · CB" hypeColor={V3.SAGE} />
      <MisregistrationHeadline lines={['First Clean', 'Sheet']} />
      <SubStat label="Goals conceded · across 90 mins" />
      <TallyMarks count={1} highlightIdx={0} top={228} />
      <InkStamp text="Earned" top={244} left={296} color={V3.SAGE} fontSize={38} />
      <InkSplatter dots={SPLATTER.slice(0, 4)} />
      <TwinStatStrip
        stats={TWIN.map((s) => (s.k === 'DEF' ? { ...s, v: 84 } : s))}
        heroKey="DEF"
        hypeTag="Wall"
        accent={V3.SAGE}
      />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Ref. J. Keegan · full 90'" />
      <EditorialFooter no="No. 042" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// sim_complete
// ──────────────────────────────────────────────────────────────────────────
export function SimCompleteCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="chessKnight" top={40} left={300} size={290} color={V3.NAVY} opacity={0.1} />
      <HeroNumber text="7W" top={32} left={326} fontSize={200} />
      <KickerLine label="Simulation · 10 Squads · Ghost Round" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Round', 'Robin Sim']} />
      <SubStat label="10 squads · 7W · 2D · 1L" color={V3.NAVY} />
      <TallyMarks count={10} highlightIdx={9} top={228} />
      <InkStamp text="Played" top={246} left={306} color={V3.NAVY} fontSize={34} />
      <InkSplatter dots={SPLATTER.slice(0, 4)} />
      <TwinStatStrip stats={TWIN} heroKey="PAS" hypeTag="Tactical" accent={V3.NAVY} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="System oracle · ghost round" />
      <EditorialFooter no="No. 010" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// attestation_milestone
// ──────────────────────────────────────────────────────────────────────────
export function AttestationMilestoneCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="waxSeal" top={40} left={290} size={300} color={V3.RED} opacity={0.1} />
      <HeroNumber text="100" top={32} left={296} fontSize={200} />
      <KickerLine label="Attestation Milestone · Brockenhurst Rvr" hypeColor={V3.RED} />
      <MisregistrationHeadline lines={['One Hundred', 'Verified']} />
      <SubStat label="Every match · preserved on-chain" />
      <TallyMarks count={20} highlightIdx={19} top={228} />
      <InkStamp text="Sealed" top={250} left={304} color={V3.RED} fontSize={34} />
      <InkSplatter dots={SPLATTER.slice(0, 6)} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="Permanent Record" accent={V3.RED} />
      <BrokenRule />
      <AttestationByline player="Brockenhurst Rovers" attestation="100 attestations · oracle-signed" />
      <EditorialFooter no="No. 100" date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// coaching_hired
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
      <HeroNumber text="30" top={32} left={358} fontSize={220} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 225,
          left: 410,
          fontSize: 12,
          fontFamily: 'JetBrains Mono',
          fontWeight: 700,
          color: V3.INK_2,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Days
      </div>
      <KickerLine label="Coaching · Signed · 30 Days" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['Owens', 'Signed']} fontSize={64} />
      <SubStat label="Shooting +5 · Pace +3 · Active" color={V3.NAVY} />
      <TallyMarks count={1} highlightIdx={0} top={228} />
      <InkStamp text="Signed" top={246} left={304} color={V3.NAVY} fontSize={34} />
      <InkSplatter dots={SPLATTER.slice(0, 3)} />
      <TwinStatStrip stats={boosted} heroKey="SHO" hypeTag="Coached" accent={V3.NAVY} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Coach E. Owens · session 1 of 30" />
      <EditorialFooter no="No. 014" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// coaching_expired
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
      <HeroNumber text="30" top={32} left={358} fontSize={220} color={V3.INK_2} />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 225,
          left: 410,
          fontSize: 12,
          fontFamily: 'JetBrains Mono',
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
      <TallyMarks count={30} highlightIdx={29} top={228} color={V3.INK_2} highlightColor={V3.INK_2} />
      <InkStamp text="Ended" top={248} left={306} color={V3.INK_2} fontSize={34} />
      <InkSplatter dots={SPLATTER.slice(0, 2)} />
      <TwinStatStrip stats={expired} heroKey="SHO" hypeTag="Farewell" accent={V3.INK_2} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="30 sessions · contract concluded" />
      <EditorialFooter no="No. 030" rep={847} date={date} />
    </CardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// match_imported
// ──────────────────────────────────────────────────────────────────────────
export function MatchImportedCardV3({ moment }: MomentCardProps) {
  const date = fmt(moment.createdAt);
  return (
    <CardShell>
      <PaperBg />
      <IconWatermark icon="ticket" top={40} left={300} size={290} color={V3.NAVY} opacity={0.1} />
      <HeroNumber text="3-1" top={32} left={296} fontSize={200} />
      <KickerLine label="Match Archived · League" position="vs Ballygally" hypeColor={V3.NAVY} />
      <MisregistrationHeadline lines={['From the', 'Archives']} />
      <SubStat label="Brockenhurst Rovers · home · 18 Jun 2024" color={V3.NAVY} />
      <TallyMarks count={4} highlightIdx={3} top={228} />
      <InkStamp text="Archived" top={248} left={290} color={V3.NAVY} fontSize={32} />
      <InkSplatter dots={SPLATTER.slice(0, 3)} />
      <TwinStatStrip stats={TWIN} heroKey="SHO" hypeTag="From Spreadsheet" accent={V3.NAVY} />
      <BrokenRule />
      <AttestationByline player="Marcus Tate" attestation="Imported · captain-attested" />
      <EditorialFooter no="No. 042" date={date} />
    </CardShell>
  );
}
