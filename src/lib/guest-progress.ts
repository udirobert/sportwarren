import { STORAGE_KEYS } from '@/contexts/WalletContext';

const GUEST_DRAFTS_KEY = 'sw_guest_drafts';
const GUEST_XP_KEY = 'sw_guest_xp';

export interface GuestProgressSnapshot {
  draftedPlayerIds: string[];
  accumulatedXP: number;
}

export function hasPendingGuestMigrationFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION) === 'true';
}

export function readGuestProgress(): GuestProgressSnapshot {
  if (typeof window === 'undefined') {
    return { draftedPlayerIds: [], accumulatedXP: 0 };
  }

  const draftsStr = localStorage.getItem(GUEST_DRAFTS_KEY);
  const xpStr = localStorage.getItem(GUEST_XP_KEY);

  let draftedPlayerIds: string[] = [];
  let accumulatedXP = 0;

  if (draftsStr) {
    try {
      const parsed = JSON.parse(draftsStr) as unknown;
      if (Array.isArray(parsed)) {
        draftedPlayerIds = parsed.filter((value): value is string => typeof value === 'string');
      }
    } catch {
      // ignore malformed local state
    }
  }

  if (xpStr) {
    accumulatedXP = parseInt(xpStr, 10) || 0;
  }

  return { draftedPlayerIds, accumulatedXP };
}

export function hasGuestProgress(snapshot: GuestProgressSnapshot = readGuestProgress()): boolean {
  return snapshot.accumulatedXP > 0 || snapshot.draftedPlayerIds.length > 0;
}

export function clearGuestProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION);
  localStorage.removeItem(GUEST_DRAFTS_KEY);
  localStorage.removeItem(GUEST_XP_KEY);
}
