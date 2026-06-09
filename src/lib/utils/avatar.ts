const XP_PER_LEVEL_BASE = 100;
const XP_PER_LEVEL_GROWTH = 1.15;

export function resolveAvatarUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("ipfs/")) return null;
  return `/api/storage/${key}`;
}

export function computeLevel(xp: number): number {
  if (xp < 0) return 1;
  let level = 1;
  let xpNeeded = XP_PER_LEVEL_BASE;
  let remaining = xp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level += 1;
    xpNeeded = Math.floor(xpNeeded * XP_PER_LEVEL_GROWTH);
  }
  return level;
}

export function xpProgress(xp: number): { level: number; current: number; needed: number; percent: number } {
  if (xp < 0) return { level: 1, current: 0, needed: XP_PER_LEVEL_BASE, percent: 0 };
  let level = 1;
  let xpNeeded = XP_PER_LEVEL_BASE;
  let remaining = xp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level += 1;
    xpNeeded = Math.floor(xpNeeded * XP_PER_LEVEL_GROWTH);
  }
  return { level, current: remaining, needed: xpNeeded, percent: Math.round((remaining / xpNeeded) * 100) };
}
