/**
 * Weekly Challenge System
 * Generates rotating short-term goals that drive engagement.
 * Challenges reset every Monday 00:00 UTC.
 */

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  xpReward: number;
  icon: string;
  category: 'scoring' | 'playmaking' | 'activity' | 'social';
}

export interface ChallengeProgress {
  challenge: WeeklyChallenge;
  current: number;
  completed: boolean;
  claimedAt?: Date;
}

const CHALLENGE_POOL: WeeklyChallenge[] = [
  {
    id: 'score-3',
    title: 'Sharpshooter',
    description: 'Score 3 goals this week',
    target: 3,
    unit: 'goals',
    xpReward: 150,
    icon: 'target',
    category: 'scoring',
  },
  {
    id: 'assist-2',
    title: 'Playmaker',
    description: 'Register 2 assists this week',
    target: 2,
    unit: 'assists',
    xpReward: 120,
    icon: 'handshake',
    category: 'playmaking',
  },
  {
    id: 'play-3',
    title: 'Iron Man',
    description: 'Play 3 matches this week',
    target: 3,
    unit: 'matches',
    xpReward: 200,
    icon: 'calendar',
    category: 'activity',
  },
  {
    id: 'rate-5',
    title: 'Scout Eye',
    description: 'Rate 5 teammates after matches',
    target: 5,
    unit: 'ratings',
    xpReward: 100,
    icon: 'star',
    category: 'social',
  },
  {
    id: 'clean-sheet',
    title: 'Wall',
    description: 'Keep a clean sheet',
    target: 1,
    unit: 'clean sheets',
    xpReward: 175,
    icon: 'shield',
    category: 'activity',
  },
  {
    id: 'win-2',
    title: 'Winning Mentality',
    description: 'Win 2 matches this week',
    target: 2,
    unit: 'wins',
    xpReward: 180,
    icon: 'trophy',
    category: 'activity',
  },
  {
    id: 'score-hat-trick',
    title: 'Hat-Trick Hero',
    description: 'Score a hat-trick in a single match',
    target: 1,
    unit: 'hat-tricks',
    xpReward: 300,
    icon: 'flame',
    category: 'scoring',
  },
  {
    id: 'verify-3',
    title: 'Trusted Witness',
    description: 'Verify 3 match results',
    target: 3,
    unit: 'verifications',
    xpReward: 100,
    icon: 'check-circle',
    category: 'social',
  },
];

function getWeekSeed(): number {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.floor(
    (now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  return now.getFullYear() * 100 + weekNumber;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getWeeklyChallenges(count = 3): WeeklyChallenge[] {
  const seed = getWeekSeed();
  const shuffled = seededShuffle(CHALLENGE_POOL, seed);
  return shuffled.slice(0, count);
}

export function getWeekProgress(
  challenge: WeeklyChallenge,
  stats: { goals: number; assists: number; matches: number; ratings: number; wins: number; cleanSheets: number; verifications: number; hatTricks: number },
): number {
  switch (challenge.id) {
    case 'score-3':
      return stats.goals;
    case 'assist-2':
      return stats.assists;
    case 'play-3':
      return stats.matches;
    case 'rate-5':
      return stats.ratings;
    case 'clean-sheet':
      return stats.cleanSheets;
    case 'win-2':
      return stats.wins;
    case 'score-hat-trick':
      return stats.hatTricks;
    case 'verify-3':
      return stats.verifications;
    default:
      return 0;
  }
}

export function getWeekStartDate(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

export function getDaysUntilReset(): number {
  const now = new Date();
  const nextMonday = getWeekStartDate();
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  return Math.ceil((nextMonday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
