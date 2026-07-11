/**
 * Shared, Redis-backed store for in-flight group-verification state.
 *
 * WHY THIS EXISTS: both TelegramService and WhatsAppService previously held
 * pending confirm/dispute state in process-local `Map`s. On serverless the
 * webhook that CREATES a pending verification and the webhook (or cron) that
 * RESOLVES it routinely land on different instances, so the second one found
 * an empty map and silently dropped the vote ("this verification has expired").
 * Persisting to Redis makes the state shared across every instance.
 *
 * The store is deliberately minimal — `get` / `save` / `remove`. It does NOT
 * enumerate: the expiry cron drives resolution from the database
 * (`prisma.match` where `status: 'pending'` and old), so no scan is needed.
 *
 * Vote-toggle semantics differ per channel (WhatsApp toggles a vote off on a
 * repeat press; Telegram does not), so that logic stays in each channel's
 * handler. This store owns only the shared persistence — the part that was
 * actually broken. DRY on the mechanism, not on the channel-specific rules.
 */

import { redisService } from '../redis';

export type VerificationChannel = 'telegram' | 'whatsapp';

/**
 * A record must be keyable by matchId. Confirms/disputes are plain string
 * arrays (userIds) rather than `Set`s so the record round-trips through JSON.
 */
export interface GroupVerificationLike {
  matchId: string;
  confirms: string[];
  disputes: string[];
  createdAt: number;
}

/**
 * The persistence contract. Declared explicitly (rather than inferred from the
 * factory's object literal) so consuming fields get a shallow named type — an
 * inferred object-of-closures type here bloats the tRPC AppRouter instantiation
 * depth and trips TS2589 at unrelated call sites.
 */
export interface GroupVerificationStore<T extends GroupVerificationLike> {
  get(matchId: string): Promise<T | null>;
  save(record: T): Promise<void>;
  remove(matchId: string): Promise<void>;
}

// 25h — comfortably past the 6h silence-is-consent window, so a record that is
// never explicitly resolved still self-cleans instead of leaking forever.
const TTL_SECONDS = 25 * 60 * 60;

/**
 * Build a typed, channel-namespaced store. Each channel keeps its own record
 * interface (Telegram carries message ids for editing; WhatsApp carries group
 * JIDs) but shares this persistence path and key namespace.
 */
export function makeGroupVerificationStore<T extends GroupVerificationLike>(
  channel: VerificationChannel,
): GroupVerificationStore<T> {
  const keyOf = (matchId: string) => `groupverif:${channel}:${matchId}`;

  return {
    async get(matchId: string): Promise<T | null> {
      const raw = await redisService.get(keyOf(matchId));
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    async save(record: T): Promise<void> {
      await redisService.set(keyOf(record.matchId), JSON.stringify(record), TTL_SECONDS);
    },

    async remove(matchId: string): Promise<void> {
      await redisService.del(keyOf(matchId));
    },
  };
}
