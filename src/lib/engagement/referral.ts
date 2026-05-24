/**
 * Referral XP System
 * Ties into the existing Scout XP meta-game. Players earn bonus XP
 * for bringing new players into the ecosystem via invite links.
 */

export interface ReferralReward {
  event: string;
  xp: number;
  scoutXP: number;
  description: string;
}

export const REFERRAL_REWARDS: Record<string, ReferralReward> = {
  signup: {
    event: 'signup',
    xp: 50,
    scoutXP: 10,
    description: 'Referred player created an account',
  },
  first_match: {
    event: 'first_match',
    xp: 100,
    scoutXP: 20,
    description: 'Referred player played their first match',
  },
  first_verification: {
    event: 'first_verification',
    xp: 75,
    scoutXP: 15,
    description: 'Referred player verified a match result',
  },
  join_squad: {
    event: 'join_squad',
    xp: 150,
    scoutXP: 25,
    description: 'Referred player joined a squad',
  },
};

export function getReferralXP(event: keyof typeof REFERRAL_REWARDS): ReferralReward | null {
  return REFERRAL_REWARDS[event] ?? null;
}

export function getTotalReferralXP(events: string[]): { xp: number; scoutXP: number } {
  let xp = 0;
  let scoutXP = 0;
  for (const event of events) {
    const reward = REFERRAL_REWARDS[event];
    if (reward) {
      xp += reward.xp;
      scoutXP += reward.scoutXP;
    }
  }
  return { xp, scoutXP };
}

export function buildReferralLink(userId: string): string {
  if (typeof window === 'undefined') return `/join?ref=${userId}`;
  return `${window.location.origin}/join?ref=${encodeURIComponent(userId)}`;
}

export function buildReferralShareText(playerName: string): string {
  return `${playerName} invited you to SportWarren — track your football, build your rep, and compete with real verified stats.`;
}
